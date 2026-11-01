# Scrollme brief: sign-in parallax intro

Status: approved on 2026-11-01.
This file replaces the older sheet-connect intro brief for `intro/` only.

## Goal

The page at `intro/` is the 3D landing page and the sign-in page.
The signed-out screen inside `app.js` stays as it is.

## Audience

One lifter.
Phone first at 390px.
Desktop check at 1440px.

## Decisions

1. Replace `intro/` only.
2. Keep the existing Google sign-in button and the same public client id.
3. Put the action in the first view and again on section 05.
4. The hero is the gym photo plus a local Three.js weight plate.
5. Keep Volt telemetry on this page.
6. Ship the page and a separate silent 16:9 film of 8 seconds.
7. One scroll value drives the camera.
8. The sign-in control is visible at 390px without scrolling.
9. Local preview only.
10. Show this page even when the client id is blank.
11. A blank client id shows Enter demo.
12. Enter demo does not skip the app gate.
13. Open app goes to `../` and can still meet the app sign-in screen.

## Sections

1. Lift. Log. Know if it's working.
2. Last set, already filled in.
3. Every machine, charted.
4. One verdict per week.
5. Start with this account.

## Motion

Camera keyframes sit at 0, 0.25, 0.5, 0.75 and 1.
UI motion uses the existing duration tokens and stays at or under 300ms.
Reduced motion keeps one static frame.
The form stays visible.

## Out of scope

No git commit.
No deploy.
No change to `app.js`.
No change to the portrait film at `hyperframes/output/final.mp4`.
