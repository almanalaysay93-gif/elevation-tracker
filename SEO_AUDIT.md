# SEO quality report

Overall: BLOCKED. Static artifact checks pass. Runtime checks are blocked because the local files are not deployed, and the live site does not match them.

Audience: public. Approved public routes: `/` (index.html, the app) and `/intro/` (intro/index.html). Excluded: Setup and other app screens, which are hash routes inside `/` and have no separate URL. Apps Script backend (`apps-script/`) is not a public page and is not in scope.
Build ref / output directory / canonical origin: working tree at project root (static, no build step). Canonical origin `https://almanalaysay93-gif.github.io/elevation-tracker/`. Note: the GitHub Pages project path is `/elevation-tracker/`.
Applicable schema and current official documentation: `/` is a free web app, so SoftwareApplication (or a subtype) is applicable. `/intro/` is a scroll story, so no app schema applies (NOT_APPLICABLE). Check against https://developers.google.com/search/docs/appearance/structured-data/software-app before shipping. No ratings or review data exist in the sources, so do not add aggregateRating.
Inspector / date / commands / tool versions / evidence directory: SEO agent (BuildMe Agent 6), 2026-11-01. Command: `python -I <buildme>/scripts/free_seo_audit.py --site-dir . --base-url https://almanalaysay93-gif.github.io --page index.html --page intro/index.html --output <scratchpad>/seo-static.json` (Python 3, runner from buildme skill). Base URL is origin-only because the runner rejects paths. Live checks: curl GET on the public URLs, 2026-11-01. Evidence JSON is in the scratchpad, not the project (reports/ was not in the write scope).

## Results

| Check | PASS / FAIL / BLOCKED / NOT_APPLICABLE | Evidence and limitations |
| --- | --- | --- |
| Built artifact audit and scoped route coverage | PASS (static) | Runner: static PASS for index.html and intro/index.html. 2 of 2 routes inspected. Runner warnings: no h1 on `/`, no canonical on either page, no JSON-LD on either page. |
| Served status, redirects, canonical destinations and headers | BLOCKED | Live `/` returns 200 text/html, but with the old title "Elevation Gym Tracker" (not the local index.html). Live `/intro/` returns 404. No canonical is declared, so none can be checked. Redirects and headers not yet verified on a deployed build. |
| robots controls and sitemap discovery/served XML | BLOCKED | Local robots.txt and sitemap.xml were added at root. Local sitemap XML parses and lists 2 URLs. Live `/robots.txt` returns 404, so discovery is not live yet. Sitemap lists `/intro/`, which currently 404s live. |
| Titles, descriptions, public content and internal navigation | BLOCKED | Local titles and descriptions are present and under limits (title 34 chars). Intro duplicates the index title and description (see F-03, F-04). Rendered content on `/` is JS-rendered (see F-05). Needs a rendered-page check on a deployed build. |
| Rendered content and fact-grounded schema | BLOCKED | No JSON-LD in either file. SoftwareApplication recommended for `/` (F-06). Needs rendered check after deploy. |
| Desktop/mobile parity, layout and primary task access | BLOCKED | Agent 10 report (PERF_A11Y_AUDIT.md) is not in the project yet. Not checked here. |
| Local Lighthouse and interaction diagnostics | BLOCKED | Agent 10 report. Not field INP. |
| llms.txt factuality, public scope and delivery | PASS (local), BLOCKED (delivery) | llms.txt written from PRODUCT.md, README.md, copy/COPY.md, index.html, intro/index.html. 413 words. No Apps Script URL, no email, no phone. Not yet served at `/llms.txt`. |

## Findings and worker repairs

Findings are for the workers who own the files. This agent did not edit index.html or intro/index.html.

