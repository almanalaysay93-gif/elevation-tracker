# Elevation — personal gym tracker

Log reps, weight (kg **and** lbs), and intensity (Easy / Med / Hard) per machine. See progress charts, a workout calendar, favorites grouped by Upper / Lower / Arms & Shoulders, a weekly Progress Score KPI, and shareable summary images. Data lives in **your Google Sheet**. Reminders arrive by **email + Google Calendar** — all free.

Live app: GitHub Pages (see repo *About* link). Works on phone and PC. Without setup it runs in demo mode (data stored in the browser only).

## 1. Create the Sheet + backend (5 min)

1. Create a blank Google Sheet (sheets.new). Name it `Elevation Gym Log`.
2. **Extensions → Apps Script.** Delete the sample code, paste all of [`apps-script/Code.gs`](apps-script/Code.gs), save.
3. Pick `setup` in the function dropdown → **Run** → grant permissions. This creates the tabs:

| Tab | What it holds |
|---|---|
| `Exercises` | Name, Machine, Group (Upper / Lower / Arms & Shoulders), Favorite ☑ — edit or add rows any time |
| `Log` | One row per set: date, exercise, set #, reps, weight, unit, KG, LBS, volume, e1RM, intensity, notes |
| `Daily` | Auto QUERY table: sets, reps, volume, top set per day |
| `Weekly` | KPI per week: sessions vs planned, volume Δ%, avg e1RM Δ%, consistency, **Score**, **Verdict** |
| `Weekly_Exercise` | Same per exercise per week |
| `Schedule` | Mon Upper · Wed Lower · Fri Upper (edit freely; Rest = no reminder) |
| `Settings` | Reminder email, ReminderHour (20 = 8pm), WorkoutHour (18 = 6pm event), CalendarEvents |

4. Pick `installTriggers` → **Run**. Every night at ReminderHour you get an email if tomorrow is a planned day, plus a Google Calendar event with a 60-min phone pop-up.
5. **Deploy → New deployment → Web app.** Execute as **Me**, access **Anyone**. Copy the `/exec` URL.
6. Open the app → **Setup** → paste the URL → **Save & sync**.

> "Anyone" means anyone holding the long secret URL can read/write your log. Don't post it publicly.

After editing `Code.gs`, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Progress Score (KPI)

```
Score = 0.4 × volume Δ%  +  0.4 × avg e1RM Δ%  +  0.2 × (consistency% − 100)
e1RM  = kg × (1 + reps / 30)          (Epley)
consistency = min(sessions / planned, 1)
```
`> +2%` **PROGRESS** · `±2%` **HOLD** · `< −2%` **DIP** · first week **BASELINE**.

## Run locally

Any static server: `npx serve .` then open the printed URL.
