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
 *
 * TWO signals, not one. Orientation ({ x, y }) says which way the
 * device is LEANING and is what parallax wants. Acceleration
 * ({ ax, ay }) says how it is being MOVED, and is what anything with
 * mass wants -- loose particles in a jar do not care which way the jar
 * is tipped half as much as they care about it being swung. iOS ships
 * the same idea as Vehicle Motion Cues; here it is for flare rather
 * than for comfort.
 *
 * Acceleration is a separate event (devicemotion) and a separate
 * permission from orientation, though one prompt covers both, so it is
 * requested in the same gesture.
 */

const TAG = '[m4-tilt]'
const STORE = 'm4_motion'
const SMOOTH = 0.12

const target = { x: 0, y: 0 }
const value = { x: 0, y: 0 }
// Acceleration is noisier than orientation and has no resting value to
// return to other than zero, so it gets its own, faster filter.
const ACCEL_SMOOTH = 0.22
// Normalising here keeps every consumer in -1..1. Set against the
// journey this is actually for: metro rolling stock is comfort-limited
// to about 1.0-1.4 m/s2, and Santiago's own trains sit inside that --
// the NS-74 pulls 1.0-1.2 depending on how full it is, the NS-93 about
// 1.35, with service braking in the same band. At 4 a train launch
// reached a quarter of the scale and read as nothing happening; at 2 a
// real journey lands mid-range and walking's sharper spikes clamp.
const ACCEL_FULL = 2
const aTarget = { x: 0, y: 0 }
const aValue = { x: 0, y: 0 }
// Gravity has to come out of the reading on anything that only offers
// accelerationIncludingGravity. A slow low-pass IS the gravity vector.
const gravity = { x: 0, y: 0 }
let hasMotion = false
let gotOrient = false
let permission = 'unknown'
let pointerLast = null

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

function forget () {
  try { localStorage.removeItem(STORE) } catch (e) {}
}

function onOrient (e) {
  if (e.gamma === null && e.beta === null) return
  gotOrient = true
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

/** Rotate a device-space pair into screen space. Same compensation the
 *  orientation path does, and just as necessary: a phone held in
 *  landscape accelerates sideways along its own y. */
function toScreen (x, y) {
  const angle = (screen.orientation && screen.orientation.angle) || window.orientation || 0
  if (angle === 90) return [y, -x]
  if (angle === -90 || angle === 270) return [-y, x]
  if (angle === 180) return [-x, -y]
  return [x, y]
}

function onMotion (e) {
  let a = e.acceleration
  // Some Androids only populate accelerationIncludingGravity. Subtract
  // the low-passed vector, which by then is gravity.
  if (!a || (a.x === null && a.y === null)) {
    const g = e.accelerationIncludingGravity
    if (!g || (g.x === null && g.y === null)) return
    gravity.x += ((g.x || 0) - gravity.x) * 0.02
    gravity.y += ((g.y || 0) - gravity.y) * 0.02
    a = { x: (g.x || 0) - gravity.x, y: (g.y || 0) - gravity.y }
  }
  hasMotion = true
  const [sx, sy] = toScreen(a.x || 0, a.y || 0)
  aTarget.x = clamp(sx / ACCEL_FULL) * damp
  aTarget.y = clamp(-sy / ACCEL_FULL) * damp
}

function onPointer (e) {
  if (source === 'gyro') return // gyro wins once it is live
  source = 'pointer'
  target.x = clamp((e.clientX / window.innerWidth) * 2 - 1) * damp
  target.y = clamp((e.clientY / window.innerHeight) * 2 - 1) * damp
  // A mouse has no accelerometer, but it has velocity, and flicking it
  // is the desktop equivalent of swinging the phone. Consumers of
  // ax/ay therefore work on a desktop without knowing it.
  if (!hasMotion) {
    const now = performance.now()
    if (pointerLast) {
      const dt = Math.max(8, now - pointerLast.t)
      aTarget.x = clamp((e.clientX - pointerLast.x) / dt * 0.6) * damp
      aTarget.y = clamp((e.clientY - pointerLast.y) / dt * 0.6) * damp
    }
    pointerLast = { x: e.clientX, y: e.clientY, t: now }
  }
}

function tick () {
  value.x += (target.x - value.x) * SMOOTH
  value.y += (target.y - value.y) * SMOOTH
  aValue.x += (aTarget.x - aValue.x) * ACCEL_SMOOTH
  aValue.y += (aTarget.y - aValue.y) * ACCEL_SMOOTH
  // Nothing re-zeroes a stale reading: devicemotion stops firing when
  // the device is still, and a pointer that stopped moving sends no
  // events at all, so the last flick would otherwise push forever.
  aTarget.x *= 0.9
  aTarget.y *= 0.9
  requestAnimationFrame(tick)
}

function listen () {
  window.addEventListener('deviceorientation', onOrient, { passive: true })
  if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', onMotion, { passive: true })
  }
}

