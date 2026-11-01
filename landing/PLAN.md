# Landing motion plan

## Confirmed scope

Repair the scene change in `landing.js` and `landing.css`.
Preserve the five-scene story, MP4 clips, 3D equipment, Google sign-in, controls, and manual Motion toggle.

## Execution graph

| ID | Depends on | Owner | Files | Acceptance and evidence |
| --- | --- | --- | --- | --- |
| P1 | None | Coordinator | `landing.js`, `landing.css` | Reproduce current alpha, blur, seam and panel transitions. Record pre-fix frame. |
| P2 | P1 | Coordinator, motion role run sequentially | `landing.js`, `landing.css`, `app.js` | Use video visibility plus a hard-edge clip-path wipe. Move panels and text with transforms only. Record source checks and forward/reverse transition frames. |
| P3 | P2 | Coordinator, design polish run sequentially | `landing.css` | Preserve existing red/graphite style and make the transition edge solid. |
| P4 | P2, P3 | Coordinator, QC role run sequentially | `landing/UX_LAWS_AUDIT.md`, `landing/QC_REPORT.md`, `.buildme/qa/landing/` | Check navigation, 390/1440 layouts, reduced-motion toggle, keyboard, runtime, and assets. Record missing tooling as BLOCKED. |

Delegation is not available with the required Haiku model in this host. Roles run sequentially. No other actor edits shared files.

## Property ownership

- `landing.js` owns scene state, clip visibility, scene transition timeline, and animation transforms.
- `landing.css` owns static layer placement and the opaque seam.
- No other code owns opacity, blur, or filters during scene transitions.
- Native wheel, touch, keyboard, dots, and arrow controls remain the input sources.

## UX law map

| Law | Decision | Check |
| --- | --- | --- |
| Fitts | Keep 44 px controls and direct scene buttons. | Measure controls at 390 px. |
| Hick | Keep five scenes and one primary sign-in action. | Count choices per scene. |
| Jakob | Keep dots, arrows, and standard Google sign-in. | Click and keyboard review. |
| Miller | Keep the five-scene sequence. | Verify scene count and order. |
| Tesler | Keep Google-owned authentication. | Confirm sign-in wiring unchanged. |
| Aesthetic-usability | Replace the noisy morph with one solid wipe and 3D panel motion. | Review desktop and phone transition frames. |
| Doherty | Keep the transition under one second and show immediate navigation state. | Measure timeline duration and navigation lock. |
| Peak-end | Keep the sign-in scene as the last scene. | Traverse to scene five. |
| Serial position | Keep product value first and sign-in last. | Verify scene order. |
| Von Restorff | Keep ember accent on active scene and progress. | Inspect active state. |
| Goal-gradient | Keep scene count and progress indicator. | Verify count and bar update. |
| Postel | Keep wheel, touch, keys, dots, and arrow inputs. | Exercise forward and reverse paths. |
| Zeigarnik | Keep the visible progress count. | Verify remaining scenes are shown. |
| Proximity/common region | Keep each title and proof card grouped in one panel. | Inspect each scene. |

## Final review

Run the motion checks from the ScrollMe verification protocol. Do not claim a pass where browser evidence is unavailable. No release action is in scope.
