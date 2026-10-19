/* global history, location */
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
  const cols = document.createElement('div')
  cols.className = 'ix-cols'
  const panels = document.createElement('div')
  panels.className = 'ix-panels'
  const nav = document.createElement('nav')
  nav.className = 'ix-nav'
  const en = (document.documentElement.lang || '').indexOf('en') === 0
  nav.setAttribute('aria-label', en ? 'Sections' : 'Secciones')

  const markerEl = document.createElement('div')
  markerEl.className = 'ix-marker'
  markerEl.setAttribute('aria-hidden', 'true')

  const entries = sections.map((s, i) => {
    const slug = s.id || `ix-${i}`

    const panel = document.createElement('section')
    panel.className = 'ix-panel post-body'
    panel.id = slug

    let head = s.head
    if (head.tagName === 'H1') {
      const h2 = document.createElement('h2')
      h2.className = head.className
      h2.innerHTML = head.innerHTML
      head.parentNode.removeChild(head)
      head = h2
    }
    // The panel owns the anchor id; leaving it on the heading too would
    // duplicate it and make #hash resolve to whichever came first.
    head.removeAttribute('id')
    panel.appendChild(head)
    s.nodes.forEach((n) => panel.appendChild(n))
    panels.appendChild(panel)

    const col = document.createElement('button')
    col.type = 'button'
    col.className = 'ix-col'
    col.setAttribute('aria-expanded', 'false')
    col.setAttribute('aria-controls', slug)
    // The icon is decorative; the accessible name is always the heading.
    col.setAttribute('aria-label', s.title)
    if (s.icon) col.appendChild(s.icon.cloneNode(true))
    else col.textContent = s.title
    cols.appendChild(col)

    const navBtn = document.createElement('button')
    navBtn.type = 'button'
    navBtn.setAttribute('aria-current', 'false')
    navBtn.setAttribute('aria-label', s.title)
    if (s.icon) navBtn.appendChild(s.icon.cloneNode(true))
    navBtn.appendChild(document.createTextNode(s.title))
    nav.appendChild(navBtn)

    applyConfig(panel, col, s.cfg)

    return { slug, title: s.title, panel, col, nav: navBtn, icon: s.icon }
  })

  wrap.appendChild(cols)
  wrap.appendChild(panels)
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

  function open (slug, push) {
    entries.forEach((e) => {
      const on = e.slug === slug
      e.panel.classList.toggle('is-open', on)
      // hidden="until-found" keeps closed panels out of layout, tab order
      // and the a11y tree while STILL matching Ctrl+F, which then fires
      // beforematch and opens that column. Unsupported browsers treat it
      // as plain hidden, i.e. today's behaviour.
      if (on) e.panel.removeAttribute('hidden')
      else e.panel.setAttribute('hidden', 'until-found')
      e.col.setAttribute('aria-expanded', on ? 'true' : 'false')
      e.nav.setAttribute('aria-current', on ? 'true' : 'false')
      if (on) {
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
    e.col.addEventListener('click', () => open(e.slug, true))
    e.nav.addEventListener('click', () => {
      open(e.slug, true)
      wrap.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    // Find-in-page landed inside a closed column: open it for real.
    e.panel.addEventListener('beforematch', () => open(e.slug, true))
  })

  window.addEventListener('hashchange', () => {
    const s = location.hash.replace('#', '')
    if (entries.some((x) => x.slug === s)) open(s, false)
  })

  const initial = location.hash.replace('#', '')
  open(entries.some((x) => x.slug === initial) ? initial : entries[0].slug, false)

  console.log(`${TAG} mounted ${entries.length} columns ` + JSON.stringify({
    withConfig: entries.filter((e) => e.panel.hasAttribute('data-m4-styled')).length,
    withIcon: entries.filter((e) => !!e.icon).length,
    scenes: entries.filter((e) => e.panel.hasAttribute('data-m4-scene'))
      .map((e) => e.panel.getAttribute('data-m4-scene')),
    memberFormsInPanels: document.querySelectorAll('.ix-panel form[data-members-form]').length,
    memberFormsStillQueryable: document.querySelectorAll('form[data-members-form]').length
  }))

  return entries
}
