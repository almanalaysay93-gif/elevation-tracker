# Scrollme brief: Elevation intro

Status: approved. The user confirmed the brief in the scrollme request. This file restates it as built.

## Goal
A scroll-driven onboarding story at `intro/` that explains Elevation in five sections and sends the lifter to the app or to the Setup section for connecting a Google Sheet.

## Audience
Lifters who have not used Elevation. Phone first (390px), desktop secondary (1440px).

## Sections (from copy/COPY.md, intro.s1 to intro.s5)
The "01 HOOK" style beat names below are internal labels. They are not shown on the page (round 1, S-4). The nav shows 01 to 05 with screen-reader names "Section 1" to "Section 5".
1. 01 HOOK. "Lift. Log. Know if it's working."
2. 02 LOG FAST. "Last set, already filled in."
3. 03 SEE PROGRESS. "Every machine, charted."
4. 04 WEEKLY VERDICT. "One verdict per week."
5. 05 CONNECT YOUR SHEET. "Your data stays in your Sheet."

## Endings
- "Open app" links to `../`.
- "Connect sheet" links to `../#settings`.

Copy file says "Connect my sheet". The brief wording wins. Recorded in PLAN.md.

## Visual direction
- Sporty cyberpunk telemetry. Matte black `#07090A`, volt `#C6FF00` for the primary object and actions, cyan `#00E5FF` wireframe edges.
- No purple gradients. Dark default, light theme follows tokens.
- Fonts from tokens: Chakra Petch (display), Inter (body), JetBrains Mono (numbers and labels).

## Hero object
One procedural barbell with plates. No downloaded assets.

## Motion
- One normalized scroll value drives the camera and the object.
- Reveals are opacity and a 12px transform, `var(--dur-slow)` (280ms) with `var(--ease-out)`, using IntersectionObserver. Round 1 moved these from literal values to tokens.
- No loops, no ambient motion. Motion ceiling 300ms. Transform and opacity only.

## Requirements
- WCAG 2.2 AA. 48px touch targets. Visible focus ring. Skip link.
- Reduced motion: no camera travel, static frame, opacity-only reveals at 120ms or less.
- WebGL failure or JS off: all five sections readable, CSS visual shown.
- Semantic HTML with real links. No horizontal scroll at 390px.
- Write only inside `intro/`. No publish, no deploy.

## Out of scope
Changes to the app, `copy/`, `tokens.css`, or any file outside `intro/`.
