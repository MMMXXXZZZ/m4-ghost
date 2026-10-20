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
  proseStagger: true,
  headingMask: true,
  symbolMotion: true,
  railRipple: true
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
      <label class="ix-lab-check"><input type="checkbox" data-cycle> cycle on each switch</label>
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
  const fxWrap = panel.querySelector('.ix-lab-fx')
  FX.forEach(([key, label]) => {
    const l = document.createElement('label')
    l.className = 'ix-lab-check'
    l.innerHTML = `<input type="checkbox" data-fx="${key}"> ${label}`
    l.querySelector('input').addEventListener('change', (e) => {
      settings[key] = e.target.checked
      save(settings)
      onChange(key, e.target.checked)
    })
    fxWrap.appendChild(l)
  })

  panel.querySelector('[data-cycle]').addEventListener('change', (e) => {
    settings.cycle = e.target.checked
    save(settings)
    onChange('cycle', e.target.checked)
  })

  panel.querySelector('[data-min]').addEventListener('click', () => {
    panel.classList.toggle('is-min')
  })

  function sync () {
    presetWrap.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.preset === settings.preset ? 'true' : 'false')
    })
    panel.querySelector('[data-cycle]').checked = !!settings.cycle
    FX.forEach(([key]) => {
      panel.querySelector(`[data-fx="${key}"]`).checked = !!settings[key]
    })
  }

  document.body.appendChild(panel)
  sync()
  return { panel, sync }
}
