# Plan: sign-in parallax intro

## Build

1. Keep one native scroll owner.
2. Sample `scrollTop / (scrollHeight - clientHeight)` in one animation frame.
3. Move a perspective camera through five keyframes.
4. Each keyframe has a position and a look target.
5. Parallax the gym photo with CSS variables.
6. Load `../assets/three.module.js` after idle.
7. Draw one opaque plate with an axle hole, three grip holes, a steel hub and a red index mark.
8. Cap the pixel ratio at 1.5, and at 1.25 below 768px.
9. On `pagehide`, cancel the frame and dispose the renderer.
10. If WebGL fails, keep the CSS plate.

## Sign-in

1. Read `localStorage` key `session`.
2. A valid session has `token`, `email` and `exp`.
3. A valid session hides Google and shows Continue to `../`.
4. Otherwise load Google Identity Services with `hl=en`.
5. Render the button in both `[data-gsi]` slots.
6. On success, check `aud` and email, store the same session shape as the app, then go to `../`.
7. If the email changes, remove `cache` and `outbox` first.

## UX laws in the plan

1. Fitts: primary controls are at least 48px and sit in the first view.
2. Hick: one Google action, plus Open app.
3. Jakob: logo left, numbered story nav, standard Google button.
4. Miller: five sections.
5. Tesler: Google and the app own the account.
6. Aesthetic-Usability: one volt accent on carbon.
7. Doherty: text paints before Three.js.
8. Peak-End: the same action returns on section 05.
9. Serial position: hook first, account last.
10. Von Restorff: volt marks the current section and the primary panel.
11. Pareto: sign-in is the job of this page.
12. Occam: no second scroller and no new account system.
13. Postel: a bad token shows a short retry line.
14. Zeigarnik: nav shows 01 to 05 and a screen-reader section count.

## Agents

Specialist agents were not spawned.
They would write the same `intro/` files at the same time.
The coordinator ran the page, the film source and these notes.
See ORCHESTRATOR.md for the blocked roles.
