/* global localStorage, location, URLSearchParams, Event */

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

/** #rrggbb -> {h,s,l} with h in degrees. */
function hexToHsl (hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '')
  if (!m) return null
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0
  let sat = 0
  if (d) {
    sat = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return { h, s: sat, l }
}

function hslToHex (h, s, l) {
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Move a colour onto another's hue, keeping its own saturation and lightness. */
function reHue (hex, hue) {
  const c = hexToHsl(hex)
  return c ? hslToHex(hue, c.s, c.l) : hex
}

export const DEFAULTS = {
  preset: 'pbs',
  cycle: false,
  // Prose stagger is the one that earns its place; the others stay in
  // the lab so they can be re-judged, but off by default.
  // Dimensions, in rem except media (px). null means "leave the
  // stylesheet's own value alone".
  pad: null,
  rail: null,
  measure: null,
  media: null,
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

/**
 * Push the lab's dimension overrides onto the app element. They drive
 * the same custom properties the stylesheet declares, so nothing needs a
 * parallel code path.
 */
export function applyDims (settings) {
  const app = document.querySelector('.ix')
  if (!app) return
  // This function listens for resize AND ends by dispatching one, so
  // every call re-entered itself: one real resize fanned out into 43
  // on the draft, and at load it recursed until the stack gave out
  // (eleven RangeErrors before the guide had finished mounting). The
  // dispatch is still wanted -- the open body's width is derived from
  // rail and padding -- so the guard is on re-entry, not on it.
  if (applyDims._busy) return
  applyDims._busy = true
  // Re-solve on resize: crossing the phone breakpoint changes which
  // overrides are allowed to apply.
  if (!applyDims._bound) {
    applyDims._bound = true
    window.addEventListener('resize', () => applyDims(settings))
  }
  const map = {
    pad: ['--ix-pad', 'rem'],
    rail: ['--ix-rail', 'rem'],
    measure: ['--ix-measure', 'rem'],
    media: ['--ix-media', 'px']
  }
  // Padding and rail width are desktop decisions. Applied inline they
  // outrank the phone rules, so a 5rem desktop padding followed the app
  // onto a 630px screen and ate the room the drawers need.
  const phone = window.matchMedia('(max-width: 64rem)').matches
  Object.keys(map).forEach((k) => {
    const [prop, unit] = map[k]
    if (phone && (k === 'pad' || k === 'rail')) {
      document.querySelectorAll('.ix').forEach((el) => el.style.removeProperty(prop))
      return
    }
    const target = k === 'measure' || k === 'media'
      ? document.querySelectorAll('.ix-body')
      : [app]
    target.forEach((el) => {
      if (settings[k] === null || settings[k] === undefined) el.style.removeProperty(prop)
      else el.style.setProperty(prop, settings[k] + unit)
    })
  })
  // Rail and padding change the arithmetic behind the open body's width.
  window.dispatchEvent(new Event('resize'))
  applyDims._busy = false
}

export function labEnabled () {
  return new URLSearchParams(location.search).has('lab')
}

/**
 * @param {object} settings  live settings object (mutated in place)
 * @param {Array}  presets   [{ name, dur, ease, stagger }]
 * @param {Function} onChange called after any change
 */
/**
 * Build the per-column palette editor.
 *
 * One row per column, collapsed to a swatch strip and expanded for the
 * column that is currently open, so the panel tracks what is on screen.
 * Each field writes straight through to the live column, and the block
 * at the bottom is the exact JSON to paste back into the post, so a
 * palette arrived at by eye can be made permanent without translation.
 */
function buildColumns (wrap, columns, onColumnChange) {
  // Grouped by mode, because the three base keys apply to BOTH modes --
  // dark falls back to light when unset -- and six flat rows gave no
  // hint of that, which read as the values being tangled together.
  const GROUPS = [
    ['light', [['bg', 'background'], ['title', 'text'], ['link', 'accent']]],
    ['dark', [['bgDark', 'background'], ['titleDark', 'text'], ['linkDark', 'accent']]]
  ]

  return columns.map((col) => {
    const cfg = Object.assign({}, col.cfg || {})
    const row = document.createElement('details')
    row.className = 'ix-lab-col'
    row.dataset.slug = col.slug

    const sum = document.createElement('summary')
    sum.innerHTML = '<span class="sw"></span><span class="t"></span>'
    sum.querySelector('.t').textContent = col.title
    row.appendChild(sum)

    const fields = document.createElement('div')
    fields.className = 'ix-lab-col-fields'
    row.appendChild(fields)

    // Hue lock. On by default: a column reads as one palette when its
    // six values share a hue and differ only in saturation and
    // lightness. Turn it off to pick them independently.
    const lock = document.createElement('button')
    lock.type = 'button'
    lock.className = 'ix-lab-toggle'
    lock.setAttribute('aria-pressed', cfg.hueLock === false ? 'false' : 'true')
    lock.innerHTML = '<span class="dot"></span> lock hue across all six'
    lock.addEventListener('click', () => {
      const on = lock.getAttribute('aria-pressed') !== 'true'
      lock.setAttribute('aria-pressed', on ? 'true' : 'false')
      cfg.hueLock = on
      emit()
    })
    fields.appendChild(lock)

    const out = document.createElement('textarea')
    out.className = 'ix-lab-block'
    out.readOnly = true
    out.rows = 6
    out.spellcheck = false

    function swatches () {
      sum.querySelector('.sw').innerHTML = ['bg', 'title', 'link']
        .map((k) => `<i style="background:${cfg[k] || 'transparent'}"></i>`).join('')
    }

    function emit () {
      const clean = {}
      Object.keys(cfg).forEach((k) => {
        const v = cfg[k]
        // hueLock drives the pickers, not the column; it never reaches
        // the block that gets pasted back into the post.
        if (k === 'hueLock') return
        if (v !== '' && v !== null && v !== undefined) clean[k] = v
      })
      // Split so the closing tag cannot terminate this script when the
      // bundle is parsed inline anywhere.
      const OPEN = '<' + 'script type="application/json" data-m4-col>'
      const CLOSE = '<' + '/script>'
      out.value = OPEN + '\n' + JSON.stringify(clean, null, 2) + '\n' + CLOSE
      swatches()
      onColumnChange(col, clean)
    }

    GROUPS.forEach(([mode, keys]) => {
      const g = document.createElement('div')
      g.className = 'ix-lab-group'
      g.dataset.mode = mode
      const h = document.createElement('p')
      h.className = 'ix-lab-group-h'
      h.textContent = mode === 'dark' ? 'dark mode · unset inherits light' : 'light mode'
      g.appendChild(h)

      keys.forEach(([key, label]) => {
        const f = document.createElement('label')
        f.className = 'ix-lab-field'
        f.innerHTML = `<span>${label}</span>` +
          `<input type="color" data-k="${key}" value="${cfg[key] || '#000000'}">` +
          '<button type="button" class="clr" title="unset">×</button>'
        const input = f.querySelector('input')
        const mark = () => f.classList.toggle('is-unset', !cfg[key])
        mark()
        input.addEventListener('input', () => {
          cfg[key] = input.value
          // With the lock on, the edited colour sets the hue and every
          // other value is rotated onto it, keeping its own saturation
          // and lightness so the palette's structure survives.
          if (cfg.hueLock !== false) {
            const h = hexToHsl(input.value)
            if (h) {
              GROUPS.forEach(([, ks]) => ks.forEach(([k2]) => {
                if (k2 !== key && cfg[k2]) cfg[k2] = reHue(cfg[k2], h.h)
              }))
              fields.querySelectorAll('input[type="color"]').forEach((i2) => {
                const k2 = i2.dataset.k
                if (cfg[k2]) i2.value = cfg[k2]
              })
            }
          }
          mark()
          emit()
        })
        f.querySelector('.clr').addEventListener('click', (e) => {
          e.preventDefault()
          delete cfg[key]
          // Show what it will actually inherit rather than a stale value.
          const base = key.endsWith('Dark') ? cfg[key.replace('Dark', '')] : null
          input.value = base || '#000000'
          mark()
          emit()
        })
        g.appendChild(f)
      })
      fields.appendChild(g)
    })

    ;[['font.family', 'font family'], ['font.weight', 'font weight'], ['scene', 'scene']]
      .forEach(([path, label]) => {
        const f = document.createElement('label')
        f.className = 'ix-lab-field is-text'
        const cur = path === 'scene' ? (cfg.scene || '') : ((cfg.font || {})[path.split('.')[1]] || '')
        f.innerHTML = `<span>${label}</span><input type="text" value="${cur}">`
        f.querySelector('input').addEventListener('input', (e) => {
          const v = e.target.value
          if (path === 'scene') { if (v) cfg.scene = v; else delete cfg.scene } else {
            cfg.font = Object.assign({}, cfg.font)
            const k = path.split('.')[1]
            if (v) cfg.font[k] = k === 'weight' ? Number(v) || v : v
            else delete cfg.font[k]
            if (!Object.keys(cfg.font).length) delete cfg.font
          }
          emit()
        })
        fields.appendChild(f)
      })

    fields.appendChild(out)
    wrap.appendChild(row)
    emit()
    return { row, slug: col.slug }
  })
}

export function createLab (settings, presets, onChange, columns, onColumnChange) {
  const panel = document.createElement('aside')
  panel.className = 'ix-lab'
  panel.innerHTML = `
    <header>
      <strong>motion lab</strong>
      <button type="button" data-min aria-label="Minimise">–</button>
    </header>
    <div class="ix-lab-body">
      <details class="ix-lab-sec"><summary>transition</summary>
      <div class="ix-lab-presets"></div>
      <button type="button" class="ix-lab-toggle" data-cycle aria-pressed="false">
        <span class="dot"></span> cycle on each switch
      </button>
      </details>
      <details class="ix-lab-sec"><summary>dimensions</summary>
      <div class="ix-lab-dims"></div>
      </details>
      <details class="ix-lab-sec"><summary>effects</summary>
      <div class="ix-lab-fx"></div>
      </details>
      <details class="ix-lab-sec" open><summary>columns</summary>
      <button type="button" class="ix-lab-toggle" data-darkpreview aria-pressed="false">
        <span class="dot"></span> preview dark mode
      </button>
      <div class="ix-lab-cols"></div>
      </details>
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

  // key, label, min, max, step, default-if-unset
  const DIMS = [
    ['pad', 'app padding', 0, 8, 0.25, 1.25],
    ['rail', 'rail width', 2, 10, 0.25, 4],
    ['measure', 'text measure', 28, 80, 1, 45],
    ['media', 'media width', 500, 2000, 20, 1100]
  ]
  const dimWrap = panel.querySelector('.ix-lab-dims')
  DIMS.forEach(([key, label, min, max, step, dflt]) => {
    const row = document.createElement('label')
    row.className = 'ix-lab-dim'
    row.innerHTML = `<span class="k">${label}</span>` +
      `<input type="range" data-dim="${key}" min="${min}" max="${max}" step="${step}">` +
      '<output></output>'
    const input = row.querySelector('input')
    const out = row.querySelector('output')
    const unit = key === 'media' ? 'px' : 'rem'
    const show = () => { out.textContent = input.value + unit }
    input.value = settings[key] === null || settings[key] === undefined ? dflt : settings[key]
    show()
    input.addEventListener('input', () => {
      settings[key] = parseFloat(input.value)
      show()
      applyDims(settings)
      save(settings)
    })
    dimWrap.appendChild(row)
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

  // Previewing dark is the only way to judge the dark values while
  // setting them.
  const darkBtn = panel.querySelector('[data-darkpreview]')
  darkBtn.addEventListener('click', () => {
    const on = darkBtn.getAttribute('aria-pressed') !== 'true'
    darkBtn.setAttribute('aria-pressed', on ? 'true' : 'false')
    document.documentElement.classList.toggle('dark', on)
    panel.querySelectorAll('.ix-lab-group').forEach((g) => {
      g.classList.toggle('is-active', g.dataset.mode === (on ? 'dark' : 'light'))
    })
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

  let colRows = []
  if (columns && columns.length) {
    colRows = buildColumns(panel.querySelector('.ix-lab-cols'), columns, onColumnChange)
  }

  /** Expand the row for whichever column is open; collapse the rest. */
  function focusColumn (slug) {
    colRows.forEach((r) => { r.row.open = r.slug === slug })
  }

  document.body.appendChild(panel)
  panel.querySelectorAll('.ix-lab-group').forEach((g) => {
    g.classList.toggle('is-active', g.dataset.mode === (document.documentElement.classList.contains('dark') ? 'dark' : 'light'))
  })
  applyDims(settings)
  sync()
  return { panel, sync, focusColumn }
}
