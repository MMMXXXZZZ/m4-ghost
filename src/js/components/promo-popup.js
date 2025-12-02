export default settings => {
  const defaults = {
    selector: '#js-promo-popup',
    storageKey: 'm4-promo-hidden',
    delay: 1000,
    content: `
      <div class="promo-popup__content">
        <span class="promo-popup__message">
          📢 We've updated our privacy policy and detention guidelines.
        </span>
        <button class="promo-popup__btn js-promo-close">
          Don't show again
        </button>
      </div>
    `
  }

  const options = { ...defaults, ...settings }
  const element = document.querySelector(options.selector)

  if (!element) return

  // Check Session Storage
  if (window.sessionStorage.getItem(options.storageKey) === 'true') {
    return
  }

  // Populate HTML
  element.innerHTML = options.content

  // Animate In (Enlarge Vertically)
  window.setTimeout(() => {
    element.classList.add('is-visible')
  }, options.delay)

  // Handle Close
  element.addEventListener('click', (e) => {
    if (e.target.classList.contains('js-promo-close')) {
      e.preventDefault()

      // Animate Out
      element.classList.remove('is-visible')

      // Set Session Storage
      window.sessionStorage.setItem(options.storageKey, 'true')

      // Remove from DOM after transition
      window.setTimeout(() => {
        element.innerHTML = ''
      }, 500)
    }
  })
}