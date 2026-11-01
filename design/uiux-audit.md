# UI/UX Audit — v1 against the design system

## Global: what reads cheap
1. Ruled-paper body background (48px line grid with a 94% overlay) is noisy and reads as a notebook, not a HUD. **Remove it; use flat #07090A.**
2. Accent used everywhere at equal weight, so there is no hierarchy. **Limit volt to CTA, active state, PR, PROGRESS.**
3. 4px radius on every box plus cut corners in many places is inconsistent. **Cut only the primary panel and CTA; otherwise 0 or 8px.**
4. Some numbers are set in the body font. **Use JetBrains Mono tabular for every metric.**
5. Hard-coded 84px bottom padding. **Use a safe-area-aware tab bar height token.**
6. Chips and stars have touch targets under 48px. **Give them a 48px minimum hit area.**
7. No visible sync or optimistic state. **Add a header sync dot: cyan = syncing, volt = saved, danger = offline/demo.**

## Per screen
- **Log:** inputs are plain text fields. Weight and reps need steppers with a big mono value. No last-set or PR context above the form; add a strip such as "LAST 80kg × 8 · PR e1RM 101". Pin the CTA above the tab bar. Replace the intensity select with a 3-way segmented control.
- **Favorites:** a flat list of names with ★ and no density. Use grouped sections (Upper / Lower / Arms & Shoulders) with sticky mono headers; each row shows name, last weight and a 48px star. Tapping a row opens Log prefilled.
- **Charts:** generic canvas, weak legend, no inspect. Add an exercise chip scroller, a hero number (current e1RM with Δ vs 4 weeks), a 2-series line, a crosshair tooltip, and a 4W/12W/ALL range toggle.
- **Calendar:** small cells; planned and done look alike. Use 44px cells with the dot/ring language; tapping a day opens a bottom sheet with that day's sets.
- **Week:** the KPI is a plain number. Build a verdict hero: big mono score, verdict word in colored Chakra 700, and three component bars (Vol 40 / e1RM 40 / Consistency 20).
- **Setup:** looks like a developer form. Use a grouped list: API URL with a connection test, default units, theme (System/Dark/Light), reminders info, demo-mode banner.
- **Share card:** must not look like a screenshot. Make it a dedicated 1080×1350 composition (see `directions.md`).
