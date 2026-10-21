/* global getComputedStyle, requestAnimationFrame, cancelAnimationFrame, IntersectionObserver */
/**
 * HERO EMBERS — ember field behind the guide hero.
 *
 * Points only for now; the material is a placeholder for the real spark
 * shader. Sparks rise, get thrown about by how the device is MOVED,
 * and fade out.
 *
 * Built on three.js rather than raw WebGL because of the single-context
 * rule below: three's WebGLRenderer owns and caches GL state, and raw
 * draw calls against the same context corrupt that cache in ways that
 * produce baffling bugs. Once any scene is three.js, all of them must
 * be — so this one is, from the start.
 *
 * Constraints that shape the lifecycle:
 *
 * - ONE renderer. Browsers cap live WebGL contexts (~8–16) and silently
 *   drop the oldest, so every scene in this guide shares this one.
 *   getRenderer() exposes it for the column scenes.
 * - Paused by IntersectionObserver AND visibilitychange — a backgrounded
 *   tab otherwise burns battery for nothing.
 * - FPS sampling halves the field twice before stopping it, rather than
 *   dropping frames on a cheap phone.
 * - prefers-reduced-motion damps drift rather than disabling the scene:
 *   ambient particle work doesn't trigger vestibular symptoms, large
 *   scroll-coupled camera movement does.
 */

import {
  Scene, OrthographicCamera, WebGLRenderer, BufferGeometry,
  BufferAttribute, PointsMaterial, Points, AdditiveBlending, Color
} from 'three'

const TAG = '[m4-gl]'
const MAX = 420

// Embers answer acceleration, not lean. A field of sparks has mass:
// what it should care about is the jar being swung, not the jar being
// tipped -- the same idea as iOS's Vehicle Motion Cues, used here for
// flare rather than for comfort. Reading orientation made the field
// slide whenever the phone simply rested at an angle, which is the one
// moment nothing should be moving.
//
// The field carries a shared velocity rather than being displaced
// directly: acceleration feeds it, friction removes it, so a flick
// throws the embers and they coast back. Displacement is OPPOSITE the
// acceleration, because that is what loose things do inside a box that
// is being moved.
// Measured against a synthetic 3.2 m/s2 flick: at 0.00007 the field
// moved under 1% of the hero's width, which is not flare, it is a
// rounding error. Mutable and published on window.M4Embers so the
// numbers can be found on a real device without a deploy.
// Terminal drift is throw * ax / (1 - friction), so the two numbers are
// not independent: at friction .94 the field reached its lag velocity
// in a quarter second and sat there, which read as "only moves while
// you shake it". Drag belongs to the air, not to the event stream --
// once the sparks have been left behind they keep going and only air
// takes it back. .99 coasts for about 1.7s, which amplifies the gain
// 100x rather than 16x, so the gain comes down to match: a steady
// 2.6 m/s2 drifts the field about 20% of the hero's width per second.
const FIELD = {
  throw: 0.00005, // acceleration -> field velocity
  friction: 0.99 // air drag only; this is what makes it coast
}

// How far outside the view a spark may be born, in field widths.
const EDGE = 0.08
// The drift at which half of all new sparks arrive from the upwind
// edge rather than from the floor.
const SPAWN_REF = 0.0012

let renderer = null

export function getRenderer () { return renderer }

