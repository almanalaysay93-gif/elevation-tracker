# Context and asset ledger: Elevation intro

## Sources read
- `BUILD_BRIEF.md`: approved product brief. Scrollme is the intro story.
- `DESIGN.md`, `design/style-spec.md`, `design/motion-doctrine.md`: volt telemetry style, motion limits, reduced-motion table.
- `tokens.css`: colour, type, motion and touch tokens. The intro imports it from `../tokens.css`.
- `VOICE.md`: voice rules, banned words, no exclamation marks, no em dashes in UI copy.
- `copy/COPY.md`: intro.s1 to intro.s5 copy, intro.progress, intro CTA strings.
- `index.html` (app root): hash routes `#settings` and the existing Google Fonts link.

## Procedural assets
| Asset | Source | Licence | Notes |
|---|---|---|---|
| Barbell with plates and collars | Built in `intro.js` from Three.js primitives (Cylinder, EdgesGeometry) | Project code | No downloaded models, textures or images |
| Fallback visual | `intro.css` shapes | Project code | Used when WebGL is absent or fails |
| Favicon | Inline SVG data URI in `index.html` | Project code | Volt triangle |

No binary assets are downloaded. No images or models are added to `intro/`.

## External dependencies
| Dependency | Version or URL | Licence | Load |
|---|---|---|---|
| Three.js | `three@0.160.0`, `cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js` (round 1; was the unminified build) | MIT | ES module, pinned exact version, released more than two weeks ago, loaded after load and idle |
| Chakra Petch, Inter, JetBrains Mono | Google Fonts link already used by the app | SIL Open Font License | `fonts.googleapis.com` stylesheet |

Only CDNs on the allowed list are used (cdnjs, cdn.jsdelivr.net/npm/, unpkg, cdn.tailwindcss.com, code.jquery.com, Google Fonts for stylesheets).

## Decisions and reconciliations
- Stack is vanilla Three.js, not R3F. GSAP and Lenis are not needed because scroll is native and the single value drives the camera.
- "Connect sheet" (brief) overrides "Connect my sheet" (copy file). Noted in PLAN.md and QC_REPORT.md.
- The root `ORCHESTRATOR.md` lists root-level BRIEF, PLAN and QC files. The user's instruction (write only inside `intro/`) takes precedence, so those files are in `intro/`.
