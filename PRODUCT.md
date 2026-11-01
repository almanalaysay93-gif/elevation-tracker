# PRODUCT.md: Elevation gym tracker

Owner: Agent 1 (Impeccable Design Director). Sources: BUILD_BRIEF.md (approved), ORCHESTRATOR.md checkpoint 2, design/thesis.md, design/directions.md, VOICE.md, copy/COPY.md, research/FEATURE_APPROACHES.md.

## Purpose

A personal gym log for one lifter. It records every set, shows progress per machine, and gives one weekly verdict (PROGRESS, HOLD or DIP) from volume, strength change and training consistency. Data lives in the user's own Google Sheet through an Apps Script web app. Free, no framework, static on GitHub Pages.

Thesis (design/thesis.md): race-car telemetry for your body. One volt signal on matte black, every number large enough to read mid-set, and every reward earned by a real PR.

## Audience

- **One lifter.** Mon/Wed/Fri Upper and Lower split, flexible. Trains with a phone in one hand between sets.
- Uses the phone at the gym (primary, 390px wide, one-handed, often sweaty, bright gym lighting, glare).
- Uses a PC at home to review charts and the week (secondary, 1024px and up).
- Technically comfortable enough to paste an Apps Script URL once. Not a developer, does not want to read docs during a set.

## Jobs to be done

The app must let the user finish these three jobs. Everything else is supporting.

1. **Log a set in two taps.** At the machine, the reps and weight are already filled from the last set on that machine. The user changes what changed and taps LOG SET. Success: the set is saved and visible in today's list in under 400 ms of feedback.
2. **Know whether this week is working.** On the Week screen the user sees one verdict (PROGRESS, HOLD or DIP), the score, the three components and why. Success: the verdict and its reason are readable in one screen with no maths.
3. **See the trend on one machine.** The user picks a machine and reads the current e1RM, its change, and the top set over time. Success: the trend and the last set are readable without tapping into a second screen.

Supporting jobs: pin a machine to Favs (grouped Upper / Lower / Arms & Shoulders), review a past day or planned day on the Calendar, share a day or a week as a PNG, connect the Sheet, switch units (kg / lbs) and theme.

## Screens

| Screen | Phone (390px) | Desktop (1024px and up) | Primary action |
|---|---|---|---|
| Log | Exercise picker, context strip (LAST, best e1RM), weight stepper, reps stepper, intensity, notes (collapsed), today's sets, pinned LOG SET | Form in 5 cols, today's session table and e1RM sparkline in 7 cols | LOG SET |
| Favs | Search, 3 grouped sections with sticky headers, 56px rows | 3 columns, one per group | Tap a row to log it |
| Charts | Exercise chip scroller, hero e1RM and delta, chart, range toggle, best sets | Chart 8 cols at 420px, stats and history in 4 cols | None (read screen) |
| Calendar | Month grid, 48px cells, legend, bottom sheet for a day | Month grid 8 cols, selected-day detail always visible in 4 cols | Log on this day (in the day detail) |
| Week | Verdict hero, 3 component bars, sessions done of planned, Share week | Hero 6 cols, 12-week score history 6 cols | Share week |
| Setup | Grouped list: Connection, Units, Theme, Reminders, Demo mode, About | Centred 640px column | Save & sync |
| Share card | 1080 x 1350 PNG, generated on canvas, shown in a dialog | Same | Share (or Save PNG) |
| Intro (scrollme page) | Separate scroll story, five sections. Uses the same tokens. Owned by the scrollme team, not this design pass | Same | Log a set |

Global: bottom tab bar with five tabs (Log, Favs, Charts, Calendar, Week) and Setup behind a header gear. Desktop: 72px left rail with the same five tabs plus Setup.

## Success criteria

- A set is logged in two taps with the fields pre-filled from the last set on that machine.
- Every touch control is at least 48 x 48 CSS px. The primary CTA is inside the bottom third of the screen.
- Every text and background pair passes WCAG 2.2 AA (4.5:1 text, 3:1 large text and UI). Table in DESIGN.md.
- Looks like a motorsport instrument cluster, not a generic fitness app. Passes the taste gate in DESIGN.md.
- Stays under 250 KB gzipped with no framework. Reduced motion respected everywhere.
- Every number on screen is monospace, tabular, and traceable to a proof point in VOICE.md.

## What it must not look like

- Purple or indigo gradients, glassmorphism, neumorphism, or slate rounded-2xl card grids.
- A four-equal-KPI-tile hero. The Week screen has one dominant number.
- Emoji as icons. One icon family (Material Symbols Outlined, 24px).
- Ambient loops, pulsing dots, confetti, or any motion over 300 ms.
- A device mockup for the share card. The share card is its own composition.
- A notebook: no ruled-paper background (v1 had one, it is removed).

## Voice and tone (from VOICE.md)

Terse, exact, zero hype. Numbers first. Uppercase display labels for status words (PROGRESS, HOLD, DIP, SYNCED, DEMO, OFFLINE). Mono for every number. No exclamation marks. The data does the cheering.

## Assumptions

- The app stays a single static page with a service worker and an offline outbox (ORCHESTRATOR checkpoint 2 decision). This doc assumes the offline state is shown, not designed in detail.
- Demo mode (no API URL) is a real mode. It is bannered and never presented as real data.
- The user reads English. Single locale.
- The Google Sheet is the only backend. No accounts, no sign-in in the app (P14).
- Reminders are configured in Apps Script. The app only explains them in Setup.

## Open questions for the user

1. Week tab icon: the bundled icon set has no chart or insights glyph. The current plan lists `insights` as a to-add icon (see the icon map in DESIGN.md, section 9). Acceptable to add it from upstream Material Symbols?
2. Calendar tab label: COPY.md says "Calendar" with a fallback to "Cal" if it overflows. DESIGN.md sets the switch at 360px width. Confirm.
