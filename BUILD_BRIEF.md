# BUILD_BRIEF — Elevation gym tracker (approved)

**Product:** personal gym tracker. Static web app on GitHub Pages + Google Sheet backend via Apps Script web app (apps-script/Code.gs). Free only.
**User:** one lifter, Mon/Wed/Fri Upper/Lower (flexible). Uses phone at gym (primary, one-handed, 390px) and PC.
**Must have (all exist in v1, keep working):** log sets (reps, weight kg/lbs with conversion, intensity Easy/Med/Hard, notes); exercises from Sheet + add new from app; favorites (★) grouped Upper / Lower / Arms & Shoulders; progress charts per exercise (e1RM Epley, top set); calendar with done/planned days; weekly KPI Progress Score (0.4 vol Δ + 0.4 avg e1RM Δ + 0.2 consistency; >+2 PROGRESS, ±2 HOLD, <−2 DIP); share card PNG via Web Share API; light/dark toggle; demo mode when no API URL; email + Google Calendar reminders (Apps Script).
**Upgrade goal:** PREMIUM feel, phone-first optimized. Sporty cyberpunk, NO purple gradients. Fast (<250KB gz, no framework required), 44px+ touch targets, WCAG 2.2 AA, reduced motion.
**Data contract:** GET `?` → `{ok, state:{exercises[{Name,Machine,Group,Favorite}], log[{ID,Date,Exercise,Group,Set,Reps,Weight,Unit,KG,LBS,Volume,E1RM,Intensity,Notes}], schedule[{Day,Split,Active}]}}`. POST text/plain JSON `{action: addSet|deleteSet|addExercise|toggleFav, ...}` → same shape.
**Activation:** A0–A13, A15 active; A14 NOT_APPLICABLE (no in-product AI). Scrollme: scroll-driven intro/onboarding story page. Designme: design system direction + 9:16 promo reel of the app.
