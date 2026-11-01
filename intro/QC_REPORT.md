# QC report: Elevation intro

## Round 1 fix re-verify (scrollme fix round 1 of 2)
Date: 2026-11-01. Server: `npx -y http-server -p 5179 -s -c-1 .` from the project root. Page: `/intro/`.
Fixed: S-1 (block, LCP), S-2 (major, JS weight), S-3 (minor, tokens and 8px chamfer), S-4 (minor, visible labels).

### Lighthouse mobile, 2 runs each (`npx lighthouse`, system Chrome, performance and accessibility)
| Metric | Before (lh-intro-1/2) | After run 1 | After run 2 | Target |
|---|---|---|---|---|
| LCP | 4.2 s / 3.8 s | 0.9 s | 0.9 s | <= 2.5 s |
| TBT | 240 / 270 ms | 160 ms | 180 ms | n/a |
| CLS | 0 | 0 | 0 | n/a |
| Performance score | 0.74 / 0.76 | 0.98 | 0.98 | n/a |
| Accessibility | n/a | 1 | 1 | n/a |
| JS transferred (hero) | about 258 KB (three.module.js full) | 145 KB (intro.js 9 KB + three.module.min.js 136 KB) | 145 KB | <= 250 KB |

Raw JSON: `scratchpad/lh-intro-r2-1.json`, `lh-intro-r2-2.json` (scratchpad folder `C:/Users/Admin/AppData/Local/Temp/claude/E--ai-claude-ALAi-elevation-progress-tracker/811cab6d-39a2-41ad-a9af-706de46daa19/`).

