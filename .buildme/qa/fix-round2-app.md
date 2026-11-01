# Fix round 2 (FINAL): A2 app (Agent 2+5)

Scope: the FIX LIST round 2 in QA_REPORT.md (R2-1 to R2-4). Files written: index.html, styles.css, app.js, sw.js. SW cache bumped `elevation-v2-2` to `elevation-v2-3`.

Harness: Playwright with system Chrome, http-server on 127.0.0.1:5181. Scripts and raw output are in the scratchpad: `scratchpad/r2/verify.cjs` (result `scratchpad/r2/verify.json`), negative control `scratchpad/r2/neg.cjs`, Lighthouse `scratchpad/r2/lh-app-{1,2}.json`, screenshots `scratchpad/r2/log-{320,390}-bottom.png`.

## Repro results

| Item | Before | After | Evidence |
|---|---|---|---|
| R2-1 week label | "Week of 2026-10-26" in the hero kicker, the history headings and the share canvas | "Week of Oct 26" in all three, at 390 and 1440. No ISO string on any page or in the canvas | verify.json `r2_1_*`. Canvas text captured via a fillText spy |
| R2-2 log controls under LOG SET | Occluded at 320 (lbs button, notes, intensity chip under the sticky bar) | Each control (weight, kg/lbs, notes, Hard, reps, exercise) scrolls to the bottom edge clear of the CTA and the tab bar. Hit test is the control itself, at 320 and 390 | verify.json `r2_2_320`, `r2_2_390`. Negative control with the fix stripped: lbs button covered by CTA, notes covered by a span, Hard covered by a nav link |
| R2-3 Week reveal overlap | viewIn 0-200 ms, verdict reveal 0-280 ms, bars 280-560 ms | viewIn 0-200, verdict 200-480, bars 480-760. No overlap | verify.json `r2_3`, `seq: true` |
| R2-4 CLS on `/` | 0.080 at 390 (one shift: `main` pushed down 72 px when the demo banner was inserted after first paint) | 0.0001 at 390 (3 loads), 0 at 1440 (3 loads) | verify.json `r2_4_*` |

## R2-4 root cause and fix

The shift source was the demo banner. It shipped with `hidden` and JS unhid it after the first render, so the page content moved down by about 72 px. Fix: index.html sets `data-demo` on `<html>` in the head inline script, before first paint, using the same rule as `isDemo()` in app.js (no sheet URL saved). styles.css hides the banner when the value is "off". The banner's `hidden` attribute is removed from the HTML. app.js keeps `showBanner()` as it was.

## Other changes

- app.js: new `weekLabel(iso)` helper (builds the local date from parts, so no timezone shift). Used at the hero kicker, the history heading and the share canvas title. The share filename keeps the ISO date.
- styles.css: verdict reveal delayed by `--dur-base`; bars delayed by `--dur-base + --dur-slow`. Desktop (1024 and up) keeps its own values.
- styles.css: `html { scroll-padding-bottom }` set to CTA height + tab bar + s-4 on phones, and s-5 on desktop. `#setForm` gets bottom padding of CTA height + tab bar on phones, and s-4 on desktop.

## Gates

- Console errors: 0 on the 7 hash routes (#log, #favorites, #progress, #calendar, #week, #settings, #main) at 390 and 1440, and on /intro/ at both widths.
- Horizontal overflow: 0 px on every route at 390 and 1440. Log at 320: scrollWidth equals clientWidth.
- Demo banner: visible in demo (data-demo "on"), hidden when a sheet URL is set (data-demo "off").
- Service worker: controlled, cache keys `["elevation-v2-3-shell"]`. Old caches removed.
- Lighthouse 13.6 mobile, `/`, 2 runs (performance, accessibility, best-practices, SEO):

| Run | Perf | A11y | BP | SEO | LCP | CLS | TBT | FCP |
|---|---|---|---|---|---|---|---|---|
| 1 | 100 | 100 | 100 | 100 | 1.1 s | 0 | 30 ms | 1.1 s |
| 2 | 100 | 100 | 100 | 100 | 1.1 s | 0 | 70 ms | 1.1 s |

- `node --check` passes on app.js and sw.js.
- graphify: `graphify update .` run after the edits. Status OK (4398 nodes, 5233 edges, 411 communities).

## Limits

- The R2-2 check uses `scrollIntoView({block:'end'})` and `focus()`, with a seeded log. Real keyboard focus on a device was not tested.
- Lighthouse was run on the demo state only. Connected-mode CLS was not measured.
- The CSS and JS files show a git line-ending warning (LF to CRLF). That comes from the working copy, not from these edits.
