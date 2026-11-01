# Fix round 1: A2 app (Agent 2+5)

Scope: the A2 app FIX LIST in QA_REPORT.md (block 1-2, major 3-7, minor 8-15). Files touched: index.html, styles.css, app.js, sw.js. SW cache bumped to `elevation-v2-2`.

## Repro results (Playwright, system Chrome, http://127.0.0.1:5178)

Harness: `scratchpad/fixr1/repro.cjs`. Result file: `scratchpad/fixr1/after2.json`. **16/16 checks pass.**

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | Block: SW overwrites shell on /intro/ | PASS | After /intro/ visit, cached `/index.html` is the app shell (contains `src="app.js"`, not the intro h1). Intro is passed through, not cached. |
| 2 | Block: LCP 3.0 s | PASS | Lighthouse 12 mobile on `/`: LCP 1.8 s (run 1), 1.8 s (run 2). Perf 98 both runs. Budget 2.5 s. |
| 3 | Major: "162.5" truncated at 390 | PASS | Log form stacks reps and weight under 480px (`.two.fields`). Weight input 222 px at 390, 152 px at 320, scrollWidth = clientWidth. |
| 4 | Major: horizontal overflow at 320 | PASS | scrollWidth 320 = clientWidth on all six routes. Header compacted under 360px. |
| 5 | Major: focus to BODY after logging a set | PASS | activeElement = `INPUT#fReps` after submit. `paint()` now restores focus to the same control when the view is unchanged. |
| 6 | Major: undo repeats set number | PASS | Set numbers after delete #2 + undo: #1, #2, #3. `Set` is renumbered by row order per day and machine (normalize, applyLocal, rebuild). |
| 7 | Major: flush shift() removes wrong item | PASS | Harness: delete the in-flight add while a second add is queued. Server rows = [6] (first add cancelled, second sent). Outbox removal is by id; see limitation below. |
| 8 | Minor: calendar cells and nav < 44 px | PASS | Under 380px the day list shows (rows 48 px). Prev/next at 320 are 48 px. |
| 9 | Minor: verdict chip < 44 px | PASS | Verdict chip 52x44 on Log. |
| 10 | Minor: lbs/kg drift on toggle | PASS | 100 lbs -> 45.4 kg -> 100 lbs. Conversion now starts from the typed value. |
| 11 | Minor: no prefill on first load | PASS | First load: reps 8, weight 62.5 (last set for the default exercise). |
| 12 | Minor: 10px text | PASS | Calendar small and week bar labels are 12 px (`--fs-xs`). |
| 13 | Minor: history dates wrap | PASS | History date spans `white-space: nowrap`, one line. |
| 14 | Minor: share canvas literal #07090A | PASS | No literal in styles.css or app.js. Share card colours come from theme tokens (see behaviour change). |
| 15 | Minor: Week animations overlap | PASS | Verdict reveal 0-280 ms, bars grow 280-560 ms. No cross-animation overlap. |

## Lighthouse (mobile, `/`)

| Run | Perf | LCP | FCP | TBT | Output |
|---|---|---|---|---|---|
| 1 | 98 | 1.8 s | 1.1 s | 40 ms | `scratchpad/fixr1/lh-after-1.json` |
| 2 | 98 | 1.8 s | 1.1 s | 70 ms | `scratchpad/fixr1/lh-after-2.json` |

## Behaviour changes and limits

- **Share card follows the active theme** (item 14). Colours are read from `--bg`, `--accent`, `--text`, `--muted`, `--surface-2` through `cssVar()`. In light mode the PNG is light. Cyan `--cyan` is a new local token in styles.css (dark #00E5FF, light #007A8A).
- **Outbox delete-in-flight (item 7)** is matched by heuristic. When a delete targets a row whose add is in flight, the delete is queued and its temp id is rebound to the server id after the add confirms. The match is by Date, Exercise, Reps and Weight among new rows. If two identical rows are queued at once, the bind can pick the wrong one. The repro covers the single-row case.
- **Tokens:** `tokens.css` was not touched. New local tokens in styles.css `:root`: `--hit` (44px), `--cyan`, `--pulse-dur`, `--pulse-low`.
- **Fonts (item 2):** Google Fonts stylesheet loads via preload + onload swap (display=swap kept). `app.js` is `defer`.
- **UX_LAWS_AUDIT.md** was not edited (not in the write list). Partials this round addresses: Doherty (LCP), touch targets (8, 9), focus (5), type size (12), overflow (4), feedback/undo (6). Owner should update the audit ratings.

## Gates

- Syntax: `node --check app.js` and `node --check sw.js` pass.
- graphify: see end of this file (updated after this write).
- graphify update . run after the edits: 2705 nodes, 3158 edges, 267 communities. Status: OK.
