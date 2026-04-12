// Post
// Imports main.js which handles all shared setup (nav, dark mode, haptic, etc.)
// This file only adds post-specific behaviour on top.
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

  // Haptic feedback is already active from main.js — the delegated listener on
  // `document` automatically covers articles appended by infinite scroll.
}

document.addEventListener('DOMContentLoaded', M4PostSetup)