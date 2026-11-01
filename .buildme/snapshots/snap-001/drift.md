# Drift guard snap-001 (post-build)

Scope: `styles.css` and `intro/intro.css`. Hardcoded colours, sizes, durations and easings that bypass `tokens.css`.

- **BYPASS**: a token with that value exists for the property. Fix: replace the literal with the token. Counts as drift.
- **GAP**: no token exists. Not drift today. Needs a token added (or accepted) before it can be guarded.
- **Structural**: hairlines (1px), negative offsets, sr-only geometry. Excluded (no width tokens exist).

## Summary

| Measure | Count |
|---|---|
| **Drift findings (BYPASS, incl. colour)** | **26** |
| Colour literals (styles.css, intro/intro.css) | 1 |
| Size, duration, easing bypasses with a token | 36 |
| GAP: literal with no token | 48 |
| Structural (excluded) | 44 |
| Weight literals (low, no weight tokens) | 24 |
| z-index literals (low, no z tokens) | 9 |
| WebGL colours in intro/intro.js (info, cannot read CSS vars) | 6 |
| Inline style attributes in index.html, intro/index.html, app.js (info; app.js:662 is data-driven bar height) | 1 |

## Top drift (BYPASS), in priority order

Priority: colour > size tied to a component > duration/easing > chamfer. Full list below.

| Where | Literal | Property | Token | Line |
|---|---|---|---|---|
| styles.css:63 | `ease-in-out` | transition/animation | `--ease-in-out` | .sync[data-state="pending"] { background: var(--signal); animation: pulse 1.2s ease-in-out infinite; } |
| styles.css:263 | `12px` | font | `--fs-xs` | .chart text { font: 500 12px var(--font-mono); fill: var(--muted); } |
| styles.css:372 | `#07090A` | background | `--bg (dark) / --accent-ink (dark)` | .share-canvas { width: 100%; height: auto; aspect-ratio: 1080 / 1350; display: block; background: #07090A; bor |
| intro/intro.css:37 | `8px` | top | `--s-2` | position: absolute; left: -9999px; top: 8px; z-index: 30; |
| intro/intro.css:38 | `12px` | padding | `--s-3` | background: var(--surface); color: var(--text); padding: 12px 16px; |

## All BYPASS findings

| Where | Literal | Property | Token | Line |
|---|---|---|---|---|
| styles.css:63 | `ease-in-out` | transition/animation | `--ease-in-out` | .sync[data-state="pending"] { background: var(--signal); animation: pulse 1.2s ease-in-out infinite; } |
| styles.css:263 | `12px` | font | `--fs-xs` | .chart text { font: 500 12px var(--font-mono); fill: var(--muted); } |
| styles.css:372 | `#07090A` | background | `--bg (dark) / --accent-ink (dark)` | .share-canvas { width: 100%; height: auto; aspect-ratio: 1080 / 1350; display: block; background: #07090A; bor |
| intro/intro.css:37 | `8px` | top | `--s-2` | position: absolute; left: -9999px; top: 8px; z-index: 30; |
| intro/intro.css:38 | `12px` | padding | `--s-3` | background: var(--surface); color: var(--text); padding: 12px 16px; |
| intro/intro.css:38 | `16px` | padding | `--s-4` | background: var(--surface); color: var(--text); padding: 12px 16px; |
| intro/intro.css:41 | `16px` | left | `--s-4` | .skip:focus { left: 16px; } |
| intro/intro.css:47 | `8px` | gap | `--s-2` | gap: 8px; padding: 4px 12px; |
| intro/intro.css:47 | `4px` | padding | `--s-1` | gap: 8px; padding: 4px 12px; |
| intro/intro.css:47 | `12px` | padding | `--s-3` | gap: 8px; padding: 4px 12px; |
| intro/intro.css:52 | `8px` | gap | `--s-2` | display: inline-flex; align-items: center; gap: 8px; min-height: 48px; |
| intro/intro.css:86 | `4px` | gap | `--s-1` | .fb-stack { display: flex; gap: 4px; align-items: center; } |
| intro/intro.css:93 | `4px` | margin-right | `--s-1` | .fb-l { margin-right: 4px; } |
| intro/intro.css:94 | `4px` | margin-left | `--s-1` | .fb-r { margin-left: 4px; } |
| intro/intro.css:103 | `16px` | padding | `--s-4` | padding: 88px 16px 32px; |
| intro/intro.css:103 | `32px` | padding | `--s-6` | padding: 88px 16px 32px; |
| intro/intro.css:110 | `10px` | clip-path | `--cut` | clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); |
| intro/intro.css:113 | `12px` | margin-top | `--s-3` | .panel p + p, .panel h1 + p, .panel h2 + p { margin-top: 12px; } |
| intro/intro.css:120 | `12px` | gap | `--s-3` | .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; } |
| intro/intro.css:136 | `12px` | transform | `--s-3` | transform: translateY(12px); |
| intro/intro.css:137 | `ease-out` | transition/animation | `--ease-out` | transition: opacity 260ms ease-out, transform 260ms ease-out; |
| intro/intro.css:137 | `ease-out` | transition/animation | `--ease-out` | transition: opacity 260ms ease-out, transform 260ms ease-out; |
| intro/intro.css:145 | `120ms` | transition | `--dur-fast (reduced-motion value)` | transition: opacity 120ms linear !important; |
| intro/intro.css:148 | `120ms` | transition | `--dur-fast (reduced-motion value)` | html.js .beat .panel { transform: none; transition: opacity 120ms linear; } |
| intro/intro.css:154 | `4px` | padding | `--s-1` | .top { padding: 4px 32px; } |
| intro/intro.css:154 | `32px` | padding | `--s-6` | .top { padding: 4px 32px; } |

## GAP groups (no token exists; candidate token additions)

| File | Class | Group | Property | Count |
|---|---|---|---|---|
| styles.css | size | layout size | width | 5 |
| styles.css | size | layout size | height | 6 |
| styles.css | duration | duration | animation | 1 |
| styles.css | size | spacing | gap | 3 |
| styles.css | size | spacing | padding | 1 |
| styles.css | size | font-size | font-size | 2 |
| styles.css | size | layout size | max-width | 1 |
| intro/intro.css | size | font-size | font-size | 4 |
| intro/intro.css | letter-spacing | letter-spacing | letter-spacing | 3 |
| intro/intro.css | size | layout size | min-width | 1 |
| intro/intro.css | size | layout size | min-height | 1 |
| intro/intro.css | size | layout size | width | 3 |
| intro/intro.css | size | layout size | height | 4 |
| intro/intro.css | size | spacing | padding | 5 |
| intro/intro.css | size | layout size | max-width | 2 |
| intro/intro.css | size | spacing | margin-bottom | 1 |
| intro/intro.css | size | spacing | margin-top | 1 |
| intro/intro.css | size | chamfer | clip-path | 1 |
| intro/intro.css | duration | duration | transition | 1 |
| intro/intro.css | easing | easing | transition/animation | 2 |

## Structural (excluded)
44 hairline, negative and sr-only geometry lines. Not counted.

## Notes
- The drift guard is text-based. It reads literal values, not computed styles.
- `intro/intro.js` WebGL colours (#000000 line 94, #c6ff00 line 100, #00e5ff line 101, #0f1314 line 102, #ffffff line 134, #ffffff line 135) are not in scope, but they are the same palette as tokens. A runtime read of computed token values would remove them.
