# COPY.md: every user-facing string, keyed by screen

Voice rules: see `VOICE.md`. Placeholders are in `{braces}`. Tables use ID, string, and a note on length or behavior.
Length budget at 390px: nav ≤ 8 characters, buttons ≤ 16, headlines ≤ 6 words, body ≤ 20 words.
Strings marked **NEW** are not in v1 and need a code change. Strings marked **CHANGED** replace a v1 string.

---

## Global

| ID | String | Note |
|---|---|---|
| g.brand | ▲ ELEVATION | Header wordmark, uppercase display |
| g.skip | Skip to content | Existing |
| g.nav.log | Log | |
| g.nav.favs | Favs | |
| g.nav.charts | Charts | |
| g.nav.calendar | Calendar | Fallback `Cal` if it overflows at 390px. Test before shipping |
| g.nav.week | Week | |
| g.nav.setup | Setup | |
| g.unit.label | kg / lbs | Chip shows the current unit |
| g.theme.toLight | Switch to light theme | aria-label, shown in dark mode |
| g.theme.toDark | Switch to dark theme | aria-label, shown in light mode |
| g.status.default | | Status line is empty when nothing is happening |

---

## Log screen

| ID | String | Note |
|---|---|---|
| log.h1 | Log a set | |
| log.plan.upper | Plan: Upper day + Arms & Shoulders | Shown when today's split is Upper |
| log.plan.split | Plan: {split} day | Lower, or any other split |
| log.plan.rest | Rest day on the plan. Training still counts. | Shown when no split is planned |
| log.field.date | Date | |
| log.field.exercise | Exercise / machine | |
| log.last | Last: {reps} × {weight} {unit} · {intensity} | Pre-filled reference line. Shown when this machine has a previous set |
| log.best | Best e1RM {best} | Second line under "Last" |
| log.field.reps | Reps | |
| log.field.weight | Weight ({unit}) | `{unit}` = kg or lbs |
| log.entryUnit.group | Entry unit | aria-label on the chip group |
| log.entryUnit.kg | kg | Chip |
| log.entryUnit.lbs | lbs | Chip |
| log.conv.toLbs | = {value} lbs | Live conversion, shown when weight > 0 and entry is kg |
| log.conv.toKg | = {value} kg | Live conversion, shown when weight > 0 and entry is lbs |
| log.intensity.label | Intensity | Label above the chip group |
| log.intensity.easy | Easy | Data value, do not rename |
| log.intensity.med | Med | Data value, do not rename |
| log.intensity.hard | Hard | Data value, do not rename |
| log.notes.label | Notes (optional) | |
| log.notes.placeholder | Seat 4, slow negatives | Example, not a prompt |
| log.submit | Log set | Button, 2-column friendly |
| log.submit.busy | Saving… | Button while the request is in flight |
| log.newMachine.summary | + New exercise or machine | `<summary>` of the disclosure |
| log.newMachine.name | Exercise name | |
| log.newMachine.machine | Machine / equipment | Optional |
| log.newMachine.group | Group | Select, options are Upper / Lower / Arms & Shoulders |
| log.newMachine.submit | Add machine | **CHANGED** from "Add to sheet". Works in demo mode too |
| log.today.h2 | Sets on {date} ({n}) | |
| log.today.share | Share day | Shown when there is at least one set |
| log.today.empty | No sets yet. Log your first one above. | Empty state |
| log.set.line | {reps} × {kg} kg · {lbs} lbs | Each logged set. Shows both units |
| log.set.delete | Delete set {n} of {exercise} | aria-label on ✕ |

### Log: errors and validation

| ID | String | Note |
|---|---|---|
| err.log.reps | Enter reps and weight. | Form validation, shown in status line |
| err.log.noExercise | Pick an exercise first. | Shown if no exercise is selected |
| err.log.dupe | That machine is already on the list. | Duplicate exercise name, case-insensitive |
| err.log.nameEmpty | Name the exercise. | New exercise form |

---

## Favorites screen

