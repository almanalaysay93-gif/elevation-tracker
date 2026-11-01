# DESIGN.md: Elevation, Volt Telemetry design system

Owners: Agent 1 (look, hierarchy, component intent) and Agent 2 (tokens, layout, states). Agent 4 filled the states and touch targets. Agent 3's taste gate is appended at the end.
Source of truth: `design/design-dna.json`, `design/style-spec.md`, `design/motion-doctrine.md`, `design/directions.md`. Code: `tokens.css`. Icons: `icons/`. Copy: `copy/COPY.md`. Voice: `VOICE.md`. Product: `PRODUCT.md`.

If this file and `design/` disagree, `design/` wins and this file gets fixed.

---

## 1. Identity

**Primary style: Motorsport HUD / telemetry** (dark OLED instrument cluster). **Secondary: Swiss data brutalism** (strict grid, large tabular numerals, hairline rules). No third style.

One distinctive decision: **volt (#C6FF00) is the only light source.** It marks the one thing to do next, the active state, a PR, and PROGRESS. Everything else is grey-green carbon, numbers, and hairlines. The chamfered top-right corner is the only ornament, used on the primary panel and the LOG SET button. It carries information: it marks the primary surface.

Rules that follow from it:
- Volt covers 10% of any screen or less.
- No gradient except one radial volt glow at 14% alpha, used only on the Week verdict hero (max 18%).
- No glass, no blur, no drop-shadow on cards, no purple, no slate.
- Motion is a telemetry tick: snap in at 6px, numbers roll, one scanline for a PR. Nothing loops.

---

## 2. Colour roles

Values match `design-dna.json`. Dark is the default. The only change from design-dna is the new `--control` role, added because the design-dna `line` colour fails the 3:1 UI rule for control borders (see section 3).

| Role (token) | Dark | Light | Use |
|---|---|---|---|
| `--bg` | #07090A | #F2F4EE | Page background |
| `--surface` | #0F1314 | #FFFFFF | Panels, tab bar, header |
| `--surface-2` | #161C1E | #E8ECE4 | Inputs, fills, pressed and selected fills |
| `--line` | #253033 | #C9D1C6 | Decorative hairlines and dividers only |
| `--control` | #5E6E68 | #6B7872 | Borders of inputs, steppers, segmented control, unselected chips, secondary buttons, dashed empty boxes |
| `--text` | #EAF2EE | #0B100E | Body, values, headings |
| `--muted` | #8FA19A | #4F5C57 | Labels, units, helper text, out-of-month dates, BASELINE |
| `--accent` | #C6FF00 | #4D6B00 | Primary button fill, active state, PR, PROGRESS, focus ring, pinned star |
| `--accent-ink` | #07090A | #FFFFFF | Text on accent |
| `--signal` | #00E5FF | #00748A | Second chart series (dashed), HOLD, syncing, planned calendar ring |
| `--danger` | #FF4D6A | #C4183A | DIP, errors, offline, destructive actions |
| `--warn` | #FFB020 | #8A5A00 | Demo mode banner only |
| `--accent-soft` | rgb(198 255 0 / 15%) | rgb(77 107 0 / 15%) | Done calendar day fill, selected-state tints |
| `--signal-soft` | rgb(0 229 255 / 12%) | rgb(0 116 138 / 12%) | Chart area fill (second series) |
| `--danger-soft` | rgb(255 77 106 / 14%) | rgb(196 24 58 / 12%) | Destructive hover fill |
| `--scrim` | rgb(0 0 0 / 60%) | rgb(11 16 14 / 50%) | Sheet and dialog scrim |

Focus ring: `--focus` is `--accent` in both themes. Focus is never removed.

**Verdict mapping.** The colour follows the verdict word. Chips use the verdict colour as text and border on `--surface`, not on a tint (see section 3 for why).

| Verdict | Colour | Note |
|---|---|---|
| PROGRESS | `--accent` | |
| HOLD | `--signal` | Cyan. Not colour alone: the word is always shown |
| DIP | `--danger` | |
| BASELINE | `--muted` | Neutral. First logged week is not a verdict. v1 used cyan; changed so cyan means HOLD only |

**Volt budget.** A Log screen with the LOG SET button, one active tab rail, one selected chip and one stepper focus is well under 10%. The Week hero glow is the only large volt area, and it is 14% alpha.

---

## 3. Contrast (WCAG 2.2 AA)

Ratios computed with the WCAG relative-luminance formula, (L1 + 0.05) / (L2 + 0.05). Text needs 4.5:1. Large text (24px+, or 18.66px bold) and non-text UI (control borders, focus rings, chart series, icons that carry meaning) need 3:1.

### Text pairs (all must pass 4.5:1)

| Foreground | Background | Dark | Light | Result |
|---|---|---|---|---|
| `--text` | `--bg` | 17.51 | 17.31 | Pass |
| `--text` | `--surface` | 16.41 | 19.18 | Pass |
| `--text` | `--surface-2` | 15.12 | 16.03 | Pass |
| `--muted` | `--bg` | 7.35 | 6.31 | Pass |
| `--muted` | `--surface` | 6.88 | 7.00 | Pass |
| `--muted` | `--surface-2` | 6.34 | 5.85 | Pass |
| `--accent` | `--bg` | 16.82 | 5.54 | Pass |
| `--accent` | `--surface` | 15.76 | 6.14 | Pass |
| `--accent` | `--surface-2` | 14.52 | 5.13 | Pass |
| `--signal` | `--bg` | 12.97 | 4.90 | Pass |
| `--signal` | `--surface` | 12.15 | 5.43 | Pass |
| `--signal` | `--surface-2` | 11.20 | 4.54 | Pass (narrowest margin; do not lighten `--surface-2` in light) |
| `--danger` | `--bg` | 6.20 | 5.35 | Pass |
| `--danger` | `--surface` | 5.80 | 5.93 | Pass |
| `--danger` | `--surface-2` | 5.35 | 4.96 | Pass |
| `--warn` | `--bg` | 10.91 | 5.35 | Pass |
| `--warn` | `--surface` | 10.22 | 5.93 | Pass |
| `--warn` | `--surface-2` | 9.42 | 4.95 | Pass |
| `--accent-ink` | `--accent` (button text) | 16.82 | 6.14 | Pass |
| `--text` | `--accent-soft` on `--surface-2` (calendar done) | 13.2 est. | 13.17 | Pass (dark value is an estimate from the blended tint; verify in QA) |
| `--text` | `--danger-soft` on `--surface` | 14.09 | 15.65 | Pass |

No text pair failed. The one that failed in a first draft was verdict text on a tint: `--accent` on `--accent-soft` over `--surface-2` in light measured 4.22:1. Fix: verdict chips are now `--surface` with a 1px verdict-coloured border and verdict-coloured text. Tints only sit behind `--text`.

### Non-text pairs (3:1 for controls and meaningful UI)

| Element | Pair | Dark | Light | Result |
|---|---|---|---|---|
| Control border | `--control` on `--bg` | 3.71 | 4.16 | Pass |
| Control border | `--control` on `--surface` | 3.48 | 4.61 | Pass |
| Control border | `--control` on `--surface-2` | 3.20 | 3.85 | Pass |
| Focus ring | `--focus` on `--bg` | 16.82 | 5.54 | Pass |
| Focus ring | `--focus` on `--surface-2` | 14.52 | 5.13 | Pass |
| Verdict chip border | verdict colour on `--surface` | 5.80 to 15.76 | 5.43 to 6.14 | Pass |
| Chart series 1 | `--accent` on `--surface` | 15.76 | 6.14 | Pass |
| Chart series 2 | `--signal` on `--surface` | 12.15 | 5.43 | Pass |
| Planned calendar ring | `--signal` on `--bg` | 12.97 | 4.90 | Pass |
| Verdict bar fill | `--accent` on `--surface-2` (track) | 14.52 | 5.13 | Pass |
| `--line` (hairline) on `--bg` | decorative only | 1.47 | 1.41 | Not a control boundary. Exempt as decorative (WCAG 1.4.11). Never used to identify a control |
| `--line` on `--surface` | decorative only | 1.38 | 1.56 | Same |
| `--line` on `--surface-2` | decorative only | 1.27 | 1.31 | Same |

**Fix applied.** A first draft used `--line` for input, stepper, segmented and chip borders. It measured 1.27 to 1.56:1, which fails 1.4.11. Added `--control` (3.20 to 4.61:1). Every element that needs to be seen as a control now uses `--control`. `--line` stays for dividers and panel edges, where the text carries the meaning.

**Exempt.** Disabled controls (WCAG 1.4.3 exempts inactive components). They still use `--muted` text so they remain readable.

---

## 4. Typography

### Families

| Role | Family | Weights | Used for |
|---|---|---|---|
| Display | Chakra Petch | 600, 700 | Wordmark, uppercase labels, button text, verdict word, tab labels, screen headings |
| Body | Inter | 400, 500, 600 | Sentences, helper text, notes, list names |
| Numeric | JetBrains Mono | 500, 700 | Every number and unit. Always `font-variant-numeric: tabular-nums` |

Two families plus the mono numeric face. No third family. Nothing else is loaded.

**Build note for Agent 5.** The current `index.html` loads Chakra Petch 500/700, Inter 400/600 and JetBrains Mono 500/700. Design-dna asks for Chakra Petch 600, Inter 500 too. Change the Google Fonts URL when index.html is next edited. Not edited by this pass.

### Scale (px, from `--fs-*`)

| Token | px | Line height | Role |
|---|---|---|---|
| `--fs-xs` | 12 | 1.25 | Labels (uppercase, `--ls-label`), tab labels, chart axis text |
| `--fs-sm` | 14 | 1.5 | Helper text, meta, history lines |
| `--fs-base` | 16 | 1.5 | Body, inputs (never below 16 to stop iOS zoom), button text |
| `--fs-lg` | 20 | 1.25 | Stepper unit, delta, card titles |
| `--fs-xl` | 24 | 1.25 | Section headings, sheet title |
| `--fs-2xl` | 32 | 1.05 | Stepper value (reps), stat value, exercise name in Log |
| `--fs-3xl` | 44 | 1.05 | Verdict word, hero e1RM on Charts |
| `--fs-hero` | 64 | 1.05 | Weight numeral on Log, score on Week |
| `--fs-share` | 280 | canvas | Share card score only (canvas, not CSS) |

Rules:
- Headline is at least 2 times body size: 44 vs 16 on screen, 280 vs 16 on the share card.
- Numbers never use the body font. A number in a sentence is still mono.
- Labels: Chakra 600, 12px, uppercase, `--ls-label` (0.12em), `--muted`.
- Display headings: Chakra 700, `--ls-display`, `--lh-tight` for numerals and `--lh-snug` for words.
- Body line length at 390 is one column, full width. Max measure on desktop is 64ch.
- No centred paragraphs. Centred text only for single numerals or a verdict word.

---

## 5. Spacing, radius, elevation, layout

### Spacing (`--s-*`, px)

`0, 4, 8, 12, 16, 24, 32, 48, 64`. Every margin, padding and gap uses one of these. Literal values in components are a build failure.

### Radius and cut

| Token | Value | Applies to |
|---|---|---|
| `--r-none` | 0 | Panels, sheets, bars, bars' tracks, calendar cells |
| `--r-md` | 8 | Buttons, inputs, steppers, segmented control, toast |
| `--r-pill` | 999 | Chips (filter, verdict, PR) |
| `--cut` (10px) | chamfer | Primary panel (Week verdict, Log context) and the LOG SET button, top-right corner only |

Chamfer and focus: `clip-path` clips `outline`. On a chamfered element the focus ring is drawn with `box-shadow: inset 0 0 0 2px var(--focus)`, not outline. Regular controls use outline.

### Elevation

| Token | Use |
|---|---|
| `--elev-0` | Default |
| `--elev-1` | Inset hairline (panel edge) |
| `--elev-float` | Toast and sheet only, never on cards |
| `--elev-glow` | PR flash on the weight panel, for 2 s, then removed |

### Layout

| Viewport | Layout |
|---|---|
| 320 | Minimum supported. No horizontal scroll. Tab label "Cal" (below 360) |
| 360 | Calendar switches to the month grid. Below 360 it uses a day list (one 48px row per day) |
| 390 | Design width. One column. Gutter 16px. Tab bar 64px + safe area. CTA pinned at `--tabbar-total` + 12px |
| 768 | Tablet. Content max 720px centred. Tab bar stays |
| 1024 | Desktop. 72px left rail replaces tab bar. Gutter 24px. Two-column Log, three-column Favs, 8+4 Charts |
| 1440 | Layout check only. Content max 1200px, centred |

Grid: 12 columns, 24px gutters on desktop. Phone uses one column.

**Calendar exception.** The month grid needs 7 columns at 44px wide plus 6 gaps of 4px, and 12px page padding: 360px. Below 360 the grid becomes a day list. The list has the same data and the same actions. This keeps every target at 44px or more without shrinking cells.

### Touch and hit areas

| Element | Visual | Hit area (min) |
|---|---|---|
| Every button, input, stepper, segment, tab | Any | 48 x 48 |
| Primary CTA (LOG SET) | 56px tall | 56 x full width |
| Chip | 32px tall | 48px tall (padding or `::before` extension) |
| Star | 24px glyph | 48 x 48 |
| Calendar cell | 44 to 48 | 44 x 48 minimum |
| Chart column (inspect) | 2px line | 44px wide column |
| Stepper value | Big numeral | Not interactive. Tap to type in a sheet |

Nothing interactive is under 44px. Thumb zone: primary actions sit in the bottom 45% of an 844px viewport (`--tabbar-total` and CTA above it).

---

## 6. Motion

Tokens: `--dur-instant` 80, `--dur-fast` 140, `--dur-base` 200, `--dur-slow` 280, `--dur-hero` 300 (ms). Easing: `--ease-out`, `--ease-in-out`, `--ease-snap`. Only `transform` and `opacity` are animated. Ceiling 300ms.

| Interaction | Full motion | Reduced motion |
|---|---|---|
| Set logged | CTA press `scale(.98)` 80ms. New row translateY 6px to 0 with fade, 200ms out. Set counter digit roll 200ms. `navigator.vibrate(10)` | Row fades 120ms. Vibration kept |
| PR hit | After the set lands: one volt scanline across the weight panel (280ms, inOut). NEW PR chip scales 0.8 to 1 with snap, 220ms. `navigator.vibrate([12,40,12])` | Chip fades 120ms. Panel border turns volt and stays 2s |
| Favourite toggle | Star fills, scales 1 to 1.25 to 1 with snap, 180ms. Row background flashes `--surface-2` 140ms | Instant fill swap |
| Verdict reveal (Week) | Score counts 0 to value in 300ms. Verdict word clip-reveals left to right in 240ms after 60ms delay. Bars grow scaleX 0 to 1, 40ms stagger, all within 300ms | Final state, 120ms fade |
| Tab change | Active rail slides to the new tab, 200ms out. View crossfades 140ms with translateX 8px in the tab's direction | 120ms crossfade only |
| Toast | translateY 12px to 0, 160ms. Exit 140ms fade | Fade only |
| Bottom sheet | translateY 100% to 0, 280ms out. Scrim 0 to 0.6 | 120ms fade |

Rules: no looping ambient animation. No scroll-linked motion. At most one hero motion per action. Motion never blocks input.

**Reduced motion** is handled in `tokens.css` by a `prefers-reduced-motion: reduce` block that sets all durations to 120ms or less and all distances to 0. Components read the tokens, so they need no separate rule. Count-ups show the final value immediately.

---

## 7. Hierarchy per screen

Each screen has one primary action. Everything else is secondary or tertiary.

| Screen | First (read) | Second | Last | Primary action |
|---|---|---|---|---|
| Log | Weight numeral (hero, 64px) | Context strip: LAST and best e1RM (read-only, top 40%) | Notes, collapsed, then today's sets | LOG SET (pinned, above tab bar) |
| Favs | Group heading with count | Favourite rows (name, last weight) | "+ Add exercise" row | Tap a row to log it |
| Charts | Hero e1RM (44px) and delta | Chart | History list | None: read screen. Exercise picker is the one control that matters |
| Calendar | Month grid | Selected-day detail | Legend | Log on this day (in detail) |
| Week | Score (64px) and verdict word (44px) | Three component bars | Sessions and per-exercise disclosure | Share week |
| Setup | Connection status | URL field | About | Save & sync |
| Share dialog | Canvas preview | Share (volt) | Save PNG, Close | Share |

Log top to bottom: header (exercise picker 56px, sync dot) → context strip → weight stepper → reps stepper → intensity segmented → notes (collapsed) → today's sets → LOG SET pinned above the tab bar. The first 40% is read-only context.

---

## 8. Components and states

Eight states are listed for each component: **default, hover, active, focus-visible, disabled, loading, empty, error**. "n/a" means the state cannot occur, with the reason. Hover styles apply only under `@media (hover: hover)`. Nothing requires hover to reach information.

### 8.1 Button

Three variants: **primary** (volt, one per screen), **secondary** (outline), **tertiary** (text). Destructive uses danger colour on secondary or tertiary.

| State | Primary | Secondary | Tertiary |
|---|---|---|---|
| Default | `--accent` bg, `--accent-ink` text, Chakra 700 16px uppercase, `--ls-button`. 56px (CTA) or 48px. Chamfer on CTA only | 1px `--control` border, `--text` text, `--surface` bg, 48px, `--r-md` | `--text` text, underline 1px, 48px hit |
| Hover | bg mixed 12% toward `--text` (`color-mix`) | bg `--surface-2` | Underline 2px |
| Active | `scale(0.98)`, 80ms | `scale(0.98)`, `--surface-2` bg | `scale(0.98)` |
| Focus-visible | 2px `--focus` outline, offset 2px. CTA: inset box-shadow (clip-path) | Same as primary | Same |
| Disabled | `--surface-2` bg, `--muted` text, `--line` border, `aria-disabled="true"`, no press | Border `--line`, text `--muted` | `--muted` text |
| Loading | Label becomes COPY `log.submit.busy` ("Saving…") or `status.syncing`. `aria-busy="true"`. Ignores clicks. Static, no spinner | Same | Same |
| Empty | n/a: buttons have no content state | n/a | n/a |
| Error | n/a on the button. Failure goes to the status line (`status.error.save`). Button returns to default with its label, so the next tap is the retry | Same | Same |

### 8.2 Stepper (weight and reps)

`[−] value [+]`. Buttons 48 x 48 at `--control` border. Value is mono, tabular. Weight value `--fs-hero`; reps value `--fs-3xl`. Unit `--fs-lg` `--muted`. Steps: weight ±2.5 kg (or ±5 lb when entry unit is lbs), reps ±1.

| State | Visual |
|---|---|
| Default | Value `--text`. Buttons outlined `--control` |
| Hover | Button bg `--surface-2` |
| Active | Button `scale(0.98)`. Value rolls 200ms (digit roll), or fades under reduced motion |
| Focus-visible | Outline 2px `--focus` on the focused button. Value is a live region (`aria-live="polite"` on the value only for screen readers) |
| Disabled | Button `--line` border, `--muted` glyph. Stepper at minimum (reps 1) disables the minus |
| Loading | n/a: steppers are local state, not network |
| Empty | Value 0 shows "0", not a dash. Log is disabled until reps and weight are above 0 |
| Error | Value border `--danger` 2px and status line `err.log.reps` ("Enter reps and weight.") |

Weight entry keyboard: `inputmode="decimal"` on the typed fallback. Tap the value to type in a sheet.

### 8.3 Segmented control (intensity, and kg/lbs)

`role="radiogroup"` with `role="radio"` and `aria-checked`. Roving tabindex. Arrow keys move selection. Height 48. Border 1px `--control`. Segments are equal width.

| State | Visual |
|---|---|
| Default | Unselected text `--muted` (6.34:1 on `--surface-2`). Selected text `--text`, `--surface-2` fill, 2px `--accent` underline |
| Hover | Unselected text `--text` |
| Active | Segment `scale(0.98)` |
| Focus-visible | 2px `--focus` outline inside the segment, offset -2px |
| Disabled | Whole group `--muted`, border `--line` |
| Loading | n/a: selection is local |
| Empty | Always has a selection (Med by default) |
| Error | n/a: a segment cannot be invalid |

Intensity colour is not used. Easy, Med, Hard are data values and read the same in all states (VOICE rule 10).

### 8.4 Chip (exercise filter, unit, range)

Pill, 32px visual, 48px hit area. Chakra 600 12px uppercase or mono 14px for units.

| State | Visual |
|---|---|
| Default | `--control` border, `--text` text, `--surface-2` bg |
| Hover | Bg `--surface` with `--text` border |
| Active | `scale(0.98)` 80ms |
| Focus-visible | 2px `--focus` outline offset 2px |
| Disabled | `--line` border, `--muted` text |
| Loading | n/a |
| Empty | n/a: the scroller shows the empty copy instead (`chart.empty.none`) |
| Error | n/a |
| Selected (`aria-pressed="true"`) | `--accent` bg, `--accent-ink` text, `--accent` border. This is the active state, so it is volt |

### 8.5 PR chip

Solid volt, `--accent-ink` text, Chakra 700 12px uppercase: `NEW PR +2.5 kg`. Stamps in with snap from 0.8 to 1, 220ms.

| State | Visual |
|---|---|
| Default | Shown only after a PR. Removed after 3 s |
| Hover / active / focus / disabled | n/a: decorative, non-interactive |
| Loading | n/a |
| Empty | Not shown |
| Error | n/a |
| Reduced motion | Fades 120ms. Panel border turns volt and holds 2 s |

### 8.6 Verdict chip (Week, calendar, share)

`--surface` bg, 1px verdict-coloured border, verdict-coloured text, pill. Word from COPY (`wk.verdict.*`). Help line under it in `--muted` (`wk.verdict.help.*`).

| State | Visual |
|---|---|
| Default | As above |
| Hover / active | n/a: a status label, not a control |
| Focus | n/a: not focusable |
| Disabled | n/a |
| Loading | n/a |
| Empty | Not shown when there is no verdict |
| Error | n/a |

### 8.7 Card and panel

Panel: `--surface`, `--elev-1`, `--r-none`, 16px padding. Primary panel (Week verdict and Log context) also takes the chamfer. Cards on Favs and Setup are rows, not boxes.

| State | Visual |
|---|---|
| Default | As above |
| Hover | Interactive rows only (Favs row): bg `--surface-2` |
| Active | Interactive rows only: bg `--surface-2`, `scale(0.99)` |
| Focus-visible | Interactive rows: 2px `--focus` outline offset 2px |
| Disabled | Interactive rows: text `--muted`, no press |
| Loading | Static text (`status.syncing`) in place of values. No skeleton shimmer |
| Empty | Dashed `--control` 1px border with the screen's empty copy (`fav.empty`, `chart.empty`, `wk.empty`) and a path |
| Error | Border `--danger` 1px and the error copy (`status.error.sheet`) |

### 8.8 Bottom tab bar

Fixed bottom. Height `--tabbar-h` (64px) plus safe area. Five items: Log, Favs, Charts, Calendar (Cal below 360px), Week. Setup sits behind the header gear. Icon 24px, label 12px Chakra 600 uppercase. Each item is 48px or more tall and at least 64px wide. `role="navigation"`, each item an `<a>` with `aria-current="page"` on the active one.

| State | Visual |
|---|---|
| Default | Icon and label `--muted` |
| Hover | `--text` (pointer only) |
| Active (current page) | 2px `--accent` rail on the top edge that slides to the new tab (200ms). Label and icon `--text`. `aria-current="page"` |
| Focus-visible | 2px `--focus` outline inset 2px |
| Disabled | n/a: tabs are always available |
| Loading | n/a: views load into the same tab |
| Empty | n/a |
| Error | n/a: a failed load shows the screen's own status line |

Desktop (1024 and up): the same five items plus Setup as a 72px left rail. Labels appear on hover and focus (tooltip style, `--surface-2` bg, `--elev-float`). Rail items 72px tall.

### 8.9 Header and sync dot

Header: 56px, `--surface`, bottom hairline `--line`. Left: wordmark `▲ ELEVATION` (Chakra 700, `--ls-wordmark`). Right: unit chip (kg/lbs), theme toggle (icon, 48 x 48), sync dot, Setup gear (48 x 48).

Sync dot, never colour alone. It is a shape with a text status in the status line and an `aria-label`.

| Status | Shape and colour | Text (COPY) |
|---|---|---|
| Saved | Filled circle, 10px, `--accent` | `status.saved` |
| Syncing | Hollow ring 2px, `--signal`. Static, no pulse | `status.syncing` |
| Offline or error | Filled square 10px, `--danger` | `status.offline` / `status.error.sheet` |
| Demo | Dashed ring 2px, `--muted` | `status.demo` |

Default is Demo when no API URL is set. The sync dot is never the only sign. The status line carries the words.

### 8.10 Input (text, number, select)

48px tall, 16px font, `--surface-2` bg, 1px `--control` border, `--r-md`. Numbers use mono and `inputmode="decimal"`. Labels above in the label style.

| State | Visual |
|---|---|
| Default | As above. Placeholder is an example, in `--muted` (`log.notes.placeholder`) |
| Hover | Border `--muted` |
| Active / focused | Border `--text`, 2px `--focus` outline offset 2px |
| Disabled | Border `--line`, text `--muted` |
| Loading | n/a: text fields do not load. Save button carries the loading state |
| Empty | Placeholder shown. Required fields are validated on submit |
| Error | Border `--danger` 2px. Error message below in `--danger` with the `error` icon, `aria-invalid="true"`, `aria-describedby` on the message. Copy: `err.log.reps`, `err.log.noExercise`, `err.log.dupe`, `err.log.nameEmpty` |

### 8.11 Toast and Undo

Above the pinned CTA: bottom = `--tabbar-total` + 12px + `--cta-h` + 12px. `--surface-2` bg, 1px `--control` border, `--elev-float`, `--r-md`. Role `status`, `aria-live="polite"`. Visible 3 s. Undo for delete set only.

| State | Visual |
|---|---|
| Default | Message in `--text`, 16px |
| Hover | Undo button bg `--surface` |
| Active | Undo `scale(0.98)` |
| Focus-visible | Undo: 2px `--focus` outline. Focus does not move to the toast; the toast is announced, not focused |
| Disabled | n/a |
| Loading | n/a |
| Empty | n/a: a toast always has text |
| Error | Icon `error` in `--danger` with the text. Used for failed Undo (`status.error.save`) |

Undo button: "Undo" is a new COPY string (flagged for Agent 9). Undo is a 48px tertiary button.

### 8.12 Sheet and dialog

Phone: bottom sheet, full width, max height 80vh, top hairline `--line`, `--r-none`, `--elev-float`, slides up 280ms (or fades 120ms reduced). Desktop (1024 and up): centred dialog, 480px, same content. Scrim `--scrim`.

Used for: calendar day detail (phone), share dialog (both), number entry (stepper value tap-to-type).

| State | Visual |
|---|---|
| Default | Title in `--fl-xl` Chakra 700. Close button 48 x 48 top right (`close` icon, label `share.close`) |
| Hover | Close button bg `--surface-2` |
| Active | Close `scale(0.98)` |
| Focus-visible | Focus moves to the sheet heading on open. Trapped inside. Escape closes. Focus returns to the opener |
| Disabled | n/a |
| Loading | Share button uses the Saving or Sharing label. Preview shows static text, no shimmer |
| Empty | Calendar sheet: `cal.day.empty.planned` or `cal.day.empty.rest` |
| Error | Status line inside the sheet (`share.fallback`, or `status.error.save`) |

### 8.13 Chart (e1RM and top set)

Custom SVG, 260px tall phone, 420px desktop. Series 1: e1RM, `--accent`, 2px solid. Series 2: top set, `--signal`, 2px dashed. Area fill under series 1 at 12% alpha (`--accent-soft` at a lower alpha if needed). Gridlines `--line` 1px at 50% opacity. Axis labels `--fs-xs` mono `--muted`.

The chart is an image with an `aria-label` (`chart.aria`). Points are inspected by tap or pointer; the value is also in the History list, which is the keyboard path. The chart itself is not focusable.

| State | Visual |
|---|---|
| Default | Both series with axis labels and legend (`chart.legend.*`) |
| Hover (pointer) | Crosshair line `--muted` and a value tag (mono) at the nearest point |
| Active (tap) | Crosshair stays until the next tap elsewhere. Tooltip shows `chart.point` text |
| Focus-visible | n/a on the chart; the range toggle and exercise chips take focus |
| Disabled | n/a |
| Loading | Static text `status.syncing` where the chart will be. No shimmer |
| Empty | No sessions: `chart.empty` (in the card, dashed border). No machines: `chart.empty.none` |
| Error | `status.offline` in the status line; chart shows the last synced data (P8) |

Range toggle (4W, 12W, ALL): segmented control (8.3). Exercise chip scroller: chips (8.4), horizontal, snaps, with the selected one volt.

### 8.14 Calendar cell

44 x 48 minimum. Mono numeral, 16px, tabular. Done and planned come from the Schedule tab. Month grid on 360px and up. Below 360, day list (48px row).

| State | Visual |
|---|---|
| Default | Numeral `--text`, bg transparent, no border |
| Hover (pointer) | bg `--surface-2` |
| Active | `scale(0.98)` |
| Focus-visible | 2px `--focus` outline offset 2px |
| Disabled | n/a: every day is tappable. Future days open an empty day with "Log on this day" |
| Loading | n/a: reads cached state. Load failure goes to the status line |
| Empty | Day with no data: numeral only |
| Error | n/a (see loading) |
| Done (logged) | bg `--accent-soft`, volt dot 6px at bottom centre. Numeral `--text`. Dot is the non-colour cue |
| Planned | 1px `--signal` inset ring. Two-letter badge `UP` or `LOW` under the numeral (`cal.badge.*`) |
| Done and planned | Done style wins. Ring is kept |
| Today | 2px `--text` underline under the numeral |
| Selected | `--surface-2` bg and 2px `--text` inset ring. Selection is kept by `aria-selected="true"` |
| Out of month | Numeral `--muted` (5.85 to 7.00:1) |

Grid: `role="grid"`, dow row labels, arrow keys move between cells. Legend under the grid: Done (volt dot), Planned (ring).

### 8.15 Verdict hero and component bars (Week)

Hero: score (mono, `--fs-hero`) and verdict word (Chakra 700, `--fs-3xl`, verdict colour). Chamfered primary panel. Glow (`--glow`) at 14% alpha in the top-right corner, dark only. Three bars: Volume (40%), Avg e1RM change (40%), Consistency (20%). Track `--surface-2`, fill is the verdict colour, 8px tall, labels in mono. Sessions done of planned below. Share week button (primary).

| State | Visual |
|---|---|
| Default | Verdict and bars revealed (motion doctrine) |
| Hover / active | Share week only (8.1) |
| Focus-visible | Share week only (8.1) |
| Disabled | n/a |
| Loading | Static `status.syncing` where the score will be |
| Empty | Copy `wk.empty`: "Log a week of training to see your Progress Score." No score, no bars |
| Error | `status.offline` in the status line, last synced score shown |
| BASELINE | Verdict word in `--muted`, help line `wk.verdict.help.BASELINE`, bars shown at zero where data is missing |

The explainer above the cards is COPY `wk.explain` and `wk.explain.bands`. It is the proof of the score (P1, P2).

### 8.16 Setup row

Grouped list. Row 56px, `--line` dividers, label on left, value or action on right. Groups: Connection (URL, Test), Units, Theme (System, Dark, Light), Reminders (info only), Demo mode (banner), About.

| State | Visual |
|---|---|
| Default | Label `--text`, value `--muted` |
| Hover | Row bg `--surface-2` |
| Active | `scale(0.99)` |
| Focus-visible | 2px `--focus` outline offset 2px |
| Disabled | Test connection disabled with no URL. Text `--muted` |
| Loading | Test connection shows `status.syncing` in the status line. Button label unchanged, `aria-busy` |
| Empty | No URL: `set.url.help`. No schedule: `set.plan.empty` |
| Error | `status.error.sheet` or `status.error.server` under the row, `--danger` text with the `error` icon. URL field keeps its value |

Demo mode banner: `--warn` 1px border and `warn` icon with `status.demo`. Text `--warn` on `--surface-2` is 9.42:1 dark, 4.95:1 light.

### 8.17 Share card (canvas, not CSS)

1080 x 1350, drawn on canvas. Background `#07090A` always, both themes (it is a PNG). 64px margins. Layout from `design/directions.md`: top wordmark `ELEVATION` (Chakra 700, 40px) with week range in mono 28px; centre score in mono 280px and verdict word in Chakra 120px in the verdict colour; chamfered panel with three bars and 32px mono labels; bottom row top PR (mono 40px) and sessions; one 6px volt rule along the bottom edge.

No device frame. No emoji. Font loading must finish before drawing (`document.fonts.ready`). Canvas uses only same-origin or inline assets, so `toBlob` does not taint.

| State | Visual |
|---|---|
| Default | As above |
| Hover / active / focus | n/a: the canvas is an image; the buttons around it carry states |
| Disabled | Share button disabled when there is no data (`cal.day.share` only when a set exists) |
| Loading | Preview shows static text until drawn |
| Empty | No data: the card is not offered (no Share button) |
| Error | `share.fallback`: "Sharing isn't on in this browser. Image saved instead." |

### 8.18 Empty and error screen patterns

Every empty state says what is missing and gives a path. Copy comes from COPY (section 8 summary there). Errors say what happened and the next step, and never show a raw error. Raw errors go to the console only.

---

## 9. Icons

Material Symbols Outlined, 24px, default weight, from `icons/`. Colour follows text (`fill="currentColor"`). Decorative icons are `aria-hidden="true"`. Icon-only buttons have an accessible name.

| Use | Icon | Status |
|---|---|---|
| Log tab | `add` | Bundled, copied |
| Favs tab | `star` | Bundled, copied (outlined) |
| Pinned favourite | `star` filled | **NOT BUNDLED** |
| Charts tab | `show_chart` | **NOT BUNDLED** |
| Calendar tab | `calendar_today` | Bundled, copied. (`calendar_month` preferred if added, optional) |
| Week tab | `insights` | **NOT BUNDLED** |
| Setup gear | `settings` | Bundled, copied |
| Share | `share` | Bundled, copied |
| Delete set | `delete` | Bundled, copied |
| Close sheet | `close` | Bundled, copied |
| Previous / next month, carousel | `chevron_left`, `chevron_right` | Bundled, copied |
| Stepper minus | `remove` | Bundled, copied |
| Stepper plus | `add` | Bundled, copied |
| Confirm, saved toast | `check`, `check_circle` | Bundled, copied |
| Error | `error` | Bundled, copied |
| Warning, demo banner | `warning` | Bundled, copied |
| Info, reminders | `info` | Bundled, copied |
| Retry, Test connection | `refresh` | Bundled, copied (used as retry, not as sync) |
| Sync state | `sync` | **NOT BUNDLED.** Not needed: the sync dot is a CSS shape (8.9). Optional |
| Offline | `cloud_off` | **NOT BUNDLED.** Optional, not needed: the status line carries the text |

**Not bundled, to add** (copy from upstream, Outlined 24px default, keep `LICENSE` and add a line to `NOTICE.md`): `star` (filled), `show_chart`, `insights`. Optional: `calendar_month`, `sync`, `cloud_off`.

Upstream path pattern: `symbols/web/<name>/materialsymbolsoutlined/<name>_24px.svg` in `google/material-design-icons` at the commit in `icons/NOTICE.md`.

`icons/` contents: add, star, calendar_today, settings, share, delete, close, chevron_left, chevron_right, remove, check, check_circle, error, warning, info, refresh (SVG), `LICENSE` (Apache 2.0), `NOTICE.md`.

Brand logos: none. Not in the set.

---

## 10. Accessibility rules

- Focus: 2px `--focus` outline, offset 2px. Chamfered elements use inset box-shadow. Never `outline: none` without a replacement.
- Targets: 48px minimum for every control (44px minimum for calendar cells, the brief's floor). The 24px star glyph has a 48px hit area.
- Labels: every icon-only control has an `aria-label` from COPY (`fav.star.add`, `log.set.delete`, `cal.prev`, `cal.next`, `g.theme.toLight`, and so on).
- Status: the status line is `role="status"`, `aria-live="polite"`. Errors in forms use `aria-invalid` and `aria-describedby`.
- Colour is never the only signal: verdicts have words, sync has shapes plus text, calendar has a dot and a ring, bars have values.
- Text is at least 16px in inputs. Numbers use `tabular-nums`.
- Reduced motion: section 6.
- Keyboard: tab order follows visual order. A skip link comes first in the DOM (`g.skip`), then the header, the screen, and the tab bar last. Every tab link is reachable with Tab.
- Language: `lang="en"`.

---

## 11. Handoffs and open issues

| # | Issue | Owner | Action |
|---|---|---|---|
| 1 | Font URL: design-dna wants Chakra Petch 600, Inter 500. index.html loads 500/700 and 400/600 | Agent 5 | Update the font link when index.html is next edited |
| 2 | `--line` is too weak for control borders in v1 CSS | Agent 5 | Use `--control` for inputs, steppers, segments, chips, secondary buttons |
| 3 | v1 body has a ruled-paper background (`repeating` lines). Remove | Agent 5 | Body background flat `--bg` |
| 4 | v1 `--cyan` used for BASELINE | Agent 5 | Use `--muted` for BASELINE |
| 5 | v1 star colour is amber (`--warn`); design uses volt for active state | Agent 5 | Pinned star uses `--accent` |
| 6 | Calendar tab label: COPY says "Calendar" with fallback "Cal" if it overflows. Here it switches at 360px | Agent 9 | Confirm, or pick one |
| 7 | New COPY string needed: "Undo" (toast, delete set) | Agent 9 | Add to COPY.md |
| 8 | Icons not bundled: `star` filled, `show_chart`, `insights` | Agent 5 or user | Add from upstream (section 9) before the tab bar ships |
| 9 | Tab labels at 12px uppercase: "CALENDAR" needs about 68px. Tab width at 390 is about 78px | Agent 4 | Measure at 390 and 360. Fall back to "Cal" below 360 |
| 10 | Calendar 360px threshold and the below-360 day list are new layout work | Agent 5 | Implement list view |
| 11 | Verdict word colour on dark tints (`--danger-soft`) measured 14:1 with text; verdict chips moved to surface bg | Done here | None |
| 12 | Dark `--text` on `--accent-soft` estimate | Agent 4 | Verify in browser |

---

## 12. Taste gate

Owner: Agent 3 (Anti-Slop Taste Specialist). Scope: the design system above, `tokens.css`, and the Week, Log, Charts and Calendar designs. Checked against `design/style-spec.md` (anti-slop, style level), `design/thesis.md` (master list, 15 items), and the anti-slop list in `design/design-dna.json`.

Taste is not preference: each result cites the Design Read or a named principle. Rulings are below.

### Master anti-slop list (thesis.md)

| # | Check | Result | Evidence and fix |
|---|---|---|---|
| 1 | No purple, indigo or violet; no multi-stop gradients | **Passed** | Palette in section 2. One radial glow only, single stop + transparent, 14% alpha |
| 2 | No slate rounded-2xl card grids | **Passed** | Panels are `--r-none`. Favs and Setup are rows, not card grids. Radius 8 only on controls |
| 3 | No glassmorphism, backdrop blur or neumorphism | **Passed** | No blur, no backdrop-filter, no inset-shadow bevels. Hairlines only |
| 4 | No emoji as UI icons; one icon set | **Passed** | One set, Material Symbols Outlined 24px (section 9). Glyphs like ▲, ◐, ⚙, ↗ in v1 are replaced |
| 5 | No 4-equal-KPI-tile hero | **Passed** | Week has one dominant score and verdict word. Charts has one hero e1RM. Bars are three, not tiles |
| 6 | No body font for numbers; mono tabular only | **Passed** | Section 4: every number is JetBrains Mono, `tabular-nums` |
| 7 | Volt is 10% or less of pixels | **Passed** | Section 1 budget. Only one large volt area (glow, 14%) |
| 8 | No looping or pulsing ambient animation; no UI motion over 300ms | **Passed** | Section 6 has no loops. Syncing is a static ring. Longest duration is 300ms (`--dur-hero`) |
| 9 | No confetti; PR reward is scanline plus chip | **Passed** | PR hit is scanline (280ms) plus chip. No confetti tokens exist |
| 10 | No target under 48px; no primary action in top half | **Passed, one exception** | All controls 48px. Calendar cells 44px (brief floor), exception is documented. LOG SET is pinned bottom |
| 11 | No centred paragraphs; no generic copy | **Passed** | Section 4 rule. Copy from COPY.md (VOICE-checked) |
| 12 | No ruled-paper or grid background textures | **Passed** | v1 ruled paper is removed (handoff 3). Hairlines are panel edges only |
| 13 | No fake data in real views; demo banner | **Passed** | Demo state is a dashed sync dot plus a `--warn` banner (`status.demo`) |
| 14 | No device-mockup share card | **Passed** | Share card is a 1080 x 1350 canvas, no frame |
| 15 | No contrast below WCAG 2.2 AA; focus never removed | **Passed after fix** | First draft used `--line` for control borders (1.27 to 1.56:1). Fixed with `--control` (3.20 to 4.61:1). Text pairs all pass (section 3) |

### Style-level anti-slop (style-spec.md)

| Check | Result | Fix or note |
|---|---|---|
| No purple or indigo gradients | Passed | See #1 |
| No slate rounded-2xl card grids | Passed | See #2 |
| No emoji icons | Passed | See #4. v1 used ＋ ★ ↗ ▦ ◆ ⚙ ◐ and ▲ as icons. All replaced by the icon set, except the wordmark ▲, which is a brand glyph in the header and stays as a text mark, not a UI icon |
| No 4-equal-KPI-tile hero | Passed | See #5 |
| No default-everything 24px icon set | Passed | Icons are sized and coloured by token, used sparingly, text labels always present |
| No centre-aligned body text | Passed | See #11 |
| No fake 3D | Passed | No 3D in the app |
| No infinite pulse | Passed | See #8 |
| No "Welcome back, User!" copy | Passed | Copy from COPY.md. Intro headline "Lift. Log. Know if it's working." is an approved COPY string |

### Taste calls (defaults replaced)

| Default found | Replaced with | Reason (cited) |
|---|---|---|
| Accent on every active or highlighted thing (v1) | Volt for primary, active, PR, PROGRESS only | Design-dna rule ("accent <= 10%") and UX audit item 2 |
| Cyan for BASELINE (v1) | Muted neutral | Cyan means HOLD in the verdict mapping. Two meanings for one colour is a taste failure and a legibility failure |
| Coloured intensity chips (v1: Easy cyan, Hard red) | Neutral segmented control, selected by underline | Colour carried a meaning the data does not have. Hick's law: fewer signals. VOICE rule 10 |
| Verdict chips on tinted fill | Surface fill with verdict-coloured border and text | Contrast: `--accent` on `--accent-soft` over `--surface-2` in light measured 4.22:1. Fails 4.5:1 |
| Rounded everything (v1 4px on all boxes) | Panels 0, controls 8, chips pill | UX audit item 3 |
| Star in amber (v1) | Volt when pinned | Design-dna: volt is the active state. Amber is reserved for the demo banner |
| Ruled-paper background (v1) | Flat `--bg` | UX audit item 1 (noisy, reads as a notebook) |
| Bounce or ease-back on taps (common default) | Snap curve only on PR chip and star peak | Motion doctrine (snap curve named for those two). Other motion uses out |
| Hover-only affordances | Hover is an enhancement; every action is reachable by tap and keyboard | UX law: Fitts and Doherty; touch-first phone use |
| Decorative chamfer everywhere | Chamfer on the primary panel and LOG SET only | Design-dna `cut` role and style-spec ("the brand mark, used only on the primary panel and the main CTA") |
| Shadow on cards | Hairline inset only (`--elev-1`); shadow only on toast and sheet | Style-spec: "no drop-shadow cards" |

### Decisions I did not change (kept, with reason)

- **Chakra Petch for labels and buttons.** Kept. It carries the telemetry character in the design-dna. Legibility at 12px uppercase is acceptable at 0.12em tracking; if QA fails it, the fix is Inter 600 for labels, not a new family.
- **Mono for every number, including units.** Kept (design-dna rule and VOICE rule 9).
- **Tab bar of five with Setup behind the gear.** Kept (style-spec, and COPY nav). The label fallback "Cal" is a copy choice for Agent 9 (handoff 6).

### Gate result

**Passed, with three open items for the build:** handoff 1 (font link), handoff 6 (Calendar label), handoff 8 (icons not bundled). Each is a build task, not a design defect. Agent 4 must verify the ones that touch states: the Calendar label and the tab widths (handoff 9), and the dark `--text` on `--accent-soft` estimate (handoff 12).
