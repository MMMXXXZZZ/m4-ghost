/**
 * Entry: custom-guide-interactive.hbs only.
 *
 * Loaded via {{#contentFor "scripts"}} in that template, so none of this
 * — three.js included — reaches any other page on the site.
 *
 * Order matters: tilt publishes window.M4Tilt before the ember field
 * starts reading it, and columns mount last so getBBox can measure icons
 * that are already in the document.
 */

import initTilt from './guide/tilt'
import initEmbers from './guide/embers'
import initColumns from './guide/columns'
import initPanels from './guide/panels'

function boot () {
  initTilt()
  initEmbers(document.querySelector('.ix-hero-fx'))
  initColumns()
  initPanels()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
