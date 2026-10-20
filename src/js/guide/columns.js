/* global history, location, getComputedStyle, URLSearchParams, requestAnimationFrame, setTimeout, clearTimeout */

import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import { loadSettings, labEnabled, createLab } from './lab'

gsap.registerPlugin(Observer, CustomEase, SplitText)

// PBS's signature easing, cubic-bezier(0.16, 1, 0.3, 1). In that project
// it drives the 800ms palette cross-fade; recreated here so our motion
// shares the same character. It is aggressively front-loaded -- 82.5% of
// the distance in the first 25% of the time -- which is what reads as
// physical rather than linear.
CustomEase.create('pbs', 'M0,0 C0.16,1 0.3,1 1,1')
/**
 * GUIDE COLUMNS — interactive presentation of a normally-published post.
 *
 * Architecture, each point measured rather than assumed:
 *
 * - LIGHT DOM, no shadow root. Ghost Portal binds member forms with a
 *   one-time document.querySelectorAll('form[data-members-form]') called
 *   from a React lifecycle hook that runs after its async init — i.e.
 *   after DOMContentLoaded, and after us. querySelectorAll does not cross
 *   a shadow boundary, so a signup card moved behind one is never found
 *   and the waitlist card would be silently dead.
 *
 * - EACH PANEL CARRIES .post-body. That class is the only carrier of
 *   prose typography (_post.sass): link colour, heading colour, and
 *   list-style, which Tailwind's preflight otherwise resets to no
 *   bullets. Prose moved out of it loses all of that.
 *
 * - COLUMN MARKER: H1 if the post uses any (Ctrl+Alt+1), else H2. H1
 *   leaves both h2 and h3 free for structure inside a column. Each is
 *   re-emitted as an h2 in its panel, since the post title is already
 *   the page h1 (article-header.hbs:5).
 *
 * - PER-COLUMN CONFIG: one Ghost HTML card immediately after the heading.
 *   Ghost renders HTML cards as raw nodes between kg-card comment markers
 *   with NO wrapper, so the card's contents are literally the heading's
 *   next siblings. Configuration lives beside the content it configures:
 *   no slug lookup, survives rewording and reordering, no deploy needed.
 */

const TAG = '[m4-ix]'
const loadedFonts = {}

/**
 * Stock exports routinely ship <style>.cls-1{fill:#231f20}</style>
 * alongside the paths. That beats fill="currentColor" and pins the icon
 * black in every column, so it goes. Scripts and on* handlers go too:
 * not distrust of the author, but a pasted icon shouldn't be able to run.
 */
function cleanSvg (svg) {
  svg.querySelectorAll('style,script').forEach((n) => n.remove())
  svg.querySelectorAll('*').forEach((n) => {
    Array.from(n.attributes).forEach((a) => {
      if (/^on/i.test(a.name)) n.removeAttribute(a.name)
    })
  })
  if (!svg.getAttribute('fill')) svg.setAttribute('fill', 'currentColor')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  return svg
}

/**
 * Rewrite the viewBox from the artwork's real bounds, so any paste from
 * any exporter renders correctly. Only when there is none or the declared
 * one doesn't contain the geometry, so a deliberately padded viewBox
 * survives. Needs the node rendered; getBBox throws otherwise.
 */
function fitSvg (svg) {
  if (svg.dataset.m4Fit === 'false') return
  let box
  try { box = svg.getBBox() } catch (e) { return }
  if (!box || !box.width || !box.height) return

  const vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number)
  const declared = vb.length === 4 && vb.every((n) => !isNaN(n)) ? vb : null
  const contained = declared &&
    box.x >= declared[0] - 1 && box.y >= declared[1] - 1 &&
    box.x + box.width <= declared[0] + declared[2] + 1 &&
    box.y + box.height <= declared[1] + declared[3] + 1
  if (contained) return

  const pad = Math.max(box.width, box.height) * 0.02
  svg.setAttribute('viewBox',
    `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`)
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet')
  console.log(`${TAG} refit svg viewBox -> ${svg.getAttribute('viewBox')}` +
    (declared ? ` (was ${declared.join(' ')})` : ' (none declared)'))
}