| ID | String | Note |
|---|---|---|
| fav.h1 | Favorites | |
| fav.intro | Tap ★ on any machine to pin it here. Tap a card to log it. | |
| fav.group.upper | Upper | Group heading, from data |
| fav.group.lower | Lower | Group heading, from data |
| fav.group.arms | Arms & Shoulders | Group heading, from data |
| fav.group.count | {n} | Mono count next to the heading |
| fav.card.last | Last: {reps} × {both} | `both` = `{kg} kg · {lbs} lbs` |
| fav.card.none | Not logged yet | Card with no sets |
| fav.card.best | Best e1RM {best} | |
| fav.card.aria | Log {exercise} | aria-label on the card button |
| fav.empty | No favorites yet. Tap ★ on any machine. | Empty state inside a group |
| fav.all.h2 | All machines | |
| fav.star.add | Add {exercise} to favorites | aria-label on ★ |
| fav.star.remove | Remove {exercise} from favorites | aria-label on ★ when pinned |
| fav.search | Search machines | **NEW**. Label (visually hidden) and placeholder for the Favorites search box |

---

## Charts screen

| ID | String | Note |
|---|---|---|
| chart.h1 | Charts | **CHANGED** from "Progress". Matches the nav label |
| chart.select.label | Exercise / machine | |
| chart.kpi.best | Best e1RM | Card label |
| chart.kpi.heaviest | Heaviest set | Card label |
| chart.kpi.heaviestSub | × {reps} on {date} | Under the heaviest-set value |
| chart.kpi.sessions | Sessions | Card label |
| chart.kpi.since | Since first session | **CHANGED** from "Since first". Clearer for a delta |
| chart.empty | Log this machine to see a chart. | Empty state, no sessions |
| chart.empty.none | No machines yet. Add one on Log. | Empty state, no exercises at all |
| chart.aria | Estimated 1 rep max and top set over {n} sessions | role=img label |
| chart.point | {date}: e1RM {value} {unit} | SVG title on each point |
| chart.legend.e1rm | Est. 1RM ({unit}) | Legend |
| chart.legend.top | Top set ({unit}) | Legend |
| chart.history.h2 | History | |
| chart.history.line | {date} #{set} | Mono, followed by `{reps} × {both}` and the intensity tag |

---

## Calendar screen

| ID | String | Note |
|---|---|---|
| cal.h1 | Calendar | |
| cal.prev | Previous month | aria-label on ‹ |
| cal.next | Next month | aria-label on › |
| cal.legend.done | Done | |
| cal.legend.planned | Planned | |
| cal.badge.upper | UP | Two-letter badge on a planned Upper day |
| cal.badge.lower | LOW | Two-letter badge on a planned Lower day |
| cal.day.aria | {date}, workout logged | Suffix on the day aria-label |
| cal.day.ariaPlanned | {date}, planned {split} | Suffix on the day aria-label |
| cal.day.h2 | {date} · {split} | Selected-day heading. Split omitted on rest days |
| cal.day.share | Share | Shown when the selected day has sets |
| cal.day.empty.planned | {split} day. Nothing logged yet. | Empty state, planned day |
| cal.day.empty.rest | Rest day. | Empty state, rest day |
| cal.day.logHere | Log on this day | Button |

---

## Week screen (Weekly KPI)

| ID | String | Note |
|---|---|---|
| wk.h1 | Weekly KPI | Nav label is Week. Heading keeps the full name |
| wk.explain | Progress Score = 40% volume change + 40% avg e1RM change + 20% consistency (sessions vs {n} planned). | Shown above the cards |
| wk.explain.bands | Above +2% = PROGRESS · within ±2% = HOLD · below −2% = DIP | Second line of the explainer |
| wk.empty | Log a week of training to see your Progress Score. | Empty state |
| wk.verdict.PROGRESS | PROGRESS | Verdict badge |
| wk.verdict.HOLD | HOLD | Verdict badge |
| wk.verdict.DIP | DIP | Verdict badge |
| wk.verdict.BASELINE | BASELINE | Verdict badge, first logged week |
| wk.verdict.help.PROGRESS | Score above +2%. | Shown on the card under the badge |
| wk.verdict.help.HOLD | Score within ±2%. | |
| wk.verdict.help.DIP | Score below −2%. | |
| wk.verdict.help.BASELINE | First logged week. Nothing to compare yet. | |
| wk.card.h2 | Week of {date} | |
| wk.card.score | Score | Stat label |
| wk.card.volume | Volume | Stat label |
| wk.card.e1rm | Avg e1RM change | **CHANGED** from "Avg e1RM Δ". No Greek symbols in labels |
| wk.card.sessions | Sessions | Stat label, value `{n}/{planned}` |
| wk.card.perEx | Per exercise | Disclosure summary |
| wk.card.perEx.line | {sets} sets · {volume} vol | Mono, under each exercise name |
| wk.share | Share week | Button |

