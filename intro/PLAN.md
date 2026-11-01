# Plan: Elevation intro (scrollme)

## Stack decision
- Vanilla Three.js `three@0.160.0`, loaded as an ES module from `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js` after window load and browser idle (round 1). Exact pin, older than two weeks.
- No React Three Fiber, no GSAP, no Lenis. The scroll is native. One normalized value does the work, so none of them is needed.
- Scroll reveals use IntersectionObserver, not GSAP ScrollTrigger.

## Files
- `index.html`: semantic story, five `section.beat` blocks, progress nav, CTA links, CSS fallback markup.
- `intro.css`: layout from `../tokens.css`, chamfered panels, reveals, reduced-motion block, desktop split at 900px.
- `intro.js`: one scroll owner, one hero, one rAF loop, cleanup on `pagehide`.
- `BRIEF.md`, `PLAN.md`, `references/CONTEXT.md`, `QC_REPORT.md`, `UX_LAWS_AUDIT.md`.

## Scroll owner
- Document scroll is the only scroll. No scroll hijack, no custom container.
- `progress = clamp(scrollTop / max(1, scrollHeight - clientHeight), 0, 1)`, read in `requestAnimationFrame`.
- The rAF loop skips the frame when progress is unchanged, when the tab is hidden, or when the stage is off-screen.

## Camera keyframes
| progress | camera position (x, y, z) | object rotation y |
|---|---|---|
| 0.00 | 0.0, 0.6, 6.0 | 0.0 |
| 0.25 | 2.8, 1.0, 4.4 | 0.9 |
| 0.50 | 0.0, 2.1, 4.8 | 1.8 |
| 0.75 | -2.8, 0.8, 4.4 | 2.7 |
| 1.00 | 0.0, 0.4, 6.0 | 3.6 |

Interpolation is smoothstep between neighbouring keyframes. The camera looks at the origin.
Portrait (aspect < 1): camera distance scales by `max(1, 1.3 / aspect)` so the full bar fits at 390px.
Wide (aspect >= 1): object shifted right by 0.9 and scaled 0.8 so the text panel stays clear.

## Render budget
- `renderer.setPixelRatio(min(devicePixelRatio, 1.5))`.
- Resize via ResizeObserver on the stage.
- Procedural geometry only: one bar, six plates, two collars, edge lines for wireframe. Material count 3.

## Reduced motion
- Detected by `prefers-reduced-motion` at load (root class `rm`) and via a `change` listener.
- No rAF loop. One static frame rendered at keyframe 0 and again on resize.
- Reveals are opacity only, 120ms linear.

## WebGL failure and no-JS
- `html.webgl` is added only after a successful first render. Canvas is hidden until then.
- The CSS fallback (`.fallback`) is visible by default. It hides only when `html.webgl` is set.
- With JS off, text panels render at full opacity (reveal classes only apply under `html.js`).
- A failed CDN import or a context loss removes `webgl` and leaves the fallback in place.

## Copy reconciliation
- Section headlines and body text match `copy/COPY.md` intro.s1 to intro.s5 word for word.
- Brief button wording wins over the copy file: "Connect sheet" (copy says "Connect my sheet"). Recorded here and in QC_REPORT.md.
- Section 1 uses "See how it works" as the only button. Copy's "Log a set" is not in the brief's ending set and is left out.
- Progress indicator text: "Section {n} of 5", updated on scroll.

## 14 UX laws
Each law is mapped to a design decision here. Evidence and status are in `UX_LAWS_AUDIT.md`.

| Law | Decision |
|---|---|
| Fitts | All buttons 48px tall, nav targets 44px. Primary action is the largest target in its section. |
| Hick | One primary action per section. Section 5 has two buttons, the others have one or none. |
| Jakob | Button labels name the result: "Open app", "Connect sheet". Nav labels name the section. |
| Miller | Five sections and five nav items, inside the 7 +/- 2 range. |
| Tesler | Apps Script setup stays in the app's Setup. The intro asks only for a paste. |
| Aesthetic-Usability | Token palette, one hero object, consistent chamfer panels. |
| Doherty | Text is readable before WebGL starts. Hero first frame is the only delayed element. |
| Peak-End | Section 5 ends on the primary volt action "Open app". |
| Serial Position | Hook first, primary CTA last. Middle sections carry the proof. |
| Von Restorff | Volt filled button is used only for the primary action. Other buttons are outlined. |
| Pareto | Sections 1 and 5 carry the decision. Sections 2 to 4 support it. |
| Occam | No extra features, no video, no third-party scroll libraries. |
| Postel | Works with JS off, with WebGL off, with the CDN blocked, and with reduced motion. |
| Zeigarnik | Progress nav and "Section n of 5" show how much of the story is left. |

## Verification plan
See `QC_REPORT.md`. Playwright via `chromium.launch({ channel: 'chrome' })`, served from the project root on port 5175. Scratch scripts live in the scratchpad, not in `intro/`.