| ID | Route/file | Severity | Observed / expected | Source / evidence | Worker | Fix | Retest evidence / status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | index.html:7 (after) | Medium | No canonical link. Expected `<link rel="canonical" href="https://almanalaysay93-gif.github.io/elevation-tracker/">` in head. | index.html head, runner `canonical.review` WARN | Agent 2 | Add the canonical link after the description meta on line 7. | Pending |
| F-02 | index.html:7 (after) | Medium | No Open Graph or Twitter tags. Expected `og:title`, `og:description`, `og:type` (website), `og:url`, plus `twitter:card` (summary). | index.html head. Compare intro/index.html:9-10 (og:title and og:description only). | Agent 2 | Add the OG and Twitter set. Copy values come from COPY.md `meta.og.title` and `meta.og.description`. Use the same URL as F-01. | Pending |
| F-03 | intro/index.html:6 | Medium | Intro title is identical to the app title (`Elevation: Gym Log and Weekly Score`). Two indexed URLs share one title. Expected a distinct intro title. | intro/index.html:6 and index.html:6 | Agent 9 (copy), applied by Agent 2 | Write an intro title from the scroll story copy, for example "How Elevation works", after copy approval. | Pending |
| F-04 | intro/index.html:7 | Medium | Intro meta description is identical to the app description. Expected an intro-specific description. | intro/index.html:7 and index.html:7 | Agent 9 (copy), applied by Agent 2 | Write from COPY.md intro section 01 or 05. Keep under 155 characters and keep the claims grounded. | Pending |
| F-05 | index.html:80 | Medium | No h1 or indexable text in the static HTML. `#view` is empty until app.js renders screens (app.js:484 is the first h1, inside JS). Runner `heading.primary` WARN. Expected a static, honest fallback for crawlers and no-JS users. | index.html:78-81, app.js:484 | Agent 2 (copy from Agent 9) | Add a `<noscript>` paragraph in `<main>` that states what Elevation is and that it needs JavaScript. Keep the app's own h1 as the visible title. | Pending |
| F-06 | index.html:7 (after) | Medium | No schema. SoftwareApplication applies to `/` (free web app, browser). Expected JSON-LD in head: `name` "Elevation", `url`, `applicationCategory` (HealthApplication or SportsApplication, owner to pick), `operatingSystem` "Any (web browser)", `offers` price 0 USD, `description` matching the meta description. Do not add aggregateRating. | runner `schema.present` WARN, PRODUCT.md (free, static web app) | Agent 2 | Add one `<script type="application/ld+json">` block. Confirm values against the Google SoftwareApplication docs. | Pending |
| F-07 | intro/index.html:7 (after) | Low | No canonical, no og:url or og:type, no og:image, no Twitter tags. | intro/index.html:6-12 | Agent 2 | Add canonical `https://almanalaysay93-gif.github.io/elevation-tracker/intro/`, og:url, og:type, and twitter:card. Schema is NOT_APPLICABLE (scroll story). | Pending |
| F-08 | index.html:9 and intro/index.html:9 | Medium | No social image exists. The only icons are SVG (icons/app-icon.svg). COPY.md `meta.og.image.alt` refers to a social preview image that is not in the repo. Expected a raster image of at least 1200 x 630 PNG, or no og:image. | icons/ listing; COPY.md meta section | Agent 12 (visual), or omit | Either supply a 1200 x 630 PNG and add `og:image` with alt text, or leave out `og:image` and `twitter:image` until one exists. | Pending |
| F-09 | repo root (deployment) | High | Live `/` returns 200 with an old title ("Elevation Gym Tracker"). Live `/intro/` returns 404. Local head fixes are not visible until redeployed. | curl GET 2026-11-01 | Coordinator (deployment) | Redeploy the current tree to GitHub Pages. Re-run the runtime checks after deploy. | Pending |
| F-10 | repo root (deployment) | Medium | Live `README.md` returns 200. `apps-script/Code.gs` returns 200. Pages from the repo root publishes whatever is in the tree, including `copy/`, `design/`, `research/`, `hyperframes/`, `graphify-out/`, and planning docs. (Live 404 so far for `copy/COPY.md`, `PRODUCT.md`, `research/`, `design/`.) Private-data check: no Apps Script deployment URL in `apps-script/Code.gs`, `README.md`, or `app.js` (app.js:740 is the placeholder `https://script.google.com/macros/s/...`, no real ID). | curl GET, grep (redacted) | Coordinator (deployment) | Publish only the public site files (index.html, app.js, styles.css, tokens.css, sw.js, manifest.webmanifest, icons/, intro/, robots.txt, sitemap.xml, llms.txt), or move internal docs out of the Pages source. robots.txt is not access control. | Pending |
| F-11 | robots.txt, sitemap.xml, llms.txt (new) | Medium | New files exist only locally. Live `/robots.txt` returns 404. | curl GET 2026-11-01 | Coordinator (deployment) | Deploy with F-09. Re-check `/robots.txt`, `/sitemap.xml`, `/llms.txt` return 200 with text/plain or XML content types. | Pending |
| F-12 | sitemap.xml | Low | Sitemap lists `/intro/`, which 404s live. | sitemap.xml, curl GET | Coordinator (deployment) | Keep as-is after F-09. If intro is not deployed, remove its `<url>` entry. | Pending |

Notes on findings not raised: `<html lang="en">` is present on both pages (index.html:2, intro/index.html:2). Viewport meta is present on both pages (index.html:5, intro/index.html:5). Both descriptions are within limits. Intro has one h1 (intro/index.html:63). The runner's `images.alt` and `images.dimensions` checks pass (no img elements in either file).

## Repair counts / two-round limit / unresolved requirements

Repairs: none made by this agent (no HTML edits). Round 1 of 2 complete.
Unresolved mandatory items: F-09 (deployment), F-11 (new files not served). Until these pass, runtime status stays BLOCKED.
Remaining runtime checks after deploy: status 200 for `/` and `/intro/`, canonical destinations, rendered title and JSON-LD on `/`, served robots.txt and sitemap.xml, served llms.txt content type.

## Accepted advisory warnings and concrete reasons

- F-05 (h1 in static HTML): the app renders its headings in JavaScript by design (no framework). Accepted only if a noscript fallback and a visible rendered h1 are confirmed in the browser.
- F-08 (social image): optional until an image is produced. Adding OG tags without an image is still recommended.

## Phase 5 gates rerun after Phase 6 implementation changes

Not applicable. This agent made no code changes. Coordinator should rerun the static runner after F-01 to F-07 are applied.

## llms.txt

File: `E:/ai/claude/ALAi/elevation progress tracker/llms.txt`. Summary of approved facts: free personal gym log for one lifter; kg and lbs; per-machine charts with e1RM; weekly Progress Score with PROGRESS, HOLD, DIP, BASELINE; Favorites; calendar; share PNG; Google Sheet backend through an Apps Script web app the user deploys; demo mode; reminders via Apps Script. Score formula and bands taken from README.md. Contact: URL only. Email and location were not provided, so they are marked "not provided" and not invented. No Apps Script URL appears in the file.

Field data: unavailable. No p75 or field INP verdict is made.
No claims about ranking, traffic or AI citations follow from this audit. llms.txt is a proposed machine-readable summary, not a guaranteed signal.
