# Guide Interactive (ix)

**Read this file in full before touching the guide component.** It is
short on purpose and the parts that look like trivia are the parts that
have cost the most time.

Updated 2026-10-21.

## Done

**Entry mechanism.** `custom-guide-interactive.hbs`, selected from the
editor's Template dropdown. Beats tag-gating because it replaces the
body template, so the sidebar, share rail, comments and the
infinite-scroll container are gone server-side rather than torn down by
JS. The tag path was removed.

**Light DOM, not shadow.** Ghost Portal binds member forms with a
one-time `document.querySelectorAll` from a React lifecycle hook that
runs after its async init. A signup card behind a shadow boundary is
never found, so the 2026 waitlist card would have been silently dead.
Verified in production: forms move into panels and stay queryable.

**Desktop accordion.** Full bleed capped at 3440px, 3rem rails, GSAP
tweening `--g` which drives `flex-grow` (14.3ms worst frame against
Flip's 20.7ms). Entry state is every column collapsed and equal; opening
one narrows the rest. Closed bodies use `hidden="until-found"` so Ctrl+F
still matches inside them.

**Hero.** 100svh, title and subtitle over a three.js ember field on one
shared renderer (`window.M4GL`), with the feature image as a dimmed
backdrop. `article-media` is not rendered; the image stays on the post
so OpenGraph cards still carry it.

**Per-column config.** One Ghost HTML card after each H1, holding JSON
plus an optional raw `<svg>`. Ghost renders HTML cards as raw nodes with
no wrapper, so the card is literally the heading's next sibling.
Identified by `data-m4-col` alone — the editor does not reliably keep
`type="application/json"`. Contrast is solved per colour mode and
written as `--m4-on-*-light` / `--m4-on-*-dark` pairs. Icon viewBoxes
are refitted from `getBBox`.

**Scrolling.** Two magnetic anchors and free scrolling past the app:
down from the top lands on the app, up from the app returns to the top
of the document, down from the app releases. Driven by GSAP Observer
with `expo.out`, not CSS snap — CSS snap always lets the page drift
first, which is why PBS feels instant only because every region there is
a panel.

**Phone.** Three drawers to a page, now a carousel in three dimensions:
the neighbouring sets sit at both edges turned away from the reader,
53 degrees at a full page of offset, dimmed, perspective and peek held
proportional (222vw / 14vw) so a 390px phone reads like the 630px
stage the values were tuned on. One number drives it -- `pos`, the
position in pages -- and each row answers it on its own response time,
so a page fans as it comes round rather than pivoting as one board.

GSAP owns the gesture here. The platform could not express it: scroll
snapping rounds every intermediate position to a snap point, and a
scroller offers one offset where this needs eight separately lagged
ones. So Observer with lockAxis does the paging, with a velocity bias
so a short flick still turns the page, rubber banding at the ends, and
a focusin handler because tabbing no longer brings a face round by
itself.

The gyro moves the vanishing point rather than anything on the stage,
so tilting reads as peering around a solid object; M4Tilt's pointer
fallback makes the same code mouse parallax on a desktop.

Opening a drawer unwraps every column into one document; the rail of
faces hangs inside the site header and rides its scroll-hide. Rail and
document follow each other on a deliberate lag.

**Motion lab** at `?lab=1`: transition presets, dimension sliders, and a
per-column palette editor with a hue lock that keeps six values on one
hue. Generates the exact block to paste back into the post.

**Infrastructure.** Sitemaps were 404ing behind a stray shortlink
Worker. `/p/` preview URLs now bypass the CDN cache. Deploys are
serialised after three concurrent runs took the site down with a 502.

## The motion lab

`?lab=1` on the guide URL opens a build-time panel. It never reaches
readers and nothing in it ships.

- **transition** — eight switching presets, or cycle on each switch.
  `?anim=<name>` pins one.
- **dimensions** — app padding, rail width, text measure, media width.
  Written as inline styles, so padding and rail are skipped below 64rem
  or a desktop figure follows the app onto a phone.
- **columns** — one row per column, expanding for whichever is open.
  Colour pickers for all six palette keys, font, scene, and a hue lock
  (on by default) that rotates the other five onto the edited colour's
  hue while each keeps its own saturation and lightness. Generates the
  exact block to paste back into the post.

Choices persist in `localStorage` and are applied at mount even with the
lab closed.

## To do

### 1. Layers: foreground, midground, background — next
The direction for everything after the carousel. First the UI itself
reads as layers at different depths, then the explanatory animations
inside a column's body do (solid particles of CS gas, and so on).
Passive to begin with and probably constrained per layer; the reader's
own motion comes in later, either as pure flare or as the thing that
advances an animation. The carousel is the first instance of this and
`M4Tilt` already publishes both signals it needs.

### 2. GSAP distance-driven transforms
The slivers exist but are static rectangles; no GSAP is involved yet.
What is needed is a continuous per-drawer value — distance from the
viewport centre — driving `scale`/`opacity`/stagger in 2D, then
`rotationY` with `transformPerspective` for the 3D pass. The existing
on-page/sliver test is the boolean version of that value.

### 3. Sticky shrinking face on desktop
Drop `.ix-marker`. The current column's `.ix-face` shrinks and sticks to
the top of the reading area as a header, pushed down by the site header
when it reappears, handing over to the neighbouring face as the reader
nears either end. The phone already has its rail equivalent.

### 4. Animate on finger-leave
Panel animation fires when a drag crosses the threshold; it should wait
for `touchend`. Instrument when it actually fires — the gyro permission
prompt is gated on scroll position and is unreliable.

### 5. Pointer and gyro gradients
Gradient outlines and button fills following the pointer on desktop and
tilt on mobile. Read `window.M4Tilt`, which already publishes a
smoothed, orientation-compensated signal with a pointer fallback.

### 6. Prose stagger tied to scroll
Currently a one-shot stagger over the first eight blocks when a column
opens. It should run as blocks enter view while reading.

### 7. Per-column WebGL scenes
`"scene": "particles-cs"` is parsed and stamped as `data-m4-scene`, and
`window.M4GL` exposes the renderer, but nothing reads it. The shader
ripple from the research — one progress number driving uniforms — is the
intended first use. Also: the ember additive blend is worth pushing
toward the chromatic-aberration family deliberately.

### 8. Keyboard model
Arrow keys do not move between columns. The ARIA tabs pattern fits.
`.ix-nav` buttons also lack `aria-controls`.

### 9. Smaller
- Rail overflow on desktop if a future edition runs to a dozen columns.
- Matomo: `trackEvent('Guide','OpenColumn',…)` has never been confirmed
  landing.
- Only two of eight columns carry a config block; the rest fall back to
  theme defaults, so "each column a different aesthetic" is not visible
  yet. Content, not code.
- `/signin/`, `/signup/`, `/signout/` 404 — theme links to routes Ghost
  serves through Portal. Pre-existing, unrelated to the guide.

---

## Traps this component keeps producing

- **Media queries add no specificity.** A block must come after every
  rule it overrides. The phone block is last in `_guide.scss` for this
  reason, and the desktop block last before it.
- **Inline styles written by JS beat every stylesheet rule.** Anything
  varying by colour mode or viewport must be a pair the stylesheet
  chooses between, never set directly.
- **Observer reports wheel and touch with opposite senses.** Direction
  goes through `gestureDir()`.
- **`assets/` is reverted before every commit**, so the local compiled
  CSS is always stale. Check the deployed stylesheet over HTTP.
- **State set once goes stale.** Derive at use time, or attach a
  threshold that refreshes it.
- **Safari flattens a 3D subtree whose root also clips.** perspective
  plus preserve-3d plus overflow on one element gives a horizontal
  stretch instead of a turn, on iOS only. Keep the clipper and the 3D
  container separate.
- **`getComputedStyle` lies about states you just set.** It returned
  the un-hovered colour under a synthetic hover, and a colour 1% into
  a 400ms fade one frame after a class change. Wait out the transition
  or look at pixels.
- **Scroll snapping eats a tween.** It rounds every write to
  scrollLeft, so an animated scroll arrives as four or five jumps.
  GSAP's ScrollToPlugin already disables snap while it runs; a raw
  scrollLeft tween does not.
- **A swipe is never level.** Any handler taking deltaY off a gesture
  that is mostly sideways will fire on a carousel swipe.
