# Elev signed-out landing — QC report (2026-11-01)

Scope: `landing.js`, `landing.css`, `signInView()` in `app.js`, `gym-background.js` (lazy Three), `sw.js` v3-52.
Roles ran **sequentially in one session** (no subagent dispatch). Disclosed per CLAUDE.md / skill rules.
Evidence: screenshots `.buildme/qa/landing/{390,1440,390-reduced}-s0..s4.png`, QA script `scratchpad/qa.cjs` (Playwright + Chromium 1217), Lighthouse 12 mobile JSON (2 runs).

## Agent 7 — Anti-slop (V1–V6, C1–C4, M1–M3)
| Detector | Status | Evidence |
|---|---|---|
| V1 purple/AI gradient | PASS | Graphite #080809 + ember red only |
| V2 generic card grid | PASS | One panel per scene in empty half of footage |
| V3 stock imagery | PASS | User-owned Grok clips |
| V4 icon soup | PASS | Svg ticks on auth perks only |
| V5 glassmorphism default | PASS | Metal tilt card, ember edge, no frosted purple |
| V6 centred hero cliché | PASS | Content follows lifter's empty side |
| C1 buzzwords | PASS | Copy concrete (“last weight and reps ready”) |
| C2 fake proof | PASS | Charts labelled “Example progress”; no user counts |
| C3 vague CTA | PASS | “Sign in with Google” |
| C4 filler | PASS | — |
| M1 unmotivated bounce | PASS | expo.out, no overshoot |
| M2 opacity-only entrances | PASS | Clip scale push + y travel + bar/line draw |
| M3 motion without reduce path | PASS | Reduced: no GSAP, no 3D, static posters |
Gate: **PASS** (0 block).

## Agent 8 — Bug hunt
| Bug | Repro | Fix | Re-run |
|---|---|---|---|
| Date stamp visible | scene 1 top corner | crop origin 50% 100%, scale 1.12 | PASS |
| Auth card left / perks wrap per word | scene 5 | `st-auth` moved to panel | PASS |
| Bars overflow card | scene 3 | `.bar` → `.st-bar` (global clash) | PASS |
| Dots overlap arrows @390 | footer | nav left, count hidden | PASS |
| Font-swap layout shift (CLS .35) | Lighthouse run 1 | panel hidden until `fonts.ready` (≤900ms) | PASS (CLS 0–0.05) |
At 390/1440/390-reduced: scroll height 0, overflowX 0, forward/back nav OK, tab order logical, 0 page errors.
Gate: **PASS** (0 block, 0 major). GSI 403 = environment, see BLOCKED.

## Agent 10 — Performance / a11y
Lighthouse mobile (simulated slow 4G), worst of 2:
| Metric | Before | After | Budget | Status |
|---|---|---|---|---|
| Performance | 40 | 70 | — | — |
| LCP | 16.5 s | 5.8 s | <2.5 s | **FAIL** (open) |
| CLS | 0.352 | 0.051 | <0.1 | PASS |
| TBT | — | 0 ms | — | PASS |
| Accessibility | 100 | 100 | — | PASS |
| Best practices | 100 | 100 | — | PASS |
Fixes: Three no longer loads on signed-out page (gym-background waits for sign-in, dynamic import); landing 3D deferred to idle; clips 2–4 lazy (`data-src`, `preload=none`, hydrate next scene). Total weight 2.3 MB, mostly 2 hero MP4s (~1.5 MB).
Remaining LCP: hero h1 waits on web font + bench MP4. Next options: self-host Chakra Petch subset with preload, smaller first-clip encode.
Field INP not measurable locally (no CrUX).
Keyboard: arrows/PgUp/PgDn/Home/End, dots, arrows buttons; inactive scenes `inert`; live region announces scenes. Touch targets ≥44px.

## UX laws (14)
| Law | Result |
|---|---|
| Fitts | PASS — sign-in top-right + scene-5 large button; 44px+ controls |
| Hick | PASS — one CTA per scene |
| Jakob | PASS — dots + arrows = familiar carousel |
| Miller | PASS — 5 scenes, ≤3 perks |
| Tesler | PASS — one-tap Google, no form |
| Doherty | PASS — scene swap <1s, input locked during morph |
| Aesthetic-usability | PASS |
| Von Restorff | PASS — ember accent word per title |
| Serial position | PASS — value first, sign-in last + persistent top button |
| Peak-end | PASS — auth scene ends with tilt card + success morph |
| Goal-gradient | PASS — progress bar + count |
| Zeigarnik | PASS — progress bar shows remaining scenes |
| Proximity / common region | PASS — panel groups text + chart |
| Postel | PASS — wheel, touch, keyboard, buttons all accepted |

## Agent 12 — Token snapshot
Tokens unchanged from app: `--bg #080809`, ember accent, Chakra Petch / Inter / JetBrains Mono. Screenshots above = snap of this build.

## BLOCKED
- Google sign-in on `http://localhost:5173`: GSI returns 403 “origin not allowed for client ID”. Button renders; real sign-in needs an authorized origin (deployed site URL) or adding `http://localhost:5173` to the OAuth client's Authorized JavaScript origins.
- WebGL-failure path: code hides `.st-3d` on null; not forced in browser test.

