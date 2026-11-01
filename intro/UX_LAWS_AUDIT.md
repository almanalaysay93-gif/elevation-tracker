# UX laws audit: Elevation intro

Status key: Compliant / Partial / Violated. Evidence points to the QC run (`QC_REPORT.md`) or to code in `index.html`, `intro.css` and `intro.js`.

| # | Law | Status | Evidence |
|---|---|---|---|
| 1 | Fitts | Compliant | Playwright measured all `a.btn` at 48px tall at 390px and 1440px (`touch-target-48` PASS). Nav links use `min-height: 44px`. |
| 2 | Hick | Compliant | One primary action per section. Section 5 has two buttons, the other sections have at most one. Nav offers five fixed choices. |
| 3 | Jakob | Compliant | "Open app" and "Connect sheet" say what happens. Nav links are numbered 01 to 05 with screen-reader names "Section 1" to "Section 5". Headings use the copy text. Internal beat labels ("01 HOOK" and so on) are no longer visible (round 1, S-4). |
| 4 | Miller | Compliant | Five sections, five nav items. Each section has one headline and one short body. |
| 5 | Tesler | Compliant | Apps Script setup is left to the app's Setup section. The intro only asks the lifter to paste a URL later. |
| 6 | Aesthetic-Usability | Compliant | Token palette, one hero object, consistent chamfered panels. Screenshots at 390px and 1440px in dark and light show a clean layout. |
| 7 | Doherty | Compliant | Round 1: the hero text is in the first paint with no JS (LCP 0.9 s, Lighthouse mobile x2). Three.js loads after load and idle, so the hero object arrives after the text. No-JS and WebGL-blocked runs PASS. |
| 8 | Peak-End | Compliant | Section 5 ends on the filled volt "Open app" button, the clearest next step. |
| 9 | Serial Position | Compliant | Hook is first, the primary CTA is last. Both positions are the strongest for recall. |
| 10 | Von Restorff | Compliant | Only the primary action is filled volt. "See how it works" and "Connect sheet" are outlined or ghost. |
| 11 | Pareto | Compliant | Sections 1 and 5 carry the decision (what it is, and how to start). Sections 2 to 4 are the proof. |
| 12 | Occam | Compliant | No video, no extra libraries, no animation beyond scroll-linked camera and reveal. |
| 13 | Postel | Compliant | Works with JS off (`no-js-text` PASS), with WebGL failing (`webgl-failure-fallback` PASS), with reduced motion (`camera-reduce` PASS). Robust input is not needed (no form). |
| 14 | Zeigarnik | Compliant | "Section n of 5" updates as the lifter scrolls, and the nav marks the current section with `aria-current`. |

## Summary
- Compliant: 14
- Partial: 0
- Violated: 0

Round 1 re-audit: Doherty moved from Partial to Compliant (measured LCP 0.9 s with the hero text first). Jakob evidence updated for the removed labels.

## Re-audit after fixes
Fixes made during QC:
- Portrait camera distance raised so the barbell fits at 390px (was clipped at the edges).
- Desktop object shifted right so it no longer runs under the text panel.
No law changed status after the fixes. Doherty stays Partial until the first-frame time is measured.