export default function initEmbers (canvas) {
  if (!canvas) return null

  window.M4Embers = FIELD

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false })
  } catch (err) {
    console.log(`${TAG} no webgl; hero stays flat`, err)
    return null
  }
  renderer.setClearColor(0x000000, 0)

  const scene = new Scene()
  // Orthographic in 0..1 space: the field is 2D, so there is no reason to
  // pay for perspective or to think in world units.
  const camera = new OrthographicCamera(0, 1, 1, 0, -1, 1)

  const pos = new Float32Array(MAX * 3)
  const alpha = new Float32Array(MAX)
  const vel = new Float32Array(MAX * 2)
  const life = new Float32Array(MAX)
  const sizes = new Float32Array(MAX)

  // Declared before seed() uses them: the field's own momentum decides
  // where a spark is born, not just where it goes.
  let throwX = 0
  let throwY = 0

  /**
   * Where a spark comes from.
   *
   * The emitter used to be a line along the bottom exactly as wide as
   * the screen, which is right for a field sitting on the vehicle and
   * wrong for a field being moved through: any sustained drift carried
   * the sparks to one side and nothing replaced them, so the windward
   * half emptied. The floor is wider than the view now, and while the
   * field is drifting a share of new sparks arrive from the UPWIND
   * edge instead -- the side being moved into -- so the hero reads as
   * passing through embers rather than carrying them.
   */
  function seed (i, fresh) {
    const drift = throwX
    const fromSide = !fresh &&
      Math.random() < Math.abs(drift) / (Math.abs(drift) + SPAWN_REF)
    if (fromSide) {
      // Born off-screen on the side the field is moving away from, at
      // any height, so it streams in rather than popping into view.
      pos[i * 3] = drift < 0 ? 1 + Math.random() * EDGE : -Math.random() * EDGE
      pos[i * 3 + 1] = Math.random()
      // Life has to outlast the height it started at or it would be
      // recycled on its first frame.
      life[i] = pos[i * 3 + 1] + 0.35 + Math.random() * 0.65
    } else {
      pos[i * 3] = fresh
        ? Math.random()
        : -EDGE + Math.random() * (1 + EDGE * 2)
      pos[i * 3 + 1] = fresh ? Math.random() : -0.02 - Math.random() * 0.05
      life[i] = 0.35 + Math.random() * 0.65
    }
    pos[i * 3 + 2] = 0
    vel[i * 2] = (Math.random() - 0.5) * 0.00018
    vel[i * 2 + 1] = (0.0009 + Math.random() * 0.0016) * (reduced ? 0.35 : 1)
    sizes[i] = 1.2 + Math.random() * 3.4
    alpha[i] = 0
  }
  for (let i = 0; i < MAX; i++) seed(i, true)

  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3))

  // Ember colour follows the theme accent so it stays on-brand in both modes.
  const accent = getComputedStyle(document.documentElement)
    .getPropertyValue('--ghost-accent-color').trim() || '#F73E05'

  const mat = new PointsMaterial({
    color: new Color(accent),
    size: 3,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: AdditiveBlending // embers glow where they overlap
  })

  const points = new Points(geo, mat)
  scene.add(points)

  function resize () {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    if (!w || !h) return
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h, false)
  }
  resize()
  window.addEventListener('resize', resize)

  let running = false
  let rafId = null
  let visible = true
  let inView = true
  let count = MAX
  let frames = 0
  let fpsMark = 0
  let degraded = 0

  function step (now) {
    if (!running) return
    const tilt = window.M4Tilt

    // Derive at use time: motion permission may be granted long after
    // the field started, and M4Tilt switches from pointer to gyro the
    // moment it does.
    if (tilt) {
      throwX = (throwX - tilt.ax * FIELD.throw) * FIELD.friction
      throwY = (throwY - tilt.ay * FIELD.throw * 0.6) * FIELD.friction
    } else {
      throwX *= FIELD.friction
      throwY *= FIELD.friction
    }

    for (let i = 0; i < count; i++) {
      pos[i * 3] += vel[i * 2]
      pos[i * 3 + 1] += vel[i * 2 + 1]
      pos[i * 3] += Math.sin(now * 0.0004 + i) * 0.00012 // lateral drift
      // Heavier sparks are thrown less. sizes[] stands in for mass
      // until the real spark shader carries one.
      const mass = 0.6 + sizes[i] * 0.18
      pos[i * 3] += throwX / mass
      pos[i * 3 + 1] += throwY / mass

      // A spark carried out of the view sideways is dead weight: it
      // would never come back on its own, and the field would quietly
      // thin out. Recycle it, which now puts it back upwind.
      const x = pos[i * 3]
      if (x < -EDGE || x > 1 + EDGE) { seed(i, false); alpha[i] = 0; continue }

      const y = pos[i * 3 + 1]
      alpha[i] = y < 0 ? 0 : Math.min(1, y * 4) * (1 - y / life[i]) * 0.9
      if (y > life[i]) seed(i, false)
    }
    geo.attributes.position.needsUpdate = true
    geo.setDrawRange(0, count)
    renderer.render(scene, camera)

    // Degrade before dropping frames: halve the field twice, then stop.
    frames++
    if (!fpsMark) {
      fpsMark = now
    } else if (now - fpsMark > 2000) {
      const fps = frames / ((now - fpsMark) / 1000)
      if (fps < 24) {
        degraded++
        if (degraded >= 3) {
          console.log(`${TAG} sustained <24fps; stopping embers`)
          stop()
          return
        }
        count = Math.max(60, Math.round(count / 2))
        console.log(`${TAG} fps ${fps.toFixed(1)}; reducing embers to ${count}`)
      }
      frames = 0
      fpsMark = now
    }
    rafId = requestAnimationFrame(step)
  }

  function start () {
    if (running) return
    running = true
    frames = 0
    fpsMark = 0
    rafId = requestAnimationFrame(step)
  }

  function stop () {
    running = false
    if (rafId) cancelAnimationFrame(rafId)
    rafId = null
  }

  const sync = () => { (visible && inView) ? start() : stop() }

  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden
    sync()
  })
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((es) => {
      inView = es[0].isIntersecting
      sync()
    }, { threshold: 0 }).observe(canvas)
  }
  sync()

  const api = { canvas, renderer, scene, camera, start, stop, get running () { return running } }
  window.M4GL = api
  console.log(`${TAG} embers up ${JSON.stringify({ max: MAX, reduced, accent })}`)
  return api
}
