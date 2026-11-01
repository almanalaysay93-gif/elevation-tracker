# UX laws audit — intro sign-in parallax

Date: 2026-11-01.
Surface: `intro/` in headless Chrome.

| Law | Status | Evidence | Required fix |
| --- | --- | --- | --- |
| Fitts | Compliant | Open app is 48px tall. Its bottom is 358px in an 844px view. Section links are 48px. | None |
| Hick | Compliant | First view has Google and Open app. A stored session shows only Continue. | None |
| Jakob | Compliant | Logo links home. Story nav is 01 to 05. The Google button is the standard control. | None |
| Miller | Compliant | Five sections. One line of proof on the first beat. | None |
| Tesler | Compliant | The page does not ask for a password. Google and the app own the account. | None |
| Aesthetic-Usability | Compliant | Volt `#C6FF00` on carbon. One plate. Chamfered panel. | None |
| Doherty | Partial | Text is in the HTML. Three.js loads after idle. Google script time was not timed. | None in this pass. The note clears when the button paints. |
| Peak-End | Compliant | Section 05 repeats the account action. Headless check showed current nav 05 and a second Google iframe. | None |
| Serial position | Compliant | The hook and the sign-in are first. The account action is last. | None |
| Von Restorff | Compliant | The current section and the primary panel use volt. Other panels do not. | None |
| Pareto | Compliant | The page job is sign-in plus five short proofs. Sheet setup stays in the app. | None |
| Occam | Compliant | One scroll loop. No new auth store. | None |
| Postel | Compliant | A bad audience or email shows a short retry line. Storage failure names Open app. | None |
| Zeigarnik | Compliant | Nav 01 to 05 plus the text "Section n of 5". | None |

## Summary

Violations found: 0.
Partials: 1 (Doherty, Google script not timed).
Re-audit required: no for the page layout.
