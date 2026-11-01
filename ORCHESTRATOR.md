# ORCHESTRATOR — Elevation premium rebuild (checkpoint 1)

Orchestrator: Agent 0 (Opus 5.5, main session). Brief approved by user (see BUILD_BRIEF.md). v1 live: https://almanalaysay93-gif.github.io/elevation-tracker/

## Model routing
buildme + scrollme agents: haiku · designme agents: opus · orchestrator + checker: opus

## Waves and file ownership
| Wave | Agent | Model | Owns (writes) |
|---|---|---|---|
| 1 | buildme A15+A11 research | haiku | research/ |
| 1 | buildme A9 content-voice | haiku | VOICE.md, copy/COPY.md |
| 1 | designme design team (design-dna, visual-style, ui-ux-pro-max, motion-design, launch-director, genjutsu thesis) | opus | design/ |
| 2 | buildme A1+A2+A3+A4 design system | haiku | PRODUCT.md, DESIGN.md, tokens.css |
| 3 | buildme A2 frontend build + A5 motion | haiku | index.html, styles.css, app.js, icons/ |
| 3 | scrollme team (intro scroll story) | haiku | intro/ , BRIEF.md, PLAN.md, QC_REPORT.md |
| 3 | designme promo reel (hyperframes) | opus | hyperframes/ |
| 4 | buildme A12 token snapshots | haiku | .buildme/snapshots/ |
| 5 | Checker: A7 anti-slop, A8 bugs, A10 perf/a11y, UX laws, designme QA rubric | opus | .buildme/qa/, UX_LAWS_AUDIT.md, QA_REPORT.md |
| 6 | buildme A6 llms.txt + SEO | haiku | llms.txt, robots.txt, sitemap.xml, SEO_AUDIT.md |
| 7 | push + A13 post-launch monitor | haiku | monitor/MONITOR.md |

apps-script/Code.gs: frozen unless checker routes a bug. A14 (ADK): NOT_APPLICABLE — no in-product AI in brief.
Revision cap: 2 rounds per agent. Tiebreak: user brief → anti-slop → cited principle → ask user.

## Checkpoint 2 — Wave 1 partial
- A9 done: VOICE.md, copy/COPY.md. A15+A11 done: research/*.
- Decisions (orchestrator defaults): prefill last set + steppers + bottom Log button; verdict chip on Log, full on Week; share card shows lifts + verdict; add service worker (offline shell) + IndexedDB/localStorage outbox for POSTs.

## Checkpoint 3 — Wave 2 done, Wave 3 dispatched
- Wave 2 done: PRODUCT.md, DESIGN.md (taste gate 15/15), tokens.css (19 text pairs AA both themes), icons/.
- Handoff decisions: load Chakra 600 + Inter 500; "Cal" label <360px; add "Undo" toast string; draw show_chart/insights/filled-star SVGs inline; calendar day-list <360px; checker verifies --text on --accent-soft live.
- Wave 3 running in parallel: A2+A5 app rebuild (haiku; index.html, styles.css, app.js, sw.js, manifest.webmanifest, icons/) · scrollme intro (haiku; intro/) · designme reel (opus; hyperframes/).
- Next: Wave 4 A12 snapshots after A2+A5 returns.
