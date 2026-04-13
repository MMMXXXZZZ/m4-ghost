/**
 * meilisearch.js
 *
 * Full MeiliSearch integration — init, click interception, haptics, animation.
 *
 * ─── Rollback ──────────────────────────────────────────────────────────────
 * To switch back to the theme's native FlexSearch:
 *   1. Set MEILISEARCH_ENABLED = false below
 *   2. Remove the CDN <script> and <link> from default.hbs
 *   3. Rebuild
 * Everything else (header buttons, CSS selectors) stays the same.
 *
 * ─── Animation strategy ────────────────────────────────────────────────────
 * The library mounts its container div during initialize(), NOT on first
 * open(). So by the time the user clicks, the container already exists in the
 * DOM and a MutationObserver watching for new body children never fires.
 *
 * Instead:
 *   1. After initialize(), poll for the container with findContainer()
 *   2. Save it as _searchContainer
 *   3. On every open() call, re-trigger the CSS keyframe via a forced reflow
 *      (void el.offsetWidth) so the animation plays each time
 *
 * ─── Haptic strategy ───────────────────────────────────────────────────────
 * Uses a custom two-pulse pattern to match the visual "snap open, settle"
 * feel of the slide animation rather than the generic single tap used by
 * other buttons. Tune SEARCH_HAPTIC to taste.
 */

import { haptics } from './haptic'

// ─── Toggle ───────────────────────────────────────────────────────────────────

/**
 * Set to false to disable MeiliSearch and fall back to the theme's native
 * FlexSearch. main.js reads this flag to decide whether to load search.js.
 */
export const MEILISEARCH_ENABLED = true

// ─── Config ───────────────────────────────────────────────────────────────────

const MS_CONFIG = {
  meilisearchHost:   'https://m44.cl/search',
  meilisearchApiKey: '27c8ffa68ef4045f6116ba22498b1a19a19acc6f00d58678d4ee8f52810fd2ba',
  indexName:         'ghost_posts',
  theme:             'system',  // 'light' | 'dark' | 'system'
}

/**
 * Haptic pattern for opening search.
 * A sharp snap (intensity 0.9, 25 ms) followed by a soft settle
 * (intensity 0.25, 15 ms after 50 ms gap) — mirrors the fast-in /
 * slow-out feel of the ms-slide-in CSS animation.
 * Swap for any preset name ('medium', 'nudge', etc.) or leave as a
 * custom Vibration[] array.
 */
const SEARCH_HAPTIC = [
  { duration: 25, intensity: 0.9 },
  { delay: 50, duration: 15, intensity: 0.25 },
]

// ─── State ────────────────────────────────────────────────────────────────────

let _searchContainer = null  // reference to the modal root element

// ─── Container detection ──────────────────────────────────────────────────────

/**
 * Try to find the search modal container using multiple strategies:
 *   1. Known IDs used by Ghost's sodo-search / common forks
 *   2. Any new child of <body> that appeared since `snapshot` was taken
 *
 * Returns the element or null.
 */
function findContainer (snapshot) {
  const byId =
    document.getElementById('ghost-search-root') ||
    document.getElementById('sodo-search-root')   ||
    document.querySelector('[data-ghost-search-root]')
  if (byId) return byId

  if (snapshot) {
    const newKids = [...document.body.children].filter(el => !snapshot.has(el))
    if (newKids.length) return newKids[newKids.length - 1]
  }

  return null
}

/**
 * Poll for the container after initialize().
 * The library may render the container asynchronously (React), so we check
 * across several animation frames rather than in the same tick.
 */
function detectContainerAfterInit (snapshot) {
  let attempts = 0
  const check = () => {
    attempts++
    const found = findContainer(snapshot)
    if (found) {
      _searchContainer = found
      console.debug('[meilisearch] modal container detected:', _searchContainer.id || _searchContainer.className || _searchContainer.tagName)
      return
    }
    if (attempts < 15) requestAnimationFrame(check)
  }
  requestAnimationFrame(check)
}

// ─── Animation ────────────────────────────────────────────────────────────────

/**
 * Trigger the ms-slide-in keyframe on the search container.
 * Removing the class and forcing a reflow before re-adding it restarts
 * the animation cleanly even if it was already applied on a previous open.
 */
function animateSearchOpen () {
  if (!_searchContainer) return
  _searchContainer.classList.remove('ms-search-entering')
  void _searchContainer.offsetWidth           // force reflow → restart keyframe
  _searchContainer.classList.add('ms-search-entering')
  _searchContainer.addEventListener('animationend', () => {
    _searchContainer.classList.remove('ms-search-entering')
  }, { once: true })
}

/**
 * After calling open(), retry finding the container if it isn't known yet.
 * This covers the (unlikely) case where the container is added on first open
 * rather than on init.
 */
function animateWithRetry (snapshot, attempts = 0) {
  if (_searchContainer) { animateSearchOpen(); return }

  const found = findContainer(snapshot)
  if (found) { _searchContainer = found; animateSearchOpen(); return }

  if (attempts < 10) {
    requestAnimationFrame(() => animateWithRetry(snapshot, attempts + 1))
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────

function initInstance () {
  if (window.GhostMeilisearchSearch && !window.ghostMeilisearchSearch) {
    window.__MS_SEARCH_CONFIG__   = MS_CONFIG
    const snapshot = new Set([...document.body.children])
    window.ghostMeilisearchSearch = window.GhostMeilisearchSearch.initialize(MS_CONFIG)
    // Find whatever the library just added to <body>
    detectContainerAfterInit(snapshot)
  }
}

// ─── Click interception ───────────────────────────────────────────────────────

/**
 * Attach capture-phase listeners to every [data-ghost-search] element.
 * Capture phase ensures our handler runs before Ghost's bubble-phase handler.
 * stopImmediatePropagation prevents Ghost's native search from opening.
 */
function wireSearchTriggers () {
  document.querySelectorAll('[data-ghost-search]').forEach(el => {
    if (el.dataset.msWired) return
    el.dataset.msWired = '1'

    el.addEventListener('click', e => {
      e.preventDefault()
      e.stopImmediatePropagation()

      // Haptic fires synchronously — still within the user gesture context
      // required by iOS Safari for the switch-checkbox trick to produce a tap.
      haptics.trigger(SEARCH_HAPTIC)

      // Snapshot body children BEFORE open() in case the container is
      // added lazily on first open rather than during initialize().
      const snapshot = new Set([...document.body.children])
      window.ghostMeilisearchSearch?.open()
      animateWithRetry(snapshot)

    }, true /* capture phase */)
  })
}

// ─── Public ───────────────────────────────────────────────────────────────────

export default function initMeiliSearch () {
  if (!MEILISEARCH_ENABLED) return

  initInstance()
  wireSearchTriggers()

  // Poll if the CDN bundle hasn't executed yet (defer in default.hbs means
  // it runs after parsing but timing relative to DOMContentLoaded varies)
  if (!window.ghostMeilisearchSearch) {
    let attempts = 0
    const poll = setInterval(() => {
      attempts++
      initInstance()
      if (window.ghostMeilisearchSearch || attempts >= 20) clearInterval(poll)
    }, 100)
  }
}
