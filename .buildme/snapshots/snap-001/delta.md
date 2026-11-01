# Delta snap-001 (post-build)

**Previous snapshot:** none. This is the first authoritative snapshot, so the delta is against the v1 baseline (git HEAD `7939cb8`).
**Summary:** Build phase 1 landed the token layer. `tokens.css` is new (89 unique names). `styles.css` is rewritten to read tokens (401 `var()` references, 1 colour literal left). `intro/` is added and still carries its own literal scale.

## Tokens: v1 to snap-001

| Area | v1 (7939cb8) | snap-001 |
|---|---|---|
| Token file | none | `tokens.css`, 89 unique names: 23 colour roles (dark and light), 66 theme-independent |
| Tokens referenced by styles.css or intro.css | 0 | 74 of 89. Unreferenced: `--glow`, `--glow-max-alpha`, `--elev-0`, `--elev-glow`, `--fs-share`, `--s-0`, `--s-8`, `--cut`, `--stepper-btn`, `--tabbar-h`, `--chip-h`, `--dur-instant`, `--dur-hero`, `--ease-in-out`, `--motion-scrim-alpha` |
| Colour values | inline | DESIGN.md colour table matches tokens.css: 12 of 12 rows, 0 mismatches |
| Spacing and font-size scales | inline | match DESIGN.md section 5 and section 4 |

## Components: v1 to snap-001

- Scanned rules: 258 total (`styles.css` 202, `intro/intro.css` 56). 79 rows are literal-only (no token binding). Per-rule table in `components.md`.
- `intro/intro.css`: a separate literal-heavy stylesheet. It binds some colours and font sizes to tokens, but spacing, duration and chamfer values are literal.
- v1 `styles.css` had 127 lines, 37 hex literals, 90 px literals, 108 `var()` references.
- snap-001 `styles.css` has 411 lines, 1 hex literal, 60 px literals, 401 `var()` references.
- v1 `app.js` had 27 `style=` attributes. snap-001 has 1, the data-driven bar height at `app.js:662`.

## Drift guard (details: `drift.md`)

- **Confirmed drift (BYPASS): 26.** One colour literal, 25 size, duration, easing or chamfer literals where a token with that value exists.
- **Candidate drift: 11.** Layout sizes equal to a layout token (`--chip-h`, `--tabbar-h`, `--touch-min`, `--chart-h`). Each needs a judgement call.
- **GAP: 48.** Literals with no token. Not counted as drift. Candidates for new tokens.
- **Spec gap:** DESIGN.md section 5 names the PR flash `--elev-glow` and section 3 names a Week hero glow. The glow tokens are defined but nothing uses them.

### Top 5 drift

1. `styles.css:372` `.share-canvas { background: #07090A }`. Only colour literal left. It matches `--bg` (dark), but it is not theme-aware.
2. `styles.css:263` `.chart text { font: 500 12px var(--font-mono) }`. Literal 12px is `--fs-xs`. Weight 500 has no token.
3. `styles.css:63` `.sync[data-state="pending"]` uses `ease-in-out` (`--ease-in-out`) and a literal `1.2s` pulse. No duration token fits 1.2s.
4. `intro/intro.css:110` and `:128` chamfer `clip-path` uses literal 10px (`--cut`) and 8px. The 8px value has no token and differs from `--cut`.
5. `intro/intro.css:137`, `:145`, `:148` motion uses literal `260ms ease-out` and `120ms linear`. `ease-out` is `--ease-out`. 120ms duplicates the reduced-motion `--dur-fast` value. `intro` does not consume `--dur-*` at all.

Also noted: the `--tabbar-h` token is unused. `styles.css:393` and `:400` set `min-height: 64px` as a literal. `--chip-h` is unused. `styles.css:182` and `:220` set chip `min-height: 32px` as a literal.

## Screenshots (`screenshots/`)

- 18 JPEG frames, quality 72, 21 to 72 KB each. Viewports 1440x900 and 390x844 at DPR 1.
- Routes: `#log`, `#favorites`, `#progress`, `#calendar`, `#week`, `#settings`, `/intro/` (three scroll stops: top, mid, end).
- Dark theme, demo data (no API URL). Fonts loaded from Google Fonts.
- Checks per route at both widths: no page horizontal overflow (`scrollWidth` equals `clientWidth`), no page errors, no failed requests.
- `#progress` chip row runs past the viewport at both widths. It sits inside `.scroller` (`app.js:597`), so the overflow is intended horizontal scroll, not a layout bug.
- Each route has one element under 44px. Not identified in this pass.

## Movement against intent

- Build matches DESIGN.md on the colour table, type and spacing scales, and motion token names.
- Drift is concentrated in `intro/intro.css`. `styles.css` is near-clean.
- Not covered: light theme screenshots, Design Arena baselines, and the rest of `.buildme/snapshots` history (none before this).
