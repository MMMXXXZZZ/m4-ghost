/**
 * meilisearch.js
 *
 * Initialises the GhostMeilisearchSearch UI, intercepts [data-ghost-search]
 * clicks to prevent Ghost's native search handler from firing, triggers
 * haptic feedback, and animates the search modal sliding in.
 *
 * The CDN bundle (GhostMeilisearchSearch) is loaded with `defer` in
 * default.hbs — it may not be ready when DOMContentLoaded fires, so we
 * poll briefly until it appears.
 */

import { haptics } from './haptic'

// ─── Config ───────────────────────────────────────────────────────────────────

const MS_CONFIG = {
  meilisearchHost:   'https://m44.cl/search',
  meilisearchApiKey: '27c8ffa68ef4045f6116ba22498b1a19a19acc6f00d58678d4ee8f52810fd2ba',
  indexName:         'ghost_posts',
  theme:             'system',  // 'light' | 'dark' | 'system'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initInstance () {
  if (window.GhostMeilisearchSearch && !window.ghostMeilisearchSearch) {
    window.__MS_SEARCH_CONFIG__    = MS_CONFIG
    window.ghostMeilisearchSearch  = window.GhostMeilisearchSearch.initialize(MS_CONFIG)
  }
}

/**
 * Intercept every [data-ghost-search] click in the capture phase so our
 * handler runs before Ghost's sodo-search handler (which listens on the same
 * elements in bubble phase). stopImmediatePropagation prevents Ghost's handler
 * from ever firing. Haptic is triggered first so the feel lands at the exact
 * instant the modal opens.
 */
function wireSearchTriggers () {
  document.querySelectorAll('[data-ghost-search]').forEach(el => {
    if (el.dataset.msWired) return   // guard against double-wiring
    el.dataset.msWired = '1'

    el.addEventListener('click', e => {
      e.preventDefault()
      e.stopImmediatePropagation()

      haptics.trigger('light')

      window.ghostMeilisearchSearch?.open()
    }, true /* capture phase */)
  })
}

/**
 * Watch for the search modal container being appended to <body>.
 * The library mounts a root element once (on first open). We add the
 * .ms-search-entering class to trigger the CSS slide-in keyframe, then
 * remove it when the animation ends so it doesn't interfere with the
 * library's own open/close transitions on subsequent opens.
 *
 * Detection priority:
 *   1. id="ghost-search-root"           — Ghost / sodo-search convention
 *   2. [data-ghost-search-root]         — alternate attribute some builds use
 *   3. Fixed full-viewport <div> on     — safe heuristic fallback
 *      document.body
 */
function watchForSearchModal () {
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue

        let target = null

        if (node.id === 'ghost-search-root') {
          target = node
        } else if (node.hasAttribute?.('data-ghost-search-root')) {
          target = node
        } else if (node.tagName === 'DIV') {
          const s = window.getComputedStyle(node)
          if (
            s.position === 'fixed' &&
            (s.top === '0px' || s.inset === '0px') &&
            node.parentNode === document.body
          ) {
            target = node
          }
        }

        if (!target) continue

        target.classList.add('ms-search-entering')
        target.addEventListener('animationend', function cleanup () {
          target.classList.remove('ms-search-entering')
        }, { once: true })
      }
    }
  })

  observer.observe(document.body, { childList: true })
}

// ─── Public init ──────────────────────────────────────────────────────────────

/**
 * Call once from main.js inside DOMContentLoaded.
 * Polls for the CDN bundle (max ~2 s) in case it hasn't executed yet.
 */
export default function initMeiliSearch () {
  initInstance()
  wireSearchTriggers()
  watchForSearchModal()

  // If the CDN bundle hasn't loaded yet, poll until it does (max 20 × 100 ms)
  if (!window.ghostMeilisearchSearch) {
    let attempts = 0
    const poll = setInterval(() => {
      attempts++
      initInstance()
      if (window.ghostMeilisearchSearch || attempts >= 20) clearInterval(poll)
    }, 100)
  }
}
