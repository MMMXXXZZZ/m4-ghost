/**
 * haptic.js
 * Core haptic engine ported from web-haptics (MIT © lochie).
 * https://github.com/lochie/web-haptics
 *
 * Preset reference (Apple HIG aligned):
 *
 * Notification  → "success"    two ascending taps — positive outcome
 *               → "warning"    two taps with hesitation — caution ahead
 *               → "error"      four rapid harsh taps — failure
 *
 * Impact        → "light"      single short tap — minor interaction
 *               → "medium"     moderate tap — standard button press
 *               → "heavy"      strong tap — major state change
 *               → "soft"       cushioned tap — rounded feel
 *               → "rigid"      crisp hard tap — precise feel
 *
 * Selection     → "selection"  subtle tick — picker / slider step
 *
 * Custom        → "nudge"      strong tap + soft tail
 *               → "buzz"       long vibration
 */

// ─── Patterns ────────────────────────────────────────────────────────────────

export const defaultPatterns = {
  // Notification
  success:   { pattern: [{ duration: 30, intensity: 0.5 }, { delay: 60,  duration: 40, intensity: 1   }] },
  warning:   { pattern: [{ duration: 40, intensity: 0.8 }, { delay: 100, duration: 40, intensity: 0.6 }] },
  error:     { pattern: [{ duration: 40, intensity: 0.7 }, { delay: 40,  duration: 40, intensity: 0.7 },
                          { delay: 40,  duration: 40, intensity: 0.9 }, { delay: 40, duration: 50, intensity: 0.6 }] },
  // Impact
  light:     { pattern: [{ duration: 15, intensity: 0.4 }] },
  medium:    { pattern: [{ duration: 25, intensity: 0.7 }] },
  heavy:     { pattern: [{ duration: 35, intensity: 1   }] },
  soft:      { pattern: [{ duration: 40, intensity: 0.5 }] },
  rigid:     { pattern: [{ duration: 10, intensity: 1   }] },
  // Selection
  selection: { pattern: [{ duration: 8,  intensity: 0.3 }] },
  // Custom
  nudge:     { pattern: [{ duration: 80, intensity: 0.8 }, { delay: 80, duration: 50, intensity: 0.3 }] },
  buzz:      { pattern: [{ duration: 1000, intensity: 1 }] },
}

// ─── Internal constants ───────────────────────────────────────────────────────

const TOGGLE_MIN   = 16    // ms at intensity 1 (every frame)
const TOGGLE_MAX   = 184   // range above min  (0.5 ≈ 100ms)
const MAX_PHASE_MS = 1000  // browser haptic window limit
const PWM_CYCLE    = 20    // ms per intensity modulation cycle

// ─── Internal helpers ─────────────────────────────────────────────────────────

function normalizeInput (input) {
  if (input == null) return { vibrations: [{ duration: 25, intensity: 0.7 }] } // medium default
  if (typeof input === 'number') return { vibrations: [{ duration: input }] }
  if (typeof input === 'string') {
    const preset = defaultPatterns[input]
    if (!preset) { console.warn(`[web-haptics] Unknown preset: "${input}"`); return null }
    return { vibrations: preset.pattern.map(v => ({ ...v })) }
  }
  if (Array.isArray(input)) {
    if (!input.length) return { vibrations: [] }
    if (typeof input[0] === 'number') {
      const vibrations = []
      for (let i = 0; i < input.length; i += 2) {
        const delay = i > 0 ? input[i - 1] : 0
        vibrations.push({ ...(delay > 0 && { delay }), duration: input[i] })
      }
      return { vibrations }
    }
    return { vibrations: input.map(v => ({ ...v })) }
  }
  if (input && input.pattern) return { vibrations: input.pattern.map(v => ({ ...v })) }
  return null
}

function modulateVibration (duration, intensity) {
  if (intensity >= 1) return [duration]
  if (intensity <= 0) return []
  const onTime = Math.max(1, Math.round(PWM_CYCLE * intensity))
  const offTime = PWM_CYCLE - onTime
  const result = []
  let remaining = duration
  while (remaining >= PWM_CYCLE) { result.push(onTime, offTime); remaining -= PWM_CYCLE }
  if (remaining > 0) {
    const remOn = Math.max(1, Math.round(remaining * intensity))
    result.push(remOn)
    const remOff = remaining - remOn
    if (remOff > 0) result.push(remOff)
  }
  return result
}

