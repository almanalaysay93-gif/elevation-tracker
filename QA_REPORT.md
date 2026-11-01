# QA Report: Wave 5 checker (Opus)

## Round 2 final verify (2026-11-01): **SHIP**

I re-ran every check myself and did not rely on the fixer's numbers. Server: `npx -y http-server -p 5184 -s .`. Browser: system Chrome through Playwright. Lighthouse 12, mobile, 2 runs per page. Script and evidence: `.buildme/qa/r2v/` (`v.cjs`, `verify.json`, `lh-{app,intro}-{1,2}.json`, `log-{320,390}-bottom.png`).

| Check | Result | Measured |
|---|---|---|
| R2-1 week label | PASS | The #week kicker reads "Week of Oct 26", and the history headings read "Week of Oct 26" and "Week of Oct 19", at 390 and 1440. A fillText spy on the share canvas captured "Week of Oct 26". No ISO date appears in the view or the canvas. |
| R2-2 LOG SET occlusion | PASS | At 320 and 390 I scrolled each control to the bottom edge and also focused it: weight, kg, lbs, notes, Hard, reps and exercise. The hit test returns the control itself every time, and none of them overlaps the CTA. Page width at 320: scrollWidth 320 = clientWidth 320. |
| R2-3 Week sequencing | PASS | viewIn ends at 200 ms. The verdict reveal runs 200–480 ms and the bars start at 480 ms. Nothing overlaps. |
| R2-4 CLS | PASS | 3 loads at each width. CLS is 0.0001 at 390 and 0 at 1440. Lighthouse CLS is 0 on both pages. The demo banner has `data-demo` "on" and is visible in demo mode, and "off" and hidden once a Sheet URL is set. |
| SW v2-4 offline | PASS | The page is controlled and the only cache is `elevation-v2-4-shell`. Sequence: load `/`, then `/intro/`, go offline, open `/`. Offline `/` is the app shell: the app title shows, app.js loads, no intro script loads, and `#view` has 5 children. `/#week` also renders offline. |
| Regression sweep | PASS | 7 hashes at 320, 390 and 1440, plus `/intro/` at all 3 widths: 0 console or page errors, 0 px horizontal overflow, and `#view` is filled on every route. |
| Lighthouse `/` (worst run) | PASS | Perf, A11y, BP and SEO: 100/100/100/100. LCP 1.6 s, TBT 30 ms, CLS 0. |
| Lighthouse `/intro/` (worst run) | PASS | Perf, A11y, BP and SEO: 99/100/100/100. LCP 0.9 s, TBT 130 ms, CLS 0. |
| JSON-LD | PASS | `/` has a SoftwareApplication block that parses cleanly: name, description, url, HealthApplication, operatingSystem, and an Offer with price 0. There is no aggregateRating. `/intro/` has no JSON-LD, which SEO_AUDIT rates as not applicable. |
| Canonical / OG / Twitter | PASS | Both pages have a canonical that matches og:url (`…/elevation-tracker/` and `…/elevation-tracker/intro/`). og:title and og:description are set and are different between the two pages. twitter:card is `summary`. |
| robots / sitemap / llms.txt | PASS | robots.txt allows all and points to the sitemap. sitemap.xml parses as XML and lists 2 URLs. llms.txt is valid Markdown with an H1 and a summary blockquote. |
| Secrets scan | PASS | I grepped the whole repo, excluding .git and node_modules, for Apps Script deployment IDs (`AKfyc…`, `/macros/s/<id>`) and for Google, OpenAI and GitHub keys. Nothing found. The only `script.google.com` hits are the placeholder `…/exec` (app.js:742, COPY.md:175) and SEO_AUDIT prose. |

UX_LAWS_AUDIT.md: no re-rate needed. The round 2 fixes were all items in the warn or minor class, and nothing regressed.

**Still open (not blocking):** SEO_AUDIT runtime checks stay BLOCKED until deploy. The live site serves an old build, and `/intro/` and `/robots.txt` return 404 live. See F-10: GitHub Pages publishes the repo root, so the internal docs would go public too.

**Do NOT commit:** `bash.exe.stackdump` (crash dump). `graphify-out/` (8.2 MB, regenerated). `.buildme/qa/` Lighthouse JSON and screenshots (7.9 MB of QA evidence; keep them local or gitignore them). `hyperframes/node_modules` and any render output, if present. **Commit, but keep off the public Pages source:** `research/`, `design/`, `copy/`, and the planning docs (BUILD_BRIEF, ORCHESTRATOR, PRODUCT, DESIGN, VOICE, QA_REPORT, SEO_AUDIT, UX_LAWS_AUDIT, CLAUDE.md).

