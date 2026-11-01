# Directions (launch-director)

## A — Volt Telemetry (WINNER)
A motorsport instrument cluster: matte black, hairlines, chamfer corner, huge mono numerals, volt as the light source.

## B — Neon Arcade (KILLED)
CRT scanlines, pixel fonts, magenta/cyan glow. Killed because it drifts toward purple/magenta, glow hurts legibility under bright gym lighting, and it reads as a toy, not premium.

## C — Clean Athletic Light (KILLED)
Nike-style white with bold black type. Killed because it is not cyberpunk and ignores the brief; dark OLED is also better for gym battery life and glare.

**Why A wins:** it meets "premium sporty cyberpunk" with a single accent, gives the most legible numbers for one-handed use, builds directly on v1 tokens (stays under 250KB, no framework), and passes AA in both themes.

## Per-screen layout (390px phone | 1440px desktop)
Desktop shell: 72px left rail nav (icons, labels on hover), content max 1200px, 12-column grid, 24px gutters.

- **Log** — 390: header (56px exercise picker, sync dot) → context strip (LAST / PR) → weight stepper (mono 64px) → reps stepper → intensity segmented control → notes (collapsed) → today's sets list → pinned LOG SET CTA above the tab bar. | 1440: two columns; left 5 cols form, right 7 cols today's session table plus a mini e1RM sparkline for the selected exercise.
- **Favorites** — 390: search field, 3 grouped sections with sticky headers, 56px rows (name, last weight in mono, ★), no FAB; "+ Add exercise" row at each section end. | 1440: 3 columns, one per group.
- **Charts** — 390: exercise chip scroller → hero e1RM + Δ → 260px chart → range toggle → best-sets list. | 1440: chart 8 cols at 420px tall; right 4 cols stats plus set-history table.
- **Calendar** — 390: month header with 48px ‹ › buttons, 7×6 grid of 44px+ cells, legend; tap opens a bottom sheet. | 1440: month grid 8 cols; selected-day detail 4 cols, always visible.
- **Week** — 390: verdict hero (score 64px mono, verdict word 44px Chakra), 3 component bars, sessions done/planned, Share CTA. | 1440: hero 6 cols; 12-week score history bar chart 6 cols.
- **Setup** — 390: grouped list of 56px rows: Connection (URL, Test), Units, Theme, Reminders, Demo mode, About. | 1440: centered 640px column.
- **Share card (1080×1350)** — bg #07090A, 64px margins. Top: "ELEVATION" in Chakra 700 40px, .12em tracking, with the week range in mono 28px muted. Center: score in mono 280px and verdict word in Chakra 120px, in the verdict color. A chamfered panel holds 3 bars (Vol / e1RM / Consistency) with 32px mono labels. Bottom row: top PR ("Bench 85kg × 5", mono 40px) and sessions ("3/3"). One 6px volt rule along the bottom edge. No device frame, no emoji.
