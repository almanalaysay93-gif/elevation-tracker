# Landing motion brief

Status: Confirmed by the user's request on 2026-11-02.

## Goal

Replace the current layered morph between signed-out landing scenes with clear, solid transitions.

## User and action

- Audience: One lifter. Phone first at 390 px.
- Primary action: Sign in with Google from the final scene.
- Story: Bench press, strength, volume, consistency, then sign in.
- Existing copy, clips, 3D equipment, controls, and scene order stay in use.

## Motion direction

- Use an opaque, directional hard-edge wipe between different clips.
- Move scene panels in 3D with transforms.
- Use no opacity tween, blur, flash, screen blend, or shake in scene transitions.
- Keep reverse navigation and the user's Motion toggle.

## Constraints

- Existing vanilla JavaScript app. Existing GSAP and local Three.js stay in use.
- Existing user-owned MP4 and poster assets stay in use.
- Phone target: 390 px. Desktop target: 1440 px.
- No paid tools, new dependencies, asset downloads, commit, push, or deployment.
- Google sign-in remains unchanged.
