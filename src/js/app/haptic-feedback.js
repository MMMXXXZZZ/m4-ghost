/**
 * haptic-feedback.js
 *
 * Attaches web-haptics feedback to any element via a `targets` array.
 * Each target maps a CSS selector → a named haptic preset (+ optional event).
 *
 * Uses a single delegated listener on `document` — works automatically
 * for elements added later by infinite scroll, no re-init needed.
 *
 * ─── Preset quick-reference ────────────────────────────────────────────────
 *
 *  "light"      single short tap     — nav links, toggles, minor taps
 *  "medium"     moderate tap         — buttons, card actions  (default)
 *  "heavy"      strong tap           — major actions, destructive confirms
 *  "soft"       cushioned tap        — subtle, rounded feel
 *  "rigid"      crisp hard tap       — precise, snappy feel
 *  "selection"  subtle tick          — sliders, pickers, steppers
 *  "success"    two ascending taps   — form saved, payment confirmed
 *  "warning"    two taps + hesitate  — destructive action ahead
 *  "error"      four rapid taps      — validation fail, network error
 *  "nudge"      strong + soft tail   — reminder / attention grab
 *  "buzz"       long vibration       — rare, high-attention moments
 *
 * ─── Apple HIG rules (follow these) ───────────────────────────────────────
 *  • Always pair with a visual change — never haptic-only feedback.
 *  • Match intensity to significance: minor → light/selection, major → heavy.
 *  • Don't over-use — if everything vibrates, nothing feels special.
 *  • Fire the haptic at the exact instant the visual change occurs.
 *  • For async ops, trigger on result, not on initiation:
 *      try { await submit(); haptics.trigger('success') }
 *      catch { haptics.trigger('error') }
 *
 * ─── Usage ─────────────────────────────────────────────────────────────────
 *
 *   import initHapticFeedback from './app/haptic-feedback'
 *
 *   initHapticFeedback({
 *     targets: [
 *       { selector: 'button',               haptic: 'medium'    },
 *       { selector: 'a[href]',              haptic: 'light'     },
 *       { selector: '.hla',                 haptic: 'light'     },
 *       { selector: '[data-haptic]',        haptic: 'medium'    },
 *       { selector: '.kg-audio-seek-slider',haptic: 'selection', event: 'change' },
 *     ],
 *     exclude: ['[disabled]', '.no-haptic'],
 *   })
 */

import { haptics } from '../lib/haptic'

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  /**
   * Array of target objects: { selector, haptic, event? }
   *
   *   selector  — any valid CSS selector
   *   haptic    — preset name (see reference above), default: "medium"
   *   event     — DOM event to listen for, default: "click"
   *               Use "change" for <input type="range"> sliders so haptic
   *               fires once on release rather than on every drag tick.
   */
  targets: [
    // Interactive elements
    { selector: 'button',                  haptic: 'medium'    },
    { selector: 'a[href]',                 haptic: 'light'     },

    // Theme icon-buttons (li elements acting as buttons)
    { selector: '.hla',                    haptic: 'light'     },
    { selector: '[data-ghost-search]',     haptic: 'light'     },

    // Opt-in data attribute — add data-haptic="preset" to any element,
    // or just data-haptic for the default medium.
    { selector: '[data-haptic]',           haptic: 'medium'    },

    // Ghost audio card — buttons covered by 'button' above,
    // sliders use 'change' so they fire once on release.
    { selector: '.kg-audio-seek-slider',   haptic: 'selection', event: 'change' },
    { selector: '.kg-audio-volume-slider', haptic: 'selection', event: 'change' },
  ],

  /**
   * Exclusions — matched elements are always skipped regardless of targets.
   * Add '.no-haptic' to any element in your templates to opt out.
   */
  exclude: [
    '[disabled]',
    '[aria-disabled="true"]',
    '.no-haptic',
  ],
}

// ─── Init ────────────────────────────────────────────────────────────────────

/**
 * @param {Partial<typeof DEFAULT_CONFIG>} userConfig
 */
export default function initHapticFeedback (userConfig = {}) {
  const config = {
    exclude: [...DEFAULT_CONFIG.exclude, ...(userConfig.exclude || [])],
    // targets: user list replaces defaults if provided, otherwise use defaults
    targets: userConfig.targets
      ? [...DEFAULT_CONFIG.targets, ...userConfig.targets]
      : [...DEFAULT_CONFIG.targets],
  }

  const excludeSelector = config.exclude.filter(Boolean).join(', ') || null

  // Group targets by event type so we can attach one delegated listener per event
  const byEvent = {}
  for (const target of config.targets) {
    const event = target.event || 'click'
    if (!byEvent[event]) byEvent[event] = []
    byEvent[event].push(target)
  }

  // Build a combined selector per event group for fast .closest() lookup
  for (const [event, targets] of Object.entries(byEvent)) {
    // Map from selector string → haptic preset
    const presetMap = new Map()
    for (const t of targets) {
      presetMap.set(t.selector.trim(), t.haptic || 'medium')
    }

    const combinedSelector = [...presetMap.keys()].join(', ')

    document.addEventListener(event, function handleHaptic (e) {
      const el = e.target.closest(combinedSelector)
      if (!el) return

      // Exclusions win
      if (excludeSelector && el.matches(excludeSelector)) return

      // Resolve which preset to use: first matching selector wins
      let preset = 'medium'
      for (const [sel, p] of presetMap) {
        try { if (el.matches(sel)) { preset = p; break } } catch (_) {}
      }

      // data-haptic="preset" overrides everything — lets templates customise inline
      const dataPreset = el.getAttribute('data-haptic')
      if (dataPreset && dataPreset.trim()) preset = dataPreset.trim()

      haptics.trigger(preset)

    }, { passive: true })
  }

  if (process.env.NODE_ENV !== 'production') {
    for (const [event, targets] of Object.entries(byEvent)) {
      console.debug(
        `[haptic-feedback] "${event}" listener →`,
        targets.map(t => `${t.selector} (${t.haptic || 'medium'})`).join(' | ')
      )
    }
    if (excludeSelector) console.debug('[haptic-feedback] Excluding:', excludeSelector)
  }
}