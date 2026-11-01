# QC report — intro sign-in parallax

Date: 2026-11-01.
Preview: `node` static server on `http://127.0.0.1:8766/intro/`.
Browser: headless Chrome, `chrome.exe` on this PC.
`node --check intro/intro.js` produced no output and the server then started.
That means the script parsed.

## Measured

1. 390 by 844, motion allowed.
`webgl` class true.
`rm` class false.
`--accent` is `#C6FF00`.
`scrollWidth` 390 equals `clientWidth` 390.
Open app top 310px, height 48px, bottom 358px.
Google iframe present in section 01.
Button label read as Continue with Google.
Headline: Lift. Log. Know if it's working.

2. 1440 by 900 device metrics.
`clientWidth` was 1425 because of the scrollbar.
`scrollWidth` matched `clientWidth`.
Text stayed left.
The plate sat on the right over the gym photo.
Google iframe present.

3. 390 with `prefers-reduced-motion: reduce`.
`rm` class true.
`webgl` class true.
Open app still inside the first view.
The loop is not started in this mode.
Frame rate was not measured.
Do not treat this as 60 fps.

4. Stored session `{ token, email, exp }`.
Continue was visible.
Open app was hidden.
Google iframe count was 0.
This used a fake token.
It does not prove a live Google sign-in.

5. Hash `#s5`.
Current nav text was 05.
Section 05 heading was Start with this account.
A second Google iframe was present.

## Not proven

1. A real Google click on an authorized origin.
2. WebGL disabled in the browser.
The CSS plate stays in the HTML and is hidden only with `html.webgl`.
3. Keyboard focus order beyond the hash links.
4. Light theme pixels.
The light token block exists.
The check forced dark, which is the page default.
5. Frame rate.

## App gate

Open app and Continue go to `../`.
If the app still requires Google, that screen remains.
`app.js` was not edited.

## Film

Command: `npx --yes hyperframes@0.8.225 render` from `hyperframes/reel`.
Exit code 0.
Duration about 31 seconds.
File: `hyperframes/reel/renders/reel_2026-11-01_19-56-45.mp4`.
Size 438,628 bytes.
Length 8.0 seconds.
The log says 30 fps standard.
This is not a 60 fps proof.
A copy is at `hyperframes/reel/output/final.mp4`.
The portrait file `hyperframes/output/final.mp4` is still 1,759,410 bytes.
Lint: 0 errors, 10 warnings.
The warnings were not listed in this report.
Nav links were set to 48 px after the Chrome measure.
The cyan rim tube was set to 0.02 after the last screenshot.
Those two edits were not shot again.
