/**
 * speculation-rules.js
 *
 * Injects a <script type="speculationrules"> tag to enable browser-native
 * hover-triggered prefetching via the Speculation Rules API.
 *
 * Strategy: prefetch only (not prerender) — safer because:
 *   - Prefetch only downloads HTML; it does NOT execute JavaScript
 *   - No risk of Matomo double-counting pageviews
 *   - No risk of side-effect routes (/logout, /signout) triggering early
 *   - Lower bandwidth cost on mobile
 *
 * Eagerness "moderate": browser prefetches after the pointer has hovered
 * a link for ~200 ms. This filters out accidental mouse-overs and avoids
 * blasting the server with every link on the page.
 *
 * Upgrade path: once you confirm prefetch is working well and your
 * Cloudflare worker passes through prefetch requests cleanly, you can
 * promote the rule to `prerender` for near-instant navigations. Just be
 * sure to add the Matomo prerendering guard (see analytics.js) first.
 *
 * ─── Cloudflare Splash Screen note ──────────────────────────────────────────
 * Prefetch requests carry cookies, so users who already passed the splash
 * (cookie set) are fine. First-time visitors may trigger the worker on
 * prefetch. Confirm your worker passes requests that include the header:
 *   Sec-Purpose: prefetch
 * or add a worker check like:
 *   if (request.headers.get('Sec-Purpose') === 'prefetch') return fetch(request)
 *
 * ─── CSP note ────────────────────────────────────────────────────────────────
 * If you have a Content-Security-Policy header, add:
 *   script-src 'inline-speculation-rules'
 * (This is a dedicated CSP source expression, NOT 'unsafe-inline'.)
 */

export default function initSpeculationRules () {
  // Bail out on unsupported browsers (Firefox, Safari) — progressive enhancement.
  // The site works perfectly for them; Chromium users get the speed boost.
  if (!HTMLScriptElement.supports?.('speculationrules')) return

  // Avoid double-injecting (e.g. if main.js is somehow called twice)
  if (document.querySelector('script[type="speculationrules"]')) return

  const rules = {
    prefetch: [
      {
        source: 'document',
        where: {
          and: [
            // Only same-origin links (cross-origin is the default browser behaviour)
            { href_matches: '/*' },

            // ── Ghost admin & API ──────────────────────────────────────────
            { not: { href_matches: '/ghost/*' } },

            // ── Auth / membership side-effects ────────────────────────────
            { not: { href_matches: '/logout*'  } },
            { not: { href_matches: '/signout*' } },
            { not: { href_matches: '/subscribe*' } },

            // Portal links open a modal, not a navigation
            { not: { selector_matches: '[data-portal]' } },
            { not: { selector_matches: '[data-members-signout]' } },

            // ── Search triggers ───────────────────────────────────────────
            // These open the MeiliSearch modal, not a page
            { not: { selector_matches: '[data-ghost-search]' } },

            // ── Hash / fragment-only links ────────────────────────────────
            // e.g. <a href="#section"> — no navigation happens
            { not: { href_matches: '/#*' } },

            // ── Infinite scroll "next" data nodes ─────────────────────────
            // These are <div data-url="…"> not real <a> tags, so they're
            // already excluded — listed here for clarity
            { not: { selector_matches: '[data-next-post-data]' } },
          ]
        },
        eagerness: 'moderate', // hover ~200 ms before prefetch fires
      }
    ]
  }

  const script = document.createElement('script')
  script.type = 'speculationrules'
  script.textContent = JSON.stringify(rules)
  document.head.appendChild(script)

  if (process.env.NODE_ENV !== 'production') {
    console.debug('[speculation-rules] Injected prefetch rules (moderate eagerness)')
  }
}
