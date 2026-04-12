/* global followSocialMedia siteSearch */

// lib
import 'lazysizes'

import socialMedia from './app/social-media'
import darkMode from './app/dark-mode'
import headerTransparency from './app/header-transparency'
import loadScript from './components/load-script'
import scrollHideHeader from './components/scroll-hide-header'
import promoPopup from './components/promo-popup'
import postInfinite from './post-infinite'

// ─── Haptic feedback ──────────────────────────────────────────────────────────
import initHapticFeedback from './app/haptic-feedback'

const M4Setup = () => {
  console.debug('[main] M4Setup starting')

  if (typeof followSocialMedia === 'object' && followSocialMedia !== null) {
    socialMedia(followSocialMedia, '.js-social-media')
  }

  darkMode('.js-dark-mode')

  headerTransparency('.has-cover', 'is-head-transparent')

  document.querySelector('.js-menu-open').addEventListener('click', function (e) {
    e.preventDefault()
    document.querySelector('.js-search').classList.add('hidden')
    document.body.classList.add('has-menu')
  })

  document.querySelector('.js-menu-close').addEventListener('click', function (e) {
    e.preventDefault()
    document.body.classList.remove('has-menu')
  })

  if (typeof searchSettings !== 'undefined' && typeof siteSearch !== 'undefined') {
    loadScript(siteSearch)
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
  // Customise any of the four targeting modes here.
  // All options shown — remove or leave empty what you don't need.
  initHapticFeedback({
    // (1) CLASS NAMES — elements with any of these classes get haptic on click
    classes: [
      // 'button' and 'kg-btn' are already in the defaults.
      // Add your own:
      // 'load-more-btn',
      // 'js-toggle-search',
    ],

    // (2) LINK PATTERNS — <a href="..."> links whose href matches get haptic
    linkPatterns: [
      // '/shop/',           // all shop links
      // 'mailto:',          // email links
      // /\.pdf$/i,          // PDF downloads
      // /^https?:\/\//,     // all external links
    ],

    // (3) SELECTORS — any CSS selector, most specific wins
    selectors: [
      // '[data-haptic]' is already in the defaults.
      // Add your own:
      // 'nav a',
      // '.post-body a',
      // 'form [type="submit"]',
    ],

    // (4) EXCLUSIONS — matched elements are always skipped
    exclude: [
      // '[disabled]' and '.no-haptic' are already in the defaults.
      // Add your own:
      // '.js-dark-mode',   // dark-mode toggle has its own feel
    ],
  })
}

document.addEventListener('DOMContentLoaded', M4Setup)
