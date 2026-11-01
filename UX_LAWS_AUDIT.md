# UX Laws Audit: Signed-out landing + sign-up page

Scope: signed-out view only (`body.signed-out`). Signed-in app unchanged.
Evidence: headless Chromium (Playwright) at 390×844 and 1280×800, plus reduced-motion emulation. Screenshots in the scratchpad: `signedout-phone.png`, `signedout-desktop.png`.
Limit: the Google Identity script was blocked in the test, so the real Google button's rendered size and its sign-in round trip were not measured. Those rows say so.

| # | Law | Status | Evidence | Fix / note |
|---|---|---|---|---|
| 1 | Fitts's Law (target size and distance) | Compliant | `#gsiBtn` slot has `min-height:44px`; the one primary action is the only control on the page. | Rendered Google button height not measured (script blocked). |
| 2 | Hick's Law (fewer choices) | Compliant | One action: Google sign-in/sign-up. No tabs, no second path, no forms. | None. |
| 3 | Jakob's Law (familiar patterns) | Compliant | Standard Google "Continue with" button; familiar landing layout (hero left, card right on desktop, stacked on phone). | None. |
| 4 | Miller's Law (chunking) | Compliant | Three short bullets; sample session shows three rows. | None. |
| 5 | Tesler's Law (complexity stays with the system) | Compliant | Account creation and sign-in are the same step; the copy explains that the account is created on first sign-in, so the user does not choose a mode. | None. |
| 6 | Aesthetic-Usability Effect | Compliant | Claymorphism tokens, red/charcoal/white palette, consistent radii and shadows. Screenshots look intentional. | None. |
| 7 | Doherty Threshold (response under 400 ms) | Partial | Sign-in UI shows "Loading Google sign-in…" until the script is ready. Load time depends on Google's script. | Status text is shown immediately. Not measured on a real network. |
| 8 | Peak-End Rule | Compliant | Strong hero headline at the start; the sign-in card is the closing action with a clear next step. | None. |
| 9 | Serial Position Effect | Compliant | The key message (headline) is first; the action is last, which is where the eye ends on phone. | None. |
| 10 | Von Restorff Effect (isolation) | Compliant | The red accent is used only for the eyebrow, bullets and numbers in the sample; the sign-in card is the single raised surface with the action. | None. |
| 11 | Pareto Principle | Compliant | Only the sign-in action matters for conversion; it is the only interactive element. | None. |
| 12 | Occam's Razor | Compliant | No extra sections, stats or testimonials (none invented). | None. |
| 13 | Postel's Law (be lenient) | Partial | If the Google script fails, the page shows "Loading Google sign-in…" with no retry. The `signInFail` message exists for failed sign-in but not for a failed script load. | Follow-up: show a retry message when the script never loads. Not changed in this pass. |
| 14 | Zeigarnik Effect | Compliant | The sample session shows a partly finished workout (three exercises with sets), which invites the user to start logging. | None. |

## Accessibility and motion checks (supporting the laws)

- One `h1` (hero), `h2` for the sign-in card. No skipped levels.
- The sample phone is `aria-hidden="true"`; the copy around it carries the meaning.
- Horizontal overflow: 0px at 390px and 1280px.
- Header, tab bar and demo banner: `display: none` while signed out (verified). Hidden on both sizes.
- Scroll reveal: only added when `prefers-reduced-motion` is not set and `IntersectionObserver` exists. With reduced motion, `.reveal-ready` is not added and all content is visible (verified: `revealReady: false`, all opacities 1).
- Content is visible without JavaScript for the reveal (the reveal class is added by JS only).

## Known issues found during this audit (not fixed in this pass)

1. `assets/three.core.js` is missing from the repo. `assets/three.module.js` imports it, so the 3D gym scene fails silently with a 404. Pre-existing; the CSS photo background still shows. Fix: vendor `three.core.js` next to `three.module.js`.
2. Law 13 (Postel): no retry message if the Google script fails to load.

## Re-audit

After the fixes above, re-run `signedout-check.mjs` and confirm the rows still hold. Issues 1 and 2 are open.

---

# Previous audit (Volt Telemetry build, a9ca584)

# UX Laws Audit: Elevation app (Wave 5 checker)

Date: 2026-11-01. Scope: the app (`index.html`, `styles.css`, `app.js`). Intro has its own audit at `intro/UX_LAWS_AUDIT.md`.
Evidence: `.buildme/qa/w5-report.json`, `.buildme/qa/w5-offline.json`, `.buildme/qa/lh-app-{1,2}.json`, `.buildme/qa/shots/*`. Browser: system Chrome via Playwright. Server: `npx http-server -p 5177 -s .`.

### Round 1 re-rate (2026-11-01, `.buildme/qa/r1v/`)
Pass 12 · Partial 2 · Fail 0.

