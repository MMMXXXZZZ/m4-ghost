# Guide Interactive — open backlog

Captured 2026-10-20. Nothing here is built yet; everything below is
agreed scope waiting on work.

## 1. Mobile: pressing a drawer — NEEDS CLARIFICATION

"We're missing unwrapping all columns on mobile if one drawer is pressed."

Two readings, and they lead to different builds:

- **(a)** Pressing a drawer should expand *every* column into one long
  scrollable document, with the pressed one scrolled into view — i.e. the
  phone abandons the one-column-at-a-time model entirely.
- **(b)** Pressing a drawer opens that column (as now) but the others
  should remain reachable as collapsed strips rather than vanishing.

Current behaviour is neither: the open drawer takes the screen and the
others are `display: none`, with the footer rail as the only way back.

## 2. Replace `.ix-marker` with a sticky, shrinking face

Drop the fixed marker on both desktop and phone. Instead the *current*
column's `.ix-face` sticks to the top of the reading area in a shrunken
form, acting as a header. It must:

- be pushed down by the site header when that reappears on scroll-up
- hand over to the previous/next column's face as the reader nears
  either end of the body

## 3. Mobile drag: animate on finger-leave, not drag-start

Panel animation currently fires the moment a drag crosses the threshold.
It should wait for `touchend`. Instrument when it actually fires, because
the gyro-permission prompt is gated on scroll position and is currently
unreliable. Observer may be the wrong tool for this; a direct
touchstart/touchend pair may be better.

## 4. Pagination dots in drawers mode

A rail of dots while the drawers are closed, showing which page you are
on: `x + + +`, the current one brighter. Soft fade in and out.

## 5. GSAP: neighbouring pages visible at the edges

While idle on a page, the next/previous drawers should show as very
narrow slivers at the viewport edge — no text, just the rectangle — so
it is obvious there are more pages. Build in 2D first, then convert to
perspective 3D.

Groundwork already in place: the drawer paging is CSS grid with native
`scroll-snap-type: x mandatory`, so no JS owns the page transition yet.
Two routes, same trade-off we settled for the panels:

- Observer-driven paging replaces native snap: full choreography
  (stagger the three drawers, `rotationY` + `transformPerspective`),
  loses native touch inertia.
- `ScrollTrigger` with `scroller: .ix-stack, horizontal: true` keeps the
  native snap and scrubs the 3D against real scroll position.

## 6. Gradient outline fills responding to pointer

Outline gradients, and button backgrounds, that follow mouse position on
desktop and gyro on mobile. `window.M4Tilt` already publishes a smoothed,
orientation-compensated signal with a pointer fallback — this should read
from it rather than binding its own listeners.

## 7. Embers: acceleration, not orientation, on mobile

`embers.js` currently reads `M4Tilt.x`, which is orientation. On a phone
it should respond to *acceleration* direction instead, which means
`devicemotion` (`accelerationIncludingGravity`) rather than
`deviceorientation`. `tilt.js` owns the permission handshake for both, so
the signal belongs there.

---

## Standing traps in this component

Three bugs this session came from the same root, worth remembering:

- **Media queries add no specificity.** A block must come *after* every
  rule it overrides. The phone block is deliberately last in
  `_guide.scss` for this reason.
- **Inline styles written by JS beat every stylesheet rule.** Anything
  that varies by colour mode or viewport must be written as a pair
  (`--m4-on-bg-light` / `--m4-on-bg-dark`) that CSS chooses between, not
  set directly.
- **Observer reports wheel and touch with opposite senses.** Direction
  goes through `gestureDir()`.
