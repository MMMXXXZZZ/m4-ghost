/**
 * haptic.js
 * Core haptic engine ported from the Tactus library (MIT © Aadee).
 * https://github.com/aadeexyz/tactus
 *
 * - iOS 12+ / Safari / WKWebView  → native "switch" checkbox tick  💥
 * - Android / other browsers      → Vibration API                   📳
 * - Desktop                       → no-op (silently ignored)
 */

const HAPTIC_ID = '___haptic-switch___'
const HAPTIC_DURATION_MS = 10

let inputElement = null
let labelElement = null
let isIOSDevice = false

// ─── iOS / iPadOS detection ────────────────────────────────────────────────

function detectIOS () {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false
  const iOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent)
  // iPadOS 13+ reports itself as "MacIntel" but has touch points
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOSUserAgent || iPadOS
}

// ─── DOM mount (called once) ────────────────────────────────────────────────

function mount () {
  if (labelElement && inputElement) return

  isIOSDevice = detectIOS()

  // Re-use elements if they already exist in the DOM (e.g. HMR / turbo)
  inputElement = document.querySelector(`#${HAPTIC_ID}`)
  labelElement = document.querySelector(`label[for="${HAPTIC_ID}"]`)
  if (inputElement && labelElement) return

  // Hidden checkbox with the `switch` attribute – Safari's haptic trigger
  inputElement = document.createElement('input')
  inputElement.type = 'checkbox'
  inputElement.id = HAPTIC_ID
  inputElement.setAttribute('switch', '')
  inputElement.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
  document.body.appendChild(inputElement)

  labelElement = document.createElement('label')
  labelElement.htmlFor = HAPTIC_ID
  labelElement.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
  document.body.appendChild(labelElement)
}

// Mount as early as possible
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true })
  } else {
    mount()
  }
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Fire one haptic pulse.
 * @param {number} [duration=10] - Vibration duration in ms (Android / fallback only)
 */
export function triggerHaptic (duration = HAPTIC_DURATION_MS) {
  if (typeof window === 'undefined') return

  if (isIOSDevice) {
    if (!inputElement || !labelElement) mount()
    if (labelElement) labelElement.click()
  } else {
    if (navigator && navigator.vibrate) {
      navigator.vibrate(duration)
    }
    // else: desktop or unsupported — silently no-op
  }
}
