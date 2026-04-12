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
  //
  // `targets` extends the defaults — you don't need to repeat selectors already
  // in DEFAULT_CONFIG (button, a[href], .hla, [data-ghost-search], sliders…).
  //
  // Add extras here, or override individual presets by repeating a selector
  // with a different haptic value (first match wins).
  //
  // Inline override: add data-haptic="success" to any element in your templates.
  //
  initHapticFeedback({
    targets: [
      // Examples — uncomment or add your own:
      // { selector: '.load-more-btn',          haptic: 'medium'    },
      // { selector: '[data-portal]',           haptic: 'light'     },  // Ghost portal links
      // { selector: '[data-members-signout]',  haptic: 'warning'   },  // sign-out = caution
      // { selector: '.js-dark-mode',           haptic: 'selection' },  // theme toggle
      // { selector: 'form [type="submit"]',    haptic: 'medium'    },
    ],

    exclude: [
      // '[disabled]' and '.no-haptic' are already in defaults.
      // Add your own opt-outs:
      // '.promo-popup__btn',
    ],
  })
}

document.addEventListener('DOMContentLoaded', M4Setup)