/**
 * Confirm the sensor is actually DELIVERING, not merely allowed.
 *
 * A grant is not evidence of events: the permission can be revoked in
 * iOS Settings, Low Power Mode suspends the sensors, and a reader can
 * answer the system prompt differently from ours. Derive state, don't
 * assume it -- if nothing has arrived shortly after we believed we
 * were listening, drop the remembered grant so the next visit asks
 * again instead of silently never working.
 */
function verify () {
  setTimeout(() => {
    if (gotOrient || hasMotion) return
    console.log(`${TAG} permitted but no readings; forgetting the grant`)
    permission = 'silent'
    forget()
  }, 2500)
}

function settle (state, which) {
  console.log(`${TAG} ${which} permission: ${state}`)
  if (state === 'granted') {
    permission = 'granted'
    // Only NOW. Storing this on the click meant a reader who answered
    // the system prompt with Deny -- or whose grant had been revoked
    // in Settings since -- was remembered as granted for ever, so the
    // card never came back and nothing ever listened.
    remember('granted')
    listen()
    verify()
  } else {
    permission = state
    // A stale 'granted' would otherwise outlive the permission it
    // described and suppress the card on every future visit.
    forget()
  }
}

function arm () {
  if (armed) return
  armed = true
  const DOE = window.DeviceOrientationEvent
  const DME = window.DeviceMotionEvent
  // iOS gates orientation and motion behind SEPARATE calls even though
  // the reader sees one "Motion & Orientation" prompt, so both go in
  // the same gesture or the second one is refused for lack of one.
  // Either grant is enough to start listening: listen() attaches both,
  // and the one that was refused simply never fires.
  let asked = false
  if (DME && typeof DME.requestPermission === 'function') {
    asked = true
    DME.requestPermission()
      .then((state) => settle(state, 'motion'))
      .catch((err) => console.log(`${TAG} motion request failed`, err))
  }
  if (DOE && typeof DOE.requestPermission === 'function') {
    asked = true
    DOE.requestPermission()
      .then((state) => settle(state, 'orientation'))
      .catch((err) => console.log(`${TAG} orientation request failed`, err))
  }
  if (!asked && DOE) {
    permission = 'not-required'
    listen()
    verify()
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
    box.remove()
    // Nothing is remembered here. Saying yes to US is not the same as
    // the system prompt being granted, and conflating the two is what
    // left readers permanently unable to be asked again.
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

  // ?motion=1 puts the signal on screen. A phone has no console, and
  // every failure here is silent by nature: a refused permission, a
  // revoked one, Low Power Mode suspending the sensors, or Reduce
  // Motion damping the readings to a quarter all look identical from
  // the outside -- nothing moves.
  if (/[?&]motion=1/.test(location.search)) {
    const box = document.createElement('div')
    box.style.cssText = 'position:fixed;left:8px;bottom:8px;z-index:99999;' +
      'background:rgba(0,0,0,.82);color:#fff;font:600 11px/1.45 ui-monospace,Menlo,monospace;' +
      'padding:8px 10px;border-radius:8px;pointer-events:none;white-space:pre'
    document.body.appendChild(box)
    const NL = String.fromCharCode(10)
    const paint = () => {
      const st = window.M4Tilt.state
      box.textContent = [
        'perm    ' + st.permission,
        'stored  ' + (st.remembered || '-'),
        'source  ' + st.source + '  motion ' + window.M4Tilt.motion,
        'armed   ' + st.armed + '  orient ' + st.gotOrient + '  accel ' + st.hasMotion,
        'reduced ' + reduced + (reduced ? '  (damped to 0.25)' : ''),
        'lean    ' + value.x.toFixed(3) + '   ' + value.y.toFixed(3),
        'ACCEL   ' + aValue.x.toFixed(3) + '   ' + aValue.y.toFixed(3)
      ].join(NL)
      requestAnimationFrame(paint)
    }
    requestAnimationFrame(paint)
  }

  window.M4Tilt = {
    get x () { return value.x },
    get y () { return value.y },
    // How the device is being MOVED, not which way it leans.
    get ax () { return aValue.x },
    get ay () { return aValue.y },
    get motion () { return hasMotion ? 'accel' : (source === 'pointer' ? 'pointer' : 'none') },
    // For checking on a device that has no console to hand.
    get state () {
      return { permission, armed, gotOrient, hasMotion, source, remembered: remembered() }
    },
    get source () { return source },
    get reduced () { return reduced },
    arm,
    ask,
    reset () { try { localStorage.removeItem(STORE) } catch (e) {} }
  }

  console.log(`${TAG} ready ${JSON.stringify({ needsPermission, hasSensor, needsPrompt, reduced })}`)
  return window.M4Tilt
}