### What changed
- Google Fonts stylesheet is no longer render-blocking (`preload` with `onload` swap, `noscript` fallback). `display=swap` was already set.
- Section 1 is `.in` in the HTML, so the hero text is painted without JS. Its LCP element was an opacity-0 reveal panel waiting on `intro.js`.
- Three.js loads after `window` load and browser idle (`whenIdle` in `intro.js`). It uses `three.module.min.js` at the same pinned 0.160.0. The text paints before the hero download.
- Durations and easings use `--dur-slow`, `--dur-fast` and `--ease-out` from `../tokens.css`. Under reduced motion the token block sets `--dur-fast` to 120 ms.
- Panel and primary CTA chamfer is 8px (`--intro-cut`). The panel was 10px.
- Visible beat labels ("01 HOOK" to "05 CONNECT YOUR SHEET") removed. Nav links have screen-reader names "Section 1" to "Section 5".
- The service worker (`sw.js`) is not involved. The intro does not register it and the LCP issue is not in the SW path. The SW finding (A2 #1) stays with the app agent.

### Playwright re-verify (`scratchpad/intro-r1.mjs`, `intro-r1c.mjs`, `intro-r1b.mjs`, `intro-cam.mjs`)
- 390x844 (dsf 2, mobile) and 1440x900, normal and reduced motion: 38/38 PASS. Page and WebGL hero active, 0 console or page errors, no horizontal overflow, h1 visible, no visible internal labels, fonts applied after load, 8px clip, touch targets >= 44px.
- Load order: three.module.min.js requested after the load event (for example 144 ms vs loadEventEnd 125 ms at 390).
- Reveal duration computed: 0.28s normal (`--dur-slow`), 0.12s reduced (`--dur-fast`).
- Camera: canvas changes with scroll in normal motion and stays identical top vs mid vs end in reduced motion, at 390 and 1440 (header and text hidden for the pixel compare). PASS.
- No-JS: all five panels at opacity 1, h1 readable. PASS.
- WebGL blocked: fallback visible, `webgl` class absent, section 5 reveals on scroll, 0 page errors. PASS.
- Screenshot: `scratchpad/intro-r1/390-motion-top.png`.

### Still open
- Hero first frame is now measured only through LCP (text first). The three.js first frame arrives after load and idle. On a slow connection the fallback visual shows longer. This is intended.
- Nothing published or deployed.

## Previous QC (initial build)
Date: 2026-11-01. Server: `npx -y http-server -p 5175 -s .` from the project root. Page: `/intro/`.
Browser: Playwright via `chromium.launch({ channel: 'chrome' })`, system Chrome.
Scripts: `C:/Users/Admin/AppData/Local/Temp/claude/E--ai-claude-ALAi-elevation-progress-tracker/811cab6d-39a2-41ad-a9af-706de46daa19/scratchpad/intro-qc.mjs`, `intro-cls.mjs`, `intro-camera.mjs`.

## Result
- PASS: 48
- FAIL: 0
- BLOCKED: 1 (Lighthouse performance score and hero first-frame timing, not run)

## Checks
| Check | Viewport | Status | Evidence |
|---|---|---|---|
| Page loads | 390x844, 1440x900 (dark and light) | PASS | HTTP 200 |
| WebGL hero active | 390, 1440 (dark and light) | PASS | `html.webgl` set, canvas displayed |
| Scroll sweep top to bottom to top | 390, 1440 (dark and light) | PASS | Max 3376 (390) and 3600 (1440). Reached bottom, back to 0 |
| No horizontal overflow | 390, 1440 (dark and light) | PASS | scrollWidth equals clientWidth in all runs |
| CTA links | 390, 1440 (dark and light) | PASS | "Open app" to `../`, "Connect sheet" to `../#settings`, "See how it works" to `#s2` |
| Touch targets 48px | 390, 1440 (dark and light) | PASS | All 3 buttons 48px tall |
| Link `../` resolves | server | PASS | HTTP 200 |
| Link `../#settings` resolves | server | PASS | HTTP 200 (fragment is client-side, app root served) |
| Console errors | 390, 1440 (dark and light) | PASS | 0 console errors, 0 page errors |
| Failed external requests | 390, 1440 | PASS | None (fonts and Three.js loaded) |
| Section reveals fire | 390, 1440 | PASS | All 5 beats gain `.in` |
| Reduced motion class and transition | 390, 1440 | PASS | `html.rm` set, panel transition 0.12s |
| Reduced motion: camera frozen | 390 | PASS | Canvas pixels identical top vs bottom with reduced motion. Changed in normal motion |
| CLS | 390, 1440 | PASS | CLS 0.0000 at both sizes (limit 0.1) |
| Keyboard: skip link first | 390 | PASS | "Skip to content" is first focus stop, moves to 16px left when focused |
| Keyboard: tab order | 390 | INFO | Logged only: skip link, nav, then CTAs in DOM order. Not asserted |
| Keyboard: focus ring | all | PASS | `:focus-visible` rule in `intro.css` (2px `var(--focus)`). Checked in CSS, not as a rendered test |
| WebGL failure fallback | 390 (Chromium with 3D APIs disabled) | PASS | `webgl` class absent, fallback displayed, canvas hidden, H1 readable, 0 page errors |
| No-JS text readable | 390 (JS disabled) | PASS | Fallback displayed, panel opacity 1, H1 readable |
| Copy matches COPY.md | all | PASS | Headlines and body text match intro.s1 to intro.s5 |
| Banned words and punctuation | copy | PASS | No banned words, no exclamation marks, no em dashes |
| Asset and code review | all | PASS | Procedural assets only. Three.js pinned at 0.160.0. No purple gradients |
| Lighthouse performance | all | BLOCKED | Not run in this pass. Reason: Lighthouse was not part of the requested checks |
| Hero first-frame timing | all | BLOCKED | Not measured. Reason: no performance trace was requested |

## Decisions recorded
- "Connect sheet" (brief) used instead of "Connect my sheet" (copy file). The brief governs.
- Section 1 has only "See how it works" as a button. Copy's "Log a set" is not in the brief's endings.

## Fixes made during QC
1. Portrait camera distance raised. The barbell's plates were clipped at 390px.
2. Desktop object shifted right and scaled to 0.8. It ran under the text panel at 1440px.

Re-run after both fixes: 42/42 main checks PASS, then the CLS, keyboard and camera checks PASS.

## Screenshots
Folder: `C:/Users/Admin/AppData/Local/Temp/claude/E--ai-claude-ALAi-elevation-progress-tracker/811cab6d-39a2-41ad-a9af-706de46daa19/scratchpad/intro-qc/`
- `phone390-dark-01-top.png`, `phone390-dark-02-end.png`, `phone390-dark-03-reduced-motion.png`
- `phone390-light-01-top.png`, `phone390-light-02-end.png`, `phone390-light-03-reduced-motion.png`
- `desk1440-dark-01-top.png`, `desk1440-dark-02-end.png`, `desk1440-dark-03-reduced-motion.png`
- `phone390-04-webgl-fallback.png`, `phone390-05-nojs.png`

## Open items
- Lighthouse and hero first-frame timing are BLOCKED. Doherty stays Partial in `UX_LAWS_AUDIT.md` until timing is measured.
- Nothing published or deployed.
