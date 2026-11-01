# FEATURE_APPROACHES: discovery packets (Agent 15 role)

Accessed 2026-11-01. Each feature lists queries, candidates and inspected sources. Nothing was installed or executed. Candidates are read as documents only.
Evidence labels: **[V]** fetched from the source; **[S]** search snippet only; **[U]** unverified.

## Shortlisted open-source repos (web/PWA workout loggers)

Search query: `github open source PWA workout logger gym tracker offline web app` (2026-11-01, WebSearch). Limit: GitHub stars/commit counts were shown on repo pages; commit dates were not shown on any fetched page.

| # | Repo | License [V] | Stack [V] | Stars / commits [V] | Offline / backend | Reusable idea | Fit / cost | Verdict |
|---|---|---|---|---|---|---|---|---|
| 1 | https://github.com/astashov/liftosaur | AGPL-3.0 [V] | Preact, TS, uPlot, Tailwind, AWS Lambda/DynamoDB | 768 stars, 3,647 commits [V] | Service worker caches network calls; offline mode without account [V] | Last-results hint, plate calculator, graphs screen | Strong feature peer, but AGPL and heavy backend | ADAPT IDEAS ONLY. Do not copy code (AGPL would bind this project). |
| 2 | https://github.com/avgrad/fitness-zettel (search result) | MIT label [V] | TS, React, Vite, vite-plugin-pwa, Dexie/IndexedDB, roughjs | 0 stars, 8 commits [V] | Local-only data; SW via vite-plugin-pwa [V] | Dexie + vite-plugin-pwa setup for offline PWA | Stack is close to a static PWA; style is hand-drawn (not a fit) | REFERENCE for the offline setup pattern. Note: fetch resolved to `sydeslyde/fitness-zettel`, so repo owner/URL redirect should be confirmed before citing. |
| 3 | https://github.com/paloranta/Treenari-source | MIT label [V] | Gatsby, React, idb, Notification Triggers API | 38 commits [V] | gatsby-plugin-offline SW [V] | Reminder PWA pattern; i18n (EN/FI) | Reminder approach conflicts with Apps Script reminders; Notification Triggers is Chromium-only with a flag [V] | LOW. Reminder idea only. |
| 4 | https://github.com/Workstr7blo/workstr-web | none found [V] | Vite, TS, IndexedDB, Nostr keys | 3 stars, 386 commits [V] | Offline reload is a Phase 0 goal [V]; no SW detail | IndexedDB namespace per account | No license means no reuse; Nostr is out of scope | INSPIRATION ONLY (unknown license). |
| 5 | https://github.com/ParalelSt/Arons-handbook (from search, not fetched) | MIT per search snippet [S] | React, TS, Supabase | not fetched | Cloud (Supabase), not offline-first [S] | Set/rep/weight PWA logger | Backend is a cloud DB; conflicts with Sheets backend | NOT FETCHED. Listed for completeness only. |

Rejected from search: PixieFit (needs MongoDB server), openGym (restricted media license per search snippet), GoalLift (no source found).

## Feature 1: fast one-thumb set logging (steppers vs keypad)

**Feature ID:** L1 (one-handed set entry). **Owner:** UI worker.
**Unfamiliar aspect:** Choosing the input control for reps and weight that is fastest on a 390px phone with one thumb.
**Existing code inspected:** None in this pass. Requirements come from BUILD_BRIEF.md (44px+ targets, one-handed, kg/lbs conversion).
**Acceptance checks:** Log a set in <= 2 taps with prefilled values; targets >= 44px; no hover-only controls; reduced motion respected.

**Queries (2026-11-01):** `Steven Hoober one-handed smartphone thumb zone study touch targets`; `WCAG 2.2 target size minimum 24px 2.5.8 and 2.5.5 44px touch target`.

**Candidate approaches found:**
1. **Stepper buttons with prefill and a one-tap primary "log set" action.** Evidence: Strong advertises "two-tap set logging" [S, SensAI article, not on strong.app]. Liftosaur shows last-results hints for similar sets [V, README].
2. **Numeric keypad for exact entry.** Standard OS numeric input; no source fetched that compares it to steppers for gym logging.
3. **Hybrid: steppers for the common increment and a tap-to-type field for exact values.** Liftosaur plate calculator rounds to available plates [V], which suggests stepping by plate increments.

**Standards and research notes:**
- Thumb-zone research (Hoober, 2013): about 49% one-handed grip, 36% cradled, 15% two-handed; bottom and top-right are weakest for right-handed users [S, secondary summaries disagree on figures; primary book not fetched].
- WCAG 2.2 SC 2.5.8 (AA) minimum 24x24 CSS px; SC 2.5.5 (AAA) 44x44 px [S, vendor summaries]. The brief's 44px target meets AAA for pointer size.

