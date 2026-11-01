# Monitor log

## Run 2026-11-01 (commit a9ca584, post-deploy)
- Live URL: https://almanalaysay93-gif.github.io/elevation-tracker/
- Status: UP (degraded on Lighthouse root perf, see below)
- Pages build: built for commit a9ca5840a4da6a8a4e11c96d9898f7502af5863f (updated 2026-11-01T05:40:23Z)
- Deploy integrity (HTTP, GitHub Pages):
  - `/` 200 text/html, title "Elevation: Gym Log and Weekly Score"
  - `/intro/` 200 text/html, title "How Elevation works: Gym Log and Weekly Score"
  - `/intro` (no slash) 301 to `/intro/` (standard Pages behavior)
  - `/sw.js` 200, `/manifest.webmanifest` 200, `/tokens.css` 200, `/styles.css` 200, `/app.js` 200
  - `/robots.txt` 200 text/plain (Allow: /, Sitemap line present)
  - `/sitemap.xml` 200 application/xml (2 URLs: `/` and `/intro/`)
  - `/llms.txt` 200 text/plain; byte-identical to repo `llms.txt`. `sw.js` also identical to repo.
- llms.txt: SERVING (matches repo, no diff)
- Browser checks (Chrome, 390px mobile emulation, live):
  - `/` and `/intro/`: 0 console errors or warnings, 0 failed or 4xx/5xx requests, no horizontal overflow
  - Service worker on `/`: active, state "activated", scope `https://almanalaysay93-gif.github.io/elevation-tracker/`
  - `/intro/` in a fresh context: no SW registration (intro does not register; app root does)
  - Offline reload of `/`: page loads, title correct, nav rendered
- Lighthouse live, mobile, 2 runs each, worst run shown (Lighthouse 13.6 CLI, Chrome, preset perf, mobile form factor):

  | URL | Run | Perf | A11y | Best practices | SEO | LCP | CLS | TBT |
  |---|---|---|---|---|---|---|---|---|
  | `/` | 1 | 49 | 100 | 100 | 100 | 22981 ms | 0.000 | 291 ms |
  | `/` | 2 | 89 | 100 | 100 | 100 | 1980 ms | 0.000 | 361 ms |
  | `/intro/` | 1 | 88 | 100 | 100 | 100 | 2210 ms | 0.000 | 345 ms |
  | `/intro/` | 2 | 91 | 100 | 100 | 100 | 2040 ms | 0.000 | 312 ms |

  Worst-wins: `/` perf 49, LCP 22981 ms (fails LCP < 2.5 s budget). `/intro/` perf 88, LCP 2210 ms (within budget).
  Root run 1 is an outlier: TTFB-related variance is not confirmed (its server-response-time was 292 ms vs 24 ms on run 2), and the LCP element is an unnamed `<span>` in both runs. Cause not isolated.
- Hosting vs localhost: local `/intro/` LCP (Lighthouse, 127.0.0.1) was 903 to 909 ms; live was 2040 to 2210 ms, about 2.3x, which exceeds the 30% threshold. Flagged as a hosting-side item. No local root LCP baseline exists in the scratchpad, so `/` cannot be compared.
- AI discoverability baseline (observed, not a ranking claim):
  - Query: brand + repo name ("Elevation gym log weekly score app almanalaysay93-gif elevation-tracker"), host web search, standard mode.
  - Result: the live site and repo did NOT appear in results. Top hits were unrelated apps (Elevate - Workouts, Elevation Logger, Gymlogio, Gym Diary, Progression).
  - No category+location query was run: the brief named no business location, so the category query is "not checked".
  - No paid trackers and no answer-engine logins were used; none are recorded as checked.
- Not run / constraints:
  - `browser-qa.mjs` against the live URL was not run; its output directory would be inside the project, and this run was limited to writing only this file. Equivalent Playwright checks were run from the scratchpad (see above).
  - Discovery baseline was folded into this file, not a separate `monitor/discovery-baseline.md`, for the same reason.
- New issues:
  1. Lighthouse root perf: one run LCP 22.98 s (perf 49). Worst-wins rule applies; second run is 1.98 s. Needs a third run before deciding it's a real regression.
  2. Live `/intro/` LCP about 2.3x local (2040 to 2210 ms live vs 903 to 909 ms local). Hosting/CDN item.
- Recommendations:
  - Re-run Lighthouse on `/` (3 to 5 runs) to see whether the 22.98 s LCP is a cold-start outlier. If it repeats, check the LCP element and the hero font/image loading order.
  - For `/intro/`, the gap to localhost is likely GitHub Pages delivery (no CDN tuning available). Keep assets small and cacheable; this is a hosting limit, not a code bug.
  - Add a category+location discovery query once the business location is known. Re-run the brand query on the next check and diff against this baseline.
  - Recurring weekly run is available (re-check the checklist and llms.txt diff, alert only on change) if the platform supports scheduled runs.

## Orchestrator follow-up (Lighthouse re-run, live /)
Runs 3 and 4, mobile: perf 97 (LCP 2.1 s), 98 (LCP 1.8 s). Run 1's 49 / 22.98 s was a cold-CDN outlier right after deploy; it did not repeat. Within the 2.5 s budget.