/**
 * Relative luminance (WCAG). Used to pick a foreground that stays
 * readable on whatever colour a column's config block supplies.
 */
function luminance (colour) {
  if (!colour) return null
  let hex = colour.trim()
  const rgb = hex.match(/^rgba?\(([^)]+)\)/i)
  if (rgb) {
    const n = rgb[1].split(',').map((v) => parseInt(v, 10))
    hex = '#' + n.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('')
  }
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return null
  const ch = [m[1], m[2], m[3]].map((h) => {
    const v = parseInt(h, 16) / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

/**
 * 0.45 sits between the theme accent (#da4912, 0.197 -> white) and a
 * bright column colour such as #7fffd4 (0.808 -> near-black), which is
 * the threshold the brief asked for.
 */
function readableOn (colour) {
  const l = luminance(colour)
  return l === null ? null : (l > 0.45 ? '#0a0a0a' : '#ffffff')
}

function applyConfig (panel, col, cfg) {
  if (!cfg) return
  const map = {
    bg: '--m4-bg',
    title: '--m4-title',
    link: '--m4-link',
    bgDark: '--m4-bg-dark',
    titleDark: '--m4-title-dark',
    linkDark: '--m4-link-dark'
  }
  let styled = false
  Object.keys(map).forEach((k) => {
    if (cfg[k]) {
      panel.style.setProperty(map[k], cfg[k])
      col.style.setProperty(map[k], cfg[k])
      styled = true
    }
  })
  if (styled) panel.setAttribute('data-m4-styled', '')

  if (cfg.font && cfg.font.family) {
    panel.style.setProperty('--m4-font-family', cfg.font.family)
    if (cfg.font.weight) panel.style.setProperty('--m4-font-weight', cfg.font.weight)
    if (cfg.font.style) panel.style.setProperty('--m4-font-style', cfg.font.style)
    panel.setAttribute('data-m4-font', '')
  }
  if (cfg.fontUrl && !loadedFonts[cfg.fontUrl]) {
    loadedFonts[cfg.fontUrl] = true
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = cfg.fontUrl
    document.head.appendChild(link)
  }
  // Icon colour: currentColor by default, inheriting the column's title
  // token so it is correct in both modes with no config. "accent" opts
  // into the link colour; any other value is used verbatim.
  if (cfg.icon === 'accent') col.style.setProperty('--m4-icon', 'var(--m4-link)')
  else if (cfg.icon) col.style.setProperty('--m4-icon', cfg.icon)
  if (cfg.scene) panel.setAttribute('data-m4-scene', cfg.scene)

  const onBg = readableOn(cfg.bg)
  const onLink = readableOn(cfg.link)
  if (onBg) panel.style.setProperty('--m4-on-bg', onBg)
  if (onLink) panel.style.setProperty('--m4-on-link', onLink)
}

/** Read the config card after a heading and detach it from the flow. */
function readConfig (head) {
  let cfg = null
  let icon = null
  let n = head.nextElementSibling
  let scanned = 0

  while (n && scanned < 4) {
    const next = n.nextElementSibling
    if (n.matches('script[type="application/json"][data-m4-col]')) {
      try {
        cfg = JSON.parse(n.textContent)
      } catch (e) {
        console.warn(`${TAG} bad JSON in config block for "${head.textContent.trim()}"`, e)
      }
      n.remove()
    } else if (n.tagName && n.tagName.toLowerCase() === 'svg' && !icon) {
      icon = cleanSvg(n)
      n.remove()
    } else if (cfg || icon) {
      break // config card ended
    } else if (scanned > 0) {
      break // nothing config-like directly after the heading
    }
    n = next
    scanned++
  }
  return { cfg, icon }
}

/**
 * 100vw includes the scrollbar, 100% does not, so the full-bleed rule in
 * _guide.scss overflows horizontally wherever scrollbars take up space.
 * Publish the difference for CSS to subtract.
 */
function trackScrollbarWidth () {
  const set = () => {
    const sbw = window.innerWidth - document.documentElement.clientWidth
    document.documentElement.style.setProperty('--m4-sbw', `${Math.max(0, sbw)}px`)
  }
  set()
  window.addEventListener('resize', set)
}

export default function initColumns () {
  const body = document.getElementById('post-body')
  if (!body) { console.log(`${TAG} no #post-body`); return }

  trackScrollbarWidth()

  const marker = body.querySelector('h1:not(.kg-card h1)') ? 'H1' : 'H2'

  // Headings inside a Koenig card are card furniture, not structure: a
  // signup card's <h2 class="kg-signup-card-heading"> is its CTA. They
  // produced two bogus columns on the 2025 guide, and because such a
  // heading is nested, the sibling walk drained only the card's own
  // children and stranded the prose that followed.
  const sections = []
  body.querySelectorAll(marker.toLowerCase()).forEach((h) => {
    if (h.closest('.kg-card')) return
    const { cfg, icon } = readConfig(h)
    const sec = { title: h.textContent.trim(), id: h.id || '', head: h, cfg, icon, nodes: [] }
    let n = h.nextSibling
    while (n) {
      if (n.nodeType === 1 && n.tagName === marker) break
      const next = n.nextSibling
      sec.nodes.push(n)
      n = next
    }
    sections.push(sec)
  })

  console.log(`${TAG} marker=${marker} sections parsed: ${sections.length} ` +
    JSON.stringify(sections.map((s) => s.title)))

  if (!sections.length) {
    console.log(`${TAG} no section headings; leaving the article as published.`)
    return
  }

  const wrap = document.createElement('div')
  wrap.className = 'ix'
  const stack = document.createElement('div')
  stack.className = 'ix-stack'
  const nav = document.createElement('nav')
  nav.className = 'ix-nav'
  const en = (document.documentElement.lang || '').indexOf('en') === 0
  nav.setAttribute('aria-label', en ? 'Sections' : 'Secciones')

  const markerEl = document.createElement('div')
  markerEl.className = 'ix-marker'
  markerEl.setAttribute('aria-hidden', 'true')

  const entries = sections.map((s, i) => {
    const slug = s.id || `ix-${i}`

    const item = document.createElement('article')
    item.className = 'ix-item'
    item.style.setProperty('--g', i === 0 ? 1 : 0)
    item.dataset.open = i === 0 ? 'true' : 'false'

    // The face is the collapsed rail: symbol plus a vertical label, which
    // is what makes a 5.5rem column readable at all.
    const face = document.createElement('button')
    face.type = 'button'
    face.className = 'ix-face'
    face.setAttribute('aria-expanded', i === 0 ? 'true' : 'false')
    face.setAttribute('aria-controls', slug)
    // The icon is decorative; the accessible name is always the heading.
    face.setAttribute('aria-label', s.title)
    if (s.icon) face.appendChild(s.icon.cloneNode(true))
    // Two labels: the horizontal one reads in the all-collapsed grid,
    // the vertical one in a 5.5rem rail. CSS shows whichever fits.
    const title = document.createElement('span')
    title.className = 'ix-face-title'
    title.textContent = s.title
    face.appendChild(title)
    const lbl = document.createElement('span')
    lbl.className = 'lbl'
    lbl.textContent = s.title
    face.appendChild(lbl)

    const bodyEl = document.createElement('div')
    bodyEl.className = 'ix-body post-body'
    bodyEl.id = slug

    let head = s.head
    if (head.tagName === 'H1') {
      const h2 = document.createElement('h2')
      h2.className = head.className
      h2.innerHTML = head.innerHTML
      head.parentNode.removeChild(head)
      head = h2
    }
    // The body owns the anchor id; leaving it on the heading too would
    // duplicate it and make #hash resolve to whichever came first.
    head.removeAttribute('id')
    bodyEl.appendChild(head)
    s.nodes.forEach((n) => bodyEl.appendChild(n))

    item.appendChild(face)
    item.appendChild(bodyEl)
    stack.appendChild(item)

    const navBtn = document.createElement('button')
    navBtn.type = 'button'
    navBtn.setAttribute('aria-current', 'false')
    navBtn.setAttribute('aria-label', s.title)
    if (s.icon) navBtn.appendChild(s.icon.cloneNode(true))
    navBtn.appendChild(document.createTextNode(s.title))
    nav.appendChild(navBtn)

    applyConfig(item, face, s.cfg)

    return { slug, title: s.title, item, face, body: bodyEl, nav: navBtn, icon: s.icon }
  })

  wrap.appendChild(stack)
  body.parentNode.insertBefore(wrap, body.nextSibling)
  document.body.appendChild(nav)
  document.body.appendChild(markerEl)

  // Icons must be rendered before getBBox can measure them.
  document.querySelectorAll('.ix svg, .ix-nav svg').forEach(fitSvg)

  const opened = {}
  let readFired = false

  /**
   * post-infinite.js owns observeArticle(), and it bails without
   * .js-infinite-container — which this template deliberately omits, so
   * read-tracking would otherwise be silently absent here. Column opens
   * measure what this format actually produces anyway.
   */
  function track (title) {
    if (!window._paq) return
    try {
      window._paq.push(['trackEvent', 'Guide', 'OpenColumn', title])
      if (!readFired && Object.keys(opened).length >= 3) {
        readFired = true
        window._paq.push(['trackEvent', 'Guide', 'Read', document.title])
      }
    } catch (err) {
      console.warn(`${TAG} analytics push failed`, err)
    }
  }

  // Animating --g (which drives flex-grow) rather than using Flip: fewer
  // moving parts, no plugin, and measured in-page it held a 14.3ms worst
  // frame against Flip's 20.7ms. Flip stays the right tool for the mobile
  // case, where drawers move between containers.
  /**
   * Switching-animation presets, cycled so they can be compared on real
   * content. The name is flashed on screen as each one runs.
   * Pin one with ?anim=<name>; the cycler is a build-time tool, not
   * something to ship to readers.
   */
  const PRESETS = [
    { name: 'pbs', dur: 0.6, ease: 'pbs', stagger: 0 },
    { name: 'power4.inOut', dur: 0.7, ease: 'power4.inOut', stagger: 0 },
    { name: 'expo.out', dur: 0.55, ease: 'expo.out', stagger: 0 },
    { name: 'circ.inOut', dur: 0.65, ease: 'circ.inOut', stagger: 0 },
    { name: 'back.out(1.4)', dur: 0.75, ease: 'back.out(1.4)', stagger: 0 },
    { name: 'elastic.out(1,0.75)', dur: 1.1, ease: 'elastic.out(1,0.75)', stagger: 0 },
    { name: 'power2.out snap', dur: 0.32, ease: 'power2.out', stagger: 0 },
    { name: 'pbs + stagger', dur: 0.6, ease: 'pbs', stagger: 0.035 }
  ]
  const FX = loadSettings()
  const pinned = new URLSearchParams(location.search).get('anim')
  if (pinned) { FX.preset = pinned; FX.cycle = false }
  const presetIndex = () => Math.max(0, PRESETS.findIndex((p) => p.name === FX.preset))

  const flash = document.createElement('div')
  flash.className = 'ix-anim-flash'
  flash.setAttribute('aria-hidden', 'true')
  document.body.appendChild(flash)

  function announce (name) {
    flash.textContent = name
    gsap.killTweensOf(flash)
    gsap.fromTo(flash, { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.6, ease: 'power2.in', delay: 0.35 })
  }

  /**
   * Content choreography inside the column that just opened.
   *
   * Transform and opacity only, on a handful of block-level children --
   * never on split prose. Splitting paragraphs multiplies DOM nodes and
   * re-splits on width change, which is exactly the reflow the pinned
   * body width exists to avoid. The heading is the one exception, and
   * its width is pinned for the same reason.
   */
  function playContent (entry, preset) {
    const el = entry.body
    const reveal = preset.dur * 0.45 // wait until the column is ~half open

    if (FX.headingMask) {
      const h = el.querySelector('h2')
      if (h && !h.dataset.ixSplit) {
        h.dataset.ixSplit = '1'
        try {
          const split = SplitText.create(h, { type: 'lines', mask: 'lines', autoSplit: false })
          entry.split = split
        } catch (e) { /* SplitText unavailable: fall through to the block stagger */ }
      }
      if (entry.split) {
        gsap.fromTo(entry.split.lines,
          { yPercent: 110 },
          { yPercent: 0, duration: 0.8, stagger: 0.08, ease: 'expo.out', delay: reveal })
      }
    }

    if (FX.proseStagger) {
      const blocks = Array.from(el.children)
        .filter((n) => !FX.headingMask || n.tagName !== 'H2')
        .slice(0, 8) // only the first screenful is worth animating
      gsap.fromTo(blocks,
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.06,
          ease: 'expo.out',
          delay: reveal,
          // Leftover transforms create stacking contexts, which break
          // the Ghost signup card's focus handling.
          clearProps: 'transform,opacity,visibility'
        })
    }
  }

  const PALETTE = ['--m4-bg', '--m4-title', '--m4-link',
    '--m4-bg-dark', '--m4-title-dark', '--m4-link-dark']

  /**
   * Pin every body to the width it has when open, so its text does not
   * re-wrap as the column animates. Without this the closing column
   * reflows its paragraphs every frame on the way down (expensive, and
   * visibly jumpy), and the opening one starts squeezed into the 5.5rem
   * rail. The item's overflow:hidden does the clipping instead.
   */
  function sizeBodies () {
    const faces = stack.querySelectorAll('.ix-face')
    if (!faces.length) return
    const gap = parseFloat(getComputedStyle(stack).gap) || 0
    const rail = faces[0].getBoundingClientRect().width
    // Every column keeps its rail, including the open one -- the body
    // sits beside its own face, not on top of it. Forgetting that last
    // rail ran the body 86px under the next column, so content measured
    // centred while looking shifted.
    const openW = stack.getBoundingClientRect().width -
      (entries.length - 1) * (rail + gap) - gap - rail
    stack.style.setProperty('--ix-open-w', `${Math.max(240, Math.round(openW))}px`)
  }

  function open (slug, push, immediate) {
    const preset = PRESETS[presetIndex()]
    const anyOpen = !!slug
    stack.dataset.allCollapsed = anyOpen ? 'false' : 'true'

    if (!immediate && anyOpen) announce(preset.name)
    const originIdx = entries.findIndex((x) => x.slug === slug)

    entries.forEach((e, i) => {
      // With nothing open every column shares the width equally; that is
      // the entry state, where each one shows a large symbol and its
      // heading rather than a vertical sliver.
      const isOpen = anyOpen && e.slug === slug
      e.item.dataset.open = isOpen ? 'true' : 'false'
      e.face.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
      e.nav.setAttribute('aria-current', isOpen ? 'true' : 'false')

      // Reveal the opening body up front; hide a closing one only once it
      // has finished collapsing. Hiding on the way down is what made the
      // outgoing content vanish instantly instead of sliding away.
      if (isOpen) e.body.removeAttribute('hidden')

      const done = () => {
        if (e.item.dataset.open === 'false') e.body.setAttribute('hidden', 'until-found')
      }

      // The symbol shrinks and turns as its column becomes a rail, so
      // the glyph lands on the same axis as the rotated label.
      const svg = e.face.querySelector('svg')
      if (svg && FX.symbolMotion && !immediate) {
        gsap.to(svg, {
          scale: anyOpen ? (isOpen ? 0.8 : 0.62) : 1,
          rotate: anyOpen && !isOpen ? 90 : 0,
          duration: preset.dur,
          ease: preset.ease,
          overwrite: 'auto'
        })
      } else if (svg && immediate) {
        gsap.set(svg, { scale: 1, rotate: 0 })
      }

      const g = anyOpen ? (isOpen ? 1 : 0) : 1
      if (immediate) {
        gsap.set(e.item, { '--g': g })
        done()
      } else {
        gsap.to(e.item, {
          '--g': g,
          duration: preset.dur,
          ease: preset.ease,
          // Ripple: neighbours start a few ms after the column you
          // clicked, so the collapse spreads outwards from it.
          delay: (FX.railRipple ? Math.abs(i - originIdx) * 0.03 : 0) +
            (preset.stagger ? Math.abs(i - originIdx) * preset.stagger : 0),
          onComplete: done
        })
      }

      if (isOpen) {
        // HomepageShell drives a data-section attribute on <html> from a
        // ScrollTrigger at the 50% line, and [data-section] carries an
        // 800ms cubic-bezier(.16,1,.3,1) transition, so the whole page
        // cross-fades to the active panel's palette. Same idea here, with
        // the open column as the trigger.
        const root = document.documentElement
        PALETTE.forEach((v) => {
          const val = e.item.style.getPropertyValue(v)
          if (val) root.style.setProperty(v, val)
          else root.style.removeProperty(v)
        })
        root.setAttribute('data-ix-section', e.slug)

        markerEl.innerHTML = ''
        if (e.icon) markerEl.appendChild(e.icon.cloneNode(true))
        const label = document.createElement('span')
        label.textContent = e.title
        markerEl.appendChild(label)
        if (!immediate) playContent(e, preset)
        if (!opened[slug]) { opened[slug] = true; track(e.title) }
      }
    })

    if (!anyOpen) {
      markerEl.innerHTML = ''
      document.documentElement.removeAttribute('data-ix-section')
      PALETTE.forEach((v) => document.documentElement.style.removeProperty(v))
    }

    if (FX.cycle && !immediate && anyOpen) {
      FX.preset = PRESETS[(presetIndex() + 1) % PRESETS.length].name
    }

    if (push && window.history && history.replaceState) {
      history.replaceState(null, '', anyOpen ? `#${slug}` : location.pathname + location.search)
    }
  }

  entries.forEach((e) => {
    e.face.addEventListener('click', () => {
      // Clicking the column that is already open returns to the all-
      // collapsed grid, so there is a way back without a nav control.
      open(e.item.dataset.open === 'true' ? null : e.slug, true)
    })
    e.nav.addEventListener('click', () => {
      open(e.slug, true)
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    // Find-in-page landed inside a closed column: open it for real.
    e.body.addEventListener('beforematch', () => open(e.slug, true))
  })

  window.addEventListener('hashchange', () => {
    const s = location.hash.replace('#', '')
    if (entries.some((x) => x.slug === s)) open(s, false)
  })

  sizeBodies()
  window.addEventListener('resize', sizeBodies)

  if (labEnabled()) {
    createLab(FX, PRESETS, (key) => {
      // Re-run the current state so a change is visible immediately.
      const current = entries.find((x) => x.item.dataset.open === 'true')
      if (key !== 'cycle' && current) {
        open(null, false, true)
        requestAnimationFrame(() => open(current.slug, false))
      }
    })
  }

  /**
   * Over the open body, reaching either end of the content and pushing
   * further releases the page out of the app -- down to the related
   * reading and comments, up to the hero. Without this the stack is a
   * trap: overscroll-behavior:contain stops the browser chaining, so the
   * reader would simply hit a wall.
   *
   * It takes a deliberate push. Below the threshold the stack resists
   * and springs back, so brushing the end of a column doesn't eject you.
   */
  const EDGE_TOL = 110
  let edgeAcc = 0
  let releasing = false

  function atEdge (el, dir) {
    if (dir < 0) return el.scrollTop <= 0
    return Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight - 1
  }

  function springBack () {
    edgeAcc = 0
    gsap.to(stack, { y: 0, duration: 0.9, ease: 'elastic.out(1, 0.5)', overwrite: 'auto' })
  }

  let rearm = null

  /**
   * Leaving a column.
   *
   * The earlier version tweened window scroll with GSAP, which threw
   * away the gesture's momentum and arrived at a fixed pace however hard
   * you pushed -- then a velocity-matched duration tried to simulate the
   * momentum back. PBS does none of that: it never animates scroll, it
   * lets the browser scroll with its own inertia and uses scroll-snap to
   * catch where that lands. So here, crossing the threshold just lifts
   * the barrier -- overscroll-behavior goes back to auto and we stop
   * calling preventDefault -- and the rest of the reader's gesture, with
   * its real trackpad or touch momentum, carries the page out. The
   * snap rule on .ix-stack decides where it settles.
   */
  function release (dir) {
    if (releasing) return
    releasing = true
    gsap.to(stack, { y: 0, duration: 0.3, ease: 'pbs', overwrite: 'auto' })
    // Panel navigation owns travel between panels now, so a column read
    // to its end hands over to it instead of releasing the page to a
    // browser scroll that no longer snaps anywhere.
    // Up from the top of a column returns to the top of the document.
    // Down is simply released: below the app, scrolling is ordinary.
    if (dir < 0 && window.M4Panels) window.M4Panels.toTop()
    else entries.forEach((e) => { e.body.style.overscrollBehavior = 'auto' })
    clearTimeout(rearm)
    rearm = setTimeout(() => {
      entries.forEach((e) => { e.body.style.removeProperty('overscroll-behavior') })
      edgeAcc = 0
      releasing = false
    }, 1100)
  }

  Observer.create({
    target: stack,
    type: 'wheel,touch',
    tolerance: 0,
    preventDefault: false,
    onChangeY (self) {
      const ev = self.event
      if (!ev || !ev.target || !ev.target.closest) return
      const bodyEl = ev.target.closest('.ix-body')
      if (!bodyEl || bodyEl.hasAttribute('hidden')) return
      // Already released: keep out of the way so the browser's own
      // momentum carries the page.
      if (releasing) return
      const dir = self.deltaY > 0 ? 1 : -1
      if (!atEdge(bodyEl, dir)) { if (edgeAcc) springBack(); return }
      if (ev.cancelable) ev.preventDefault()
      edgeAcc += Math.abs(self.deltaY)
      if (edgeAcc >= EDGE_TOL) release(dir)
      else gsap.to(stack, { y: -dir * Math.min(34, edgeAcc * 0.34), duration: 0.12, ease: 'power2.out', overwrite: 'auto' })
    }
  })

  // With no lede above the first heading, #post-body is left empty and
  // would still contribute its margins.
  if (!body.textContent.trim() && !body.querySelector('img, figure, iframe')) {
    body.classList.add('is-empty')
  }

  console.log(`${TAG} mounted ${entries.length} columns ` + JSON.stringify({
    withConfig: entries.filter((e) => e.item.hasAttribute('data-m4-styled')).length,
    withIcon: entries.filter((e) => !!e.icon).length,
    scenes: entries.filter((e) => e.item.hasAttribute('data-m4-scene'))
      .map((e) => e.item.getAttribute('data-m4-scene')),
    memberFormsInPanels: document.querySelectorAll('.ix-body form[data-members-form]').length,
    memberFormsStillQueryable: document.querySelectorAll('form[data-members-form]').length
  }))

  return entries
}
