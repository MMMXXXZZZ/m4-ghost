/* global location, requestAnimationFrame, performance */

/**
 * PANELS — two magnetic anchors, and free scrolling everywhere else.
 *
 * Not PBS's model. PBS has no wheel interception whatsoever: its only
 * programmatic scrolls are two calls in its header for nav clicks. It
 * feels instant because EVERY region there is a 100vh panel under
 * scroll-snap-type:mandatory with scroll-snap-stop:always, so a single
 * notch has nowhere to rest except the next panel. That works precisely
 * because nothing on that page scrolls freely.
 *
 * This page does scroll freely below the app, so uniform snapping cannot
 * express the wanted behaviour. There are two magnetic destinations --
 * the top of the document and the app itself -- and everything past the
 * app is ordinary scrolling:
 *
 *   above the app, scrolling down   -> animate to the app
 *   in the app, scrolling up        -> animate to the top
 *   in the app, scrolling down      -> release, free scrolling below
 *   below the app, scrolling up     -> animate to the app, but only once
 *                                      it is REVEAL_RATIO in view
 *   anywhere else                   -> never intercepted
 *
 * The wheel is only ever preventDefault-ed on a gesture that is about to
 * be answered, so free regions keep the platform's own scrolling.
 */

import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(Observer, ScrollToPlugin)

const TAG = '[m4-panels]'

// How much of the app must be on screen before scrolling up is caught.
const REVEAL_RATIO = 0.8
// expo.out rather than the 'pbs' curve: it front-loads harder, so the
// move reads as decisive instead of drifting into place.
const DURATION = 0.65
const EASE = 'expo.out'
// How close to the app's top counts as settled.
const SETTLE_TOL = 6
// Quiet period after an animation, so the tail of the same flick does
// not immediately qualify as the next gesture.
const COOLDOWN = 450

export default function initPanels () {
  const app = document.querySelector('.ix')
  if (!app) return null

  // CSS snapping stays in the stylesheet as a no-JS fallback, but two
  // systems deciding where the page rests fight each other.
  document.documentElement.style.setProperty('scroll-snap-type', 'none')

  let moving = false
  let lastMoveEnd = 0

  const appTop = () => Math.round(app.getBoundingClientRect().top + window.scrollY)

  /** How much of the app is within the viewport, 0..1. */
  function appVisibility () {
    const r = app.getBoundingClientRect()
    const vh = window.innerHeight
    const seen = Math.min(r.bottom, vh) - Math.max(r.top, 0)
    return Math.max(0, seen) / Math.min(r.height, vh)
  }

  /**
   * Settled means the app's top is flush with the viewport top -- not
   * merely that the app is mostly visible. Treating "mostly visible" as
   * being in the app meant that catching it from below qualified
   * instantly as the next go-to-top, so it ran on to the hero and never
   * came to rest.
   */
  function isSettled () {
    return Math.abs(window.scrollY - appTop()) <= SETTLE_TOL
  }

  /** Is the app the thing we are looking at? (header state only) */
  function inApp () {
    return appVisibility() > 0.6
  }

  function animateTo (y) {
    moving = true
    document.body.classList.toggle('ix-in-stack', Math.abs(y - appTop()) < 4)
    gsap.to(window, {
      duration: DURATION,
      ease: EASE,
      scrollTo: { y, autoKill: false },
      onComplete () { moving = false; lastMoveEnd = performance.now() }
    })
  }

  /**
   * An open column scrolls its own prose. The gesture only belongs to
   * the page once that inner scroller has reached its end in the
   * direction being pushed.
   */
  function innerStillScrolling (ev, dir) {
    const body = ev && ev.target && ev.target.closest
      ? ev.target.closest('.ix-body')
      : null
    if (!body || body.hasAttribute('hidden')) return false
    if (body.scrollHeight <= body.clientHeight) return false
    return dir < 0
      ? body.scrollTop > 0
      : Math.ceil(body.scrollTop + body.clientHeight) < body.scrollHeight - 1
  }

  Observer.create({
    type: 'wheel,touch',
    tolerance: 12,
    // Claimed per gesture below, so free regions scroll natively.
    preventDefault: false,
    onChangeY (self) {
      if (moving || performance.now() - lastMoveEnd < COOLDOWN) return
      const dir = self.deltaY > 0 ? 1 : -1
      if (innerStillScrolling(self.event, dir)) return

      const top = appTop()
      const y = window.scrollY
      const above = y < top - 4
      const claim = () => { if (self.event && self.event.cancelable) self.event.preventDefault() }

      if (dir > 0) {
        // Down. One gesture from the top lands on the app; past the app
        // nothing is magnetic.
        if (above) { claim(); animateTo(top) }
        return
      }

      // Up.
      if (above) return // already past it, leave alone
      if (isSettled()) {
        // Only once the app is actually at rest does an up-scroll mean
        // "go to the top".
        claim()
        animateTo(0)
        return
      }
      // Coming up from below: catch the app once it is mostly revealed
      // and bring it to rest. The next gesture is what leaves for the top.
      if (appVisibility() >= REVEAL_RATIO) { claim(); animateTo(top) }
    }
  })

  function syncHeader () {
    document.body.classList.toggle('ix-in-stack', inApp())
  }
  window.addEventListener('scroll', syncHeader, { passive: true })
  syncHeader()

  window.M4Panels = {
    toApp: () => animateTo(appTop()),
    toTop: () => animateTo(0),
    get visibility () { return appVisibility() }
  }

  const nav = performance.getEntriesByType('navigation')[0]
  if (location.hash && !(nav && nav.type === 'reload')) {
    requestAnimationFrame(() => window.scrollTo({ top: appTop(), behavior: 'auto' }))
  }

  console.log(`${TAG} ready ${JSON.stringify({ revealRatio: REVEAL_RATIO })}`)
  return window.M4Panels
}
