export default el => {
  const $header = document.querySelector(el)

  if (!$header) return

  // Guard: .js-search may not exist on every page template
  const $search = document.querySelector('.js-search')

  let prevScrollpos = window.pageYOffset

  // IMPORTANT: use addEventListener, not `window.onscroll = ...`
  // Assigning to window.onscroll gets silently overwritten by any other
  // script (including infinite-scroll) that does the same — this was why
  // scroll-hide-header stopped working after infinite scroll was added.
  window.addEventListener('scroll', function () {
    const currentScrollPos = window.pageYOffset

    if (prevScrollpos > currentScrollPos) {
      // Scrolling up — reveal header
      $header.classList.remove('-top-18')
      if ($search) $search.classList.add('mt-16')
    } else {
      // Scrolling down — hide header
      $header.classList.add('-top-18')
      if ($search) $search.classList.remove('mt-16')
    }

    prevScrollpos = currentScrollPos
  }, { passive: true })
}