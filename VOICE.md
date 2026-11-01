# VOICE.md: Elevation

Owner: Agent 9 (Content & Copy Voice). Source: BUILD_BRIEF.md, app.js and index.html (v1 copy).

## Voice in one sentence

We talk like a pit-side stopwatch: terse, exact, zero hype. Not like a motivational poster, a fitness-app ad, or a chatbot.

## Who we talk to

One lifter. Mon/Wed/Fri Upper/Lower, flexible. Standing at a machine with a phone in one hand. Address them as "you". Never "users", "athletes", "gym-goers" or "champions".

## Voice rails

**1. TERSE.** Numbers first, then the verb. No filler words, no throat-clearing.
- Do: `Set logged. 3 × 8 at 60 kg.`
- Don't: `Great job! Your set has been successfully logged.`

**2. DRY, NOT HYPE.** Flat and confident. The data does the cheering.
- Do: `PROGRESS. Volume and e1RM both up.`
- Don't: `You're CRUSHING it! Keep going, champ!`

**3. EXACT ABOUT THE MATH.** Say what a number means and how it is made. Show the formula when a number is judged.
- Do: `e1RM = kg × (1 + reps ÷ 30). Epley.`
- Don't: `Our smart algorithm analyzes your gains.`

## Cyberpunk flavor lives in type, not words

- Uppercase display labels and status words: `SYNCED`, `DEMO`, `OFFLINE`, `PROGRESS`, `HOLD`, `DIP`.
- Mono for every number and unit.
- Copy stays plain. No sci-fi puns, no "neon", "grid", "jack in", "system online", "the machine learns".

## Verbs and nouns we use

Log, add, pin, save, share, delete, connect, sync, pre-filled, plan, last, best, planned, done. Sets, reps, weight, machine, split, session, week, sheet.

## Banned words (hard veto)

Grep-verified against COPY.md. Any hit blocks the build.

**Universal AI-slop list:** unlock, elevate, revolutionize, seamless, cutting-edge, world-class, game-changer, empower, robust, leverage, innovative, next-level, stunning, discover, transform, best-in-class, unleash, delve, tapestry, supercharge, effortless, ultimate, powerful, smart, personalized, AI, AI-powered, journey, welcome, get started, let's, oops, whoops, awesome, amazing.

**Brand-specific fitness-cliché bans:** crush, crushing, beast, beast mode, grind, gains, hustle, smash, killer, no pain no gain, shred, sweat, goals, glow up, level up, fitness journey, your best self, body goals.

**Style bans:** exclamation marks in UI copy. Emoji in UI copy (the ★ ▲ ◐ ⚙ glyphs are icons, not copy). Em dashes in UI copy (use a middle dot · or a period). Hype emoji.

Note: "Elevation" is the product name and is allowed. The banned root is "elevate" only.

## Proof points inventory

Only these may back a claim. A claim without one is deleted or softened to an opinion ("We think...").

| ID | Proof point | Source |
|---|---|---|
| P1 | Progress Score = 40% volume change + 40% avg e1RM change + 20% consistency (sessions vs planned) | app.js `weekly()`, Week view |
| P2 | Verdict bands: above +2% PROGRESS, within ±2% HOLD, below −2% DIP. First logged week is BASELINE | app.js `verdict()` |
| P3 | e1RM = kg × (1 + reps ÷ 30), the Epley formula | app.js `local.act()` |
| P4 | Weights stored in kg. lbs = kg × 2.20462. Each set shows both | app.js `LB`, `both()` |
| P5 | Reps and weight pre-fill from the last set on that machine | app.js `views.log` |
| P6 | Data lives in your own Google Sheet, via your Apps Script web app URL | BUILD_BRIEF.md, Setup view |
| P7 | Demo mode works with no setup. Data stays in this browser | app.js `load()` |
| P8 | Offline: shows last synced data | app.js `load()` catch |
| P9 | Free. No paid services | BUILD_BRIEF.md ("Free only") |
| P10 | Daily reminder email, plus tomorrow's planned workout added to Google Calendar. Time is set in the Sheet | apps-script/Code.gs `reminder()`, `installTriggers()` |
| P11 | Share card as PNG. Uses the phone share sheet where supported, otherwise downloads | app.js share functions |
| P12 | Calendar marks done days and planned split days from the Schedule tab | app.js `views.calendar` |
| P13 | Light and dark theme | index.html, app.js theme toggle |
| P14 | No sign-up for Elevation itself | app.js (no login screen) |
| P15 | 44px+ touch targets, reduced motion respected | BUILD_BRIEF.md. Claim only after QA passes |

Deleted claims: "fastest", "smarter", "AI", "science-backed", "used by thousands", "guaranteed gains", "results in 30 days".

## Writing rules

1. **Concrete over clever.** `Last: 8 × 60 kg` beats `Your history at a glance`.
2. **One job per element.** Headline sells the outcome. Body says how. Button says what happens on tap.
3. **Buttons state the result.** `Log set`, `Save & sync`, `Share week`, `Connect sheet`. Never `Submit`, `OK`, `Learn more`.
4. **Errors explain and give the next step.** `Couldn't reach your sheet. Check the URL in Setup.`
5. **Empty states give a path.** `No sets yet. Log your first one above.`
6. **Phone first.** Nav labels ≤ 8 characters. Buttons ≤ 16 characters in a two-column row. Headlines ≤ 6 words. Body ≤ 20 words per intro section.
7. **Alt and aria text describe, never decorate.** `Estimated 1 rep max and top set over 12 sessions`, not `Cool chart`.
8. **Sentence case** everywhere except the uppercase display labels.
9. **Units and numbers** are always mono. Use the × sign for sets × reps. Use the middle dot · between facts on one line.
10. **Data values stay as they are in the Sheet.** Intensity `Easy` / `Med` / `Hard`, splits `Upper` / `Lower` / `Arms & Shoulders`, verdicts `PROGRESS` / `HOLD` / `DIP`. Don't rename them in copy.

## Self-verify

- [x] VOICE.md written before COPY.md
- [x] Zero banned words in copy/COPY.md (grep run before handback)
- [x] Every number on screen traces to a proof point
- [x] Every button states its result
- [x] Title ≤ 60 characters, description ≤ 155 characters
