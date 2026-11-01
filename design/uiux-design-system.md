# UI/UX Design System (ui-ux-pro-max informed)

## Local queries run
Script: `E:/ai/claude/.claude/skills/ui-ux-pro-max/scripts/search.py`
- `"fitness dashboard dark" --domain style` returned Neumorphism (rejected: low contrast) and Dark Mode OLED (adopted as the base).
- `"sport energetic dark neon" --domain color` returned Arcade/Retro (#0F172A slate bg, rejected as slate slop; kept the idea of one hot accent plus a green success color).
- `"sporty technical" --domain typography` returned Fira Code + Fira Sans "Dashboard Data". Adopted the mono-for-data principle, but kept v1's Chakra Petch / Inter / JetBrains Mono for stronger sporty character.

## Tokens
Defined in `design-dna.json`. CSS custom properties: `--bg --surface --surface-2 --line --text --muted --accent --accent-ink --signal --danger --warn --cut`.

## Components
| Component | Spec |
|---|---|
| Tab bar | fixed bottom, 64px + `env(safe-area-inset-bottom)`, 5 items, 22px icon + 11px label; active = 2px volt top rail + text color; `aria-current="page"` |
| Primary CTA | 56px, full width, volt bg, ink text, Chakra 700 uppercase 16px, chamfer cut; pressed scale .98 |
| Stepper field | [−] value [+]; 48×48 buttons; value in JetBrains Mono 32px tabular |
| Segmented control (Easy/Med/Hard, kg/lbs) | 48px, hairline border, selected = surface-2 fill + volt underline |
| Panel | surface, 1px inset line, radius 0; chamfer cut only on the primary panel |
| Stat | 12px uppercase label, .12em tracking, muted; value mono 32–64px |
| Chip | 28px visual / 48px hit area, pill, mono 12px; PR chip volt; verdict chips follow the color rule |
| Toast | above CTA, 3s, `role="status"`, Undo for deleteSet |
| Chart | line, 2px stroke; volt = e1RM, cyan dashed = top set; area fill ≤ 12% alpha; gridlines at 50% line color; tap-to-inspect crosshair; 44px hit columns |
| Calendar cell | 44×44 min; done = volt dot + 15% fill; planned = cyan hairline ring; today = text underline |

## UX rules applied
- Fitts / thumb zone: primary actions in the bottom third. Destructive actions (delete set) sit behind swipe or long-press plus an Undo toast, never at thumb rest.
- Hick: Log shows favorites for today's split (Upper/Lower) first.
- Doherty: optimistic UI for addSet (under 100ms feedback), sync dot in the header.
- Contrast: text ≥ 4.5:1. Volt on bg ≈ 17:1; muted #8FA19A on #07090A ≈ 7.4:1; light accent #4D6B00 on #F2F4EE ≈ 6.1:1.
- Focus: 2px volt outline, 2px offset, never removed.
- Numerals: `font-variant-numeric: tabular-nums` wherever data appears.
- Reduced motion: see `motion-doctrine.md`.
- Charts: units always labelled; empty state reads "Log 2 sessions to see a trend".
