# Open Issues & Decision Log

## Open Issues

### Issue 1: White flash on navigation (Firefox) 🔴

**Problem:** Firefox does not support View Transitions API for navigation as of April 2026. Every page navigation causes a blank white screen for ~30ms while the browser tears down the old page and begins rendering the new one.

**What's been tried:**
- View Transitions API: `<meta name="view-transition" content="same-origin">` + `@view-transition { navigation: auto; }` in `default.hbs` → works on Chrome 111+, Safari 18+, not Firefox.

**Proposed solutions (not yet implemented):**

**Option A (Quick win):** Make the flash dark instead of white.
```html
<!-- In default.hbs <head>, early inline style -->
<style>body { background: #110f16; }</style>
```
Replace `#110f16` with your actual dark mode background color. Doesn't eliminate the flash but removes the painful white → dark transition.

**Option B (Proper fix):** Integrate [Swup.js](https://swup.js.org/) for MPA-style transitions.
- Intercepts link clicks, fetches pages via `fetch()`, swaps `<body>` content
- No blank screen between navigations
- **Complexity warning:** Must re-trigger on every navigation:
  - `M4Setup()` / `M4PostSetup()`
  - `lazySizes` (re-scan)
  - `InfiniteScroll` (re-init if `.js-infinite-container` present)
  - `initMeiliSearch()`
  - The `post.js` vs `main.js` split is tricky — Swup doesn't reload `<head>` scripts, so you'd need to conditionally call post-specific init from a single entry point
  - Ghost member scripts (`data-portal`, etc.) need careful handling

---

### Issue 2: Haptic targets not configured 🟡

**Status:** `initHapticFeedback()` is called in `main.js` with `targets: []` (empty).

**To do:** Uncomment and configure selectors in `src/js/main.js`:

```js
initHapticFeedback({
  targets: [
    { selector: '.load-more-btn',         haptic: 'medium'    },
    { selector: '[data-portal]',          haptic: 'light'     },
    { selector: '[data-members-signout]', haptic: 'warning'   },
    { selector: '.js-dark-mode',          haptic: 'selection' },
    { selector: 'form [type="submit"]',   haptic: 'medium'    },
  ],
  exclude: [],
})
```

You can also add `data-haptic="medium"` (or `light`, `warning`, `selection`, `success`) as an HTML attribute directly on any element in a `.hbs` template without needing to update JS config.

---

### Issue 3: Speculation Rules + Worker splash conflict 🟡

**Problem:** When `speculation-rules.js` triggers a prefetch and the URL is a cache miss, the Worker serves the splash as the prefetched response. First-time visitors (no `m4_vis` in sessionStorage) may get the splash unexpectedly.

**Preferred fix:** Cloudflare Configuration Rule:
- Condition: `http.request.headers["sec-purpose"] eq "prefetch"`
- Action: Bypass Workers

Requires Cloudflare paid plan (Configuration Rules are not available on free tier).

**Current status:** Accepted limitation. The speculation rules use `prefetch` (not prerender) and `eagerness: "moderate"`, so the impact is minimal — prefetch fires ~200ms before a click, and the prefetched response is only used if the user actually clicks the link.

---

### Issue 4: Worker free tier quota monitoring 🟡

**Status:** The 100k/day limit resets daily. Fail open is configured so hitting it doesn't break the site.

**Monitoring:** Check Cloudflare Workers analytics dashboard for daily invocation counts. If regularly approaching 100k, upgrade to Workers Paid ($5/month, 10M requests/month).

---

## Decision Log

### Why sessionStorage instead of localStorage for `m4_vis`

localStorage persists across sessions, so a returning visitor from days ago would never see the splash again. sessionStorage resets when the tab closes, so:
- Splash shows on fresh tab open (cold visit)
- Suppressed for in-session navigation (no mid-session flash)
- New tab = new session = splash may show again on cache miss

This matches expected UX for a "first page of a session" experience.

### Why `prefetch` and not `prerender` for Speculation Rules

`prerender` executes JavaScript in a background tab before the user navigates. Problems:
1. Matomo would track a pageview before the user actually views the page (double-counting)
2. The Worker splash would fire in the prerendered tab
3. Side-effect routes (`/logout`, `/signout`) could trigger early

`prefetch` only downloads HTML. Zero JS execution. Safe.

Upgrade path: when/if switching to `prerender`, the `analytics.js` file already has the prerendering guard documented in comments.

### Why the mobile menu partial must be outside `.site-wrapper`

`.site-wrapper` is `display: flex; flex-direction: column; min-height: 100vh`. The mobile menu's children are `position: fixed` (full-screen overlay), but the wrapper `div.mobile-menu-wrapper` itself has no explicit height. Inside a flex column, the wrapper still participates in flex layout and creates phantom space at the bottom of the page.

Moving the partial outside `.site-wrapper` makes the wrapper a direct child of `<body>` (no flex context), eliminating the phantom block. The fixed children still visually overlay the viewport correctly.

### Why `#m4-loader` was removed from `default.hbs`

When the Worker serves a cache miss, the browser receives the Worker's SPLASH HTML followed immediately by the full origin HTML. Both documents have `<html>` tags. The browser's HTML parser handles this by effectively "resetting" at the second `<!DOCTYPE>`. If `#m4-loader` existed in both, the user would see two instances, and the dismiss logic would conflict.

The Worker is the authoritative source for the splash on cache misses. The `sessionStorage` gate in `default.hbs` handles all return-visit suppression without needing the actual loader element.

### Why the IG share-to-story moved from code injection to theme

Code injection in Ghost Admin:
- Not version controlled
- Loads as an external script with a separate HTTP request
- Has no SASS integration for styles

Moving to the theme bundle:
- Version controlled with the rest of the theme
- Included in the main JS bundle (zero extra HTTP requests)
- Styles in `_ig-share-story.scss` use existing SASS variables (`$font-sans`, etc.)
- BEM class names prevent collisions

### Why `main.js` is imported by `post.js`

`post.js` needs everything `main.js` sets up (dark mode, mobile menu, haptic feedback, etc.) plus post-specific functionality. Rather than duplicating the setup, `post.js` imports `main.js` and then adds its own `M4PostSetup()`. This means on post pages, both `M4Setup()` and `M4PostSetup()` run on `DOMContentLoaded`.