---

## Setup screen

| ID | String | Note |
|---|---|---|
| set.h1 | Setup | |
| set.url.label | Apps Script web app URL | |
| set.url.placeholder | https://script.google.com/macros/s/…/exec | |
| set.url.help | Leave empty for demo mode. Data stays in this browser. | |
| set.url.guide | Setup steps are in the README on GitHub. | "README" is a link |
| set.save | Save & sync | Button, states the result |
| set.test | Test connection | Button |
| set.unit.label | Display unit | **NEW**. Label over the kg / lbs toggle on Setup |
| set.theme.label | Theme | **NEW**. Label over the Dark / Light toggle on Setup |
| set.plan.h2 | Plan | |
| set.plan.note | Change your split in the Schedule tab of your Sheet. Reminders read it daily. | |
| set.plan.empty | No schedule found. Add rows to the Schedule tab. | **NEW**. Shown if the schedule is empty |

---

## Share card and dialog

| ID | String | Note |
|---|---|---|
| share.dialog.title | Share summary | Dialog heading |
| share.canvas.day | Workout summary image | aria-label on the canvas, day view |
| share.canvas.week | Week summary image | aria-label on the canvas, week view. **NEW** |
| share.go | Share | Button. Opens the phone share sheet where supported |
| share.save | Save PNG | Button |
| share.close | Close | Button |
| share.card.dayTitle | {split} DAY | Card headline. Falls back to WORKOUT on a rest day |
| share.card.dayTitleFallback | WORKOUT | |
| share.card.dayStat.sets | SETS | Card stat label |
| share.card.dayStat.volume | VOLUME | Card stat label |
| share.card.dayStat.moves | MOVES | Card stat label |
| share.card.weekTitle | {verdict} | Card headline, PROGRESS / HOLD / DIP / BASELINE |
| share.card.weekStat.score | SCORE | Card stat label |
| share.card.weekStat.volume | VOLUME | Card stat label |
| share.card.weekStat.sessions | SESSIONS | Card stat label |
| share.card.footer | Tracked with Elevation | Card footer |
| share.native.title.day | My workout | Share sheet title |
| share.native.title.week | My week | Share sheet title. **NEW** |
| share.native.text | Logged with Elevation | Share sheet body. **CHANGED** from "Workout logged with Elevation" |
| share.fallback | Sharing isn't on in this browser. Image saved instead. | Shown when the Web Share API is missing |

---

## Status and system messages

| ID | String | Note |
|---|---|---|
| status.demo | Demo mode. Data stays on this device. Connect your sheet in Setup. | Shown on load with no URL |
| status.syncing | Syncing with your Google Sheet… | Shown during load |
| status.saving | Saving… | Shown during a write |
| status.saved | Saved to your Google Sheet. | After a successful write |
| status.connected | Connected. Sheet synced. | **NEW**. Shown after a successful Test connection or Save & sync |
| status.offline | Offline. Showing last synced data. | **CHANGED**. Replaces the v1 string that appended the raw error. Raw error goes to console only |
| status.error.sheet | Couldn't reach your sheet. Check the URL in Setup. | **NEW**. Fetch or network failure |
| status.error.server | Your sheet returned an error. Check Setup. | **NEW**. Replaces raw `j.error` text |
| status.error.save | Couldn't save. Try again. | **NEW**. Generic write failure |
| status.share.unsupported | Sharing isn't on in this browser. Image saved instead. | Same as share.fallback |
| status.undo | Undo | **NEW**. Action button on the toast after deleting a set. Restores the set as a new row (new ID) with the same values |
| status.deleted | Set deleted. | **NEW**. Toast text after delete |
| status.restored | Set restored. | **NEW**. Toast text after Undo |
| status.logged | Set logged. | **NEW**. Toast after Log set, when the set is not a new PR |
| status.prLogged | New PR. Set logged. | **NEW**. Toast after Log set, when the set beats the best e1RM on that machine |
| status.pr | New PR | **NEW**. Chip on the set row that set the new best e1RM. Matches the toast's first word |
| status.added | Machine added. | **NEW**. Toast after Add machine |
| status.lastNone | No sets yet on this machine | **NEW**. Shown in the LAST strip when this machine has no sets |
| status.sync.synced | Synced | **NEW**. aria-label on the sync dot when data is current |
| status.sync.pending | Saving | **NEW**. aria-label on the sync dot while a write is queued |
| status.sync.offline | Offline | **NEW**. aria-label on the sync dot when offline |
| status.sync.demo | Demo | **NEW**. aria-label on the sync dot in demo mode |

