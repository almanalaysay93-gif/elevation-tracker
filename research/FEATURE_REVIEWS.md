# FEATURE_REVIEWS: approach comparisons (Agent 11 role)

Accessed 2026-11-01. Input: research/FEATURE_APPROACHES.md (same date). Evidence labels: **[V]** fetched from source; **[S]** search snippet or secondary summary; **[U]** unverified.
No candidate code was run or installed.

---

## Feature L1: fast one-thumb set logging

```text
Feature / task ID / implementation owner: L1 / one-handed set entry / UI worker
Unfamiliar aspect / existing code inspected: stepper vs keypad for reps and weight; existing code not inspected in this pass
Requirements and acceptance checks: log a set in <= 2 taps with prefilled values; targets >= 44px; kg/lbs conversion; no hover-only controls
GitHub queries / access date / tool / search limitations: Liftosaur README [V]; Strong and Hevy feature pages [V]; SensAI comparison [S] for Strong "two-tap" claim
Candidate URLs and inspected refs: https://github.com/astashov/liftosaur; https://www.strong.app/; https://www.hevyapp.com/features/; https://www.sensai.fit/blog/hevy-vs-strong-vs-fitbod-vs-jefit
Agent 15 discovery report / Agent 11 comparison report: FEATURE_APPROACHES.md (L1) / this file
```

| Approach | Mechanism | Fit to brief | Evidence | Risk |
|---|---|---|---|---|
| A. Steppers + prefill from last set + bottom primary "Log set" | +/- buttons (per-exercise increment), values prefilled from previous set, one primary button | Best fit: fewest taps, thumb-reachable bottom bar | Liftosaur "last results" hint [V]; Strong "two-tap" claim [S] | Slow for large jumps unless long-press repeat exists |
| B. Numeric keypad | OS keypad on tap of value | Good for exact entry, poor for repeated similar sets | No fetched source compares speed | Keypad covers the lower screen; more taps for repeats |
| C. Hybrid: steppers by default, tap value to type | A + tap-to-type on the number | Covers the common case and exact entry | Liftosaur plate calculator rounds to available plates [V] suggests increment logic | More code paths; keep one primary action |

**Rejected:** Pure keypad (B alone). It is the slowest common path for repeated sets and is not supported by any reviewed source as faster.

**Recommendation:** C (hybrid). Stepper increments per exercise (e.g., 2.5 kg / 5 lb), long-press to repeat, tap the number for exact entry, prefill from last set, and one full-width "Log set" button in the bottom third. Keep targets at >= 44px (brief) which also satisfies WCAG 2.2 AA 24px and AAA 44px [S].

**Remaining risks:** No evidence measured actual speed on a phone. Thumb-zone figures come from secondary summaries that disagree (A List Apart and Smashing quote different attributions) [S].

**Suggested validation:** On a 390px viewport, time 10 simulated set logs with each approach (or a scripted tap count). Target: median <= 2 taps per set, zero scroll needed to reach "Log set".

**Decision:** adapt ideas (no code reuse). Liftosaur is AGPL-3.0 [V], so copying code is not allowed.

**Research gate:** READY (for the decision). Speed claim is UNVERIFIED until device test.

---

## Feature O1: offline-first caching (service worker) for a GitHub Pages app

```text
Feature / task ID / implementation owner: O1 / offline reload and logging queue / PWA worker
Unfamiliar aspect / existing code inspected: SW on a subpath; cache versioning; POST queueing; existing code not inspected
Requirements and acceptance checks: shell loads offline; offline set is queued and synced; SW update does not strand old HTML; < 250KB gz total
GitHub queries / access date / tool / search limitations: github PWA workout logger search (2026-11-01); MDN SW pages not fully in search; web.dev Offline Cookbook fetched [V]
Candidate URLs and inspected refs: https://web.dev/articles/offline-cookbook [V]; https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers [V]; https://github.com/avgrad/fitness-zettel [V]; https://github.com/astashov/liftosaur [V]
Agent 15 discovery report / Agent 11 comparison report: FEATURE_APPROACHES.md (O1) / this file
```

| Approach | Mechanism | Fit | Evidence | Risk |
|---|---|---|---|---|
| A. Precache shell + cache-first for static assets, versioned caches, IndexedDB outbox for POSTs | SW `install` caches the shell with a version name; `activate` deletes old caches; POSTs go to an IndexedDB queue and replay when online | Best fit: keeps data correct (Sheet is truth), shell offline | web.dev Offline Cookbook [V] for cache-first, versioned caches; Liftosaur SW caches network calls [V] | Replay conflicts if the Sheet changed; needs ID-based dedupe |
| B. Network-first with cache fallback for everything (including API GET) | Try network, fall back to cached copy | Good for showing last-known state offline | Offline Cookbook [V]: suits frequently changing content | Slow on poor gym Wi-Fi; stale data offline; still needs an outbox for writes |
| C. Stale-while-revalidate for the API GET | Serve cache, refresh in background | Fast first paint | Offline Cookbook [V] | May show stale KPI scores; more to explain to user |

