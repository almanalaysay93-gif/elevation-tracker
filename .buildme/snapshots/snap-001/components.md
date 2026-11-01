# Component inventory snap-001 (post-build)

Each row is one CSS rule. "Tokens" lists the `--*` tokens bound by that rule. A rule with no tokens is a literal-only rule, see drift.md / delta.md.
Scanner: 258 rules (styles.css 202, intro/intro.css 56).

## styles.css :: Start

| Line | Selector | Tokens bound |
|---|---|---|
| 1 | `*, *::before, *::after` | **none (literal)** |
| 3 | `html` | **none (literal)** |
| 4 | `body` | `--bg`, `--text`, `--font-body`, `--fs-base`, `--lh-body`, `--tabbar-total`, `--s-5` |
| 15 | `h1, h2, h3` | `--font-display`, `--lh-snug` |
| 16 | `h1` | `--fs-2xl`, `--ls-display`, `--s-4`, `--s-3` |
| 17 | `h2` | `--fs-lg`, `--ls-button` |
| 18 | `p` | **none (literal)** |
| 19 | `a` | `--text` |
| 20 | `button, input, select` | **none (literal)** |
| 21 | `button` | **none (literal)** |
| 22 | `:focus-visible` | `--focus` |
| 23 | `[hidden]` | **none (literal)** |
| 24 | `.sr-only` | **none (literal)** |
| 26 | `.skip` | `--s-4`, `--accent`, `--accent-ink`, `--s-2`, `--r-md` |
| 27 | `.skip:focus` | `--s-2` |
| 28 | `.sprite` | **none (literal)** |
| 29 | `.i` | **none (literal)** |
| 30 | `.mono` | `--font-mono` |
| 31 | `.muted` | `--muted` |
| 32 | `.up` | `--accent` |
| 33 | `.down` | `--danger` |
| 34 | `.hint` | `--muted`, `--fs-sm` |
| 35 | `.row` | `--s-2` |
| 36 | `.between` | **none (literal)** |
| 37 | `.stack` | `--s-4` |
| 38 | `.two` | `--s-3` |
| 39 | `.empty` | `--muted`, `--s-5`, `--s-2` |
| 40 | `.top` | `--header-h`, `--gutter`, `--bg`, `--line` |
| 50 | `.brand` | `--font-display`, `--ls-wordmark`, `--fs-base`, `--s-2`, `--touch-min` |
| 55 | `.brand-mark` | `--accent` |
| 56 | `.top-actions` | `--s-1` |
| 57 | `.sync` | `--s-1`, `--muted` |
| 61 | `.sync[data-state="synced"]` | `--accent` |
| 62 | `.sync[data-state="pending"]` | `--signal` |
| 63 | `.sync[data-state="offline"]` | `--danger` |
| 64 | `.sync[data-state="demo"]` | `--warn` |
| 66 | `.icon-btn, .chip, .btn, .step, .seg > button, .unit-row > button` | `--touch-min`, `--s-2`, `--control`, `--surface-2`, `--text`, `--r-md`, `--font-display`, `--ls-button`, `--dur-fast`, `--ease-out` |
| 79 | `.icon-btn` | `--touch-min` |
| 80 | `.chip` | `--s-3`, `--r-pill`, `--fs-sm` |
| 81 | `.chip[aria-pressed="true"], .chip[aria-checked="true"]` | `--accent`, `--accent-ink` |
| 82 | `.icon-btn:active, .chip:active, .btn:active, .step:active, .seg > button:active` | `--motion-press-scale` |
| 83 | `.banner` | `--s-2`, `--s-3`, `--gutter`, `--surface-2`, `--warn`, `--r-md`, `--fs-sm` |
| 93 | `.banner .i` | `--warn` |
| 94 | `.nav` | `--tabbar-total`, `--surface`, `--line` |
| 104 | `.nav a` | `--touch-min`, `--muted`, `--font-display`, `--fs-xs`, `--ls-button` |
| 112 | `.nav a[aria-current="page"]` | `--text` |
| 113 | `.nav a[aria-current="page"] .i` | `--accent` |
| 114 | `.nav .rail` | **none (literal)** |
| 115 | `.nav-setup` | **none (literal)** |
| 116 | `.lbl-short` | **none (literal)** |
| 118 | `.lbl-long` | **none (literal)** |
| 119 | `.lbl-short` | **none (literal)** |
| 121 | `main` | `--s-2`, `--gutter`, `--content-max` |
| 124 | `main:focus` | **none (literal)** |
| 125 | `.status` | `--muted`, `--fs-sm`, `--font-mono` |
| 126 | `.status:not(:empty)` | `--s-2` |
| 127 | `.status.err` | `--danger` |
| 128 | `.view` | `--dur-base`, `--ease-out` |
| 130 | `.card` | `--surface`, `--elev-1`, `--s-4`, `--s-3` |
| 137 | `.card > summary` | `--font-display`, `--touch-min` |
| 138 | `.card details > summary, details > summary` | `--touch-min`, `--font-display`, `--ls-button` |
| 139 | `.field > label, .label` | `--s-1`, `--font-display`, `--fs-xs`, `--ls-label`, `--muted` |
| 145 | `input, select` | `--touch-min`, `--s-3`, `--surface-2`, `--control`, `--r-md`, `--fs-base` |
| 153 | `input[type="date"]` | `--font-mono` |
| 154 | `input[type="number"]` | `--font-mono` |
| 155 | `select option, select optgroup` | `--surface`, `--text` |
| 156 | `.btn` | `--s-4`, `--surface-2` |
| 158 | `.btn.primary` | `--accent`, `--accent-ink`, `--clip-cut` |
| 159 | `.btn.ghost, .btn.tertiary` | **none (literal)** |
| 160 | `.btn.wide` | **none (literal)** |
| 161 | `.btn.cta` | `--cta-h`, `--fs-lg`, `--tabbar-total`, `--s-2` |
| 162 | `.btn[disabled]` | **none (literal)** |
| 163 | `.meta-row` | `--s-2`, `--s-3` |
| 166 | `.ex-row` | `--touch-min`, `--s-2` |
| 167 | `.star` | `--touch-min`, `--control`, `--r-md`, `--muted` |
| 168 | `.star[aria-pressed="true"]` | `--accent` |
| 169 | `.star.pop .i` | `--dur-slow`, `--ease-snap` |
| 171 | `.strip` | `--s-2`, `--s-4`, `--line`, `--font-mono`, `--fs-sm` |
| 178 | `.strip .k` | `--font-display`, `--fs-xs`, `--ls-label`, `--muted`, `--s-1` |
| 179 | `.pr-chip` | `--s-3`, `--accent`, `--accent-ink`, `--font-display`, `--ls-button`, `--r-sm` |
| 186 | `.pr-chip.stamp::after` | `--text`, `--motion-scan-duration`, `--ease-out` |
| 193 | `.pr-chip.stamp` | `--dur-slow`, `--ease-snap` |
| 195 | `.stepper` | `--touch-min`, `--s-1` |
| 197 | `.step` | `--touch-min`, `--fs-xl`, `--font-mono` |
| 198 | `.stepper input` | `--fs-xl` |
| 199 | `.unit-row` | `--s-2` |
| 200 | `.unit-row > button` | `--touch-min`, `--s-3`, `--r-pill`, `--fs-sm` |
| 201 | `.unit-row .conv` | `--font-mono`, `--muted`, `--fs-sm` |
| 202 | `.unit-row > button[aria-checked="true"]` | `--accent`, `--accent-ink` |
| 203 | `.seg` | `--s-2` |
| 205 | `.seg > button` | `--s-2` |
| 206 | `.seg > button[aria-checked="true"]` | `--accent`, `--accent-ink` |
| 207 | `.tag` | `--s-2`, `--s-1`, `--control`, `--r-pill`, `--font-display`, `--fs-xs`, `--ls-button`, `--text` |
| 214 | `.tag.Hard` | `--danger`, `--danger-soft` |
| 215 | `.tag.Med` | `--signal`, `--signal-soft` |
| 216 | `.tag.Easy` | `--control` |
| 217 | `.verdict` | `--s-3`, `--r-pill`, `--verdict-BASELINE`, `--font-display`, `--fs-sm`, `--ls-button`, `--text` |
| 224 | `.verdict.PROGRESS` | `--verdict-PROGRESS`, `--accent-soft` |
| 225 | `.verdict.HOLD` | `--verdict-HOLD`, `--signal-soft` |
| 226 | `.verdict.DIP` | `--verdict-DIP`, `--danger-soft` |
| 227 | `.verdict.BASELINE` | `--surface-2` |
| 228 | `.sets` | **none (literal)** |
| 230 | `.sets li` | `--s-3`, `--line` |
| 234 | `.sets li:last-child` | **none (literal)** |
| 235 | `.del` | `--touch-min`, `--control`, `--r-md`, `--muted` |
| 236 | `.del:hover` | `--danger` |
| 237 | `.h-row` | `--s-2` |
| 239 | `.search` | `--s-3` |
| 242 | `.fav-group` | `--s-5` |
| 243 | `.fav-group > h2` | `--s-3` |
| 244 | `.grid` | `--s-3` |
| 245 | `.fav-card` | `--s-1`, `--surface`, `--line`, `--r-none`, `--s-4`, `--touch-min`, `--text` |
| 251 | `.fav-card .name` | `--font-display`, `--fs-lg` |
| 252 | `.fav-card .mach` | `--muted`, `--fs-sm` |
| 253 | `.fav-card .mono` | `--fs-sm` |
| 254 | `.spark` | `--s-1` |
| 255 | `.spark .line` | `--accent` |
| 256 | `.scroller` | `--s-2` |
| 259 | `.scroller > *` | **none (literal)** |
| 260 | `.range` | `--s-3` |
| 261 | `.chart` | `--chart-h` |
| 262 | `.chart text` | `--font-mono`, `--muted` |
| 263 | `.chart .grid-l` | `--line` |
| 264 | `.chart .line` | `--accent` |
| 265 | `.chart .line2` | `--signal` |
| 266 | `.legend` | `--s-4`, `--fs-sm`, `--muted`, `--s-2` |
| 267 | `.legend i` | `--s-1` |
| 268 | `.kpi-grid` | `--s-3` |
| 269 | `.kpi-grid .card` | **none (literal)** |
| 270 | `.stat` | `--font-display`, `--fs-xl`, `--lh-tight` |
| 271 | `.stat small` | `--font-mono`, `--fs-sm`, `--muted`, `--s-1` |
| 272 | `.kicker` | `--font-display`, `--fs-xs`, `--ls-label`, `--muted` |
| 273 | `.cal-head` | `--s-2`, `--s-3` |
| 276 | `.cal-head h2` | `--fs-lg` |
| 277 | `.cal` | **none (literal)** |
| 278 | `.cal .dow` | `--font-display`, `--fs-xs`, `--muted`, `--s-1` |
| 279 | `.cal button` | `--cal-cell`, `--s-1`, `--surface-2`, `--text`, `--font-mono`, `--fs-sm`, `--r-sm` |
| 285 | `.cal button small` | `--font-display`, `--ls-button`, `--muted` |
| 286 | `.cal button.out` | **none (literal)** |
| 287 | `.cal button.done` | `--accent-soft` |
| 288 | `.cal button.plan` | `--signal` |
| 289 | `.cal button.today` | `--focus` |
| 290 | `.cal button[aria-selected="true"]` | `--text` |
| 291 | `.daylist` | **none (literal)** |
| 292 | `.day-panel` | `--s-3` |
| 293 | `.day-panel .sets li` | **none (literal)** |
| 296 | `.cal` | **none (literal)** |
| 297 | `.daylist` | **none (literal)** |
| 298 | `.daylist button` | `--touch-min`, `--s-3`, `--surface-2`, `--text`, `--font-mono`, `--line` |
| 303 | `.daylist button.done` | `--accent-soft` |
| 304 | `.daylist button.plan .split` | `--signal` |
| 305 | `.daylist button[aria-selected="true"]` | `--text` |
| 307 | `.hero` | `--s-5`, `--s-4` |
| 310 | `.hero .verdict-word` | `--font-display`, `--fs-3xl`, `--lh-tight`, `--ls-display`, `--dur-slow`, `--ease-snap` |
| 315 | `.hero .verdict-word.PROGRESS` | `--verdict-PROGRESS` |
| 316 | `.hero .verdict-word.HOLD` | `--verdict-HOLD` |
| 317 | `.hero .verdict-word.DIP` | `--verdict-DIP` |
| 318 | `.hero .verdict-word.BASELINE` | `--verdict-BASELINE` |
| 319 | `.hero .score` | `--font-mono`, `--fs-hero`, `--lh-tight` |
| 321 | `.bars` | `--s-2`, `--s-4` |
| 322 | `.bar` | `--s-1` |
| 323 | `.bar i` | `--signal`, `--dur-slow`, `--ease-out` |
| 324 | `.bar.cur i` | `--accent` |
| 325 | `.bar span` | `--font-mono`, `--muted` |
| 327 | `.week-h` | `--s-2` |
| 329 | `details summary` | **none (literal)** |
| 330 | `details summary::-webkit-details-marker` | **none (literal)** |
| 331 | `.plan-list li` | `--s-3`, `--line` |
| 334 | `.setup-links` | `--s-4`, `--s-3` |
| 335 | `.setup-links a` | `--touch-min`, `--text`, `--font-display`, `--ls-button` |
| 336 | `.toast` | `--gutter`, `--tabbar-total`, `--s-3`, `--s-4`, `--surface-2`, `--control`, `--r-md`, `--elev-float`, `--motion-toast-distance`, `--dur-base`, `--ease-out` |
| 351 | `.toast.show` | **none (literal)** |
| 352 | `.toast .btn.tertiary` | `--touch-min`, `--accent`, `--s-2` |
| 353 | `.toast[hidden]` | **none (literal)** |
| 354 | `.sheet-dialog` | `--s-4`, `--surface`, `--text`, `--line`, `--r-none`, `--elev-float` |
| 367 | `.sheet-dialog::backdrop` | `--scrim` |
| 368 | `.sheet-dialog[open]` | `--dur-base`, `--ease-out` |
| 369 | `.dlg-head` | `--s-3` |
| 370 | `.dlg-head h2` | `--fs-lg` |
| 371 | `.share-canvas` | `--line` |
| 372 | `.share-row` | `--s-3` |
| 373 | `.share-row .btn` | **none (literal)** |
| 374 | `#shareStatus` | `--s-2` |
| 378 | `.kpi-grid` | **none (literal)** |
| 379 | `.grid` | **none (literal)** |
| 380 | `.two` | `--s-4` |
| 384 | `body` | `--s-7`, `--rail-w` |
| 385 | `.top` | `--rail-w`, `--s-5` |
| 386 | `.top` | **none (literal)** |
| 387 | `.nav` | `--rail-w`, `--s-5`, `--s-1`, `--line` |
| 392 | `.nav a` | **none (literal)** |
| 393 | `.nav .rail` | `--accent`, `--dur-base`, `--ease-out` |
| 394 | `.nav-setup` | **none (literal)** |
| 395 | `main` | `--s-4`, `--s-5` |
| 396 | `.toast` | `--rail-w`, `--s-5` |
| 397 | `.btn.cta` | **none (literal)** |
| 398 | `.chart` | **none (literal)** |
| 399 | `.cal button` | **none (literal)** |
| 400 | `.bars` | **none (literal)** |
| 404 | `main` | `--s-6` |
| 408 | `.sync[data-state="pending"]` | **none (literal)** |
| 409 | `.bar i` | **none (literal)** |

