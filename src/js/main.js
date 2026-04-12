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

  // ── Mobile menu ────────────────────────────────────────────────────────────
  // Guard against .js-search being absent on pages that don't render the
  // search overlay partial (prevents a null-reference crash that would
  // silently swallow the menu open/close listeners).
  const $menuOpen  = document.querySelector('.js-menu-open')
  const $menuClose = document.querySelector('.js-menu-close')
  const $search    = document.querySelector('.js-search')

  if ($menuOpen) {
    $menuOpen.addEventListener('click', function (e) {
      e.preventDefault()
      if ($search) $search.classList.add('hidden')
      document.body.classList.add('has-menu')
    })
  }

  if ($menuClose) {
    $menuClose.addEventListener('click', function (e) {
      e.preventDefault()
      document.body.classList.remove('has-menu')
    })
  }

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
  initHapticFeedback({
    targets: [
      // { selector: '.load-more-btn',          haptic: 'medium'    },
      // { selector: '[data-portal]',           haptic: 'light'     },
      // { selector: '[data-members-signout]',  haptic: 'warning'   },
      // { selector: '.js-dark-mode',           haptic: 'selection' },
      // { selector: 'form [type="submit"]',    haptic: 'medium'    },
    ],
    exclude: [],
  })
}

document.addEventListener('DOMContentLoaded', M4Setup)