| # | Law | Round 0 | Round 1 | Evidence |
|---|---|---|---|---|
| 1 | Fitts's Law | Partial | **Pass** | Weight input is 150, 190 and 220 px at 320, 360 and 390, with no clipping. The verdict chip is 52x44. Steppers and eunit chips are 48 px. The calendar day list is used below 380. Remaining note: the sticky CTA can cover fields at the bottom edge at 320 (R2-2, minor). |
| 5 | Tesler's Law | Partial | **Pass** | First load prefills reps and weight from the last set, and they match the LAST strip. Unit conversion is drift-free. |
| 6 | Aesthetic-Usability | Partial | **Pass** | Steppers are no longer squeezed at 320 to 390. No horizontal overflow on any route. History dates use nowrap. |
| 7 | Doherty Threshold | Fail | **Pass** | Lighthouse mobile, 2 runs, worse run counts: LCP 1.8 s, TBT 90 ms, CLS 0.082, perf 98. |
| 12 | Occam's Razor | Partial | Partial | Product decision, unchanged. The current week can show DIP mid-week. Owner: orchestrator or user. |
| 14 | Zeigarnik Effect | Partial | Partial | Optional BASELINE progress cue, unchanged (A9 + A2). |

All other laws are still Pass. The round 0 table below is kept for history.


### Summary
Pass 8 · Partial 5 · Fail 1 (Doherty). Main blockers: the Reps/Weight input is too narrow on phones (Fitts, Aesthetic-Usability), and LCP on mobile is 2.9 to 3.0 s against a 2.5 s budget (Doherty).

| # | Law | Verdict | Evidence | Action (owner) |
|---|---|---|---|---|
| 1 | Fitts's Law | Partial | The Log CTA is full width and sits at the bottom, inside thumb reach (`shots/dark-390-log.png`). Steppers are 48x48. The weight input is only 51 px wide at 390 and 18 px wide at 320, so "162.5" does not fit (scrollWidth 85 vs clientWidth 51). Calendar day cells are 41x48 at 360. The verdict chip is 52x32 at every width. | Stack Reps and Weight below 480 px. Make the chip at least 44 px tall. Use 44 px minimum cells, or the day list, below 380 (A2). |
| 2 | Hick's Law | Pass | Log has one primary action. Intensity offers 3 choices with Med preselected. The nav has 5 tabs, and Setup moves to the header on phones. | — |
| 3 | Jakob's Law | Pass | Bottom tab bar on phone and left rail on desktop. Native `<select>` and date input. ±1 steppers and a kg/lbs segmented control. | — |
| 4 | Miller's Law | Pass | The Week hero shows 4 stats: score, volume, avg e1RM change, sessions. The LAST/BEST strip holds 2 facts. | — |
| 5 | Tesler's Law | Partial | The app does the conversion maths: the `= 45.4 kg` hint and stored KG/LBS columns. It prefills the last set when the exercise changes or `lastEx` is set. On a first visit, or when `lastEx` is unset, the fields stay empty while the LAST strip shows 8 × 62.5 (`app.js:1111`). Intro beat 2 says "Last set, already filled in." | Prefill from the resolved exercise in `views.log` or after `load()` (A2). |
| 6 | Aesthetic-Usability | Partial | The token system is on-brief: volt on near-black, Chakra, chamfer. The squeezed stepper inputs look broken at 320 to 390. Calendar history dates wrap mid-date in light 390 Charts (`shots/light-390-progress.png`). | Fix the stepper layout. Use `white-space:nowrap` on history dates (A2). |
| 7 | Doherty Threshold | **Fail** | Lighthouse mobile, 2 runs, worse run counts: LCP 3.0 s, FCP 3.0 s, TBT 0, CLS 0. The LCP element is the demo-banner text. Render-blocking resources are the Google Fonts CSS, `app.js` (no `defer`) and both stylesheets, for an estimated saving of 2.4 s. Interaction feedback is instant because the UI updates optimistically: the toast appears before the network call returns. | Add `defer` to `app.js`, preload fonts or load them without blocking, and inline critical tokens (A2). |
| 8 | Peak-End Rule | Pass | The peak is the PR stamp (the toast "New PR. Set logged." plus a chip). The end is the Week verdict and the share card. | — |
| 9 | Serial Position | Pass | Log is first and Week is last in the nav. Setup is reachable from the header gear. | — |
| 10 | Von Restorff | Pass | Volt is reserved for the primary CTA, the current-week bar and PROGRESS. DIP uses the danger colour. | — |
| 11 | Pareto | Pass | The 80% task (log a set) is the default route and needs at most 3 taps with prefill. | — |
| 12 | Occam's Razor | Partial | Mid-week, the score shows DIP (−10% on seeded data). Consistency is counted as sessions so far against a full week's plan. The maths matches `Code.gs refreshWeekly`, but the verdict penalises an unfinished week. | Product decision, not a bug. Consider a label such as "in progress" for the current week (orchestrator or user). |
| 13 | Postel's Law | Pass | `normalize()` coerces "TRUE" strings to booleans and the number columns to numbers. Lbs and kg entry both work. Bad input shows "Enter reps and weight." Offline writes queue and flush after reconnect (`w5-offline.json`: outbox 2, then 0 after going online, server rows 2). | — |
| 14 | Zeigarnik Effect | Partial | Week shows sessions as "1/3", and the Log plan line names today's split. The sync dot stays "pending" until the sheet confirms. On the first week the result is BASELINE, with no progress cue toward the first score. | Optional: add "x of N sessions to first score" on BASELINE (A9 copy + A2). |
