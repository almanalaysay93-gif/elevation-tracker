# v3-7 QA evidence: phone spacing + claymorphism + logo palette

## Ran
- Populated route check (seeded 324 rows, 12 weeks), Log / Progress / Week / Calendar / Favorites at 320, 360, 390px: no horizontal overflow, no console or page errors.
- Sibling-block gap and overlap measurement (gaps-v37.mjs), hidden `<details>` excluded: 0 overlaps on every route at 320/360/390. Minimum vertical gap 16px or more (Log 24px).
  - The earlier overlap readings (Week "Per exercise" list, Log fields over "Sets on") came from measuring closed `<details>` content. Those boxes are not rendered, so they are not real overlaps.
- Contrast (computed from the hex values in tokens.css, WCAG relative luminance, 20 pairs, both themes): every pair >= 4.5:1. Lowest: dark accentText on bg 6.20, dark accentInk on accent 5.85, light danger on surface 5.72, light warn on surface 5.93. Text and muted pairs are all above 8:1.
- Light theme (data-theme="light", 390px): background rgb(236,233,230) = #ECE9E6 as specified, no overflow, no errors.
- Visual review of dark Log and Week at 390px (screenshots in scratchpad pop-v37).
- graphify update . (AST-only, completed).

## Not run / BLOCKED
- BLOCKED: Lighthouse / perf-a11y-auditor (Agent 10). Reason: not run this session; the free Chromium Lighthouse command is not set up here.
- NOT RUN: full bug-hunter browser-qa.mjs pass across all routes and keyboard-only walkthrough (Agent 8). Only the populated route check above was run.
- NOT RUN: 13-detector anti-slop pass (Agent 7) and UX_LAWS_AUDIT.md (14 laws).
- NOT RUN: designme style-spec.md, thesis.md, design-dna.json, motion-doctrine.md, and the claymorphism QA rubric. The clay direction was implemented directly in tokens.css and styles.css.
- NOT RUN: token snapshot snap-002 (Agent 12).
- Share-card PNG colour output not screenshotted after the token change.