## intro/intro.css :: Intro

| Line | Selector | Tokens bound |
|---|---|---|
| 1 | `*, *::before, *::after` | **none (literal)** |
| 5 | `html` | `--bg` |
| 7 | `:root:not([data-theme="dark"])` | **none (literal)** |
| 8 | `:root[data-theme="light"]` | **none (literal)** |
| 9 | `body` | `--bg`, `--text`, `--font-body`, `--fs-base` |
| 22 | `h1, h2` | `--font-display` |
| 24 | `h1` | **none (literal)** |
| 25 | `h2` | **none (literal)** |
| 26 | `p` | **none (literal)** |
| 27 | `:focus-visible` | `--focus` |
| 29 | `.sr-only` | **none (literal)** |
| 34 | `.skip` | `--surface`, `--text`, `--control` |
| 40 | `.skip:focus` | **none (literal)** |
| 41 | `.top` | `--bg`, `--line` |
| 50 | `.brand` | `--text`, `--font-display`, `--fs-sm` |
| 55 | `.brand-mark` | `--accent` |
| 56 | `.progress` | **none (literal)** |
| 57 | `.progress a` | `--font-mono`, `--fs-xs`, `--muted` |
| 62 | `.progress a[aria-current="true"]` | `--accent` |
| 63 | `.stage` | `--bg` |
| 70 | `.stage-art` | **none (literal)** |
| 71 | `#heroCanvas` | **none (literal)** |
| 72 | `html.webgl #heroCanvas` | **none (literal)** |
| 73 | `.fallback` | **none (literal)** |
| 78 | `html.webgl .fallback` | **none (literal)** |
| 79 | `.fb-ring` | `--signal` |
| 83 | `.fb-row` | **none (literal)** |
| 84 | `.fb-bar` | `--accent` |
| 85 | `.fb-stack` | **none (literal)** |
| 86 | `.fb-stack span` | `--signal`, `--surface` |
| 89 | `.fb-stack span:nth-child(1), .fb-stack span:nth-child(5)` | **none (literal)** |
| 90 | `.fb-stack span:nth-child(2), .fb-stack span:nth-child(4)` | **none (literal)** |
| 91 | `.fb-stack span:nth-child(3)` | `--accent-soft`, `--accent` |
| 92 | `.fb-l` | **none (literal)** |
| 93 | `.fb-r` | **none (literal)** |
| 94 | `.story` | **none (literal)** |
| 97 | `.beats` | **none (literal)** |
| 98 | `.beat` | **none (literal)** |
| 104 | `.panel` | `--surface`, `--line` |
| 111 | `.panel--primary` | `--control` |
| 112 | `.panel p + p, .panel h1 + p, .panel h2 + p` | **none (literal)** |
| 113 | `.panel p` | `--text` |
| 114 | `.label` | `--font-mono`, `--fs-xs`, `--accent` |
| 118 | `.actions` | **none (literal)** |
| 120 | `.btn` | `--font-display`, `--fs-sm`, `--text`, `--control` |
| 129 | `.btn--primary` | `--accent`, `--accent-ink` |
| 130 | `.btn--ghost` | `--surface-2` |
| 131 | `html.js .beat .panel` | **none (literal)** |
| 138 | `html.js .beat.in .panel` | **none (literal)** |
| 139 | `html.rm .beat .panel, html.js.rm .beat .panel` | **none (literal)** |
| 147 | `html.js .beat .panel` | **none (literal)** |
| 148 | `html .btn` | **none (literal)** |
| 153 | `.top` | **none (literal)** |
| 154 | `.beat` | **none (literal)** |
| 155 | `.panel` | **none (literal)** |
| 156 | `.fb-row` | **none (literal)** |

