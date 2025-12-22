// Post
import './main'

import videoResponsive from './components/video-responsive'
import resizeImagesInGalleries from './components/resize-images-galleries'
import highlightPrism from './components/highlight-prismjs'
import M4Gallery from './components/gallery'
import isSinglePost from './post/is-singgle-post'

// Import Infinite Scroll Manager
import initInfiniteScroll from './post-infinite'

const M4PostSetup = () => {
  /* Standard Initializers */
  videoResponsive()
  resizeImagesInGalleries()
  highlightPrism('code[class*=language-]')
  isSinglePost()
  M4Gallery()

  /* Initialize Infinite Scroll */
  initInfiniteScroll()
}

document.addEventListener('DOMContentLoaded', M4PostSetup)