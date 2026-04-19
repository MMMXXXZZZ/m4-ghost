# m4-ghost Theme — Claude Code Context

This file captures the full project context for the **m4-ghost** Ghost theme and its Cloudflare infrastructure. It exists so Claude Code can pick up exactly where the claude.ai project left off.

## Project Overview

**Site:** https://m44.cl — a Spanish-language political/media publication (with `/en/` English section)  
**Platform:** Ghost CMS (self-hosted, Envoy reverse proxy on origin)  
**Theme:** `m4-ghost` — a fork of [Mapache by GodoFredoNinja](https://godofredo.ninja), heavily customised  
**Infrastructure:** Cloudflare (DNS + CDN + Cache Rules + Workers) → Ghost origin  
**Analytics:** Matomo (self-hosted)  
**Search:** MeiliSearch via `@fanyangmeng/ghost-meilisearch-search-ui@1.2.3`

---

## Repository Structure

```
m4-ghost/
├── src/
│   ├── js/
│   │   ├── main.js                          # Entry: all non-post pages
│   │   ├── post.js                          # Entry: post/page templates (imports main.js)
│   │   ├── post-infinite.js                 # Infinite scroll
│   │   ├── app/
│   │   │   ├── dark-mode.js
│   │   │   ├── haptic-feedback.js           # Configurable haptic listener (4 targeting modes)
│   │   │   ├── header-transparency.js
│   │   │   ├── social-media.js
│   │   │   └── meilisearch.js               # (may be in lib/ — see note)
│   │   ├── lib/
│   │   │   ├── haptic.js                    # Tactus core engine (ported from TS, zero deps)
│   │   │   ├── meilisearch.js               # MeiliSearch integration
│   │   │   ├── speculation-rules.js         # Hover prefetch via Speculation Rules API
│   │   │   └── analytics.js                 # Matomo + scroll read-tracking
│   │   ├── components/
│   │   │   ├── ig-share-story.js            # Instagram "Add to Story" share button
│   │   │   ├── scroll-hide-header.js
│   │   │   ├── promo-popup.js
│   │   │   ├── load-script.js
│   │   │   ├── video-responsive.js
│   │   │   ├── resize-images-galleries.js
│   │   │   ├── gallery.js
│   │   │   └── highlight-prismjs.js
│   │   └── post/
│   │       └── is-singgle-post.js           # (typo in filename is intentional/upstream)
│   └── sass/
│       ├── main.sass                        # Imports all partials
│       └── components/
│           ├── _ig-share-story.scss         # Instagram share button styles
│           └── ... (other component partials)
├── assets/
│   └── scripts/                             # ⚠️ BUILD OUTPUT — do not edit directly
│       ├── main.js
│       ├── post.js
│       ├── pagination.js
│       └── prismjs.js
├── partials/
│   └── layout/
│       ├── default.hbs                      # Root layout template
│       ├── header.hbs
│       ├── footer.hbs
│       └── mobile-menu.hbs                  # Must stay OUTSIDE .site-wrapper
├── package.json
└── m4-splash.mjs                            # Cloudflare Worker (separate deploy)
```

**Build workflow:**
```bash
npm run dev     # watch mode (development)
npm run build   # production bundle
```
Source → `src/js/` → compiled → `assets/scripts/`

---

## JS Architecture

### Entry Points

**`main.js`** — loaded on all non-post pages. Runs `M4Setup()` on `DOMContentLoaded`:
- `socialMedia()` — social follow buttons
- `darkMode('.js-dark-mode')` — dark/light toggle
- `headerTransparency()` — transparent header on cover images
- Mobile menu open/close (`.js-menu` / `.js-menu-close`) — with null-guards for `.js-search`
- `scrollHideHeader('.js-hide-header')`
- `promoPopup('#js-promo-popup', 2000)`
- `postInfinite()` — only if `.js-infinite-container` exists on page
- `initHapticFeedback({ targets: [], exclude: [] })` — haptic feedback
- `initMeiliSearch()` — search
- `initSpeculationRules()` — hover prefetch

**`post.js`** — loaded on post/page templates. Imports `main.js` first, then runs `M4PostSetup()`:
- `videoResponsive()`
- `resizeImagesInGalleries()`
- `highlightPrism('code[class*=language-]')`
- `isSinglePost()`
- `M4Gallery()`
- `initInfiniteScroll()`
- `initIgShareStory()`

> Note: `initHapticFeedback()` is NOT called in `post.js` — it uses a delegated listener on `document` set up by `main.js`, so it automatically covers dynamically added content from infinite scroll.

### Key Implementation Details

**Mobile menu** must be rendered outside `.site-wrapper` in `default.hbs`:
```hbs
{{!-- CORRECT: outside site-wrapper --}}
</div> {{!-- end .site-wrapper --}}
{{> "layout/mobile-menu"}}
```
Moving it inside `.site-wrapper` (a flex column) creates phantom layout space.

**MeiliSearch** — the CDN bundle is loaded via `<script defer>` in `default.hbs` `<head>`. The `initMeiliSearch()` in `main.js` polls for the container after the library initialises, then applies a custom open animation via forced reflow (`void el.offsetWidth`).

**Infinite scroll** — conditionally initialised only when `.js-infinite-container` is present on the page (checked in `main.js`). The delegated event listener pattern means haptic feedback and other document-level listeners work on dynamically loaded articles without re-init.

---

## default.hbs Head — Critical Inline Scripts

These must appear at the very top of `<head>`, before any stylesheets:

```html
<!-- 1. Splash screen skip gate (sessionStorage) -->
<script>if(sessionStorage.getItem('m4_vis'))document.documentElement.classList.add('m4-skip');</script>

<!-- 2. Dark mode (no FOUC) -->
<script>
if(localStorage.theme==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
  document.documentElement.classList.add('dark');
}
</script>

<!-- 3. View Transitions (Chrome 111+, Safari 18+) -->
<meta name="view-transition" content="same-origin">
<style>@view-transition { navigation: auto; }</style>
```

---

## Cloudflare Worker: `m4-splash`

**File:** `m4-splash.mjs`  
**Route:** `m44.cl/*` (free tier Workers)  
**Purpose:** On cache miss, stream the orange splash screen as a prefix before the origin HTML, so users see branded loading UX instead of blank white.

### How it works

1. Request arrives at Worker
2. Non-HTML requests (by file extension) exit immediately → `fetch(request)` passthrough
3. Admin/API/member routes exit → passthrough
4. Ghost admin session cookie present → passthrough (editors bypass splash)
5. Cache miss path: prepend `SPLASH` HTML constant, stream origin body behind it
6. Cache hit (via Cloudflare edge): Worker steps aside, origin serves directly

### SPLASH HTML constants

The Worker injects these at the top of the streamed response:
- `<script>if(sessionStorage.getItem('m4_vis'))document.documentElement.classList.add('m4-skip');</script>` — skip for in-session navigations
- Dark mode class application (same logic as `default.hbs`)
- `#m4-loader` div: orange (#F73E05) full-screen overlay with SVG logo
- "¿Primera vez?" text appears after 3s delay (English version for `/en/` paths)
- Auto-dismisses on `window.load` or after 8s max
- Slide-up CSS animation on dismiss
- Sets `sessionStorage.setItem('m4_vis', '1')` on dismiss

### sessionStorage vs localStorage

- Key: `m4_vis` — stored in **`sessionStorage`** (not localStorage)
- This means: splash shows on first page of a fresh tab, suppressed for all subsequent navigations in the same tab session
- New tab = fresh sessionStorage = splash may show again on cache miss

### Worker limits (free tier)

- 100,000 requests/day (resets daily)
- **All** requests matching `m44.cl/*` count, including sub-resources (JS, CSS, images)
- File extension early-exit added but invocation still counts toward quota
- **Fail open configured** — hitting quota causes Worker error which falls through to origin. Site loads normally without splash. Safe.

### What was removed from default.hbs

The `#m4-loader` div that was previously in `default.hbs` was **removed**. The Worker is now the sole injector of the splash on cold misses. The `sessionStorage` gate in `<head>` handles return-visit suppression. Without this the user would see two loaders on cache miss.

---

## Cloudflare Cache Setup

Ghost sends `Cache-Control: public, max-age=0` which causes every request to be `CF-Cache-Status: MISS`.

**Required Cache Rule** (Rules → Cache Rules):

- Match: hostname = `m44.cl`, URI does NOT contain `/ghost/`, URI does NOT contain `/api/`
- Actions:
  - Cache Status: **Eligible for cache**
  - Edge Cache TTL: **Override origin → 5 minutes** (Ghost purges via GitHub Action webhook on deploy)
  - Browser Cache TTL: Bypass
  - Remove `Set-Cookie` response header (critical — Ghost session cookies prevent caching)

After applying, verify with:
```bash
curl -sI https://m44.cl/ | grep -i "cf-cache\|age\|cache-control"
# Should show: CF-Cache-Status: HIT
```

---

## Features Implemented (Session History)

### 1. Splash Screen / Loading Screen ✅
- Orange (#F73E05) full-screen overlay
- SVG logo placeholder (can be replaced with actual SVG)
- "¿Primera vez?" / "First time?" hint text after 3s delay
- Slides up on dismiss
- Cloudflare Worker streams it before origin HTML on cache miss
- `sessionStorage` gate prevents showing on in-session navigation

### 2. Haptic Feedback (Tactus) ✅
- Files: `src/js/lib/haptic.js`, `src/js/app/haptic-feedback.js`
- iOS: native switch checkbox tick (UIFeedbackGenerator equivalent)
- Android: Vibration API
- Desktop: no-op
- `data-haptic="medium|light|warning|selection|success"` attribute override on any element
- Delegated listener on `document` — works on dynamically loaded content

**Current config in `main.js` (all targets commented out — configure per your needs):**
```js
initHapticFeedback({
  targets: [
    // { selector: '.load-more-btn',         haptic: 'medium'    },
    // { selector: '[data-portal]',          haptic: 'light'     },
    // { selector: '[data-members-signout]', haptic: 'warning'   },
    // { selector: '.js-dark-mode',          haptic: 'selection' },
    // { selector: 'form [type="submit"]',   haptic: 'medium'    },
  ],
  exclude: [],
})
```

### 3. Speculation Rules (Hover Prefetch) ✅
- File: `src/js/lib/speculation-rules.js`
- Strategy: `prefetch` (not prerender — avoids Matomo double-count and Worker splash side-effects)
- Eagerness: `moderate` (~200ms hover dwell before firing)
- Excluded paths: `/ghost/`, `/api/`, `/members/`, sign-out anchors, data portal links, search URLs
- Chromium-only; silent no-op on Firefox/Safari

**⚠️ Known issue:** On first-visit users (no `m4_vis` in sessionStorage), prefetch requests to pages that are cache misses will trigger the Worker and the splash may fire in the background. The `Sec-Purpose: prefetch` header workaround requires a Cloudflare Configuration Rule (paid plan feature). Current status: accepted limitation.

### 4. Instagram "Add to Story" Share Button ✅
- Files: `src/js/components/ig-share-story.js`, `src/sass/components/_ig-share-story.scss`
- Moved from Ghost code injection (header-injected external script) into theme bundle
- Uses Web Share API to share the post's feature image
- Rendered via `<div class="ig-share-root" data-image="{{feature_image}}"></div>` in post template
- Mobile-only UX; desktop shows "mobile only" notice
- Initialized by `initIgShareStory()` in `post.js`
- **Remove from Ghost Admin → Code Injection → Site Header:** the old `<link rel="preload">` and `<script>` lines for `agregarahistoria.js`

### 5. Mobile Menu Fix ✅
- Root cause: `mobile-menu-wrapper` was inside `.site-wrapper` (a `flex column min-h-screen` container), creating phantom layout height
- Fix: moved `{{> "layout/mobile-menu"}}` outside `.site-wrapper` div in `default.hbs`
- Menu children are `position: fixed` so DOM position doesn't affect visual rendering

### 6. View Transitions ✅ (partial)
- Added `<meta name="view-transition" content="same-origin">` and `@view-transition { navigation: auto; }` to `default.hbs` `<head>`
- Works: Chrome 111+, Safari 18+
- Does not work: Firefox (View Transitions navigation not yet shipped in FF as of April 2026)

---

## Known Open Issues / Next Steps

### 🔴 White flash on navigation (Firefox)
Firefox doesn't support View Transitions navigation. The browser blanks the screen between pages (~30ms).

**Suggested interim fix (not yet applied):**
```html
<!-- In default.hbs <head>, inline style to make flash dark instead of white -->
<style>body { background: #110f16; }</style>
```
(Use your dark mode background color — removes the jarring white flash even if the page flickers)

**Proper fix:** Integrate [Swup.js](https://swup.js.org/) for MPA transitions. Significant effort — must re-run `M4Setup`, `lazySizes`, InfiniteScroll, MeiliSearch on each navigation. `post.js` vs `main.js` split needs careful handling (Swup doesn't reload `<head>` scripts).

### 🟡 Haptic feedback targets not configured
`initHapticFeedback()` is called with an empty `targets: []` array. Uncomment or add selectors for your interactive elements.

### 🟡 Speculation Rules + Worker splash conflict
Prefetch requests from first-time visitors (no `m4_vis`) on cache-miss URLs trigger the splash in the background. Requires Cloudflare Configuration Rules (paid) to add "Bypass Workers for `Sec-Purpose: prefetch`" header match.

### 🟡 Worker invocation quota
Every sub-resource request (JS, CSS, images) counts toward the 100k/day free tier limit due to the `m44.cl/*` route. Extension-based early-exit is in place but doesn't prevent the invocation from being counted. Monitor usage; $5/month Workers Paid gives 10M requests/month.

---

## GitHub Action / Deploy Flow

1. Theme changes pushed to repo
2. GitHub Action: builds theme, deploys to Ghost origin
3. Action restarts origin server
4. Action purges Cloudflare cache (webhook or API call)
5. First visitor after purge gets Worker splash (cache miss path)
6. Worker caches origin response → subsequent visitors get cache HIT, Worker steps aside

---

## Ghost Admin — Code Injection

Items that should/should not be in Site Header:

**Should remain:**
- MeiliSearch CDN script: `<script defer src="https://cdn.jsdelivr.net/npm/@fanyangmeng/ghost-meilisearch-search-ui@1.2.3/dist/search.min.js">`
- Any MeiliSearch config variables (`window.__MS_SEARCH_CONFIG__`)
- Custom CSS for MeiliSearch UI (hosted separately)

**Should be removed (moved to theme bundle):**
- `<link rel="preload" href=".../agregarahistoria.js" as="script">`
- `<script src=".../agregarahistoria.js" defer></script>`
- Any duplicate analytics setup that's now in `analytics.js`

---

## Locale / Language

- Primary: Spanish (`lang="es"`)
- English section: `/en/*` paths
- Splash screen text: `¿Primera vez?` (ES) / `First time?` (EN) — detected by URL slug in Worker

---

## Useful Diagnostic Commands

```bash
# Check Cloudflare cache status
curl -sI https://m44.cl/ | grep -i "cf-cache\|age\|cache-control\|set-cookie\|server"

# Confirm Worker is intercepting (should NOT see "server: envoy")
curl -sI https://m44.cl/ | grep -i "server\|x-m4-worker"

# Check if Set-Cookie is blocking cache
curl -sI https://m44.cl/ | grep -i "set-cookie"
# If present → add "Remove Set-Cookie" to Cache Rule
```
