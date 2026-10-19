/* global localStorage, screen, location, requestAnimationFrame, IntersectionObserver */
/**
 * TILT — one normalized orientation signal for every scene and effect.
 *
 * Exposes smoothed { x, y } in -1..1 so WebGL scenes, DOM parallax and
 * text effects read the same input instead of each binding their own
 * listeners.
 *
 * Why it is built this way:
 *
 * - iOS (13+) requires DeviceOrientationEvent.requestPermission() from
 *   inside a user gesture. Without it Safari fires NOTHING, silently —
 *   no error, no events. iOS also asks once per origin and a refusal
 *   sticks, so we never spend that prompt on an unexplained dialog: a
 *   priming card appears after the hero has scrolled past, and only
 *   "yes" calls requestPermission, synchronously inside the click.
 * - Android/Chrome needs no prompt, only a secure context.
 * - Raw readings are jittery, so values are low-pass filtered.
 * - Axes rotate with the device, so screen.orientation.angle is
 *   compensated for; otherwise landscape tilts the wrong way.
 * - prefers-reduced-motion DAMPS the signal rather than zeroing it.
 *   Tilt parallax is exactly the vestibular-triggering kind of motion,
 *   unlike the ambient ember field, so this is where restraint belongs.
 * - Desktop has no gyro: pointer position drives the same signal, so a
 *   scene never needs to know which input it is reading.
 */

const TAG = '[m4-tilt]'
const STORE = 'm4_motion'
const SMOOTH = 0.12

const target = { x: 0, y: 0 }
const value = { x: 0, y: 0 }

let source = 'none'
let armed = false
let damp = 1
let reduced = false

const clamp = (n) => (n < -1 ? -1 : n > 1 ? 1 : n)

function remembered () {
  try { return localStorage.getItem(STORE) } catch (e) { return null }
}

function remember (v) {
  try { localStorage.setItem(STORE, v) } catch (e) {}
}

function onOrient (e) {
  if (e.gamma === null && e.beta === null) return
  source = 'gyro'
  const g = e.gamma || 0
  const b = e.beta || 0
  const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0
  let x = g
  let y = b
  if (angle === 90) { x = b; y = -g } else if (angle === -90 || angle === 270) { x = -b; y = g } else if (angle === 180) { x = -g; y = -b }
  target.x = clamp(x / 35) * damp
  target.y = clamp((y - 45) / 35) * damp // 45° is a natural holding angle
}

function onPointer (e) {
  if (source === 'gyro') return // gyro wins once it is live
  source = 'pointer'
  target.x = clamp((e.clientX / window.innerWidth) * 2 - 1) * damp
  target.y = clamp((e.clientY / window.innerHeight) * 2 - 1) * damp
}

function tick () {
  value.x += (target.x - value.x) * SMOOTH
  value.y += (target.y - value.y) * SMOOTH
  requestAnimationFrame(tick)
}

function listen () {
  window.addEventListener('deviceorientation', onOrient, { passive: true })
}

function arm () {
  if (armed) return
  armed = true
  const DOE = window.DeviceOrientationEvent
  if (DOE && typeof DOE.requestPermission === 'function') {
    DOE.requestPermission().then((state) => {
      console.log(`${TAG} motion permission: ${state}`)
      if (state === 'granted') listen()
    }).catch((err) => console.log(`${TAG} motion permission denied`, err))
  } else if (DOE) {
    listen()
  }
}

function buildPrompt () {
  const en = (document.documentElement.lang || '').indexOf('en') === 0 ||
    location.pathname.indexOf('/en/') === 0

  const box = document.createElement('div')
  box.className = 'm4-motion-ask'
  box.setAttribute('role', 'dialog')
  box.setAttribute('aria-labelledby', 'm4-motion-q')
  box.innerHTML =
    `<p id="m4-motion-q">${en
      ? 'On this website we\'d like to use <em>Motion and Orientation sensors.</em>'
      : 'En este sitio web nos gustaría usar <em>sensores de movimiento y orientación.</em>'}</p>` +
    '<div class="m4-motion-actions">' +
      `<button type="button" data-yes>${en ? 'Yes' : 'Sí'}</button>` +
      `<button type="button" data-no>${en ? 'No' : 'No'}</button>` +
    '</div>'

  box.querySelector('[data-yes]').addEventListener('click', () => {
    remember('granted')
    box.remove()
    arm() // gesture is live: prompt now
  })

  // A decline is NOT stored: the reader is asked again on a later visit,
  // when they may well want it. Only "granted" persists, since re-asking
  // for a permission already given is pure noise.
  box.querySelector('[data-no]').addEventListener('click', () => {
    box.remove()
    console.log(`${TAG} reader declined motion (will ask again next visit)`)
  })
  box.addEventListener('keydown', (e) => { if (e.key === 'Escape') box.remove() })

  document.body.appendChild(box)
  box.querySelector('[data-yes]').focus()
  return box
}

function ask () {
  if (remembered() === 'granted') { arm(); return } // silent re-arm
  buildPrompt()
}

export default function initTilt () {
  if (window.M4Tilt) return window.M4Tilt

  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  damp = reduced ? 0.25 : 1

  requestAnimationFrame(tick)

  // Desktop Chrome on Windows also exposes requestPermission as a
  // function, so its presence says nothing about whether a sensor is
  // there -- gating on it alone asked desktop readers for motion access.
  // Pair it with a device that plausibly HAS orientation hardware.
  const needsPermission = !!(window.DeviceOrientationEvent &&
    typeof window.DeviceOrientationEvent.requestPermission === 'function')
  const hasSensor = window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0
  const needsPrompt = needsPermission && hasSensor

  if (!needsPrompt) {
    // Android and desktop: no permission exists, the sensor is just there.
    if (window.DeviceOrientationEvent) { listen(); armed = true }
  } else if (remembered() === 'granted') {
    // Already allowed for this origin: re-arm quietly on any gesture.
    ;['pointerdown', 'touchend', 'keydown'].forEach((ev) => {
      window.addEventListener(ev, arm, { once: true, passive: true })
    })
  } else {
    // Ask once the hero has gone by.
    const hero = document.querySelector('.ix-hero')
    if (hero && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => {
        if (!es[0].isIntersecting) { io.disconnect(); ask() }
      }, { threshold: 0 })
      io.observe(hero)
    } else {
      const once = () => {
        if (window.scrollY > window.innerHeight * 0.8) {
          window.removeEventListener('scroll', once)
          ask()
        }
      }
      window.addEventListener('scroll', once, { passive: true })
    }
  }

  window.addEventListener('pointermove', onPointer, { passive: true })

  window.M4Tilt = {
    get x () { return value.x },
    get y () { return value.y },
    get source () { return source },
    get reduced () { return reduced },
    arm,
    ask,
    reset () { try { localStorage.removeItem(STORE) } catch (e) {} }
  }

  console.log(`${TAG} ready ${JSON.stringify({ needsPermission, hasSensor, needsPrompt, reduced })}`)
  return window.M4Tilt
}