---


## Round 1 re-verify (2026-11-01)

I re-ran every check independently. Server: `npx -y http-server -p 5180 -s -c-1 .`. Browser: system Chrome through Playwright. Scripts: `scratchpad/r1v/{v,u,o}.cjs`. Evidence: `.buildme/qa/r1v/` (`verify.json`, `unit.json`, `occlusion.json`, `lh-{app,intro}-{1,2}.json`, `shots/`, `reel/`).

| Gate | Round 0 | Round 1 | Evidence |
|---|---|---|---|
| G1 Anti-slop | PASS (warn) | **PASS** | C4: no visible "01 HOOK" at 390 or 1440, and section names are screen-reader only. M3: Week went from 3 to 2 concurrent animations. Bars now wait `--dur-slow` (styles.css:333), but viewIn (:134) still overlaps the verdict reveal (:322). This is a warning, not a fail. |
| G2 Bug-hunter | FAIL | **PASS** | See the table below. |
| G3 Perf/a11y | FAIL | **PASS** | Lighthouse 12, mobile, 2 runs each, worst run counts. `/`: perf 98/98, a11y, BP and SEO 100, LCP 1.8 s, TBT 90 ms, CLS 0.082. `/intro/`: perf 98/99, LCP 0.9 s, TBT 150 ms, CLS 0. Bundle gzip (-9): index 3.5 KB, app.js 16.6 KB, styles 5.1 KB, tokens 2.9 KB, sw 0.9 KB, so the app totals about 29 KB. Intro initial JS transferred is 176 KB (three.module.min 167 KB plus intro.js 9 KB), against a 250 KB budget. |
| G4 UX laws | PASS (partials) | **PASS** | 12 pass, 2 partial (product items), 0 fail. See `UX_LAWS_AUDIT.md`. |
| G5 Reel | FAIL | **PASS (1 minor)** | h264, 1080x1920, 60 fps, 15.000 s. Frames at 1.6, 1.8 and 1.9 s: the hook text is gone, so no collision. 1.6 s is an empty dark transition frame. Frames at 11.6 and 12.4 s: the share card holds, "WEEK OF OCT 26". Determinism comes from the designme double-render SHA (I did not re-render, because of write scope). **Mismatch:** the app renders `Week of 2026-10-26` (ISO, app.js:703, :718, :847), not "Oct 26". |

