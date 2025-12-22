/* global prismJs */

import loadScript from './load-script'
import docSelectorAll from '../app/document-query-selector-all'

export default (root = document, codeLanguage) => {
  const $codeLanguage = (root && root.querySelectorAll) ? root.querySelectorAll(codeLanguage) : docSelectorAll(codeLanguage)

  if ((!$codeLanguage || !$codeLanguage.length) && typeof prismJs === 'undefined') return

  // Show Language
  Array.prototype.forEach.call($codeLanguage || [], element => {
    // Idempotency
    if (element.classList && element.classList.contains('js-prism-processed')) return

    let language = element.getAttribute('class') || ''
    language = language.split('-')
    if (element.parentElement && language[1]) {
      element.parentElement.setAttribute('rel', language[1])
    }

    if (element.classList) element.classList.add('js-prism-processed')
  })

  // Load PrismJs and Plugin Loaf
  loadScript(prismJs)
}
