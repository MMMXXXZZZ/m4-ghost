/* global MutationObserver, matchMedia, requestAnimationFrame */

/**
 * The phone's drawer pages, as a carousel in three dimensions.
 *
 * Three drawers to a page, the neighbouring sets turned away at the
 * left and right edges. One number -- `pos`, the carousel's position
 * measured in pages -- drives everything on screen. Every drawer's
 * transform is derived from its own distance to that number at the
 * moment it is applied, so a drag that stops halfway is as consistent
 * as one that lands, and there is no per-drawer state to go stale.
 *
 * Lag between linked objects: the three drawers of a page do not turn
 * together. Each row answers the carousel on its own delay, so a page
 * fans as it comes round instead of pivoting like one welded board.
 * The lag is the whole effect -- remove it and this is a cube.
 *
 * Prefer the platform over simulation, except here. The browser's own
 * horizontal scrolling cannot express a per-drawer turn: scroll
 * snapping rounds every intermediate position to a snap point (it ate
 * a GSAP tween on the rail for exactly this reason), and a scroller
 * gives one offset where this needs eight separate lagged ones. So
 * GSAP owns the gesture here, and everything the scroller used to do
 * for free -- paging, momentum, bringing a focused face into view --
 * is done explicitly below.
 */

import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'

gsap.registerPlugin(Observer)

const PER_PAGE = 3

// Tuned on the spike at a 630px stage and kept as proportions, so the
// same read survives a 390px phone: see ROT/DIM below for the two that
// are already unitless.
const ROT = 53 // degrees of turn at one full page of offset
const DIM = 0.5 // how dark a face goes when fully turned away
const DEPTH = 0.19 // z pushback as a fraction of the stage width

// The drawer nearest the top leads; each one below answers later. These
// are the same LAG/FOLLOW idea as the rail, expressed as a response
// time per row rather than a delay, because the target moves every
// frame while a finger is down.
const FOLLOW = 0.42
const STAGGER = 0.09

// Past this the page is off stage and not worth drawing.
const EDGE = 1.6

