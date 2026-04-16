export default settings => {
  const options = {
    selector: '#js-promo-popup',
    storageKey: 'm4-promo-hidden',
    delay: 1000,
    ...settings
  }

  const element = document.querySelector(options.selector)
  if (!element) return

  const message = element.dataset.message
  if (!message) return

  if (window.sessionStorage.getItem(options.storageKey) === message) return

  element.innerHTML = `
    <div class="promo-popup__content">
      <span class="promo-popup__message">${message}</span>
      <button class="promo-popup__btn js-promo-close">Don't show again</button>
    </div>
  `

  window.setTimeout(() => {
    element.classList.add('is-visible')
  }, options.delay)

  element.addEventListener('click', (e) => {
    if (e.target.classList.contains('js-promo-close')) {
      e.preventDefault()
      element.classList.remove('is-visible')
      window.sessionStorage.setItem(options.storageKey, message)
      window.setTimeout(() => { element.innerHTML = '' }, 500)
    }
  })
}