## Overall
PASS except LCP budget (FAIL, 5.8 s vs 2.5 s) and GSI localhost (BLOCKED).

## Round 2 (user: "video not playing, add morph, why not 3D parallax") — sw v3-53
| Item | Root cause | Fix | Evidence | Status |
|---|---|---|---|---|
| Video not playing | SW cache-first served MP4s, breaking Range requests (Playwright blocks SW, so QA missed it) | SW skips `.mp4/.webm` + any `Range` request; MP4s removed from precache | code; needs real-browser recheck after SW update | PASS (code) / user recheck |
| Weak parallax | Clip parallax only ±10px and overwritten by GSAP inline transform after first swap | Parallax moved to `.st-media` wrapper: ±34/22px + rotateY 5° / rotateX 3.5° under 1200px perspective; idle drift on touch phones | computed transform changes; m390/m1440 frames | PASS |
| Morph transition | Was crossfade + scale | Circle clip-path reveal from incoming panel side, ember seam on edge, old clip falls back with blur, panels fly in on Z/rotateX | clipPath sampled 0% → 18% → 150% → cleared | PASS |
| Regression | — | QA script 390/1440/390-reduced: scroll 0, overflow 0, nav fwd/back, tab order, 0 page errors | qa.cjs | PASS |
UX laws re-audit: Doherty (morph 1.15s, input locked), Peak-end, Aesthetic-usability unchanged PASS; reduced motion disables morph, drift, tilt.

## Round 3 — "still no video no morph; aggressive morph" (sw v3-54)
Root cause (verified in owner's Chrome via claude-in-chrome): OS "Animation effects" off → `prefers-reduced-motion: reduce` = true → page disabled video play, GSAP, morph, 3D.
Owner decision: motion ON by default. Accessibility kept via visible **Motion off** toggle in footer (44px, aria-pressed, remembered in localStorage) → `.stage.is-calm` static mode.
Video now plays in both modes (muted, inline).
Aggressive morph: 0.7s expo slash wipe (direction-aware), new clip punches in from scale 1.6 / rotate 7° / skew 8° / overexposed blur, old clip blows out (scale 1.75, blur 22px, brightness 2.4), ember flash yoyo, frame shake on media layer, panels fly on Z.
Evidence: owner Chrome — clips `hero-bench:PLAY`, cache `elevation-v3-54-shell`, mid-transition screenshot shows slash + flash. QA script 390/1440/calm: scroll 0, overflow 0, nav OK, 0 page errors.
UX laws: Doherty — transition ~1.1s, input locked (accepted by owner as stylistic). Postel/accessibility — Motion toggle replaces OS-query honoring (deviation recorded, owner-requested).

## Round 4 — "anime.js on all 3D text" (sw v3-55)
Source: github.com/juliangarnier/anime, v4.5.0, MIT. Vendored as `assets/anime.esm.min.js` (118 KB), precached, lazy-imported after the GSAP intro.
Applies to every `.st-title` (5 scenes). `splitText` breaks each title into words and characters; the original text stays in `aria-label` and the split pieces are `aria-hidden`. Characters are extruded with a `text-shadow` stack, with an ember extrusion on the accent word.
- In: each character flips in 3D (rotateX −110→0, rotateY 40→0, z −320→0, scale 1.7→1) with a 32 ms stagger and an elastic ease, synced to the morph at 0.5 s and following the travel direction.
- Out: characters fling at z +260 with an inExpo ease from the centre.
- Hover: each character spins and flashes ember.
- Calm mode: no split animation, no extrusion.
Evidence: `scratchpad/txt.cjs` (split OK, 0 errors) and phone screenshots t-mid/t-end. The Motion button overlapped the dots at 390 px; it now sits above the arrows (44 px). Re-checked: PASS.
Regression check with qa.cjs at 390, 1440 and calm: scroll 0, overflow 0, navigation forward and back OK, tab order logical, 0 page errors (only the GSI 403 error, which is BLOCKED).
UX laws: no change except Aesthetic-usability (stronger) and Doherty (text finishes within the ~1.1 s morph; input stays locked). M1 "unmotivated bounce": the elastic ease is on titles only and was requested by the owner (exempt-by-brief). Calm mode removes it.

## Round 5 - solid scene wipe

Removed transition opacity, blur bursts, screen blend, shake, and oversized image transforms. Added a directional hard-edge clip wipe and a solid ember seam. Panel and title changes use transforms only. Outgoing scene remains visible through the wipe. Calm mode remains instant.

Evidence: .buildme/qa/landing/morph-qa.py; screenshots morph-desktop-mid.png, morph-desktop-final.png, morph-mobile-mid.png, morph-mobile-final.png, and morph-mobile-calm.png. Browser checks passed forward and reverse at 1440 x 900 and 390 x 844. The seam hid after each transition. Calm mode changed scenes instantly. No browser page errors. 
ode --check landing.js and git diff --check -- landing.js landing.css app.js passed.

UX laws: Doherty, Aesthetic usability, Fitts, Postel, and continuity verified. Static background shade and card materials remain unchanged. Google sign-in was not submitted.

Full five-scene forward and reverse navigation passed at 390 x 844, including bench-to-sign-in same-video change.