### G2 bug re-runs
| Item | Result | Measured |
|---|---|---|
| A2-1 SW: visit /intro/, go offline, open / | PASS | The page served offline is the app shell: title "Elevation: Gym Log and Weekly Score", app.js script present, no intro script, `#view` renders. `/#week` also renders offline. |
| A2-6 Undo numbering | PASS | #1 #2 #3, then delete #2 gives #1 #2, then Undo gives #1 #2 #3. |
| A2-3 62.5 / 162.5 width | PASS | Input clientWidth equals scrollWidth at 320 (150 px), 360 (190 px) and 390 (220 px). No page overflow. |
| A2-7 Outbox, delete of in-flight add | PASS | add 5×60 (1.5 s latency), add 6×61, delete 5×60 while in flight. POSTs: `addSet:5, addSet:6, deleteSet:srv0`. Server keeps [6x61], the outbox is 0 and the UI shows 1 row. Single-row heuristic only, as the fixer noted. |
| A2-10 Unit toggle | PASS | 100 lbs, then kg 45.4, then lbs 100, then 45.4, then 100: no drift. 62.5 lbs converts to 28.3 kg. |
| A2-14 Share PNG theme | PASS | Canvas pixel: light [242,244,238] = --bg #F2F4EE. Dark [7,9,10] = #07090A. |
| A2-11 Prefill | PASS | First load shows reps 6 and weight 65, which match the LAST strip. |
| Regression sweep | PASS | 7 hashes (#main, log, settings, favorites, progress, calendar, week) at 390 and 1440, plus /intro/ at 390 and 1440. 0 console or page errors, and scrollWidth equals clientWidth everywhere. |

### FIX LIST round 2 (all minor, none blocking)
| # | Owner | Sev | File:line | Repro | Expected |
|---|---|---|---|---|---|
| R2-1 | A2 app | minor | app.js:703, :718, :847 (`Week of ${w.week}`) | Open #week, or share: it shows "Week of 2026-10-26". The reel shows "Week of Oct 26". | Format the date as `toLocaleDateString('en-US',{month:'short',day:'numeric'})`, giving "Week of Oct 26", in the view and the share PNG. |
| R2-2 | A2 app | minor | styles.css (sticky `.cta` on Log) | At 320x844, scrolling a control to the bottom edge leaves the eunit kg/lbs, notes and intensity hidden under the sticky LOG SET bar (`r1v/occlusion.json`, `shots/log-320.png`). | Add `scroll-padding-bottom` equal to the CTA height, so focused fields scroll clear. |
| R2-3 | A2 app | warn | styles.css:134 vs :322 | Week: viewIn and verdict reveal run together. | Optional: delay the reveal by `--dur-base`. |
| R2-4 | A2 app | warn | Lighthouse CLS 0.082 on `/` | Under the 0.1 limit, but it was 0 before. | Optional: reserve space for the demo banner or the font swap. |

---


Date: 2026-11-01. Evidence lives in `.buildme/qa/`: `w5-report.json`, `w5-offline.json`, `lh-app-{1,2}.json`, `lh-intro-{1,2}.json`, `shots/*.png`, `reel/*.png`.
Tooling: Playwright with system Chrome (channel `chrome`), http-server on :5177, Lighthouse 12 (mobile), ffmpeg/ffprobe.
`browser-qa.mjs` did not run: it returned NEED_SETUP because bundled chromium-1134 is missing. My own Playwright scripts covered the same checks.

## Round 0 (original) gate verdicts

| Gate | Verdict | Evidence |
|---|---|---|
| G1 Anti-slop (13 detectors) | **PASS (warnings)** | V1–V6, C2, C3, M2 pass. C1 ("Elevation") and M1 (scroll intro) are exempt by brief. C4 minor: "01 HOOK" beat label is shown to users. M3 warn: three animations run at once on Week. |
| G2 Bug-hunter | **FAIL** | 1 block (SW cache poisoning), 4 major. KPI matches Code.gs, e1RM is correct, lbs maths is correct, the outbox works offline, SW scope is OK, contrast of --text on --accent-soft is 11.28 (dark) and 15.49 (light), and the console is clean. |
| G3 Perf/a11y | **FAIL** | App: perf 89/89, a11y/BP/SEO 100, LCP 3.0 s against a 2.5 s budget. Intro: perf 74/76, LCP 4.2 s, TBT 270 ms, initial JS about 258 KB against a 250 KB budget. Reduced motion, focus rings and the dialog all pass. Some targets are under 44 px. |
| G4 UX laws | **PASS (partials)** | `UX_LAWS_AUDIT.md`: 8 pass, 5 partial, 1 fail (Doherty, the same root cause as the G3 LCP failure). |
| G5 Reel qa-rubric | **FAIL** | h264, 1080x1920, 60 fps, 15 s; no audio (exempt by brief); no Math.random. Collision frame at 1.65–1.9 s. Determinism check is **BLOCKED**: write scope forbids rendering into `hyperframes/`. |

Short-hold warnings on the reel:
- "8 × 82.5 kg" holds 0.5 s. Accepted, because the PR beat repeats it.
- Share-card VOLUME holds 1.06 s. Minor: add about 0.4 s.

## Builder known issues: adjudication

| Issue | Ruling |
|---|---|
| Undo gives the restored set a new ID | Accepted, per COPY.md:229. The duplicate set number it causes is a separate major bug (A2-6). |
| 62.5 truncation | Confirmed major (A2-3). |
| Status strings missing from COPY.md | Confirmed minor (A9-1). |
| "Connect sheet" vs "Connect my sheet" | Minor. Align COPY.md to the brief's "Connect sheet" (A9-2). |
| Share-canvas literal #07090A, and literal intro durations | Minor drift (A2-14, S-3). |

## FIX LIST

### A2 app (index.html/styles.css/app.js/sw.js)
| # | Sev | File:line | Repro | Expected |
|---|---|---|---|---|
| 1 | block | sw.js navigate handler (`c.put('./index.html', copy)`) | Visit `/intro/`, go offline, open `/`. The intro HTML is served: the cached index.html is 5059 B, the app's is 10285 B. | Cache each navigation under its own request URL (`c.put(req, copy)`). Never overwrite the app shell with another page. |
| 2 | block | index.html:14, :101; styles.css | Lighthouse mobile shows LCP 3.0 s. | LCP ≤ 2.5 s. Add `defer` to app.js, load fonts without blocking (preload + `display=swap`), and inline the critical tokens. |
| 3 | major | styles.css:39 `.two`, :197 `.stepper`; app.js:476 | At 390 px, enter 162.5. The input is 51 px wide (scrollWidth 85) and the value is cut. At 320 px it is 18 px wide. | Stack Reps and Weight below 480 px. The full value stays visible at 320. |
| 4 | major | styles.css:43 `.top`, :57 `.top-actions` | At 320 px, every route scrolls sideways (scrollWidth 322). | No horizontal overflow at 320. |
| 5 | major | app.js:919-933 logSet | Submit the Log form, then check `document.activeElement`. Focus is on BODY. | Focus returns to the Log button, or moves to the new set row. |
| 6 | major | app.js:935-947 removeSet/undo; :142 applyLocal | Delete set #2 of 3, then Undo. The list shows "#3" twice. | Number sets by order, not by count + 1, or restore the original number. |
| 7 | major | app.js:195-222 flush, :287 write | Static read, not reproduced live. Delete a tmp set while its POST is in flight. The filter shortens the outbox, then `outbox.shift()` removes the wrong item. | Remove items by ID after success, not with `shift()`. |
| 8 | minor | styles.css:280 `.cal button` | Calendar day cells are 41 px wide at 360. Prev/next buttons are 43 px at 320. | ≥ 44 px, or show the day list below 380. |
| 9 | minor | styles.css:219 `.verdict` | The verdict chip is 52x32. | Hit area ≥ 44 px tall, or the chip is not interactive. |
| 10 | minor | app.js:7 LB / conversion | 100 lbs → 45.4 kg → 100.1 lbs. | Keep the value as entered and convert only for display. No drift after toggling units. |
| 11 | minor | app.js:1110-1113 | On first load with no lastEx, the fields are empty while the LAST strip shows 8 × 62.5. | Prefill from the resolved exercise, as the intro promises. |
| 12 | minor | styles.css:286 `small`, :325 `.bar span` | Text is 10 px. | ≥ 12 px. |
| 13 | minor | Charts history dates | In light theme at 390, dates wrap mid-date. | `white-space:nowrap` |
| 14 | minor | styles.css:372 | Share canvas uses the literal #07090A. | Use a token. |
| 15 | minor | styles.css:129, :314, :324 | Week runs viewIn, reveal and grow at the same time (M3). | Stagger them, or drop one. |

### scrollme (intro/)
| # | Sev | File:line | Repro | Expected |
|---|---|---|---|---|
| S-1 | block | intro/index.html:14; intro/intro.js:3 | Lighthouse mobile: LCP 4.2 s, TBT 270 ms. | LCP ≤ 2.5 s. Fonts should not block rendering, and the hero text should paint before three.js loads. |
| S-2 | major | intro/intro.js:3 | three.module.js 0.160.0 transfers 250 KB, putting initial JS at about 258 KB. | Use `three.module.min.js` or load it lazily, keeping initial JS ≤ 250 KB. |
| S-3 | minor | intro/intro.css:37-41, 47, 110, 137, 145, 148 | Durations and easings are literal values. | Use the `--dur-*` and `--ease-out` tokens. |
| S-4 | minor | intro/index.html:33, :60 | The internal beat label "01 HOOK" is visible (C4). | Remove it, or show it to screen readers only. |

### designme (hyperframes/)
| # | Sev | File:line | Repro | Expected |
|---|---|---|---|---|
| D-1 | major | hyperframes/index.html:20 `.phone` and hook exit | At 1.65–1.9 s, "LIFT. LOG. CLIMB." shows through the phone card (`reel/strip2.png`). | The hook has fully left before the phone enters, or the card is opaque. |
| D-2 | minor | hyperframes/index.html:84 | PROGRESS shows while SCORE counts up from +0. | Finish the count before PROGRESS stamps, or start the count above +2. |
| D-3 | minor | reel copy | "PUSH DAY" does not match the app's Upper/Lower splits. | Use "UPPER". |
| D-4 | minor | reel copy | "WEEK 32" does not match the app's "WEEK OF <date>". | Match the app format. Also add about 0.4 s to the VOLUME hold. |

### A9 copy (copy/COPY.md)
| # | Sev | Item | Expected |
|---|---|---|---|
| A9-1 | minor | Status strings that are used but not listed: "Set logged.", "Machine added.", "New PR", "Synced/Saving/Offline/Demo", "No sets yet on this machine". | Add them to COPY.md. |
| A9-2 | minor | COPY.md:252 "Connect my sheet" vs intro "Connect sheet". | Align COPY.md to "Connect sheet". |
| A9-3 | minor | COPY.md:241 "01 HOOK" written as visible text. | Mark it as an internal label. Optional: add a BASELINE cue such as "x of N sessions to first score". |

### Code.gs (only if real bug)
None. The weekly KPI formula, the verdict thresholds and BASELINE all match the client.
