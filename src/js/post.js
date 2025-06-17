// Post
import './main'

import videoResponsive from './components/video-responsive'
import resizeImagesInGalleries from './components/resize-images-galleries'
import highlightPrism from './components/highlight-prismjs'
import M4Gallery from './components/gallery'

// Post
import isSinglePost from './post/is-singgle-post'

const M4PostSetup = () => {
  /* All Video Responsive
  /* ---------------------------------------------------------- */
  videoResponsive()

  /* Gallery Card
  /* ---------------------------------------------------------- */
  resizeImagesInGalleries()

  /* highlight prismjs
  /* ---------------------------------------------------------- */
  highlightPrism('code[class*=language-]')

  /* Is single post
  /* ---------------------------------------------------------- */
  isSinglePost()

  /* M4 Gallery
  /* ---------------------------------------------------------- */
  M4Gallery()

  // End M4Setup
}

document.addEventListener('DOMContentLoaded', M4PostSetup)
