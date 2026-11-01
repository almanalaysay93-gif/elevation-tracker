# Style Spec — Volt Telemetry

**Primary style: Motorsport HUD / Telemetry** (dark OLED instrument cluster).
**Secondary style: Swiss data brutalism** (strict grid, huge tabular numerals, hairline rules). No third style.

## Material
Matte carbon black (#07090A), not slate. Surfaces are flat panels separated by 1px hairlines. The chamfered top-right corner (10px clip-path cut) is the brand mark, used only on the primary panel and the main CTA. No glass, no blur, no drop-shadow cards. Volt #C6FF00 acts as a light source: active rail, primary CTA, PR flash, PROGRESS verdict. Cyan #00E5FF is the secondary signal (second chart series, HOLD, syncing). No purple anywhere, no multi-stop gradients.

## Motion grammar: "telemetry tick"
Elements snap in (translateY 6px to 0, 140–200ms, ease-out) and numbers roll (digit count-up, 300ms max). Nothing floats, loosely bounces, or loops in the background. One accent scanline sweep, left to right, is kept for hero moments.

## Hero moment
**Set logged, then PR hit.** The weight numeral (64px mono) locks, a volt scanline sweeps the panel once, a "NEW PR +2.5kg" chip stamps in with snap easing, and `navigator.vibrate` fires. Secondary hero: the weekly verdict reveal on the Week screen.

## Phone-first at 390px, one-handed
- Bottom tab bar with 5 tabs (Log, Favs, Charts, Cal, Week); Setup sits behind a header gear. Bar is 64px plus safe area.
- Log: the input stack lives in the thumb zone; the full-width 56px "LOG SET" CTA is pinned above the tab bar.
- Steppers (±2.5kg, ±1 rep) are 48px; numeric fields use `inputmode="decimal"`.
- The top 40% of the screen is read-only context (exercise name, last set, PR).

## Anti-slop (style level)
No purple/indigo gradients · no slate rounded-2xl card grids · no emoji icons · no glassmorphism · no 4-equal-KPI-tile hero · no default-everything 24px icon sets · no center-aligned body text · no fake 3D · no infinite pulse animations · no "Welcome back, User!" copy.
