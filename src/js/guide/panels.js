/* global location, requestAnimationFrame */

/**
 * PANELS — gesture-driven navigation between the guide's three panels.
 *
 * CSS scroll-snap cannot do this. The browser always scrolls first and
 * only decides where the motion settles, so a light wheel drifts before
 * anything snaps -- the behaviour that made the page feel loose rather
 * than taken over. PBS has the same drift for the same reason.
 *
 * So the wheel is intercepted instead: past a threshold the page is
 * animated straight to the next panel, one gesture to one panel, with no
 * drift in between. This is the GSAP Observer section-navigation
 * pattern (https://gsap.com/docs/v3/Plugins/Observer/).
 *
 * Native scrolling is preserved where it belongs: inside an open column
 * the reader scrolls the prose normally, and only a push past the end of
 * that content hands over to the next panel.
 *
 * CSS snapping is switched off while this runs. Two systems both deciding
 * where the page should rest will fight each other.
 */

import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(Observer, ScrollToPlugin)

const TAG = '[m4-panels]'

export default function initPanels () {
  const panels = ['.ix-hero', '.ix-stack', '.ix-outro']
    .map((s) => document.querySelector(s))
    .filter(Boolean)
  if (panels.length < 2) return null

  // Hand-off from CSS: Observer owns resting position from here.
  document.documentElement.style.setProperty('scroll-snap-type', 'none')

  const top = (el) => Math.round(el.getBoundingClientRect().top + window.scrollY)
  let index = 0
  let moving = false

  function sync () {
    // The site header is hidden while a column is open so nothing
    // overlays the reading panel; it returns on the hero and the outro.
    document.body.classList.toggle('ix-in-stack', panels[index].classList.contains('ix-stack'))
  }

  function goTo (i, immediate) {
    const n = gsap.utils.clamp(0, panels.length - 1, i)
    if (n === index && !immediate) return false
    index = n
    sync()
    if (immediate) {
      window.scrollTo({ top: top(panels[n]), behavior: 'auto' })
      return true
    }
    moving = true
    gsap.to(window, {
      duration: 0.9,
      ease: 'pbs',
      scrollTo: { y: () => top(panels[n]), autoKill: false },
      onComplete () { moving = false }
    })
    return true
  }

  /**
   * An open column scrolls its own prose. Only when that inner scroller
   * is at the end in the direction being pushed does the gesture belong
   * to the panels.
   */
  function innerHandles (ev, dir) {
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
    // Threshold, so a stray nudge does not change panel; preventDefault
    // is what stops the page drifting before we take over.
    tolerance: 24,
    preventDefault: true,
    onChangeY (self) {
      if (moving) return
      const dir = self.deltaY > 0 ? 1 : -1
      if (innerHandles(self.event, dir)) {
        // Give the gesture back to the column's own scroller.
        if (self.event && self.event.cancelable === false) return
        const body = self.event.target.closest('.ix-body')
        body.scrollTop += self.deltaY
        return
      }
      goTo(index + dir)
    }
  })

  // Deep links and the column component can ask for a specific panel.
  window.M4Panels = {
    goTo,
    toStack: () => goTo(panels.findIndex((p) => p.classList.contains('ix-stack'))),
    toOutro: () => goTo(panels.length - 1),
    get index () { return index }
  }

  // Land on the right panel when arriving with a column in the hash.
  if (location.hash) {
    requestAnimationFrame(() => {
      goTo(panels.findIndex((p) => p.classList.contains('ix-stack')), true)
    })
  }
  sync()

  console.log(`${TAG} ready ${JSON.stringify({ panels: panels.length })}`)
  return window.M4Panels
}