function toVibratePattern (vibrations, defaultIntensity) {
  const result = []
  for (const vib of vibrations) {
    const intensity = Math.max(0, Math.min(1, vib.intensity ?? defaultIntensity))
    const delay     = vib.delay ?? 0
    if (delay > 0) {
      if (result.length && result.length % 2 === 0) result[result.length - 1] += delay
      else { if (!result.length) result.push(0); result.push(delay) }
    }
    const modulated = modulateVibration(vib.duration, intensity)
    if (!modulated.length) {
      if (result.length && result.length % 2 === 0) result[result.length - 1] += vib.duration
      else if (vib.duration > 0) result.push(0, vib.duration)
      continue
    }
    for (const seg of modulated) result.push(seg)
  }
  return result
}

// ─── WebHaptics class ─────────────────────────────────────────────────────────

let _instanceCounter = 0

export class WebHaptics {
  constructor (options = {}) {
    this._id       = ++_instanceCounter
    this._debug    = options.debug ?? false
    this._label    = null
    this._domReady = false
    this._rafId    = null
    this._resolve  = null
  }

  static get isSupported () {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
  }

  async trigger (input, options = {}) {
    const normalized = normalizeInput(input)
    if (!normalized) return
    const { vibrations } = normalized
    if (!vibrations.length) return

    const defaultIntensity = Math.max(0, Math.min(1, options.intensity ?? 0.5))

    for (const vib of vibrations) {
      if (vib.duration > MAX_PHASE_MS) vib.duration = MAX_PHASE_MS
      if (!Number.isFinite(vib.duration) || vib.duration < 0 ||
          (vib.delay !== undefined && (!Number.isFinite(vib.delay) || vib.delay < 0))) {
        console.warn('[web-haptics] Invalid vibration values — skipping.')
        return
      }
    }

    if (WebHaptics.isSupported) {
      navigator.vibrate(toVibratePattern(vibrations, defaultIntensity))
    }

    // iOS / Safari: use the checkbox-switch trick (fires native HIG haptic)
    if (!WebHaptics.isSupported || this._debug) {
      this._ensureDOM()
      if (!this._label) return
      this._stopPattern()
      const firstDelay      = vibrations[0]?.delay ?? 0
      const firstClickFired = firstDelay === 0
      if (firstClickFired) this._label.click()
      await this._runPattern(vibrations, defaultIntensity, firstClickFired)
    }
  }

  cancel () {
    this._stopPattern()
    if (WebHaptics.isSupported) navigator.vibrate(0)
  }

  destroy () {
    this._stopPattern()
    if (this._label) { this._label.remove(); this._label = null; this._domReady = false }
  }

  _stopPattern () {
    if (this._rafId !== null) { cancelAnimationFrame(this._rafId); this._rafId = null }
    if (this._resolve) { this._resolve(); this._resolve = null }
  }

  _runPattern (vibrations, defaultIntensity, firstClickFired) {
    return new Promise(resolve => {
      this._resolve = resolve
      const phases  = []
      let cumulative = 0
      for (const vib of vibrations) {
        const intensity = Math.max(0, Math.min(1, vib.intensity ?? defaultIntensity))
        const delay     = vib.delay ?? 0
        if (delay > 0) { cumulative += delay; phases.push({ end: cumulative, isOn: false, intensity: 0 }) }
        cumulative += vib.duration
        phases.push({ end: cumulative, isOn: true, intensity })
      }
      const totalDuration = cumulative
      let startTime = 0, lastToggleTime = -1

      const loop = time => {
        if (!startTime) startTime = time
        const elapsed = time - startTime
        if (elapsed >= totalDuration) { this._rafId = null; this._resolve = null; resolve(); return }

        let phase = phases[0]
        for (const p of phases) { if (elapsed < p.end) { phase = p; break } }

        if (phase.isOn) {
          const interval = TOGGLE_MIN + (1 - phase.intensity) * TOGGLE_MAX
          if (lastToggleTime === -1) {
            lastToggleTime = time
            if (!firstClickFired) { this._label?.click(); firstClickFired = true }
          } else if (time - lastToggleTime >= interval) {
            this._label?.click()
            lastToggleTime = time
          }
        }
        this._rafId = requestAnimationFrame(loop)
      }
      this._rafId = requestAnimationFrame(loop)
    })
  }

  _ensureDOM () {
    if (this._domReady || typeof document === 'undefined') return
    const id       = `web-haptics-${this._id}`
    const label    = document.createElement('label')
    label.htmlFor  = id
    label.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden'
    const checkbox = document.createElement('input')
    checkbox.type  = 'checkbox'
    checkbox.id    = id
    checkbox.setAttribute('switch', '')
    checkbox.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
    label.appendChild(checkbox)
    document.body.appendChild(label)
    this._label    = label
    this._domReady = true
  }
}

// ─── Shared singleton used by haptic-feedback.js ──────────────────────────────
export const haptics = new WebHaptics()