**Rejected:** Caching POST responses. Search summaries say not appropriate [S]; the outbox (A) is the correct place for writes.

**Recommendation:** A. Precache a short list (index, css, js, icons, manifest). Use cache-first for those, network-first for GET state with cache fallback, and an IndexedDB outbox for writes. Register the SW with a relative path so the subpath scope works on GitHub Pages [V for MDN scope rule; subpath behavior inferred, verify on deployed URL]. Use `skipWaiting` with a "new version, tap to reload" prompt, not silent takeover, so the user is not interrupted mid-workout.

**Remaining risks:** No GitHub Pages-specific SW guide found [limit]. Apps Script cold starts may be slow offline-to-online; outbox needs visible status. Adding a build step (Workbox/Vite PWA) conflicts with the "no framework" brief; handwritten SW keeps it small.

**Suggested validation:** Lighthouse PWA audit on the deployed Pages URL; airplane-mode test: load app, log 3 sets, go online, confirm 3 rows in Sheet with no duplicates; SW update test by bumping the cache version and checking the reload prompt.

**Decision (recommended):** independent implementation with the handwritten SW pattern. Fitness Zettel (MIT) shows a Dexie + vite-plugin-pwa setup [V] but requires a bundler; use it only as a pattern reference, not code.

**Research gate:** READY for decision. GitHub Pages subpath behavior is UNVERIFIED until deployed.

---

## Feature S1: share card PNG via canvas + Web Share API

```text
Feature / task ID / implementation owner: S1 / share card / UI-graphics worker
Unfamiliar aspect / existing code inspected: canvas PNG -> File -> navigator.share; existing code not inspected
Requirements and acceptance checks: share sheet opens with PNG on phone; download fallback; no tainted canvas; triggered only by user click
GitHub queries / access date / tool / search limitations: MDN navigator.share fetched [V]; web.dev share-files pattern fetched [V]; Zenn snippet [S]
Candidate URLs and inspected refs: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share [V]; https://web.dev/patterns/files/share-files [V]
Agent 15 discovery report / Agent 11 comparison report: FEATURE_APPROACHES.md (S1) / this file
```

| Approach | Mechanism | Fit | Evidence | Risk |
|---|---|---|---|---|
| A. `canvas.toBlob('image/png')` -> `File` -> `canShare({files})` -> `share({files,...})`, click handler | Blob-based, no base64 | Best: smallest memory, matches MDN/web.dev | MDN [V]; web.dev [V] | Support gaps (Firefox flag per web.dev search summary [S]) |
| B. `toDataURL` -> Blob -> File | Base64 string first | Works, extra conversion and memory | Zenn [S] | Larger memory for a tall card |
| C. Download-only (`<a download>`) | No Web Share | Safe baseline and fallback | web.dev recommends fallback [V] | No direct share on phone |

**Rejected:** Server-side image rendering. Brief is static and free; no server for images.

**Recommendation:** A, with C as fallback when `navigator.canShare` is missing or returns false. Call `share()` inside the click handler (transient activation is required [V]). Treat `AbortError` as user cancel, not a failure [V]. Draw only same-origin or inline assets to avoid a tainted canvas [S]. Await `document.fonts.ready` before drawing if the card uses web fonts [U, not from a fetched source; verify].

**Remaining risks:** Cross-browser file sharing varies; MDN compatibility table did not load [limit]. Desktop Windows behaviour unverified.

**Suggested validation:** On Android Chrome and iOS Safari, tap share and confirm PNG attachment; on a browser without support, confirm download; check `toBlob` returns non-null with a cross-origin image removed.

**Decision (recommended):** independent implementation. No reviewed repo contained a share-card implementation that could be reused, and none were licensed for reuse (Workstr has no license; Liftosaur is AGPL).

**Research gate:** READY for decision. Device behaviour UNVERIFIED.

---

## Summary for the coordinator

- L1: hybrid stepper + tap-to-type, prefilled from last set, bottom primary button. Test on a 390px device.
- O1: handwritten SW, cache-first shell, outbox for writes, relative paths for subpath, prompt-to-reload updates. Verify on the Pages URL.
- S1: canvas `toBlob` -> File -> `canShare` -> `share` in click handler, download fallback.
- No reference repo is reusable as code: Liftosaur is AGPL-3.0; Workstr has no license; Fitness Zettel and Treenari are MIT but use build tooling that conflicts with the no-framework brief.
