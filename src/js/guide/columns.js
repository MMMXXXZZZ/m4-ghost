/* global history, location, getComputedStyle, performance */

import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(Observer, CustomEase)

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
  const DUR = 0.6
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
    const faceW = faces[0].getBoundingClientRect().width
    const openW = stack.getBoundingClientRect().width -
      (entries.length - 1) * (faceW + gap) - gap
    stack.style.setProperty('--ix-open-w', `${Math.max(240, Math.round(openW))}px`)
  }

  function open (slug, push, immediate) {
    entries.forEach((e) => {
      const on = e.slug === slug
      e.item.dataset.open = on ? 'true' : 'false'
      e.face.setAttribute('aria-expanded', on ? 'true' : 'false')
      e.nav.setAttribute('aria-current', on ? 'true' : 'false')

      // Reveal the opening body up front; hide a closing one only once it
      // has finished collapsing. Hiding on the way down is what made the
      // outgoing content vanish instantly instead of sliding away.
      if (on) e.body.removeAttribute('hidden')

      const done = () => {
        // Re-check rather than trust the closure: a fast second click can
        // land while this tween is still running.
        if (e.item.dataset.open === 'false') e.body.setAttribute('hidden', 'until-found')
      }

      if (immediate) {
        gsap.set(e.item, { '--g': on ? 1 : 0 })
        done()
      } else {
        gsap.to(e.item, { '--g': on ? 1 : 0, duration: DUR, ease: 'power3.inOut', onComplete: done })
      }

      if (on) {
        // HomepageShell drives a data-section attribute on <html> from a
        // ScrollTrigger at the 50% line, and [data-section] carries an
        // 800ms cubic-bezier(.16,1,.3,1) transition, so the whole page
        // cross-fades to the active panel's palette. Same idea here, with
        // the open column as the trigger: the chrome follows the column
        // instead of only the column repainting.
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
        if (!opened[slug]) { opened[slug] = true; track(e.title) }
      }
    })
    if (push && window.history && history.replaceState) {
      history.replaceState(null, '', `#${slug}`)
    }
  }

  entries.forEach((e) => {
    e.face.addEventListener('click', () => open(e.slug, true))
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

  /**
   * Wheel over a COLLAPSED rail walks the columns sideways. Over the open
   * body the wheel is left alone, so reading still scrolls normally.
   *
   * Threshold plus cooldown rather than raw delta: a trackpad emits a
   * long tail of small deltas, and without both, one flick would skip
   * half the guide. Below the threshold the stack rubber-bands and
   * springs back, so the gesture is acknowledged even when it doesn't
   * commit.
   */
  const TOLERANCE = 35
  const LOCK_MS = 520
  let lastStep = 0
  let band = 0

  function rubber (dir) {
    band = gsap.utils.clamp(-26, 26, band + dir * 6)
    gsap.to(stack, {
      x: band,
      duration: 0.18,
      ease: 'power2.out',
      overwrite: 'auto',
      onComplete () {
        gsap.to(stack, {
          x: 0,
          duration: 0.9,
          ease: 'elastic.out(1, 0.45)',
          overwrite: 'auto',
          onComplete () { band = 0 }
        })
      }
    })
  }

  function stepColumn (dir) {
    const now = performance.now()
    if (now - lastStep < LOCK_MS) return false
    const i = entries.findIndex((e) => e.item.dataset.open === 'true')
    const n = gsap.utils.clamp(0, entries.length - 1, i + dir)
    if (n === i) { rubber(dir); return false }
    lastStep = now
    gsap.to(stack, { x: 0, duration: 0.5, ease: 'pbs', overwrite: 'auto' })
    open(entries[n].slug, true)
    return true
  }

  Observer.create({
    target: stack,
    type: 'wheel,touch',
    tolerance: TOLERANCE,
    preventDefault: false,
    onChangeY (self) {
      const ev = self.event
      const over = ev && ev.target && ev.target.closest ? ev.target.closest('.ix-item') : null
      if (!over || over.dataset.open === 'true') return
      if (ev.cancelable) ev.preventDefault()
      const dir = self.deltaY > 0 ? 1 : -1
      if (!stepColumn(dir)) rubber(dir)
    }
  })

  const initial = location.hash.replace('#', '')
  // immediate: at mount there is nothing to animate from, and tweening
  // would leave every closed body visible in a 5.5rem rail for 600ms.
  open(entries.some((x) => x.slug === initial) ? initial : entries[0].slug, false, true)

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
