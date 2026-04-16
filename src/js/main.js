/* global followSocialMedia siteSearch */

// lib
import 'lazysizes'

import socialMedia        from './app/social-media'
import darkMode           from './app/dark-mode'
import headerTransparency from './app/header-transparency'
import loadScript         from './components/load-script'
import scrollHideHeader   from './components/scroll-hide-header'
import promoPopup         from './components/promo-popup'
import postInfinite       from './post-infinite'

import initHapticFeedback                       from './app/haptic-feedback'
import initMeiliSearch, { MEILISEARCH_ENABLED } from './lib/meilisearch'
import initSpeculationRules                     from './lib/speculation-rules'

const M4Setup = () => {
  console.debug('[main] M4Setup starting')

  if (typeof followSocialMedia === 'object' && followSocialMedia !== null) {
    socialMedia(followSocialMedia, '.js-social-media')
  }

  darkMode('.js-dark-mode')
  headerTransparency('.has-cover', 'is-head-transparent')

  const $menuOpen  = document.querySelector('.js-menu-open')
  const $menuClose = document.querySelector('.js-menu-close')
  const $search    = document.querySelector('.js-search')

  if ($menuOpen) {
    $menuOpen.addEventListener('click', e => {
      e.preventDefault()
      if ($search) $search.classList.add('hidden')
      document.body.classList.add('has-menu')
    })
  }

  if ($menuClose) {
    $menuClose.addEventListener('click', e => {
      e.preventDefault()
      document.body.classList.remove('has-menu')
    })
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  if (!MEILISEARCH_ENABLED) {
    if (typeof searchSettings !== 'undefined' && typeof siteSearch !== 'undefined') {
      loadScript(siteSearch)
    }
  }

  scrollHideHeader('.js-hide-header')
  promoPopup('#js-promo-popup', 2000)

  if (document.querySelector('.js-infinite-container')) {
    console.info('[main] .js-infinite-container detected — initializing postInfinite')
    postInfinite()
  } else {
    console.debug('[main] .js-infinite-container not found — skipping postInfinite')
  }

  // ── Haptic feedback ────────────────────────────────────────────────────────
  initHapticFeedback({
    targets: [],
    exclude: [],
  })

  // ── MeiliSearch ────────────────────────────────────────────────────────────
  initMeiliSearch()

  // ── Speculation Rules (prefetch on hover) ──────────────────────────────────
  // Progressive enhancement: Chromium only. No-ops silently on Firefox/Safari.
  // See src/js/lib/speculation-rules.js for exclusion list and upgrade notes.
  initSpeculationRules()
}

document.addEventListener('DOMContentLoaded', M4Setup)
