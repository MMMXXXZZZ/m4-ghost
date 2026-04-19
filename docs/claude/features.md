# Feature Reference

## Haptic Feedback (Tactus)

**Files:**
- `src/js/lib/haptic.js` — core engine ported from [Tactus](https://github.com/aadeexyz/tactus) TypeScript source
- `src/js/app/haptic-feedback.js` — configurable listener, the only file to edit day-to-day

**How it works:**
- iOS 12+: uses a hidden `<input type="checkbox">` to trigger the native UIFeedbackGenerator tick
- Android: uses the Vibration API
- Desktop/unsupported: silent no-op

**Four targeting modes:**

```js
initHapticFeedback({
  // Mode 1: CSS class names
  classes: ['button', 'btn', 'kg-btn'],

  // Mode 2: Link href patterns (strings or RegExp)
  linkPatterns: ['/shop/', 'mailto:', /\.pdf$/i],

  // Mode 3: Arbitrary CSS selectors with per-selector haptic type
  targets: [
    { selector: '.load-more-btn',         haptic: 'medium'    },
    { selector: '[data-members-signout]', haptic: 'warning'   },
  ],

  // Mode 4: Exclude selectors
  exclude: ['.no-haptic', '#search-input'],
})
```

**Inline override:** Add `data-haptic="medium"` to any HTML element. Overrides JS config.

**Haptic presets:** `light`, `medium`, `heavy`, `selection`, `success`, `warning`, `error`

---

## Speculation Rules (Prefetch on Hover)

**File:** `src/js/lib/speculation-rules.js`

**Behavior:**
- Injects `<script type="speculationrules">` into `<head>` on page load
- Prefetches same-origin links after ~200ms hover (eagerness: moderate)
- Chromium-only; no-ops silently on Firefox/Safari
- Strategy: `prefetch` (not prerender)

**Excluded URLs:**
- `/ghost/`, `/api/`, `/members/`, `/content/`, `/assets/`
- `#signout`, `#logout`, `?signout`, `?logout` 
- `[data-portal]` links
- `[data-ghost-search]` links

**Upgrade to prerender:**
1. Change `"prefetch"` to `"prerender"` in the speculation rules JSON
2. Update `analytics.js` to use the prerendering guard pattern documented in its comments
3. Verify Worker handles `Sec-Purpose: prerender` correctly

---

## Instagram "Add to Story"

**Files:**
- `src/js/components/ig-share-story.js`
- `src/sass/components/_ig-share-story.scss`

**Template usage:** In your post Handlebars templates, add:
```hbs
<div class="ig-share-root" data-image="{{feature_image}}"></div>
```

**Language detection:** Checks `navigator.language` for ES/EN, falls back to ES.

**Icon configuration:** Set `ICON_URL` constant at top of `ig-share-story.js` to your Instagram camera icon URL.

**Styling:** Uses `--ig-share-icon-url` CSS custom property (set at runtime by JS). SASS uses `$font-sans` variable from your existing variables file.

---

## Analytics (Matomo)

**File:** `src/js/lib/analytics.js`

**`AnalyticsManager` class:**
- `observeArticle(element, title)` — attaches IntersectionObserver to track when 50%+ of an article is visible for 10+ seconds, then fires a Matomo "Read" event
- Used by infinite scroll (`post-infinite.js`) to track each loaded article
- Safe from prerendering (IntersectionObserver doesn't fire in background/prerendered state)

**Virtual pageview tracking:** Called by infinite scroll on article change to update `window.location` and fire `_paq.push(['setCustomUrl', ...])`.

---

## MeiliSearch

**CDN bundle:** `@fanyangmeng/ghost-meilisearch-search-ui@1.2.3`
Loaded via `<script defer>` in `default.hbs` `<head>`.

**Theme integration:** `src/js/lib/meilisearch.js`
- Detects the search container after the library initialises (polls across animation frames)
- Applies custom open animation via forced reflow (`void el.offsetWidth`)
- Haptic: custom two-pulse array on search open (configurable)

**Config:** `window.__MS_SEARCH_CONFIG__` set in Ghost Admin code injection.

---

## Scroll Hide Header

**File:** `src/js/components/scroll-hide-header.js`

**Usage in main.js:** `scrollHideHeader('.js-hide-header')`

Applied to the header element. Hides on scroll down, shows on scroll up. Was broken after infinite scroll was added (scroll events conflicting). Fixed by ensuring mobile menu listeners and scroll listeners are null-guarded and initialized independently.

---

## Dark Mode

**File:** `src/js/app/dark-mode.js`

**Usage:** `darkMode('.js-dark-mode')` (called from `main.js`)

**State:** Stored in `localStorage.theme` = `'dark'` or `'light'`

**FOUC prevention:** Inline script at top of `<head>` in `default.hbs` applies `dark` class to `<html>` before any rendering. Same logic duplicated in Worker's SPLASH constant for cache-miss pages.

---

## Promo Popup

**File:** `src/js/components/promo-popup.js`

**Usage:** `promoPopup('#js-promo-popup', 2000)` — shows after 2000ms delay.

**Template:** `<div id="js-promo-popup" class="promo-popup"></div>` in `default.hbs`.
