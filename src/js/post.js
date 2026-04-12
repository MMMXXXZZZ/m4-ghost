// Post
// Loads main.js first (which calls initHapticFeedback via DOMContentLoaded),
// so haptic feedback is already active for the initial post page.
// The delegated listener on `document` automatically covers elements
// appended later by infinite scroll — no re-init needed.
import './main'

import videoResponsive from './components/video-responsive'
import resizeImagesInGalleries from './components/resize-images-galleries'
import highlightPrism from './components/highlight-prismjs'
import M4Gallery from './components/gallery'
import isSinglePost from './post/is-singgle-post'

import initInfiniteScroll from './post-infinite'

const M4PostSetup = () => {
  console.log('M4PostSetup: Starting initialization...')

  videoResponsive()
  resizeImagesInGalleries()
  highlightPrism('code[class*=language-]')
  isSinglePost()
  M4Gallery()

  console.log('M4PostSetup: Initializing Infinite Scroll...')
  initInfiniteScroll()

  // ── Haptic note ────────────────────────────────────────────────────────────
  // initHapticFeedback() was already called by main.js.
  // Because it uses a single delegated listener on `document`, it automatically
  // covers every article appended by infinite scroll — nothing extra needed here.
}

document.addEventListener('DOMContentLoaded', M4PostSetup)
