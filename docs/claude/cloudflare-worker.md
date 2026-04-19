# Cloudflare Worker: m4-splash

## Purpose

The `m4-splash` Worker intercepts HTML page requests on cache miss and streams an orange branded splash screen before the origin HTML. This prevents users from seeing raw unstyled HTML while the page loads.

## Deployment

- **Worker name:** `m4-splash`
- **Route:** `m44.cl/*` (Cloudflare Workers Routes)
- **Plan:** Free tier (100k requests/day)
- **Fail open:** Yes — hitting quota causes the Worker to error; with "fail open" set, traffic falls through directly to origin.

## Logic Flow

```
Request arrives
    │
    ▼
Is Accept header non-HTML? (or known static extension?)
    │ Yes → fetch(request) passthrough
    │ No  ↓
Is path /ghost/ or /api/ or /members/ or /content/ or /assets/?
    │ Yes → fetch(request) passthrough
    │ No  ↓
Does Cookie contain ghost-admin-api-session or ghost-members-ssr?
    │ Yes → fetch(request) passthrough (editors/logged-in users)
    │ No  ↓
Check Cloudflare edge cache for this URL
    │ HIT → return cached response (no splash needed, fast)
    │ MISS ↓
Fetch origin (background)
    │
    ▼
Stream SPLASH HTML prefix → then stream origin body
Set Cache-Control: public, max-age=300 on response
```

## SPLASH HTML

The splash is a string constant in the Worker file containing:

1. `<!DOCTYPE html><html lang="es">` opening
2. Minimal `<head>` with:
   - sessionStorage skip gate: `if(sessionStorage.getItem('m4_vis')) classList.add('m4-skip')`
   - Dark mode class: applies `dark` class if `localStorage.theme === 'dark'` or prefers-color-scheme matches
3. Inline CSS for `#m4-loader` (orange full-screen overlay, SVG logo, hint text, slide-up animation)
4. Inline JS for dismiss logic (fires on `window.load` or 8s timeout)
5. `¿Primera vez?` / `First time?` text (language detected by URL path containing `/en/`)

## sessionStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `m4_vis` | `'1'` | Set on first splash dismiss. Presence causes `m4-skip` class on `<html>`, hiding `#m4-loader` instantly. Scoped to session (tab). |

## Dark Mode in Splash

The Worker splash must apply the dark class immediately to prevent FOUC. The SPLASH constant includes:

```html
<script>
if(localStorage.theme==='dark'||(!('theme'in localStorage)&&window.matchMedia('(prefers-color-scheme:dark)').matches)){
  document.documentElement.classList.add('dark');
}
</script>
```

This must be kept in sync with the equivalent script in `default.hbs`.

## default.hbs Coordination

Because the Worker prepends splash HTML, the browser receives:
```
[Worker SPLASH HTML]
[Origin HTML: <!DOCTYPE html><html>...]
```

To prevent issues:
- `#m4-loader` div was **removed** from `default.hbs` (Worker is sole injector)
- The `sessionStorage` gate in `default.hbs` `<head>` prevents flash on return navigation

## Quota Management

All requests matching `m44.cl/*` count toward the 100k/day limit, even passthrough ones. Mitigations applied:
- File extension early exit (`.js`, `.css`, `.png`, `.jpg`, etc.) → `fetch(request)` immediately
- Admin/member/asset paths excluded from route

**If over quota:** Worker returns error → fail open → origin serves request directly without splash. Acceptable degradation.

## Known Issues

**Speculation Rules prefetch conflict:** When a browser prefetches a link (via `speculation-rules.js`) and that URL is a cache miss, the Worker fires the splash in the background. The `Sec-Purpose: prefetch` header is present but the Worker currently ignores it. Fix requires Cloudflare Configuration Rules (paid plan) to bypass Workers for prefetch requests. Current status: accepted limitation.

## Updating the Splash Design

The entire splash UI is in the `SPLASH` constant at the top of `m4-splash.mjs`. To change colors, logo, text, or animation — edit that constant and redeploy the Worker via Cloudflare dashboard.

Orange accent color: `#F73E05`
