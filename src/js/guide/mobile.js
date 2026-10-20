/* global getComputedStyle, requestAnimationFrame, IntersectionObserver */

/**
 * MOBILE — one document, a sticky face rail, and lag between the two.
 *
 * On a phone, opening a drawer does not isolate that column. Every
 * column's body unwraps into a single scrollable document and the rail
 * of faces becomes a sticky header, centred on whichever column you are
 * reading. The two are linked but never rigid:
 *
 *   scrolling the document  -> the rail glides to centre that face
 *   dragging the rail       -> the document follows to that column
 *
 * Neither is instant. A connected-but-separate object that tracks its
 * partner frame-for-frame reads as one welded thing; a short delay reads
 * as mass. Every link here carries LAG, and that is the rule for this
 * project rather than a flourish of this component.
 *
 * Dragging the rail deliberately does NOT "tap into" the column it
 * passes. There is no open/close here -- only a reading position that
 * the two views agree on, eventually.
 */

import { gsap } from 'gsap'

const TAG = '[m4-mobile]'

// The lag law. Short enough to feel responsive, long enough to read as
// something with mass following something else.
const LAG = 0.18
const FOLLOW = 0.55

export const isPhone = () => window.matchMedia('(max-width: 64rem)').matches

export default function initMobile (entries, stack, nav, onBack) {
  if (!entries.length) return null

  const app = stack.parentElement

  // A sticky element only sticks within its own parent's box. The rail
  // is appended to <body> as its last child, so sticky parked it at the
  // bottom of the document -- measured at top 12365 of 13123. It has to
  // live inside the app to stick to the top of the read.
  function dockRail () {
    if (nav.parentElement !== app) app.insertBefore(nav, stack)
  }
  function undockRail () {
    if (nav.parentElement !== document.body) document.body.appendChild(nav)
  }

  // Back out of the continuous read to the three-drawer pages.
  const back = document.createElement('button')
  back.type = 'button'
  back.className = 'ix-rail-back'
  back.setAttribute('aria-label', 'Volver')
  back.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"/></svg>'
  back.addEventListener('click', (e) => {
    e.stopPropagation()
    if (onBack) onBack()
  })

  let active = null
  let railSettling = false
  let docSettling = false

  const railBtn = (e) => e.nav

  /** Centre a face in the rail, trailing whatever caused it. */
  function centreRail (entry, immediate) {
    const btn = railBtn(entry)
    if (!btn) return
    const target = btn.offsetLeft - (nav.clientWidth - btn.offsetWidth) / 2
    if (immediate) { nav.scrollLeft = target; return }
    railSettling = true
    gsap.to(nav, {
      scrollLeft: Math.max(0, target),
      duration: FOLLOW,
      delay: LAG,
      ease: 'expo.out',
      overwrite: 'auto',
      onComplete () { railSettling = false }
    })
  }

  /** Bring a column's body to the reading position, trailing the rail. */
  function goToColumn (entry, immediate) {
    const y = entry.body.getBoundingClientRect().top + window.scrollY - railHeight()
    if (immediate) { window.scrollTo({ top: y, behavior: 'auto' }); return }
    docSettling = true
    gsap.to(window, {
      duration: FOLLOW,
      delay: LAG,
      ease: 'expo.out',
      scrollTo: { y, autoKill: false },
      overwrite: 'auto',
      onComplete () { docSettling = false }
    })
  }

  function railHeight () {
    return nav.getBoundingClientRect().height + (parseFloat(getComputedStyle(nav).top) || 0)
  }

  function setActive (entry, from) {
    if (!entry || entry === active) return
    active = entry
    entries.forEach((e) => {
      const on = e === entry
      e.nav.setAttribute('aria-current', on ? 'true' : 'false')
      e.item.dataset.reading = on ? 'true' : 'false'
    })
    if (from !== 'rail') centreRail(entry)
  }

  /**
   * Unwrap every column into one document. This is the whole difference
   * from desktop: there is no single open column on a phone, only a
   * position within a continuous read.
   */
  function unwrapAll (target) {
    stack.dataset.mobileOpen = 'true'
    dockRail()
    if (back.parentElement !== nav) nav.insertBefore(back, nav.firstChild)
    entries.forEach((e) => {
      e.body.removeAttribute('hidden')
      e.item.dataset.open = 'true'
      gsap.set(e.item, { '--g': 1 })
    })
    nav.classList.add('is-rail')

    // Let layout settle before measuring a scroll target.
    requestAnimationFrame(() => {
      if (target) { goToColumn(target, true); setActive(target, 'init'); centreRail(target, true) }
      watchReadingPosition()
    })
  }

  function wrapAll () {
    stack.dataset.mobileOpen = 'false'
    nav.classList.remove('is-rail')
    undockRail()
    if (back.parentElement) back.remove()
    entries.forEach((e) => { e.item.dataset.reading = 'false' })
  }

  /** Which column is at the reading line? */
  let io = null
  function watchReadingPosition () {
    if (io) io.disconnect()
    const line = railHeight() + 24
    io = new IntersectionObserver((records) => {
      // Whichever side is driving, the other must not answer back --
      // otherwise the lag turns into a feedback loop between them.
      if (railSettling || docSettling) return
      records.forEach((r) => {
        if (r.isIntersecting) {
          const e = entries.find((x) => x.body === r.target)
          if (e) setActive(e, 'scroll')
        }
      })
    }, { rootMargin: `-${Math.round(line)}px 0px -70% 0px`, threshold: 0 })
    entries.forEach((e) => io.observe(e.body))
  }

  // Dragging the rail moves the read, without opening anything.
  /**
   * Switch as soon as the next face reaches the middle of the rail, not
   * after the drag has stopped. Waiting for an idle moment made the
   * column change feel disconnected from the gesture that caused it.
   * The document still follows on the lag -- that part SHOULD trail.
   */
  function centredEntry () {
    const mid = nav.scrollLeft + nav.clientWidth / 2
    let best = null
    let bestD = Infinity
    entries.forEach((e) => {
      const b = railBtn(e)
      const d = Math.abs((b.offsetLeft + b.offsetWidth / 2) - mid)
      if (d < bestD) { bestD = d; best = e }
    })
    return best
  }

  nav.addEventListener('scroll', () => {
    if (railSettling || stack.dataset.mobileOpen !== 'true') return
    const best = centredEntry()
    if (best && best !== active) {
      setActive(best, 'rail')
      goToColumn(best)
    }
  }, { passive: true })

  console.log(`${TAG} ready ${JSON.stringify({ columns: entries.length, lag: LAG })}`)
  return { unwrapAll, wrapAll, goToColumn, centreRail, setActive, get active () { return active } }
}