---

## Intro / onboarding scroll story

Five sections. Each has a label, a headline (≤ 6 words), and a body (≤ 20 words). The page header shows `Section {n} of 5` for screen readers.

The labels `01 HOOK` to `05 CONNECT YOUR SHEET` are internal beat names. Screen readers only (visually hidden). Do not show them as visible text.

| ID | Label | Headline | Body |
|---|---|---|---|
| intro.s1.label | 01 HOOK | Lift. Log. Know if it's working. | Elevation logs every set and tells you, week by week, whether you're progressing. One lifter. One Sheet. Free. |
| intro.s2.label | 02 LOG FAST | Last set, already filled in. | Reps and weight start from your last set on that machine. Change what changed, then tap Log set. |
| intro.s3.label | 03 SEE PROGRESS | Every machine, charted. | Estimated 1-rep max and your top set, plotted session by session. See the trend, not just today. |
| intro.s4.label | 04 WEEKLY VERDICT | One verdict per week. | PROGRESS, HOLD or DIP. Built from volume, strength change, and how often you trained against your plan. |
| intro.s5.label | 05 CONNECT YOUR SHEET | Your data stays in your Sheet. | Paste your Apps Script URL in Setup. Sets save to a Google Sheet you own. No Sheet yet? Start in demo mode. |

| ID | String | Note |
|---|---|---|
| intro.progress | Section {n} of 5 | aria-label on the progress indicator |
| intro.cta.primary | Log a set | Section 1 button. Goes to Log |
| intro.cta.secondary | See how it works | Section 1 link. Scrolls to section 2 |
| intro.s5.cta.primary | Connect sheet | Goes to Setup. Matches intro/BRIEF.md and the intro build. Replaces "Connect my sheet" |
| intro.s5.cta.secondary | Start in demo mode | Goes to Log. No data leaves the device |

Note on section 1: "Know if it's working" is backed by P2 (verdict bands). "Free" is backed by P9. "One Sheet" is backed by P6.

---

## Page title and meta

| ID | String | Length |
|---|---|---|
| meta.title | Elevation: Gym Log and Weekly Score | 34 characters. Limit 60 |
| meta.description | Log sets in kg or lbs, chart progress per machine, and get a weekly Progress Score. Free. Your data stays in your own Google Sheet. | Limit 155. Counted in the check below |
| meta.og.title | Elevation: Gym Log and Weekly Score | Same as title |
| meta.og.description | Log sets, chart each machine, and get a weekly verdict. Free, with data in your own Google Sheet. | |
| meta.og.image.alt | Elevation workout summary card | Alt for the social preview image |
| meta.theme | Elevation | Manifest and app name |
| meta.intro.title | How Elevation works: Gym Log and Weekly Score | Intro page title. Limit 60 |

---

## Empty states (summary)

| Screen | String |
|---|---|
| Log, no sets today | No sets yet. Log your first one above. |
| Favorites, no favorites | No favorites yet. Tap ★ on any machine. |
| Charts, no sessions | Log this machine to see a chart. |
| Charts, no machines | No machines yet. Add one on Log. |
| Calendar, planned day, empty | {split} day. Nothing logged yet. |
| Calendar, rest day | Rest day. |
| Week, no logs | Log a week of training to see your Progress Score. |
| Setup, no schedule | No schedule found. Add rows to the Schedule tab. |

---

## Self-verify

- [x] Every screen in the brief is covered: Log, Favorites, Charts, Calendar, Week, Setup, Share card, empty states, error and status messages, aria-labels, page title and meta, intro with 5 sections.
- [x] Every number traces to a proof point in `VOICE.md`.
- [x] Every button states its result.
- [x] Zero banned words in this file (grep run before handback: word and phrase lists both clean, no exclamation marks).
- [ ] 390px check: nav labels, chips, and the explainer line. Test on device before shipping.