**Limits:** No source measured error rates or speed for steppers vs keypads in gym logging. Treat preference as a hypothesis to test on the device.

## Feature 2: offline-first caching for a static GitHub Pages app (service worker)

**Feature ID:** O1 (offline reload and offline logging queue). **Owner:** PWA worker.
**Unfamiliar aspect:** Service worker on a project subpath (GitHub Pages `user.github.io/repo/`), cache versioning, and what to do with Apps Script API writes while offline.
**Existing code inspected:** None in this pass.
**Acceptance checks:** App shell loads offline; a logged set made offline is queued and synced once online; SW update does not strand users on old HTML.

**Queries (2026-11-01):** `service worker offline first GitHub Pages static app caching strategies MDN`; MDN Using Service Workers and Navigator.share pages fetched.

**Candidate approaches found:**
1. **Precache app shell + cache-first for versioned static assets; versioned cache names; delete old caches in `activate`.** Sources: web.dev Offline Cookbook [V]; third-party summaries [S]. Note from web.dev: `cache.addAll()` in `install` fails the whole install if one path is bad; keep the precache list short [V].
2. **Network-first or stale-while-revalidate for the data endpoint** (Apps Script GET). Offline Cookbook says network-first suits frequently changing content and stale-while-revalidate suits content where the newest copy is not essential [V].
3. **Outbox queue in IndexedDB for POSTs** (addSet, deleteSet, etc.) replayed when online. Search summaries say caching POSTs is inappropriate [S]; a queue is therefore separate from the cache. Example stack: Fitness Zettel uses Dexie/IndexedDB [V]; Liftosaur runs an SW that caches network calls [V].

**Platform facts (MDN, fetched [V]):**
- Service workers require HTTPS or localhost [V]. GitHub Pages is HTTPS.
- Default scope is the directory of the worker file. On a subpath, register `./sw.js` relative to the page and keep all cached URLs relative, or the worker will point to the origin root [V, inferred for subpath; MDN does not cover GitHub Pages].
- New workers wait until old-version pages close unless `skipWaiting()`/`clients.claim()` are called [V].

**Limits:** No GitHub Pages-specific SW guide was found. Subpath behavior is inferred from MDN scope rules and must be verified on the deployed URL.

## Feature 3: share image generation via canvas + Web Share API

**Feature ID:** S1 (share card PNG). **Owner:** UI/graphics worker.
**Unfamiliar aspect:** Generating a PNG share card on canvas and sharing it as a file, with a download fallback.
**Existing code inspected:** None in this pass. The brief already requires the share card via Web Share API.
**Acceptance checks:** Share sheet opens on phone with a PNG file; fallback download on unsupported browsers; no tainted-canvas error; button is the only trigger.

**Queries (2026-11-01):** `Web Share API navigator.share files canvas PNG share image MDN`; MDN Navigator.share page and web.dev "share files" pattern fetched.

**Candidate approaches found:**
1. **Canvas `toBlob('image/png')` -> `new File([blob], name, {type})` -> `navigator.canShare({files})` -> `navigator.share({files, title, text})`, called from the click handler.** web.dev and MDN examples [V]; the MDN example uses `input.files` but the same call pattern applies to a generated File.
2. **`canvas.toDataURL('image/png')` -> Blob -> File.** Works but is heavier than `toBlob`. Zenn article (German/Japanese summary snippet [S]) uses this route.
3. **Download fallback via `<a download>` when `navigator.canShare` is absent or returns false.** web.dev recommends a fallback for browsers without support [V].

**Platform facts (fetched [V]):**
- `navigator.share()` requires a secure context and transient user activation (a click). `canShare()` should be called first, with `files` only.
- Error names to handle: `AbortError` (user cancelled; not a failure), `NotAllowedError`, `TypeError`, `DataError`, `InvalidStateError`.
- Support per web.dev search summary [S]: Chrome 128+, Edge 93+, Safari 12.1+, Firefox behind a flag. Browser table on MDN did not load in the fetch; re-check before shipping.

**Limits:** Canvas taint: images from other origins block `toBlob`; the share card should use only same-origin assets or inline data [S, Zenn article]. Font loading before drawing is not covered by any fetched source [U]; verify on device.

## Coordinator/worker decision placeholder

Decisions are owned by the coordinator in ORCHESTRATOR.md. Recommended, pending coordinator decision:
- L1: adapt Strong/Liftosaur ideas (prefilled sets, stepper + tap-to-type). Independent implementation.
- O1: independent implementation using standard SW patterns; reference fitness-zettel for Dexie/vite-plugin-pwa only if a build step is accepted (the brief says no framework; the build step may conflict).
- S1: independent implementation with the web.dev pattern. No code reuse.