export default function initCarousel (entries, stack) {
  if (!entries.length) return null

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const pages = Math.ceil(entries.length / PER_PAGE)
  const state = { pos: 0 }
  let W = 0
  let STEP = 0
  let on = false

  // One shade per drawer. A turned face is dimmed rather than lit:
  // cheaper than a real light, and it stays correct in both colour
  // modes because it is black over whatever the column already is.
  const drawers = entries.map((e, i) => {
    let shade = e.item.querySelector(':scope > .ix-shade')
    if (!shade) {
      shade = document.createElement('div')
      shade.className = 'ix-shade'
      shade.setAttribute('aria-hidden', 'true')
      e.item.appendChild(shade)
    }
    const row = i % PER_PAGE
    const page = Math.floor(i / PER_PAGE)
    // The lagged copy of `pos` that this drawer is actually drawing.
    const proxy = { off: 0 }
    const d = {
      item: e.item,
      shade,
      row,
      page,
      proxy,
      paint: () => paint(d)
    }
    // quickTo retargets an existing tween instead of starting a new one
    // each frame, which is what makes a per-frame target cheap.
    d.drive = gsap.quickTo(proxy, 'off', {
      duration: FOLLOW + row * STAGGER,
      ease: 'expo.out',
      onUpdate: d.paint
    })
    return d
  })

  /** Draw one drawer from its own lagged offset. */
  function paint (d) {
    const off = d.proxy.off
    const k = gsap.utils.clamp(-EDGE, EDGE, off)
    const far = Math.abs(k)
    gsap.set(d.item, {
      x: -k * STEP,
      rotationY: k * ROT,
      z: -far * DEPTH * W,
      // Hinged on the edge it turns away from, so neighbouring pages
      // meet at the seam instead of sliding through each other.
      transformOrigin: off > 0 ? '100% 50%' : '0% 50%',
      opacity: far > EDGE - 0.05 ? 0 : 1,
      visibility: far > EDGE - 0.05 ? 'hidden' : 'visible'
    })
    gsap.set(d.shade, { opacity: Math.min(1, far) * DIM })
  }

  /** Hand every drawer the current position; each answers on its lag. */
  function tick (immediate) {
    drawers.forEach((d) => {
      const target = state.pos - d.page
      if (immediate || reduced) {
        d.proxy.off = target
        d.paint()
      } else {
        d.drive(target)
      }
    })
    if (onMove) onMove(Math.round(state.pos))
  }

  let onMove = null

  function measure () {
    W = stack.clientWidth
    // Derived from where the layout actually put the pages rather than
    // recomputed from peek and gap, which drift apart the moment one of
    // them changes.
    const first = drawers[0]
    const second = drawers.find((d) => d.page === 1)
    STEP = second
      ? second.item.offsetLeft - first.item.offsetLeft
      : first.item.offsetWidth
    if (!STEP) STEP = W
  }

  function goTo (page, dur) {
    const target = gsap.utils.clamp(0, pages - 1, page)
    gsap.to(state, {
      pos: target,
      duration: dur == null ? 0.62 : dur,
      ease: 'expo.out',
      overwrite: true,
      onUpdate: tick
    })
  }

  // Rubber band at the ends: the carousel may be pulled past the first
  // and last page, but not far, and it is let go of on release.
  const limit = (v) => gsap.utils.clamp(-0.4, pages - 0.6, v)

  const observer = Observer.create({
    target: stack,
    type: 'touch,pointer,wheel',
    lockAxis: true,
    dragMinimum: 5,
    tolerance: 5,
    // Vertical gestures still belong to the page: this is what lets a
    // reader scroll past the app without the carousel swallowing it.
    preventDefault: false,
    onDrag (self) {
      if (!on || self.axis !== 'x') return
      state.pos = limit(state.pos - self.deltaX / STEP)
      tick()
    },
    onDragEnd (self) {
      if (!on || self.axis !== 'x') return
      // Throw with the gesture rather than snapping to whatever is
      // nearest: a short fast flick should still turn the page.
      const bias = gsap.utils.clamp(-1, 1, -(self.velocityX || 0) / 900)
      goTo(Math.round(state.pos + bias))
    },
    onChangeX (self) {
      if (!on || self.isDragging) return
      state.pos = limit(state.pos + self.deltaX / STEP * 1.4)
      tick()
      gsap.delayedCall(0.12, () => goTo(Math.round(state.pos))).restart(true)
    }
  })
  observer.disable()

  // The native scroller used to bring a focused face into view by
  // itself. Tabbing is how the carousel is reached without a pointer,
  // so that has to be done by hand now.
  stack.addEventListener('focusin', (ev) => {
    if (!on) return
    const d = drawers.find((x) => x.item.contains(ev.target))
    if (d && Math.round(state.pos) !== d.page) goTo(d.page)
  })

  function activate () {
    if (on) return
    on = true
    stack.dataset.carousel = 'true'
    observer.enable()
    measure()
    tick(true)
  }

  function deactivate () {
    if (!on) return
    on = false
    stack.removeAttribute('data-carousel')
    observer.disable()
    gsap.killTweensOf(state)
    drawers.forEach((d) => {
      gsap.set(d.item, { clearProps: 'transform,opacity,visibility' })
      gsap.set(d.shade, { opacity: 0 })
      d.proxy.off = 0
    })
  }

  /**
   * Derive state, don't assume it. Which mode the stack is in changes
   * from several places -- opening a drawer, going back, crossing the
   * breakpoint -- so the carousel reads the stack's own attributes
   * rather than trusting a call that may never come.
   */
  function sync () {
    const want = stack.dataset.allCollapsed === 'true' &&
      stack.dataset.mobileOpen !== 'true' &&
      matchMedia('(max-width: 64rem)').matches
    if (want) {
      activate()
      measure()
      tick(true)
    } else {
      deactivate()
    }
  }

  new MutationObserver(sync).observe(stack, {
    attributes: true,
    attributeFilter: ['data-all-collapsed', 'data-mobile-open']
  })
  window.addEventListener('resize', () => {
    if (!on) return
    measure()
    state.pos = gsap.utils.clamp(0, pages - 1, Math.round(state.pos))
    tick(true)
  })

  requestAnimationFrame(sync)

  return {
    goTo,
    sync,
    page: () => Math.round(state.pos),
    pageCount: pages,
    isOn: () => on,
    onMove (fn) { onMove = fn }
  }
}
