import docSelectorAll from '../app/document-query-selector-all'

/**
 * Gallery card support
 * Used on any individual post/page
 *
 * Detects when a gallery card has been used and applies sizing to make sure
 * the display matches what is seen in the editor.
 */

export default (root = document) => {
  const images = (root && root.querySelectorAll) ? root.querySelectorAll('.kg-gallery-image > img') : docSelectorAll('.kg-gallery-image > img')

  if (!images || !images.length) return

  images.forEach(image => {
    // Idempotency: skip images already processed
    if (image.classList && image.classList.contains('js-gallery-processed')) return

    const container = image.closest('.kg-gallery-image')
    if (!container) return

    const width = image.attributes.width && image.attributes.width.value
    const height = image.attributes.height && image.attributes.height.value
    if (!width || !height) return

    const ratio = width / height
    container.style.flex = ratio + ' 1 0%'

    image.classList.add('js-gallery-processed')
  })
}
