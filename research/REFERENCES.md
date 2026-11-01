# REFERENCES: Elevation gym tracker (Agent 11 brief)

Scope: 3 deep references (Hevy, Strong, Liftosaur) plus 2 competitors listed for context (Fitbod, Jefit). Boostcamp was not researched in this pass. Accessed 2026-11-01 unless noted.
Evidence labels: **[V]** = fetched from the source's own page or repo. **[S]** = secondary/vendor-blog claim, not verified on the primary page. **[U]** = unverified.

## Source table

| Ref | URL | Evidence | Logging-relevant facts | Limits |
|---|---|---|---|---|
| Hevy | https://www.hevyapp.com/features/ | [V] | Add/remove sets, set types, start empty workout, automatic rest timer, muscle charts, sets per muscle per week, social media shareables, share folders/routines | No free/paid split or calendar shown on page |
| Strong | https://www.strong.app/ | [V] | Custom timers, advanced charts (PRO), workout sharing, CSV export, Apple Watch, supersets, RPE, warm-up calculator, Apple Health | No set-entry flow described; no PRO price shown |
| Liftosaur | https://github.com/astashov/liftosaur | [V] | README: workout history, configurable rest timers (push only on native apps), warmup sets, "last results" hints for similar sets, plate calculator, uPlot lift graphs, offline mode (account needed to save to server) | No logging-flow screenshots read; last commit date not shown |
| Strong pricing | https://setgraph.app/ai-blog/hevy-vs-strong-app-comparison-2026 and https://www.sensai.fit/blog/hevy-vs-strong-vs-fitbod-vs-jefit | [S] | Strong PRO $4.99/mo, $29.99/yr, $99.99 lifetime (SensAI); Hevy Pro $2.99/mo or $23.99/yr, $74.99 lifetime (SensAI) but $4.99/mo, $39.99/yr in another vendor post | Vendor blogs disagree; check app stores |
| Fitbod / Jefit | https://www.sensai.fit/blog/hevy-vs-strong-vs-fitbod-vs-jefit | [S] | Fitbod is generation-first ($15.99/mo, $95.99/yr, no lifetime per SensAI). Jefit Elite $12.99/mo (SensAI), advanced graphs incl. 1RM projection | Written by a competitor; not checked on vendor pages |
| Boostcamp | not researched | [U] | none | Add a follow-up if needed |

## Deep teardown (what matters for a one-handed, phone-first set logger)

### 1. Hevy (most-recommended value option per vendor blogs [S])
- **Structure:** Workout-first. Start empty workout, add exercise, add/remove sets, set types (warm-up/drop/etc.). Social feed and shareable workouts.
- **Visual identity:** Not analyzed (no screenshots taken; no design claims made).
- **Differentiators:** Community feed, free unlimited logging [S], shareable routines/folders [V].
- **Friction / beat:** Social-first chrome competes with the logging screen [U, needs visual check]. Charts are described but not deeply on the features page [V].
- **Conversion:** Free logging, paid analytics/AI programming [S].

### 2. Strong (fastest minimal logger per vendor blogs [S])
- **Structure:** Minimal logger. Feature page lists custom timers, advanced charts behind PRO, workout sharing, CSV export, Apple Watch [V].
- **Steal:** "Two-tap set logging" is the headline claim in a vendor comparison [S]; not confirmed on the primary page. CSV export is a trust feature worth copying for a Sheet-backed app.
- **Beat:** Apple Watch and Apple Health are core [V]; this app is Android/PC-first in practice (Sheets backend), so do not copy the watch path. Strong's charts sit behind a paywall [V]; this app has no paywall, so charts can be free.
- **Friction:** Feature list is long; the page does not show the set-entry flow [V].

### 3. Liftosaur (open-source PWA, closest technical peer) [V]
- **License:** AGPL-3.0 (see REPOSITORIES note in FEATURE_APPROACHES.md). Copying code is not allowed for this project without relicensing; ideas only.
- **Stack:** Preact + TypeScript, uPlot charts, Tailwind, service worker caching network calls, AWS Lambda/DynamoDB backend, thin native wrappers [V].
- **Steal:**
  - "Last results" hint for similar sets and AMRAPs (prefill the next set from the previous one) [V].
  - Plate calculator: rounds weights to available plates [V]. Useful for the kg/lbs conversion step.
  - Configurable warm-up sets [V].
  - Lift progression graphs defined per user on a graphs screen [V]. Maps to the per-exercise progress chart requirement.
  - Offline mode works without internet, with an account needed to sync to the server [V]. Matches the offline queue idea.
- **Beat:** Liftosaur's logging screen is script-heavy (Liftoscript) and dense [V, README]; this app should keep logging to one screen with stepper controls and a single primary button. Rest-timer push notifications only work on native apps [V]; on a PWA use an in-app timer plus the existing Apps Script email/Calendar reminders.
- **Avoid:** Building a progression scripting language. Out of scope for a single-user tracker on a free Sheet backend.

## Avoid list (category slop / traps, for Agent 7 detectors)

- **Decorative purple-gradient hero and stock fitness photography.** Not verified across the set (no screenshots taken). Treat as a candidate detector only after a visual pass; the brief already bans purple gradients.
- **Paywalled charts and analytics.** Strong and Hevy gate advanced charts or analytics behind PRO/Pro [V/S]. This app is free; do not add a paywall.
- **Watch-first or native-only features** (watch logging, push rest timers) that do not exist on a PWA. Build the PWA equivalent or omit.
- **Feed/social chrome on the logging screen.** Hevy-style feeds compete with the one-handed set entry flow [U].

## Beat list (where the new build can win)

1. Single-screen, one-thumb logging with steppers, prefilled from last set, and one bottom primary button (no competitor is verified to do this exactly; treat as a hypothesis to test on the 390px phone).
2. Free charts and calendar (paywalled in Strong [V] and Hevy analytics [S]).
3. Data you own: the Google Sheet is the source of truth; competitors store in their own cloud [V for Liftosaur; S for others].
4. Weekly KPI score (Progress/Hold/Dip) is not seen in any of the three references [V for the features pages checked; absence on those pages only].
5. Accessibility: none of the three feature pages claim WCAG 2.2 AA conformance [V, absence]. Target 44px+ and reduced motion as stated in the brief.

## Questions for Grill Me

1. Do you want prefilled sets from your last session (Liftosaur-style "last results") as the default, or a blank form? This changes the logging screen layout.
2. Is the weekly KPI score meant to be shown on the logging screen, or only on the Progress tab? No reference does this, so the placement is open.
3. Should the share card show the KPI verdict (PROGRESS/HOLD/DIP) or only the lift numbers? Strong and Hevy share workouts, not weekly verdicts [V].
