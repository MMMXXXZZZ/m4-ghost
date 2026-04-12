/**
 * haptic-feedback.js
 *
 * Attaches haptic feedback to any combination of:
 *   1. CSS class names          → config.classes
 *   2. Link href patterns       → config.linkPatterns
 *   3. Raw CSS selectors        → config.selectors
 *   4. Exclusions (opt-out)     → config.exclude
 *
 * Uses a single delegated listener on `document` — cheap and
 * works for elements added dynamically (e.g. infinite scroll posts).
 *
 * Usage — call once after DOMContentLoaded:
 *
 *   import initHapticFeedback from './app/haptic-feedback'
 *
 *   initHapticFeedback({
 *     classes:      ['button', 'btn', 'js-haptic'],
 *     linkPatterns: ['/shop/', 'mailto:', /\.pdf$/i],
 *     selectors:    ['[data-haptic]', 'nav a', '.sidebar .button'],
 *     exclude:      ['[disabled]', '.no-haptic', '.promo-popup__btn'],
 *     duration:     10,   // ms — Android / Vibration API only
 *   })
 */

import { triggerHaptic } from '../lib/haptic'

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  /**
   * (1) CLASS NAMES  — without the leading dot.
   * Every element that has at least one of these classes will trigger haptic.
   *
   * Examples:
   *   classes: ['button', 'btn', 'kg-btn', 'js-haptic']
   */
  classes: [
    'button',    // your theme's .button class
    'kg-btn',    // Ghost card buttons
    'js-haptic', // opt-in marker — add this class to any element you like
    'post-box',
    'story-cover',
  ],

  /**
   * (2) LINK PATTERNS — strings or RegExp objects tested against href.
   * Only <a> tags are tested. An empty array disables link-pattern matching.
   *
   * Examples:
   *   linkPatterns: [
   *     '/shop/',            // internal shop links
   *     'mailto:',           // email links
   *     /\.pdf$/i,           // PDF downloads
   *     /^https?:\/\/(?!yourdomain\.com)/, // all external links
   *   ]
   */
  linkPatterns: [],

  /**
   * (3) SELECTORS — any valid CSS selector string.
   * These are passed directly to .matches() / .closest().
   *
   * Examples:
   *   selectors: [
   *     '[data-haptic]',      // data-attribute opt-in
   *     'nav a',              // all nav links
   *     '.post-body a',       // all links inside posts
   *     'form [type="submit"]',
   *   ]
   */
  selectors: [
    '[data-haptic]',        // data-attribute opt-in on any element
    'button',
    'a[href]',
      '.hla',
  '[data-ghost-search]',
    '.kg-audio-seek-slider',
  '.kg-audio-volume-slider',
  ],

  /**
   * (4) EXCLUDE — CSS selectors that suppress haptic even if matched above.
   * Checked last, so they always win.
   *
   * Examples:
   *   exclude: [
   *     '[disabled]',
   *     '[aria-disabled="true"]',
   *     '.no-haptic',
   *     '.js-dark-mode',  // already has its own feel
   *   ]
   */
  exclude: [
    '[disabled]',
    '[aria-disabled="true"]',
    '.no-haptic',
  ],

  /**
   * Vibration duration in milliseconds.
   * Only used on Android / browsers that support the Vibration API.
   * iOS ignores this (it uses a native tick with no configurable length).
   */
  duration: 10,
}

// ─── Init ────────────────────────────────────────────────────────────────────

/**
 * @param {Partial<typeof DEFAULT_CONFIG>} userConfig
 */
export default function initHapticFeedback (userConfig = {}) {
  const config = {
    ...DEFAULT_CONFIG,
    ...userConfig,
    // Array fields are merged, not replaced, so callers can just pass extras
    classes:      [...DEFAULT_CONFIG.classes,      ...(userConfig.classes      || [])],
    linkPatterns: [...DEFAULT_CONFIG.linkPatterns, ...(userConfig.linkPatterns || [])],
    selectors:    [...DEFAULT_CONFIG.selectors,    ...(userConfig.selectors    || [])],
    exclude:      [...DEFAULT_CONFIG.exclude,      ...(userConfig.exclude      || [])],
  }

  // ── Build the CSS selector that catches everything in one .closest() call ──

  const selectorParts = new Set()

  // Classes → .className
  config.classes.forEach(cls => {
    if (cls && cls.trim()) selectorParts.add(`.${cls.trim().replace(/^\./, '')}`)
  })

  // Raw selectors pass through as-is
  config.selectors.forEach(sel => {
    if (sel && sel.trim()) selectorParts.add(sel.trim())
  })

  // Link patterns require us to catch ALL <a> tags first, then filter in the handler
  const hasLinkPatterns = config.linkPatterns.length > 0
  if (hasLinkPatterns) selectorParts.add('a[href]')

  if (selectorParts.size === 0) {
    console.warn('[haptic-feedback] No targets configured — nothing to listen to.')
    return
  }

  const combinedSelector = [...selectorParts].join(', ')
  const excludeSelector  = config.exclude.filter(Boolean).join(', ') || null

  // ── Single delegated listener ─────────────────────────────────────────────

  document.addEventListener('click', function handleHapticClick (e) {
    // Walk up the DOM from the click target to find the first matching ancestor
    const target = e.target.closest(combinedSelector)
    if (!target) return

    // (4) Exclusions — checked against the matched element
    if (excludeSelector && target.matches(excludeSelector)) return

    // (2) Extra gate for <a> tags: only fire if the href matches a pattern
    if (target.tagName === 'A' && hasLinkPatterns) {
      // Skip if the element already matched via a class or explicit selector
      const matchedByClassOrSelector = (
        config.classes.some(cls => target.classList.contains(cls.replace(/^\./, ''))) ||
        config.selectors.some(sel => {
          try { return target.matches(sel) } catch (_) { return false }
        })
      )

      if (!matchedByClassOrSelector) {
        const href = target.getAttribute('href') || ''
        const hrefMatches = config.linkPatterns.some(pattern => {
          if (pattern instanceof RegExp) return pattern.test(href)
          return typeof pattern === 'string' && href.includes(pattern)
        })
        if (!hrefMatches) return
      }
    }

    triggerHaptic(config.duration)

  }, { passive: true })

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[haptic-feedback] Listening for:', combinedSelector)
    if (excludeSelector) console.debug('[haptic-feedback] Excluding:', excludeSelector)
  }
}
