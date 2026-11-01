# Motion Doctrine — "telemetry tick"

Every UI motion is 300ms or less. Easings come from design-dna: out `cubic-bezier(.2,.8,.2,1)`, snap `cubic-bezier(.3,1.4,.5,1)`, inOut `cubic-bezier(.65,0,.35,1)`. Animate only `transform` and `opacity`.
Under `@media (prefers-reduced-motion: reduce)`: transforms off, opacity fades of 120ms or less, count-ups replaced by the final value.

| Interaction | Full motion | Reduced motion |
|---|---|---|
| **Set logged** | CTA press scale .98 (80ms); new row slides in translateY 6px to 0 with fade, 200ms out; set counter digit rolls 200ms; `vibrate(10)` | row fades in over 120ms; vibration kept (not visual) |
| **PR hit** | after the set lands: one volt scanline across the weight panel (280ms inOut); "NEW PR" chip scales .8 to 1 with snap, 220ms; `vibrate([12,40,12])` | chip fades in over 120ms; panel border turns volt, static, for 2s |
| **Favorite toggle** | star fills and scales 1 to 1.25 to 1 with snap, 180ms; row background flashes surface-2 for 140ms | instant fill swap |
| **Verdict reveal** (Week) | score counts 0 to value in 300ms; verdict word clip-reveals left to right in 240ms after a 60ms delay; component bars grow scaleX 0 to 1 with 40ms stagger, all within 300ms | final state, 120ms fade |
| **Tab change** | active rail slides to the new tab, 200ms out; view crossfades in 140ms with translateX 8px in the tab's direction | 120ms crossfade only |
| Toast | translateY 12px to 0 in 160ms; exits with a 140ms fade | fade |
| Bottom sheet (calendar day) | translateY 100% to 0 in 280ms out; scrim fades 0 to .6 | 120ms fade |

Rules: no looping ambient animation; no scroll-linked motion in the app; at most one hero motion per action; motion never blocks input (a set can be logged while an animation runs).