## Token blast radius (references per token)

| Token | styles.css rules | intro.css rules | Defined |
|---|---|---|---|
| `--accent` | 21 | 8 | yes |
| `--accent-ink` | 6 | 1 | yes |
| `--accent-soft` | 3 | 1 | yes |
| `--bg` | 2 | 5 | yes |
| `--cal-cell` | 1 | 0 | yes |
| `--chart-h` | 1 | 0 | yes |
| `--chip-h` | 0 | 0 | yes |
| `--clip-cut` | 1 | 0 | yes |
| `--content-max` | 1 | 0 | yes |
| `--control` | 7 | 3 | yes |
| `--cta-h` | 1 | 0 | yes |
| `--cut` | 0 | 0 | yes |
| `--danger` | 6 | 0 | yes |
| `--danger-soft` | 2 | 0 | yes |
| `--dur-base` | 5 | 0 | yes |
| `--dur-fast` | 2 | 0 | yes |
| `--dur-hero` | 0 | 0 | yes |
| `--dur-instant` | 0 | 0 | yes |
| `--dur-slow` | 4 | 0 | yes |
| `--ease-in-out` | 0 | 0 | yes |
| `--ease-out` | 9 | 0 | yes |
| `--ease-snap` | 3 | 0 | yes |
| `--elev-0` | 0 | 0 | yes |
| `--elev-1` | 1 | 0 | yes |
| `--elev-float` | 2 | 0 | yes |
| `--elev-glow` | 0 | 0 | yes |
| `--focus` | 2 | 1 | yes |
| `--font-body` | 1 | 1 | yes |
| `--font-display` | 18 | 3 | yes |
| `--font-mono` | 13 | 2 | yes |
| `--fs-2xl` | 1 | 0 | yes |
| `--fs-3xl` | 1 | 0 | yes |
| `--fs-base` | 3 | 1 | yes |
| `--fs-hero` | 1 | 0 | yes |
| `--fs-lg` | 5 | 0 | yes |
| `--fs-share` | 0 | 0 | yes |
| `--fs-sm` | 13 | 2 | yes |
| `--fs-xl` | 3 | 0 | yes |
| `--fs-xs` | 6 | 2 | yes |
| `--glow` | 0 | 0 | yes |
| `--glow-max-alpha` | 0 | 0 | yes |
| `--gutter` | 5 | 0 | yes |
| `--header-h` | 1 | 0 | yes |
| `--lh-body` | 1 | 0 | yes |
| `--lh-snug` | 1 | 0 | yes |
| `--lh-tight` | 3 | 0 | yes |
| `--line` | 12 | 2 | yes |
| `--ls-button` | 9 | 0 | yes |
| `--ls-display` | 2 | 0 | yes |
| `--ls-label` | 3 | 0 | yes |
| `--ls-wordmark` | 1 | 0 | yes |
| `--motion-chip-from` | 1 | 0 | yes |
| `--motion-distance` | 1 | 0 | yes |
| `--motion-press-scale` | 1 | 0 | yes |
| `--motion-scan-duration` | 1 | 0 | yes |
| `--motion-scrim-alpha` | 0 | 0 | yes |
| `--motion-star-peak` | 1 | 0 | yes |
| `--motion-tab-shift` | 1 | 0 | yes |
| `--motion-toast-distance` | 1 | 0 | yes |
| `--muted` | 19 | 1 | yes |
| `--r-md` | 7 | 0 | yes |
| `--r-none` | 2 | 0 | yes |
| `--r-pill` | 4 | 0 | yes |
| `--r-sm` | 2 | 0 | yes |
| `--rail-w` | 4 | 0 | yes |
| `--s-0` | 0 | 0 | yes |
| `--s-1` | 14 | 0 | yes |
| `--s-2` | 29 | 0 | yes |
| `--s-3` | 29 | 0 | yes |
| `--s-4` | 16 | 0 | yes |
| `--s-5` | 10 | 0 | yes |
| `--s-6` | 2 | 0 | yes |
| `--s-7` | 1 | 0 | yes |
| `--s-8` | 0 | 0 | yes |
| `--scrim` | 1 | 0 | yes |
| `--signal` | 6 | 2 | yes |
| `--signal-soft` | 2 | 0 | yes |
| `--stepper-btn` | 0 | 0 | yes |
| `--surface` | 5 | 3 | yes |
| `--surface-2` | 8 | 1 | yes |
| `--tabbar-h` | 0 | 0 | yes |
| `--tabbar-total` | 4 | 0 | yes |
| `--text` | 15 | 5 | yes |
| `--touch-min` | 20 | 0 | yes |
| `--verdict-BASELINE` | 2 | 0 | yes |
| `--verdict-DIP` | 2 | 0 | yes |
| `--verdict-HOLD` | 2 | 0 | yes |
| `--verdict-PROGRESS` | 2 | 0 | yes |
| `--warn` | 3 | 0 | yes |

Defined but unreferenced by styles.css or intro.css: `--glow`, `--glow-max-alpha`, `--elev-0`, `--elev-glow`, `--fs-share`, `--s-0`, `--s-8`, `--cut`, `--stepper-btn`, `--tabbar-h`, `--chip-h`, `--dur-instant`, `--dur-hero`, `--ease-in-out`, `--motion-scrim-alpha`
Referenced but undefined in tokens.css: none
