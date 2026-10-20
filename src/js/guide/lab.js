/* global localStorage, location, URLSearchParams */

/**
 * LAB — a build-time panel for choosing the accordion's motion.
 *
 * Shown only with ?lab=1 in the URL. Never reaches readers.
 *
 * Two independent groups, because they are different kinds of thing:
 *  - the transition preset (how the columns themselves move), one at a time
 *  - effects (what happens to content in the opened column), any combination
 *
 * Choices persist in localStorage so a reload keeps the setup being judged.
 */

const STORE = 'm4_ix_lab'

export const DEFAULTS = {
  preset: 'pbs',
  cycle: false,
  // Prose stagger is the one that earns its place; the others stay in
  // the lab so they can be re-judged, but off by default.
  proseStagger: true,
  headingMask: false,
  symbolMotion: false,
  railRipple: false
}

export function loadSettings () {
  try {
    return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE) || '{}'))
  } catch (e) {
    return Object.assign({}, DEFAULTS)
  }
}

function save (settings) {
  try { localStorage.setItem(STORE, JSON.stringify(settings)) } catch (e) {}
}

export function labEnabled () {
  return new URLSearchParams(location.search).has('lab')
}

/**
 * @param {object} settings  live settings object (mutated in place)
 * @param {Array}  presets   [{ name, dur, ease, stagger }]
 * @param {Function} onChange called after any change
 */
export function createLab (settings, presets, onChange) {
  const panel = document.createElement('aside')
  panel.className = 'ix-lab'
  panel.innerHTML = `
    <header>
      <strong>motion lab</strong>
      <button type="button" data-min aria-label="Minimise">–</button>
    </header>
    <div class="ix-lab-body">
      <p class="ix-lab-legend">transition</p>
      <div class="ix-lab-presets"></div>
      <button type="button" class="ix-lab-toggle" data-cycle aria-pressed="false">
        <span class="dot"></span> cycle on each switch
      </button>
      <p class="ix-lab-legend">effects</p>
      <div class="ix-lab-fx"></div>
      <p class="ix-lab-note">?lab=1 only · saved locally</p>
    </div>`

  const presetWrap = panel.querySelector('.ix-lab-presets')
  presets.forEach((p) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.textContent = p.name
    b.dataset.preset = p.name
    b.addEventListener('click', () => {
      settings.preset = p.name
      settings.cycle = false
      panel.querySelector('[data-cycle]').checked = false
      sync()
      save(settings)
      onChange('preset', p.name)
    })
    presetWrap.appendChild(b)
  })

  const FX = [
    ['proseStagger', 'prose stagger'],
    ['headingMask', 'heading line mask'],
    ['symbolMotion', 'symbol motion'],
    ['railRipple', 'collapse ripple']
  ]
  // Buttons with aria-pressed rather than native checkboxes: a checkbox
  // in a flex row needs careful sizing to stay legible, and its on/off
  // state is far less readable at this scale than a filled pill.
  const fxWrap = panel.querySelector('.ix-lab-fx')
  FX.forEach(([key, label]) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'ix-lab-toggle'
    b.dataset.fx = key
    b.setAttribute('aria-pressed', 'false')
    b.innerHTML = `<span class="dot"></span> ${label}`
    b.addEventListener('click', () => {
      settings[key] = !settings[key]
      sync()
      save(settings)
      onChange(key, settings[key])
    })
    fxWrap.appendChild(b)
  })

  panel.querySelector('[data-cycle]').addEventListener('click', () => {
    settings.cycle = !settings.cycle
    sync()
    save(settings)
    onChange('cycle', settings.cycle)
  })

  panel.querySelector('[data-min]').addEventListener('click', () => {
    panel.classList.toggle('is-min')
  })

  function sync () {
    presetWrap.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.preset === settings.preset ? 'true' : 'false')
    })
    panel.querySelector('[data-cycle]').setAttribute('aria-pressed', settings.cycle ? 'true' : 'false')
    FX.forEach(([key]) => {
      panel.querySelector(`[data-fx="${key}"]`)
        .setAttribute('aria-pressed', settings[key] ? 'true' : 'false')
    })
  }

  document.body.appendChild(panel)
  sync()
  return { panel, sync }
}
