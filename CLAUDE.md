# Project rules (from user)

- When a skill is invoked (/buildme, /scrollme, /designme, etc.), run ALL of it: every phase, every agent role, every gate and required file. Never decide on your own to skip or compress parts. If something truly cannot run, mark it BLOCKED with the reason and tell the user.
- Model routing: buildme + scrollme agents → `haiku`; designme agents → `opus`; orchestrator + final checker/QA → `opus`.
- Target: premium web app, phone-first optimized (390px primary), desktop secondary.
