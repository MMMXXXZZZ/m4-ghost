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
 * ─── Usage ─────────────────────────────────────────────────────────────────
 *
 *   import initHapticFeedback from './app/haptic-feedback'
 *
 *   initHapticFeedback({
 *     targets: [
 *       { selector: 'button',               haptic: 'medium'    },
 *       { selector: 'a[href]',              haptic: 'light'     },
 *       { selector: '.kg-audio-seek-slider',haptic: 'selection', event: 'change' },
 *     ],
 *     exclude: ['[disabled]', '.no-haptic'],
 *   })
 */

import { haptics } from '../lib/haptic'

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  targets: [
    { selector: 'button',                  haptic: 'medium'    },
    { selector: 'a[href]',                 haptic: 'heavy'     },
    { selector: '.hla',                    haptic: 'light'     },

    // [data-ghost-search] clicks are handled by meilisearch.js (capture phase)
    // so they never reach this bubble-phase listener. Listed here only so that
    // if MeiliSearch is not loaded, the click still gets a haptic.
    { selector: '[data-ghost-search]',     haptic: 'nudge'     },

    { selector: '[data-haptic]',           haptic: 'medium'    },
    { selector: '.kg-audio-seek-slider',   haptic: 'selection', event: 'change' },
    { selector: '.kg-audio-volume-slider', haptic: 'selection', event: 'change' },
  ],
  exclude: [
    '[disabled]',
    '[aria-disabled="true"]',
    '.no-haptic',
  ],
}

// ─── Init ────────────────────────────────────────────────────────────────────

export default function initHapticFeedback (userConfig = {}) {
  const config = {
    exclude: [...DEFAULT_CONFIG.exclude, ...(userConfig.exclude || [])],
    targets: userConfig.targets
      ? [...DEFAULT_CONFIG.targets, ...userConfig.targets]
      : [...DEFAULT_CONFIG.targets],
  }

  const excludeSelector = config.exclude.filter(Boolean).join(', ') || null

  const byEvent = {}
  for (const target of config.targets) {
    const event = target.event || 'click'
    if (!byEvent[event]) byEvent[event] = []
    byEvent[event].push(target)
  }

  for (const [event, targets] of Object.entries(byEvent)) {
    const presetMap = new Map()
    for (const t of targets) presetMap.set(t.selector.trim(), t.haptic || 'medium')

    const combinedSelector = [...presetMap.keys()].join(', ')

    document.addEventListener(event, function handleHaptic (e) {
      const el = e.target.closest(combinedSelector)
      if (!el) return
      if (excludeSelector && el.matches(excludeSelector)) return

      let preset = 'medium'
      for (const [sel, p] of presetMap) {
        try { if (el.matches(sel)) { preset = p; break } } catch (_) {}
      }

      // data-haptic="preset" inline override — highest priority
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