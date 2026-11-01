# Shot plan: Elevation 15s reel (1080x1920, 60fps)
All UI is recreated in HTML/CSS from tokens.css values (Volt Telemetry: #07090A ground, volt #C6FF00 accent <=10%, Chakra Petch / Inter / JetBrains Mono). No app code used.
1. 0-1.9 Hook: "LIFT. LOG. CLIMB." stagger rise (expo.out); first word on screen at frame 0 for thumbnail.
2. 1.65-4.4 Log set: phone card slides up; thumb ghost taps + (80.0 -> 82.5), taps LOG SET, set 3 slides in.
3. 4.4-6.4 NEW PR: phone fades out, volt NEW PR badge back.out pop, "BENCH 82.5 KG".
4. 6.4-9.1 Chart: 8-week bench line draws (power2.inOut 1.5s), peak dot pops.
5. 9.1-11.1 Verdict: PROGRESS scale-settle, score counts 0 -> +8.
6. 11.1-12.7 Share card: card rises/de-rotates, stats stagger; footer "Tracked with Elevation".
7. 12.7-15 End card: ELEVATION, "free, your Google Sheet", URL (2.15s hold).
Timeline: single paused GSAP timeline at window.__timelines["main"] in index.html, fully seekable, no clocks/random.
