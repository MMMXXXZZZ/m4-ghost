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
const DEPTH = 0.19 // z pushback as a fraction of the stage width
// How dark a turned face goes is NOT here: JS publishes --ix-k, the
// turn as 0..1, and the stylesheet multiplies it by --ix-dim, which is
// a different number in light mode than in dark.

// The drawer nearest the top leads; each one below answers later. These
// are the same LAG/FOLLOW idea as the rail, expressed as a response
// time per row rather than a delay, because the target moves every
// frame while a finger is down.
const FOLLOW = 0.42
const STAGGER = 0.09

// Past this the page is off stage and not worth drawing.
const EDGE = 1.6

// How far the vanishing point travels either side of centre, in per
// cent of the stage, at full tilt. Exposed on window.M4IXTilt so it can
// be felt and re-tuned on the page without a deploy, the way the lab's
// dimensions are.
const TILT = { x: 16, y: 9 }
// Moving the vanishing point repaints the whole 3D subtree, so it is
// worth not doing per frame for nothing: writing every frame measured
// a 20ms p95 against 10ms for a gated one. Below this the move is
// invisible anyway, and M4Tilt is already low-passed.
const TILT_EPS = 0.15

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
      // The grid has already laid the pages out side by side, so this
      // translate is the carousel's position, not the drawer's offset
      // from centre: -k * STEP left the centred page sitting at its
      // natural 929px, off stage to the right. Unclamped on purpose --
      // the turn saturates at the edge, the spacing must not.
      x: -(off + d.page) * STEP,
      rotationY: k * ROT,
      z: -far * DEPTH * W,
      // Hinged on the edge it turns away from, so neighbouring pages
      // meet at the seam instead of sliding through each other.
      transformOrigin: off > 0 ? '100% 50%' : '0% 50%',
      opacity: far > EDGE - 0.05 ? 0 : 1,
      visibility: far > EDGE - 0.05 ? 'hidden' : 'visible',
      // A turned page hinges on its inner edge, so that edge stays at
      // z 0 and only the rest of it goes back. Depth alone therefore
      // does not decide what covers what, and the later drawers in the
      // DOM were painting over the page being read. Nearest the centre
      // wins, explicitly.
      zIndex: Math.round(100 - far * 50)
    })
    // What the drawer is worth as dimming is the stylesheet's call --
    // see --ix-dim, which differs per colour mode.
    d.shade.style.setProperty('--ix-k', Math.min(1, far).toFixed(3))
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
      // The face under the finger must not take this as a tap.
      stack.dataset.dragged = 'true'
      state.pos = limit(state.pos - self.deltaX / STEP)
      tick()
    },
    onDragEnd (self) {
      if (!on || self.axis !== 'x') return
      gsap.delayedCall(0.25, () => { stack.dataset.dragged = 'false' })
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

  /**
   * The gyro moves where you are looking FROM, not what you are looking
   * at. The drawers keep their own transforms untouched; only the
   * stage's vanishing point moves, so tilting the phone reads as
   * peering around a solid object rather than as the object wobbling.
   * On desktop M4Tilt falls back to the pointer, so the same code gives
   * mouse parallax without knowing which input it has.
   *
   * Lag between linked objects: the trailing is M4Tilt's own low-pass
   * filter, so the stage arrives a beat after the hand -- which is what
   * makes it feel like mass rather than a mirror.
   */
  let originX = 50
  let originY = 45
  function parallax () {
    const t = window.M4Tilt
    if (!t) return
    // Derive at use time: the signal is live and the carousel may have
    // been activated long before any of it was granted.
    const nx = 50 + t.x * TILT.x
    const ny = 45 + t.y * TILT.y
    if (Math.abs(nx - originX) < TILT_EPS && Math.abs(ny - originY) < TILT_EPS) return
    originX = nx
    originY = ny
    stack.style.perspectiveOrigin = originX.toFixed(1) + '% ' + originY.toFixed(1) + '%'
  }

  function activate () {
    if (on) return
    on = true
    stack.dataset.carousel = 'true'
    observer.enable()
    measure()
    tick(true)
    // One ticker callback for the whole stage, not one per drawer.
    gsap.ticker.add(parallax)
  }

  function deactivate () {
    if (!on) return
    on = false
    stack.removeAttribute('data-carousel')
    observer.disable()
    gsap.ticker.remove(parallax)
    stack.style.removeProperty('perspective-origin')
    originX = 50
    originY = 45
    gsap.killTweensOf(state)
    drawers.forEach((d) => {
      // Kill the drawer's own tween FIRST. quickTo keeps a live tween
      // on the proxy, and a surviving one writes the transform back
      // the frame after it is cleared -- which left the unwrapped
      // article translated a page to the left, mid-turn.
      gsap.killTweensOf(d.proxy)
      d.proxy.off = 0
      gsap.set(d.item, { clearProps: 'transform,transformOrigin,opacity,visibility,willChange,zIndex' })
      d.shade.style.setProperty('--ix-k', '0')
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

  // Tunable on the page, like the lab's dimensions: set
  // window.M4IXTilt.x / .y and the next frame uses it.
  window.M4IXTilt = TILT

  return {
    goTo,
    sync,
    page: () => Math.round(state.pos),
    pageCount: pages,
    isOn: () => on,
    onMove (fn) { onMove = fn }
  }
}
