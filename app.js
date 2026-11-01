/* Elevation: front end. Vanilla JS, no build step.
   Talks to the Apps Script web app. Without a URL it runs on a local demo store.
   Writes show on screen at once and wait in an outbox until the sheet confirms them. */
(() => {
  'use strict';

  const LB = 2.20462;
  const GROUPS = ['Upper', 'Lower', 'Arms & Shoulders'];
  const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /* Strings from copy/COPY.md. Keep in step with that file. */
  const COPY = {
    demo: 'Demo mode. Data stays on this device. Connect your sheet in Setup.',
    syncing: 'Syncing with your Google Sheet…',
    saving: 'Saving…',
    saved: 'Saved to your Google Sheet.',
    connected: 'Connected. Sheet synced.',
    offline: 'Offline. Showing last synced data.',
    errSheet: "Couldn't reach your sheet. Check the URL in Setup.",
    errServer: 'Your sheet returned an error. Check Setup.',
    errSave: "Couldn't save. Try again.",
    errReps: 'Enter reps and weight.',
    errNoEx: 'Pick an exercise first.',
    errDupe: 'That machine is already on the list.',
    errName: 'Name the exercise.',
    shareFallback: "Sharing isn't on in this browser. Image saved instead.",
    undo: 'Undo',
    deleted: 'Set deleted.',
    restored: 'Set restored.',
    logged: 'Set logged.',
    added: 'Machine added.',
    newPr: 'New PR',
    sync: { synced: 'Synced', pending: 'Saving', offline: 'Offline', demo: 'Demo' },
    planUpper: 'Plan: Upper day + Arms & Shoulders',
    planSplit: (s) => `Plan: ${s} day`,
    planRest: 'Rest day on the plan. Training still counts.',
    lastNone: 'No sets yet on this machine',
    badgeUp: 'UP',
    badgeLow: 'LOW',
    chartEmpty: 'Log this machine to see a chart.',
    chartNone: 'No machines yet. Add one on Log.',
    favIntro: 'Tap ★ on any machine to pin it here. Tap a card to log it.',
    favEmpty: 'No favorites yet. Tap ★ on any machine.',
    favSearch: 'Search machines',
    wkEmpty: 'Log a week of training to see your Progress Score.',
    wkExplain: (n) => `Progress Score = 40% volume change + 40% avg e1RM change + 20% consistency (sessions vs ${n} planned).`,
    wkBands: 'Above +2% = PROGRESS · within ±2% = HOLD · below −2% = DIP',
    verdictHelp: {
      PROGRESS: 'Score above +2%.',
      HOLD: 'Score within ±2%.',
      DIP: 'Score below −2%.',
      BASELINE: 'First logged week. Nothing to compare yet.',
    },
    calEmptyPlan: (s) => `${s} day. Nothing logged yet.`,
    calEmptyRest: 'Rest day.',
    setPlanEmpty: 'No schedule found. Add rows to the Schedule tab.',
    setPlanNote: 'Change your split in the Schedule tab of your Sheet. Reminders read it daily.',
    shareCardDay: (s) => (s ? `${s} DAY` : 'WORKOUT'),
  };

  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // ISO week start (YYYY-MM-DD) to a short label such as "Oct 26". Built from parts, so no timezone shift.
  const weekLabel = iso => { const [y, m, d] = String(iso).split('-').map(Number); if (!y || !m || !d) return String(iso); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
  const icon = (id) => `<svg class="i" aria-hidden="true" focusable="false"><use href="#${id}"/></svg>`;
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } },
  };
  const uid = () => (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => iso(new Date());
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const r1 = n => Math.round(n * 10) / 10;
  const r2 = n => Math.round(n * 100) / 100;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- state ---------- */
  const empty = () => ({ exercises: [], log: [], schedule: [] });
  let base = empty();      // last snapshot from the sheet (or the demo store)
  let state = empty();     // base with the outbox applied on top: what the screen shows
  let outbox = ls.get('outbox', []);
  let unit = ls.get('unit', 'kg');
  let lastRoute = null;
  let toastTimer = null;
  let shareBlob = null, shareName = 'workout.png', shareTitle = 'My workout';

  const ui = {
    calMonth: null,
    calDay: today(),
    progEx: '',
    progRange: '12W',
    favQ: '',
    openNew: false,
    popFav: '',
    draft: {
      date: today(),
      exercise: ls.get('lastEx', ''),
      group: '',
      reps: '',
      weight: '',
      entryUnit: ls.get('entryUnit', 'kg'),
      intensity: 'Med',
      notes: '',
      wSrc: null,   // { v, u, shown }: the typed weight and unit, kept so unit toggles do not drift
    },
  };

  const apiUrl = () => ls.get('apiUrl', '');
  const isDemo = () => !apiUrl();

  const IMG = {}; (window.EQUIPMENT || []).forEach(r => { if (r[3]) IMG[r[0]] = r[3]; });
  const exImg = (name, cls) => IMG[name] ? `<img class="${cls}" src="${esc(IMG[name])}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">` : '';

  function demoSeed() {
    return {
      exercises: (window.EQUIPMENT || [])
        .map(([Name, Machine, Group]) => ({ Name, Machine, Group, Favorite: false })),
      log: [],
      schedule: [['Monday', 'Upper'], ['Tuesday', 'Rest'], ['Wednesday', 'Lower'], ['Thursday', 'Rest'], ['Friday', 'Upper'], ['Saturday', 'Rest'], ['Sunday', 'Rest']]
        .map(([Day, Split]) => ({ Day, Split, Active: true })),
    };
  }

  /* Set numbers follow the order of the rows, per day and machine. Keeps them gapless after a delete or an undo. */
  function renumber(s) {
    const n = {};
    s.log.forEach(r => { const k = r.Date + '|' + r.Exercise; n[k] = (n[k] || 0) + 1; r.Set = n[k]; });
    return s;
  }

  function normalize(s) {
    s = s || empty();
    s.exercises = (s.exercises || []).filter(e => e && String(e.Name || '').trim()); s.log = s.log || []; s.schedule = s.schedule || [];
    s.exercises.forEach(e => { e.Favorite = e.Favorite === true || e.Favorite === 'TRUE'; });
    s.schedule.forEach(d => { d.Active = d.Active === true || d.Active === 'TRUE'; });
    s.log.forEach(r => ['Set', 'Reps', 'Weight', 'KG', 'LBS', 'Volume', 'E1RM'].forEach(k => { r[k] = Number(r[k]) || 0; }));
    return renumber(s);
  }

  /* Pure change to a state object. Used by the demo store and by the outbox replay. */
  function applyLocal(s, p) {
    if (p.action === 'addSet') {
      const e = s.exercises.find(x => x.Name === p.exercise);
      if (!e) throw new Error(COPY.errNoEx);
      const w = Number(p.weight), reps = Number(p.reps);
      const kg = p.unit === 'lbs' ? w / LB : w;
      const setNo = s.log.filter(r => r.Date === p.date && r.Exercise === p.exercise).length + 1;
      s.log.push({
        ID: p.tmpId || uid(), Date: p.date, Exercise: p.exercise, Group: e.Group, Set: setNo,
        Reps: reps, Weight: w, Unit: p.unit, KG: r2(kg), LBS: r1(kg * LB), Volume: r1(kg * reps), E1RM: r1(kg * (1 + reps / 30)),
        Intensity: p.intensity, Notes: p.notes || '',
      });
    } else if (p.action === 'deleteSet') {
      s.log = s.log.filter(r => r.ID !== p.id);
    } else if (p.action === 'addExercise') {
      s.exercises.push({ Name: p.name, Machine: p.machine || '', Group: p.group, Favorite: false });
    } else if (p.action === 'toggleFav') {
      const e = s.exercises.find(x => x.Name === p.name); if (e) e.Favorite = !e.Favorite;
    }
    return renumber(s);
  }

  /* Last server snapshot plus every queued write, in order. */
  function rebuild(b) {
    let s = normalize(JSON.parse(JSON.stringify(b)));
    for (const o of outbox) { try { s = applyLocal(s, o.p); } catch (e) { /* stale item, skipped */ } }
    return s;
  }

  /* ---------- network ---------- */
  class NetErr extends Error {}
  class SrvErr extends Error {}

  async function call(url, opts) {
    let res;
    try { res = await fetch(url, opts); } catch (e) { throw new NetErr(String(e && e.message)); }
    let j;
    try { j = await res.json(); } catch (e) { throw new SrvErr('Response was not JSON'); }
    if (!j || !j.ok) throw new SrvErr((j && j.error) || 'Not ok');
    return normalize(j.state);
  }
  const fetchState = url => call(url, { redirect: 'follow' });
  // text/plain avoids a CORS preflight, which Apps Script cannot answer.
  const postAction = (url, body) => call(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body), redirect: 'follow' });

  /* ---------- sync ---------- */
  function setSync(s) {
    const dot = $('#syncDot');
    if (!dot) return;
    dot.dataset.state = s;
    dot.setAttribute('aria-label', COPY.sync[s] || '');
  }
  function setStatus(msg, err) {
    const el = $('#status');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('err', !!err);
  }
  function showBanner(on) { const b = $('#demoBanner'); if (b) b.hidden = !on; }
  function saveOutbox() { ls.set('outbox', outbox); }

  let flushing = false;
  let inFlight = null;   // id of the outbox item whose POST is on the wire
  const dropItem = id => { outbox = outbox.filter(o => o.id !== id); saveOutbox(); };

  /* A confirmed add gets a real row id. Point any queued delete for its temp id at that row. */
  function bindTmpId(item, before, next) {
    const p = item.p;
    if (p.action !== 'addSet' || !p.tmpId) return;
    const row = next.log.find(r => !before.has(r.ID) && r.Date === p.date && r.Exercise === p.exercise
      && r.Reps === Number(p.reps) && r.Weight === Number(p.weight));
    if (row) outbox.forEach(o => { if (o.p.action === 'deleteSet' && o.p.id === p.tmpId) o.p.id = row.ID; });
  }

  async function flush() {
    if (flushing || isDemo()) return;
    flushing = true;
    try {
      if (!outbox.length) { setSync('synced'); return; }
      setSync('pending');
      setStatus(COPY.saving);
      while (outbox.length) {
        // Work on this item by identity. The queue can change while the POST is in flight.
        const item = outbox[0];
        const body = { ...item.p };
        delete body.tmpId;
        const before = new Set(base.log.map(r => r.ID));
        let next;
        inFlight = item.id;
        try {
          next = await postAction(apiUrl(), body);
        } catch (e) {
          inFlight = null;
          if (e instanceof NetErr) { setSync('offline'); setStatus(COPY.offline, true); paint(); return; }
          // The sheet rejected this write. Drop it so the queue can move on, and say so.
          console.warn('Write rejected', e);
          dropItem(item.id);
          state = rebuild(base);
          setStatus(COPY.errSave, true);
          paint();
          continue;
        }
        inFlight = null;
        bindTmpId(item, before, next);
        dropItem(item.id);
        base = next; ls.set('cache', base);
        state = rebuild(base);
        paint();
      }
      setSync('synced');
      setStatus(COPY.saved);
    } finally {
      inFlight = null;
      flushing = false;
    }
  }

  async function load(opts) {
    const notify = !!(opts && opts.notify);
    if (isDemo()) {
      base = normalize(ls.get('demoState', null) || demoSeed());
      (window.EQUIPMENT || []).forEach(([Name, Machine, Group]) => { if (!base.exercises.some(x => x.Name === Name)) base.exercises.push({ Name, Machine, Group, Favorite: false }); });
      state = base;
      ls.set('demoState', state);
      setSync('demo'); showBanner(true); setStatus('');
      return;
    }
    showBanner(false);
    setStatus(COPY.syncing);
    try {
      base = await fetchState(apiUrl());
      ls.set('cache', base);
      state = rebuild(base);
      setSync('synced');
      setStatus(notify ? COPY.connected : '');
      await flush();
      if (notify && !outbox.length) setStatus(COPY.connected);
    } catch (e) {
      console.warn('Load failed', e);
      base = normalize(ls.get('cache', null) || empty());
      state = rebuild(base);
      setSync('offline');
      setStatus(e instanceof NetErr ? COPY.offline : COPY.errServer, true);
    }
  }

  async function testConn() {
    if (isDemo()) { setStatus(COPY.demo); return; }
    setStatus(COPY.syncing);
    try {
      base = await fetchState(apiUrl());
      ls.set('cache', base);
      state = rebuild(base);
      setSync(outbox.length ? 'pending' : 'synced');
      setStatus(COPY.connected);
    } catch (e) {
      console.warn('Test failed', e);
      setSync('offline');
      setStatus(e instanceof NetErr ? COPY.errSheet : COPY.errServer, true);
    }
    paint();
  }

  /* Apply a write to the screen now. Queue it, then send it. */
  function write(p) {
    if (p.action === 'addSet' && !state.exercises.some(x => x.Name === p.exercise)) throw new Error(COPY.errNoEx);
    if (p.action === 'addExercise' && state.exercises.some(x => x.Name.toLowerCase() === String(p.name).toLowerCase())) throw new Error(COPY.errDupe);

    if (isDemo()) {
      state = applyLocal(state, p);
      base = state;
      ls.set('demoState', state);
      return Promise.resolve();
    }
    if (p.action === 'addSet') p.tmpId = 'tmp-' + uid();
    if (p.action === 'deleteSet' && String(p.id).startsWith('tmp-')) {
      const add = outbox.find(o => o.p.action === 'addSet' && o.p.tmpId === p.id);
      if (add && add.id !== inFlight) {
        // Still queued and never sent: cancel the add, nothing to send.
        outbox = outbox.filter(o => o !== add);
      } else {
        // The add is already on the wire. Send the delete after it; its real id is bound when the add confirms.
        outbox.push({ id: uid(), p });
      }
    } else {
      outbox.push({ id: uid(), p });
    }
    saveOutbox();
    state = rebuild(base);
    return flush();
  }

  /* ---------- analytics ---------- */
  const fmtW = kg => unit === 'kg' ? `${r1(kg)} kg` : `${r1(kg * LB)} lbs`;
  const both = r => `${r1(r.KG)} kg · ${r1(r.LBS)} lbs`;
  const weekStart = s => { const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
  const pct = (c, p) => p > 0 ? (c - p) / p * 100 : null;
  const verdict = x => x === null ? 'BASELINE' : x > 2 ? 'PROGRESS' : x < -2 ? 'DIP' : 'HOLD';
  const fmtPct = x => x === null || x === undefined ? '—' : `${x > 0 ? '+' : ''}${r1(x)}%`;
  const cls = x => x === null || x === undefined ? '' : x > 0 ? 'up' : x < 0 ? 'down' : '';
  const planned = () => state.schedule.filter(d => d.Active && d.Split !== 'Rest').length || 3;

  function weekly() {
    const W = {};
    state.log.forEach(r => {
      const k = weekStart(r.Date);
      const w = W[k] = W[k] || { week: k, dates: new Set(), vol: 0, sets: 0, ex: {} };
      w.dates.add(r.Date); w.vol += r.Volume; w.sets++;
      const e = w.ex[r.Exercise] = w.ex[r.Exercise] || { name: r.Exercise, group: r.Group, sets: 0, vol: 0, e1rm: 0 };
      e.sets++; e.vol += r.Volume; e.e1rm = Math.max(e.e1rm, r.E1RM);
    });
    const keys = Object.keys(W).sort(), seen = {}, out = [];
    keys.forEach((k, i) => {
      const w = W[k], prev = i ? W[keys[i - 1]] : null, ds = [];
      Object.values(w.ex).forEach(e => {
        const last = seen[e.name];
        e.volD = last ? pct(e.vol, last.vol) : null;
        e.e1D = last ? pct(e.e1rm, last.e1rm) : null;
        if (e.e1D !== null) ds.push(e.e1D);
        seen[e.name] = e;
      });
      const volD = prev ? pct(w.vol, prev.vol) : null;
      const e1Avg = ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : null;
      const cons = Math.min(w.dates.size / planned(), 1) * 100;
      const score = volD === null ? null : 0.4 * volD + 0.4 * (e1Avg || 0) + 0.2 * (cons - 100);
      out.push({ ...w, sessions: w.dates.size, volD, e1Avg, cons, score, verdict: verdict(score) });
    });
    return out.reverse();
  }

  function exStats(name) {
    const rows = state.log.filter(r => r.Exercise === name);
    const byDate = {};
    rows.forEach(r => {
      const d = byDate[r.Date] = byDate[r.Date] || { date: r.Date, e1rm: 0, vol: 0, top: 0 };
      d.e1rm = Math.max(d.e1rm, r.E1RM); d.vol += r.Volume; d.top = Math.max(d.top, r.KG);
    });
    const sessions = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    const last = rows.length ? rows.reduce((a, b) => (b.Date > a.Date || (b.Date === a.Date && b.Set > a.Set)) ? b : a) : null;
    const best = rows.reduce((a, b) => (!a || b.E1RM > a.E1RM) ? b : a, null);
    const heavy = rows.reduce((a, b) => (!a || b.KG > a.KG) ? b : a, null);
    return { rows, sessions, last, best, heavy };
  }

  function splitFor(dateStr) {
    const day = parse(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    const s = state.schedule.find(d => d.Day === day);
    return s && s.Active && s.Split !== 'Rest' ? s.Split : null;
  }

  function planLine(date) {
    const s = splitFor(date);
    if (!s) return COPY.planRest;
    return s === 'Upper' ? COPY.planUpper : COPY.planSplit(s);
  }

  function prFor(name, entryUnit, w, reps) {
    const best = exStats(name).best;
    if (!best || !(best.E1RM > 0)) return false;
    const kg = entryUnit === 'kg' ? w : w / LB;
    return kg * (1 + reps / 30) > best.E1RM;
  }

  function dayGroups(date) {
    const rows = state.log.filter(r => r.Date === date);
    const byEx = {};
    rows.forEach(r => { (byEx[r.Exercise] = byEx[r.Exercise] || []).push(r); });
    return { rows, byEx };
  }

  /* ---------- shared markup ---------- */
  function exOptions(sel, only) {
    const block = (label, list) => list.length
      ? `<optgroup label="${esc(label)}">${list.map(e => `<option value="${esc(e.Name)}"${e.Name === sel ? ' selected' : ''}>${e.Favorite ? '★ ' : ''}${esc(e.Name)}</option>`).join('')}</optgroup>`
      : '';
    if (only) return block(only, state.exercises.filter(e => e.Group === only));
    const other = state.exercises.filter(e => !GROUPS.includes(e.Group));
    return GROUPS.map(g => block(g, state.exercises.filter(e => e.Group === g))).join('') + block('Other', other);
  }

  function favButton(name, fav, extraClass) {
    return `<button type="button" class="star${extraClass ? ' ' + extraClass : ''}" data-fav="${esc(name)}" aria-pressed="${fav}"
      aria-label="${fav ? 'Remove ' : 'Add '}${esc(name)} ${fav ? 'from' : 'to'} favorites">${icon(fav ? 'i-star-fill' : 'i-star')}</button>`;
  }

  function spark(vals) {
    if (vals.length < 2) return '';
    const min = Math.min(...vals), max = Math.max(...vals), w = 200, h = 36;
    const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 4 - (max === min ? 0.5 : (v - min) / (max - min)) * (h - 8)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" class="spark" preserveAspectRatio="none" aria-hidden="true"><polyline class="line" points="${pts}"/></svg>`;
  }

  function chart(sessions) {
    if (!sessions.length) return `<p class="empty">${COPY.chartEmpty}</p>`;
    const desktop = matchMedia('(min-width: 1024px)').matches;
    const W = Math.round(Math.min(900, Math.max(280, (($('#view') || {}).clientWidth || 358) - 40)));
    const H = desktop ? 420 : 260, P = 36;
    const conv = v => unit === 'kg' ? v : v * LB;
    const a = sessions.map(s => conv(s.e1rm)), b = sessions.map(s => conv(s.top));
    const all = a.concat(b);
    const min = Math.min(...all) * 0.95, max = (Math.max(...all) * 1.05) || 1;
    const x = i => P + (sessions.length === 1 ? (W - 2 * P) / 2 : i / (sessions.length - 1) * (W - 2 * P));
    const y = v => H - P - (v - min) / ((max - min) || 1) * (H - 2 * P);
    const line = arr => arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const ticks = [0, 0.5, 1].map(t => min + t * (max - min));
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Estimated 1 rep max and top set over ${sessions.length} sessions">
      ${ticks.map(t => `<line class="grid-l" x1="${P}" x2="${W - P}" y1="${y(t).toFixed(1)}" y2="${y(t).toFixed(1)}"/><text x="2" y="${(y(t) + 4).toFixed(1)}">${Math.round(t)}</text>`).join('')}
      <polyline class="line" points="${line(a)}"/><polyline class="line2" points="${line(b)}"/>
      ${a.map((v, i) => `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="4"><title>${sessions[i].date}: e1RM ${r1(v)} ${unit}</title></circle>`).join('')}
      <text x="${P}" y="${H - 8}">${sessions[0].date}</text><text x="${W - P}" y="${H - 8}" text-anchor="end">${sessions[sessions.length - 1].date}</text>
    </svg>
    <div class="legend"><span><i class="sw sw-a"></i>Est. 1RM (${unit})</span><span><i class="sw sw-s"></i>Top set (${unit})</span></div>`;
  }

  function dayPanel(date) {
    const { rows, byEx } = dayGroups(date);
    const plan = splitFor(date);
    const body = rows.length
      ? Object.entries(byEx).map(([n, rs]) => `<div class="day-ex"><strong>${esc(n)}</strong><div class="mono muted">${rs.map(r => `${r.Reps}×${fmtW(r.KG)}`).join(' · ')}</div></div>`).join('')
      : `<p class="empty">${plan ? COPY.calEmptyPlan(plan) : COPY.calEmptyRest}</p>`;
    return `<section class="card day-panel">
      <div class="h-row"><h2>${esc(date)}${plan ? ' · ' + esc(plan) : ''}</h2>
        ${rows.length ? `<button type="button" class="btn ghost" data-share-day="${date}">Share</button>` : ''}</div>
      ${body}
      <button type="button" class="btn wide mt" data-logday="${date}">Log on this day</button>
    </section>`;
  }

  /* ---------- views ---------- */
  const views = {};

  views.log = () => {
    const d = ui.draft;
    if (!state.exercises.some(e => e.Name === d.exercise)) d.exercise = state.exercises[0] ? state.exercises[0].Name : '';
    const ex = state.exercises.find(e => e.Name === d.exercise);
    const st = ex ? exStats(ex.Name) : null;
    const todays = state.log.filter(r => r.Date === d.date).sort((a, b) => a.Exercise.localeCompare(b.Exercise) || a.Set - b.Set);
    const wk = weekly()[0];
    const isEntryKg = d.entryUnit === 'kg';
    const stepUnit = isEntryKg ? 'kg' : 'lbs';
    const newOpen = ui.openNew || !state.exercises.length;
    ui.openNew = false;

    return `
      <div class="meta-row">
        <h1>Log a set</h1>
        ${wk ? `<a class="verdict ${wk.verdict}" href="#week" aria-label="This week: ${wk.verdict}">${wk.verdict}</a>` : ''}
      </div>
      <p class="hint">${esc(planLine(d.date))}</p>

      <form id="setForm" class="card stack" novalidate>
        <div class="field">
          <label for="fGroup">Split</label>
          <select id="fGroup">${['', ...GROUPS].map(g => `<option value="${esc(g)}"${g === (d.group || '') ? ' selected' : ''}>${g ? esc(g) : 'All splits'}</option>`).join('')}</select>
        </div>
        <div class="field">
          <label for="fEx">Exercise / machine</label>
          <div class="ex-row">
            <select id="fEx">${exOptions(d.exercise, d.group)}</select>
            ${ex ? favButton(ex.Name, ex.Favorite, ui.popFav === ex.Name ? 'pop' : '') : ''}
          </div>
          ${ex ? exImg(ex.Name, 'ex-photo') : ''}
        </div>

        <div class="strip" aria-live="polite">
          ${st && st.last
            ? `<span><span class="k">LAST</span>${st.last.Reps} × ${esc(both(st.last))} · ${esc(st.last.Intensity)}</span>`
            : `<span class="muted"><span class="k">LAST</span>${COPY.lastNone}</span>`}
          ${st && st.best ? `<span><span class="k">BEST</span>e1RM ${fmtW(st.best.E1RM)}</span>` : ''}
          <span id="prSlot" data-pr="0"></span>
        </div>

        <div class="field">
          <label for="fDate">Date</label>
          <input type="date" id="fDate" value="${esc(d.date)}" required>
        </div>

        <div class="two fields">
          <div class="field">
            <label for="fReps">Reps</label>
            <div class="stepper">
              <button type="button" class="step" data-step="reps:-1" aria-label="One fewer rep">−</button>
              <input id="fReps" type="number" inputmode="numeric" min="1" max="100" step="1" value="${esc(d.reps)}" required>
              <button type="button" class="step" data-step="reps:1" aria-label="One more rep">+</button>
            </div>
          </div>
          <div class="field">
            <label for="fW">Weight (${stepUnit})</label>
            <div class="stepper">
              <button type="button" class="step" data-step="w:-1" aria-label="Less weight">−</button>
              <input id="fW" type="number" inputmode="decimal" min="0" step="0.5" value="${esc(d.weight)}" required>
              <button type="button" class="step" data-step="w:1" aria-label="More weight">+</button>
            </div>
          </div>
        </div>
        <div class="unit-row" role="radiogroup" aria-label="Entry unit">
          <button type="button" role="radio" aria-checked="${isEntryKg}" data-eunit="kg">kg</button>
          <button type="button" role="radio" aria-checked="${!isEntryKg}" data-eunit="lbs">lbs</button>
          <span id="conv" class="conv"></span>
        </div>

        <div class="field">
          <span class="label" id="intLbl">Intensity</span>
          <div class="seg" role="radiogroup" aria-labelledby="intLbl">
            ${['Easy', 'Med', 'Hard'].map(i => `<button type="button" role="radio" aria-checked="${d.intensity === i}" data-int="${i}">${i}</button>`).join('')}
          </div>
        </div>

        <div class="field">
          <label for="fNotes">Notes (optional)</label>
          <input id="fNotes" maxlength="200" placeholder="Seat 4, slow negatives" value="${esc(d.notes)}">
        </div>

        <button class="btn primary cta" type="submit">Log set</button>
      </form>

      <details class="card"${newOpen ? ' open' : ''}>
        <summary>+ New exercise or machine</summary>
        <form id="exForm" class="stack mt">
          <div class="field"><label for="nName">Exercise name</label><input id="nName" required maxlength="60"></div>
          <div class="field"><label for="nMach">Machine / equipment</label><input id="nMach" maxlength="60"></div>
          <div class="field"><label for="nGroup">Group</label>
            <select id="nGroup">${GROUPS.map(g => `<option>${esc(g)}</option>`).join('')}</select></div>
          <button class="btn" type="submit">Add machine</button>
        </form>
      </details>

      <section class="card mt">
        <div class="h-row"><h2>Sets on ${esc(d.date)} (${todays.length})</h2>
          ${todays.length ? `<button type="button" class="btn ghost" data-share-day="${esc(d.date)}">Share day</button>` : ''}</div>
        ${todays.length
          ? `<ul class="sets">${todays.map(r => `<li>
              <div><strong>${esc(r.Exercise)}</strong> <span class="mono muted">#${r.Set}</span><br>
              <span class="mono">${r.Reps} × ${esc(both(r))}</span><span class="tag ${esc(r.Intensity)}">${esc(r.Intensity)}</span></div>
              <button type="button" class="del" data-del="${esc(r.ID)}" aria-label="Delete set ${r.Set} of ${esc(r.Exercise)}">${icon('i-remove')}</button>
            </li>`).join('')}</ul>`
          : `<p class="empty">No sets yet. Log your first one above.</p>`}
      </section>`;
  };

  views.favorites = () => `
    <h1>Favorites</h1>
    <p class="hint">${COPY.favIntro}</p>
    <div class="field search">
      <label class="sr-only" for="favSearch">${COPY.favSearch}</label>
      <input id="favSearch" type="search" placeholder="${COPY.favSearch}" value="${esc(ui.favQ)}">
    </div>
    <div id="favBody"></div>
    <div class="row mt"><button type="button" class="btn" id="addExBtn">+ Add exercise</button></div>

    <section class="card mt">
      <h2>All machines</h2>
      <ul class="sets">${state.exercises.map(e => `<li>
        <span><strong>${esc(e.Name)}</strong> <span class="muted">· ${esc(e.Group)}</span></span>
        ${favButton(e.Name, e.Favorite, ui.popFav === e.Name ? 'pop' : '')}</li>`).join('')}</ul>
    </section>`;

  function renderFavBody() {
    const el = $('#favBody');
    if (!el) return;
    const q = ui.favQ.trim().toLowerCase();
    const match = e => !q || `${e.Name} ${e.Machine} ${e.Group}`.toLowerCase().includes(q);
    const favs = state.exercises.filter(e => e.Favorite && match(e));
    el.innerHTML = GROUPS.map(g => {
      const list = favs.filter(e => e.Group === g);
      return `<section class="fav-group">
        <h2><span>${esc(g)}</span><span class="mono muted">${list.length}</span></h2>
        ${list.length
          ? `<div class="grid">${list.map(e => {
              const s = exStats(e.Name);
              return `<button type="button" class="fav-card" data-goto="${esc(e.Name)}" aria-label="Log ${esc(e.Name)}">
                ${exImg(e.Name, 'fav-photo')}
                <span class="name">${esc(e.Name)}</span>
                <span class="mach">${esc(e.Machine)}</span>
                <span class="mono">${s.last ? `Last: ${s.last.Reps} × ${esc(both(s.last))}` : 'Not logged yet'}</span>
                ${s.best ? `<span class="mono up">Best e1RM ${fmtW(s.best.E1RM)}</span>` : ''}
                ${spark(s.sessions.map(x => x.e1rm))}
              </button>`;
            }).join('')}</div>`
          : `<p class="empty">${COPY.favEmpty}</p>`}
      </section>`;
    }).join('') || `<p class="empty">${COPY.favEmpty}</p>`;
  }

  views.progress = () => {
    if (!state.exercises.length) return `<h1>Charts</h1><p class="empty">${COPY.chartNone}</p>`;
    const logged = [...new Set(state.log.map(r => r.Exercise))];
    if (!ui.progEx || !state.exercises.some(e => e.Name === ui.progEx)) ui.progEx = logged[0] || state.exercises[0].Name;
    const s = exStats(ui.progEx);
    const days = ui.progRange === '4W' ? 28 : ui.progRange === '12W' ? 84 : null;
    const cutoff = days ? iso(addDays(new Date(), -days)) : null;
    const sessions = cutoff ? s.sessions.filter(x => x.date >= cutoff) : s.sessions;
    const first = s.sessions[0], last = s.sessions[s.sessions.length - 1];
    const gain = first && last && s.sessions.length > 1 ? pct(last.e1rm, first.e1rm) : null;
    const hist = s.rows.slice().reverse().slice(0, 30);
    const ranges = ['4W', '12W', 'ALL'];
    return `
      <h1>Charts</h1>
      <div class="scroller" role="group" aria-label="Exercise / machine">
        ${state.exercises.map(e => `<button type="button" class="chip" data-chart-ex="${esc(e.Name)}" aria-pressed="${e.Name === ui.progEx}">${esc(e.Name)}</button>`).join('')}
      </div>
      <div class="seg range" role="radiogroup" aria-label="Date range">
        ${ranges.map(r => `<button type="button" role="radio" aria-checked="${ui.progRange === r}" data-range="${r}">${r}</button>`).join('')}
      </div>
      <div class="kpi-grid">
        <div class="card"><span class="kicker">Best e1RM</span><div class="stat">${s.best ? fmtW(s.best.E1RM) : '—'}</div></div>
        <div class="card"><span class="kicker">Heaviest set</span><div class="stat">${s.heavy ? fmtW(s.heavy.KG) : '—'}<small>${s.heavy ? `× ${s.heavy.Reps} on ${s.heavy.Date}` : ''}</small></div></div>
        <div class="card"><span class="kicker">Sessions</span><div class="stat">${s.sessions.length}</div></div>
        <div class="card"><span class="kicker">Since first session</span><div class="stat ${cls(gain)}">${fmtPct(gain)}</div></div>
      </div>
      <div class="card">${chart(sessions)}</div>
      ${hist.length ? `<section class="card"><h2>History</h2><ul class="sets">${hist.map(r => `<li>
        <span class="mono nowrap">${r.Date} #${r.Set}</span>
        <span class="mono">${r.Reps} × ${esc(both(r))}</span><span class="tag ${esc(r.Intensity)}">${esc(r.Intensity)}</span></li>`).join('')}</ul></section>` : ''}`;
  };

  views.calendar = () => {
    const now = new Date();
    const m = ui.calMonth || new Date(now.getFullYear(), now.getMonth(), 1);
    ui.calMonth = m;
    const done = new Set(state.log.map(r => r.Date));
    const start = new Date(m); start.setDate(1 - ((m.getDay() + 6) % 7));
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const s = iso(d), plan = splitFor(s), isDone = done.has(s);
      const c = [d.getMonth() !== m.getMonth() && 'out', isDone && 'done', !isDone && plan && s >= today() && 'plan', s === today() && 'today'].filter(Boolean).join(' ');
      const label = `${d.toDateString()}${isDone ? ', workout logged' : ''}${plan ? ', planned ' + plan : ''}`;
      cells.push(`<button type="button" class="${c}" data-day="${s}" aria-selected="${s === ui.calDay}" aria-label="${esc(label)}">${d.getDate()}${plan ? `<small>${plan === 'Upper' ? COPY.badgeUp : COPY.badgeLow}</small>` : ''}</button>`);
    }
    const list = [];
    const dim = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (let n = 1; n <= dim; n++) {
      const d = new Date(m.getFullYear(), m.getMonth(), n), s = iso(d), plan = splitFor(s);
      const c = [done.has(s) && 'done', plan && 'plan'].filter(Boolean).join(' ');
      list.push(`<button type="button" class="${c}" data-day="${s}" aria-selected="${s === ui.calDay}">
        <span>${n} ${DAYS_SHORT[(d.getDay() + 6) % 7]}${done.has(s) ? ' · logged' : ''}</span><span class="split">${plan ? esc(plan) : 'Rest'}</span></button>`);
    }
    return `
      <h1>Calendar</h1>
      <section class="card">
        <div class="cal-head">
          <button type="button" class="icon-btn" data-mon="-1" aria-label="Previous month">${icon('i-chevron_left')}</button>
          <h2>${m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button type="button" class="icon-btn" data-mon="1" aria-label="Next month">${icon('i-chevron_right')}</button>
        </div>
        <div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(x => `<div class="dow" aria-hidden="true">${x}</div>`).join('')}${cells.join('')}</div>
        <div class="daylist">${list.join('')}</div>
        <div class="legend">
          <span><i class="sw sw-a"></i>Done</span>
          <span><i class="sw sw-p"></i>Planned</span>
        </div>
      </section>
      ${dayPanel(ui.calDay)}`;
  };

  views.week = () => {
    const wk = weekly();
    if (!wk.length) return `<h1>Weekly KPI</h1><p class="empty">${COPY.wkEmpty}</p>`;
    const w = wk[0];
    const recent = wk.slice(0, 8).reverse();
    const maxVol = Math.max(...recent.map(x => x.vol), 1);
    const bars = `<div class="bars" role="img" aria-label="Volume for the last ${recent.length} weeks">${recent.map(x =>
      `<div class="bar${x === w ? ' cur' : ''}"><i style="height:${Math.max(4, Math.round(x.vol / maxVol * 100))}%"></i><span>${x.week.slice(5)}</span></div>`).join('')}</div>`;
    return `
      <h1>Weekly KPI</h1>
      <p class="hint">${COPY.wkExplain(planned())}</p>
      <p class="hint">${COPY.wkBands}</p>

      <section class="card hero">
        <span class="kicker">Week of ${esc(weekLabel(w.week))}</span>
        <span class="verdict-word ${w.verdict}">${w.verdict}</span>
        <p class="hint">${COPY.verdictHelp[w.verdict]}</p>
        <div class="row mt"><span class="kicker">Score</span></div>
        <div class="score ${cls(w.score)}" id="heroScore" data-target="${w.score === null ? '' : w.score}">${fmtPct(w.score)}</div>
        <div class="kpi-grid mt">
          <div><span class="kicker">Volume</span><div class="stat">${fmtW(w.vol)}<small class="${cls(w.volD)}">${fmtPct(w.volD)}</small></div></div>
          <div><span class="kicker">Avg e1RM change</span><div class="stat ${cls(w.e1Avg)}">${fmtPct(w.e1Avg)}</div></div>
          <div><span class="kicker">Sessions</span><div class="stat">${w.sessions}<small>/${planned()}</small></div></div>
        </div>
        ${bars}
      </section>

      <h2 class="mt">History</h2>
      ${wk.map((x, i) => `<section class="card">
        <div class="week-h"><h2>Week of ${esc(weekLabel(x.week))}</h2><span class="verdict ${x.verdict}">${x.verdict}</span></div>
        <div class="row mt">
          <span class="stat ${cls(x.score)}">${fmtPct(x.score)}</span>
          <span class="mono muted">${fmtW(x.vol)} · ${x.sessions}/${planned()}</span>
        </div>
        <details class="mt"><summary>Per exercise</summary>
          <ul class="sets">${Object.values(x.ex).sort((a, b) => (b.e1D ?? -999) - (a.e1D ?? -999)).map(e => `<li>
            <span><strong>${esc(e.name)}</strong><br><span class="mono muted">${e.sets} sets · ${fmtW(e.vol)} vol</span></span>
            <span class="mono ${cls(e.e1D)}">${fmtPct(e.e1D)}</span></li>`).join('')}</ul>
        </details>
        <button type="button" class="btn ghost mt" data-share-week="${i}">Share week</button>
      </section>`).join('')}`;
  };

  views.settings = () => {
    const url = apiUrl();
    const dark = currentTheme() === 'dark';
    return `
      <h1>Setup</h1>
      <form class="card stack" id="cfgForm">
        <div class="field">
          <label for="cUrl">Apps Script web app URL</label>
          <input id="cUrl" type="url" inputmode="url" autocomplete="off" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(url)}">
        </div>
        <p class="hint">Leave empty for demo mode. Data stays in this browser.</p>
        <p class="hint">Setup steps are in the README on GitHub.</p>
        <div class="row">
          <button class="btn primary" type="submit">Save &amp; sync</button>
          <button class="btn ghost" type="button" id="cTest">Test connection</button>
        </div>
      </form>

      <section class="card stack">
        <div class="field">
          <span class="label" id="unitLbl">Display unit</span>
          <div class="seg two-up" role="radiogroup" aria-labelledby="unitLbl">
            <button type="button" role="radio" aria-checked="${unit === 'kg'}" data-unit-set="kg">kg</button>
            <button type="button" role="radio" aria-checked="${unit === 'lbs'}" data-unit-set="lbs">lbs</button>
          </div>
        </div>
        <div class="field">
          <span class="label" id="themeLbl">Theme</span>
          <div class="seg two-up" role="radiogroup" aria-labelledby="themeLbl">
            <button type="button" role="radio" aria-checked="${dark}" data-theme-set="dark">Dark</button>
            <button type="button" role="radio" aria-checked="${!dark}" data-theme-set="light">Light</button>
          </div>
        </div>
      </section>

      <section class="card">
        <h2>Plan</h2>
        ${state.schedule.length
          ? `<ul class="sets plan-list">${state.schedule.map(d => `<li><span>${esc(d.Day)}</span><span class="mono">${esc(d.Split)}</span></li>`).join('')}</ul>`
          : `<p class="empty">${COPY.setPlanEmpty}</p>`}
        <p class="hint mt">${COPY.setPlanNote}</p>
      </section>

      <p class="setup-links"><a href="./intro/">How it works</a></p>`;
  };

  /* ---------- share card ---------- */
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  async function drawCard(title, sub, stats, lines) {
    try { await document.fonts.ready; } catch (e) { /* fonts optional */ }
    const c = $('#shareCanvas'), g = c.getContext('2d'), W = c.width, H = c.height;
    // Colours come from the active theme tokens, so the card matches the screen it was made on.
    const bg = cssVar('--bg'), acc = cssVar('--accent'), cy = cssVar('--cyan'), tx = cssVar('--text'), mu = cssVar('--muted'), grid = cssVar('--surface-2');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = grid; g.lineWidth = 2;
    for (let yy = 0; yy < H; yy += 54) { g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
    g.fillStyle = acc; g.beginPath(); g.moveTo(W - 220, 0); g.lineTo(W, 0); g.lineTo(W, 220); g.closePath(); g.fill();
    g.fillStyle = acc; g.font = '700 40px "Chakra Petch", sans-serif'; g.fillText('▲ ELEVATION', 72, 110);
    g.fillStyle = tx; g.font = '700 92px "Chakra Petch", sans-serif'; g.fillText(title.toUpperCase().slice(0, 16), 72, 240);
    g.fillStyle = cy; g.font = '500 38px "JetBrains Mono", monospace'; g.fillText(sub, 72, 300);
    stats.forEach(([k, v], i) => {
      const x = 72 + i * 320;
      g.fillStyle = mu; g.font = '600 26px "Chakra Petch", sans-serif'; g.fillText(k.toUpperCase(), x, 400);
      g.fillStyle = acc; g.font = '700 64px "JetBrains Mono", monospace'; g.fillText(v, x, 470);
    });
    g.fillStyle = acc; g.fillRect(72, 520, W - 144, 4);
    g.font = '500 36px "JetBrains Mono", monospace';
    lines.slice(0, 12).forEach((l, i) => {
      g.fillStyle = i % 2 ? mu : tx;
      g.fillText(l.length > 44 ? l.slice(0, 43) + '…' : l, 72, 600 + i * 58);
    });
    g.fillStyle = mu; g.font = '500 28px "JetBrains Mono", monospace'; g.fillText('Tracked with Elevation', 72, H - 60);
    return new Promise(res => c.toBlob(res, 'image/png'));
  }

  async function openShare(label, title, sub, stats, lines, fileName, shareHead) {
    shareName = fileName;
    shareTitle = shareHead;
    shareBlob = await drawCard(title, sub, stats, lines);
    const c = $('#shareCanvas');
    c.setAttribute('aria-label', label);
    $('#shareStatus').textContent = '';
    const dlg = $('#shareDialog');
    if (!dlg.open) dlg.showModal();
    $('#shareGo').focus();
  }

  function shareDay(date) {
    const { rows, byEx } = dayGroups(date);
    const vol = rows.reduce((a, r) => a + r.Volume, 0);
    const lines = [];
    Object.entries(byEx).forEach(([n, rs]) => {
      lines.push(n);
      lines.push('  ' + rs.map(r => `${r.Reps}×${r1(unit === 'kg' ? r.KG : r.LBS)}`).join('  ') + ' ' + unit);
    });
    const plan = splitFor(date);
    return openShare(
      'Workout summary image',
      COPY.shareCardDay(plan),
      date,
      [['Sets', String(rows.length)], ['Volume', fmtW(vol).replace(' ', '')], ['Moves', String(Object.keys(byEx).length)]],
      lines,
      `workout-${date}.png`,
      'My workout',
    );
  }

  function shareWeek(i) {
    const w = weekly()[i];
    if (!w) return;
    const lines = Object.values(w.ex).sort((a, b) => (b.e1D ?? -999) - (a.e1D ?? -999)).map(e => `${e.name}  ${fmtPct(e.e1D)}`);
    return openShare(
      'Week summary image',
      w.verdict,
      `Week of ${weekLabel(w.week)}`,
      [['Score', fmtPct(w.score)], ['Volume', fmtW(w.vol).replace(' ', '')], ['Sessions', `${w.sessions}/${planned()}`]],
      lines,
      `week-${w.week}.png`,
      'My week',
    );
  }

  function downloadShare() {
    if (!shareBlob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(shareBlob);
    a.download = shareName;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- toast ---------- */
  function showToast(msg, undo) {
    const t = $('#toast');
    $('#toastMsg').textContent = msg;
    const act = $('#toastAct');
    act.hidden = !undo;
    act.textContent = COPY.undo;
    act.onclick = () => { hideToast(); if (undo) undo(); };
    t.hidden = false;
    requestAnimationFrame(() => t.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, undo ? 6000 : 3500);
  }
  function hideToast() {
    const t = $('#toast');
    if (!t) return;
    t.classList.remove('show');
    setTimeout(() => { if (!t.classList.contains('show')) t.hidden = true; }, 220);
  }

  /* ---------- count-up for the hero score ---------- */
  function countUp(el, to) {
    if (reduced()) { el.textContent = fmtPct(to); return; }
    const t0 = performance.now(), dur = 280;
    const tick = now => {
      const k = Math.min(1, (now - t0) / dur);
      el.textContent = fmtPct(to * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- actions ---------- */
  function syncDraft() {
    const d = ui.draft;
    const f = $('#setForm');
    if (!f) return;
    d.exercise = $('#fEx').value || d.exercise;
    d.date = $('#fDate').value || d.date;
    d.reps = $('#fReps').value;
    d.weight = $('#fW').value;
    d.notes = $('#fNotes').value;
  }

  function setExercise(name) {
    const d = ui.draft;
    d.exercise = name;
    ls.set('lastEx', name);
    const st = exStats(name);
    if (st.last) {
      d.reps = String(st.last.Reps);
      d.weight = String(r1(d.entryUnit === 'kg' ? st.last.KG : st.last.LBS));
    } else {
      d.reps = ''; d.weight = '';
    }
  }

  const toUnit = (v, from, to) => (from === to ? v : (to === 'kg' ? v / LB : v * LB));

  function setEntryUnit(u) {
    const d = ui.draft;
    const w = Number(d.weight);
    if (w > 0 && d.entryUnit !== u) {
      // Convert from the value the user typed, while the field still shows what we last converted to.
      const s = d.wSrc;
      if (s && s.shown === d.weight) {
        d.weight = String(s.u === u ? s.v : r1(toUnit(s.v, s.u, u)));
        d.wSrc = { v: s.v, u: s.u, shown: d.weight };
      } else {
        d.weight = String(r1(toUnit(w, d.entryUnit, u)));
        d.wSrc = { v: w, u: d.entryUnit, shown: d.weight };
      }
    }
    d.entryUnit = u;
    ls.set('entryUnit', u);
    paint();
  }

  function stepValue(spec) {
    const [k, dir] = spec.split(':');
    const n = Number(dir), d = ui.draft;
    if (k === 'reps') d.reps = String(Math.max(1, Math.min(100, (Number(d.reps) || 0) + n)));
    else d.weight = String(Math.max(0, r1((Number(d.weight) || 0) + n * (d.entryUnit === 'kg' ? 2.5 : 5))));
    const r = $('#fReps'), w = $('#fW');
    if (r) r.value = d.reps;
    if (w) w.value = d.weight;
    updateLogLive();
  }

  function updateLogLive() {
    const d = ui.draft, w = Number(d.weight), reps = Number(d.reps);
    const conv = $('#conv');
    if (conv) conv.textContent = w > 0 ? (d.entryUnit === 'kg' ? `= ${r1(w * LB)} lbs` : `= ${r1(w / LB)} kg`) : '';
    const slot = $('#prSlot');
    if (!slot || !d.exercise) return;
    const pr = reps > 0 && w > 0 && prFor(d.exercise, d.entryUnit, w, reps);
    if (pr !== (slot.dataset.pr === '1')) {
      slot.dataset.pr = pr ? '1' : '0';
      slot.innerHTML = pr ? `<span class="pr-chip stamp">${COPY.newPr}</span>` : '';
    }
  }

  function logSet() {
    syncDraft();
    const d = ui.draft;
    const reps = Number(d.reps), w = Number(d.weight);
    if (!(reps > 0) || d.weight === '' || !(w >= 0)) { setStatus(COPY.errReps, true); return; }
    if (!d.exercise) { setStatus(COPY.errNoEx, true); return; }
    const isPR = prFor(d.exercise, d.entryUnit, w, reps);
    run(async () => {
      const p = write({ action: 'addSet', date: d.date, exercise: d.exercise, reps, weight: w, unit: d.entryUnit, intensity: d.intensity, notes: d.notes });
      ls.set('lastEx', d.exercise);
      ui.draft.notes = '';
      showToast(isPR ? `${COPY.newPr}. ${COPY.logged}` : COPY.logged);
      ui.popFav = '';
      await p;
    }, () => { const r = $('#fReps'); if (r) r.focus({ preventScroll: true }); });
  }

  function removeSet(id) {
    const row = state.log.find(r => r.ID === id);
    if (!row) return;
    run(async () => {
      const p = write({ action: 'deleteSet', id });
      showToast(COPY.deleted, () => {
        run(async () => {
          await write({ action: 'addSet', date: row.Date, exercise: row.Exercise, reps: row.Reps, weight: row.Weight, unit: row.Unit, intensity: row.Intensity, notes: row.Notes });
          showToast(COPY.restored);
        });
      });
      await p;
    });
  }

  function addExercise() {
    const name = $('#nName').value.trim();
    if (!name) { setStatus(COPY.errName, true); return; }
    const machine = $('#nMach').value.trim();
    const group = $('#nGroup').value;
    run(async () => {
      await write({ action: 'addExercise', name, machine, group });
      setExercise(name);
      showToast(COPY.added);
    });
  }

  function saveSetup() {
    ls.set('apiUrl', $('#cUrl').value.trim());
    run(() => load({ notify: true }));
  }

  function currentTheme() {
    return document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem('theme', t); } catch (e) { /* blocked */ }
    paint();
  }
  function toggleTheme() { setTheme(currentTheme() === 'light' ? 'dark' : 'light'); }
  function setThemeLabel() {
    const b = $('#themeToggle');
    if (!b) return;
    const light = currentTheme() === 'light';
    b.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }

  /* Run a write-type action, then repaint. Errors show in the status line. */
  async function run(fn, after) {
    try { await fn(); }
    catch (e) { setStatus(e && e.message ? e.message : COPY.errSave, true); }
    paint();
    if (after) after();
  }

  /* ---------- router + paint ---------- */
  function route() {
    const r = location.hash.slice(1) || 'log';
    return views[r] ? r : 'log';
  }

  function paint() {
    const r = route();
    const changed = r !== lastRoute;
    lastRoute = r;
    const view = $('#view');
    if (!view) return;
    // innerHTML replacement drops focus. Put it back on the same control when the view is unchanged.
    const focusId = !changed && view.contains(document.activeElement) ? document.activeElement.id : '';
    view.innerHTML = views[r]();
    if (focusId) { const el = document.getElementById(focusId); if (el) el.focus({ preventScroll: true }); }
    if (changed) {
      view.classList.remove('enter');
      void view.offsetWidth;
      view.classList.add('enter');
      window.scrollTo(0, 0);
      $('#main').focus({ preventScroll: true });
    }
    $$('.nav a[data-route]').forEach(a => {
      if (a.dataset.route === r) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const rail = document.querySelector('.nav .rail');
    const cur = document.querySelector('.nav a[aria-current]');
    if (rail && cur && matchMedia('(min-width: 1024px)').matches) {
      rail.style.height = cur.offsetHeight + 'px';
      rail.style.transform = `translateY(${cur.offsetTop}px)`;
    }
    const ub = $('#unitToggle');
    if (ub) ub.textContent = unit;
    setThemeLabel();

    if (r === 'log') updateLogLive();
    if (r === 'favorites') renderFavBody();
    if (r === 'week' && changed) {
      const h = $('#heroScore');
      if (h && h.dataset.target !== '') countUp(h, Number(h.dataset.target));
    }
    ui.popFav = '';
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('button');
    if (!t) return;
    const d = t.dataset;
    if (t.hasAttribute('data-dialog-close')) { t.closest('dialog').close(); return; }
    if (t.id === 'unitToggle') { unit = unit === 'kg' ? 'lbs' : 'kg'; ls.set('unit', unit); paint(); return; }
    if (t.id === 'themeToggle') { toggleTheme(); return; }
    if (t.id === 'cTest') { testConn(); return; }
    if (t.id === 'addExBtn') { ui.openNew = true; location.hash = '#log'; return; }
    if (d.fav !== undefined) {
      ui.popFav = d.fav;
      run(() => { write({ action: 'toggleFav', name: d.fav }); });
    } else if (d.step) stepValue(d.step);
    else if (d.eunit) setEntryUnit(d.eunit);
    else if (d.int) {
      ui.draft.intensity = d.int;
      $$('[data-int]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.int === d.int)));
    }
    else if (d.del !== undefined) removeSet(d.del);
    else if (d.goto !== undefined) { setExercise(d.goto); location.hash = '#log'; }
    else if (d.mon) {
      const m = ui.calMonth;
      ui.calMonth = new Date(m.getFullYear(), m.getMonth() + Number(d.mon), 1);
      paint();
    }
    else if (d.day) { ui.calDay = d.day; paint(); }
    else if (d.logday) { ui.draft.date = d.logday; location.hash = '#log'; }
    else if (d.shareDay) shareDay(d.shareDay);
    else if (d.shareWeek !== undefined) shareWeek(Number(d.shareWeek));
    else if (d.chartEx !== undefined) { ui.progEx = d.chartEx; paint(); }
    else if (d.range) { ui.progRange = d.range; paint(); }
    else if (d.themeSet) setTheme(d.themeSet);
    else if (d.unitSet) { unit = d.unitSet; ls.set('unit', unit); paint(); }
  });

  document.addEventListener('change', e => {
    const id = e.target.id;
    if (id === 'fEx') { setExercise(e.target.value); paint(); }
    else if (id === 'fGroup') {
      ui.draft.group = e.target.value;
      const inGroup = state.exercises.find(x => x.Name === ui.draft.exercise && (!ui.draft.group || x.Group === ui.draft.group));
      if (!inGroup) {
        const first = state.exercises.find(x => !ui.draft.group || x.Group === ui.draft.group);
        if (first) setExercise(first.Name);
      }
      paint();
    }
    else if (id === 'fDate') { ui.draft.date = e.target.value || today(); paint(); }
  });

  document.addEventListener('input', e => {
    const id = e.target.id;
    if (id === 'fReps') { ui.draft.reps = e.target.value; updateLogLive(); }
    else if (id === 'fW') { ui.draft.weight = e.target.value; updateLogLive(); }
    else if (id === 'fNotes') ui.draft.notes = e.target.value;
    else if (id === 'favSearch') { ui.favQ = e.target.value; renderFavBody(); }
  });

  document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    if (f.id === 'setForm') logSet();
    else if (f.id === 'exForm') addExercise();
    else if (f.id === 'cfgForm') saveSetup();
  });

  $('#shareGo').addEventListener('click', async () => {
    if (!shareBlob) return;
    const file = new File([shareBlob], shareName, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: shareTitle, text: COPY.shareText || 'Logged with Elevation' }); }
      catch (e) { /* user cancelled */ }
    } else {
      downloadShare();
      $('#shareStatus').textContent = COPY.shareFallback;
    }
  });
  $('#shareSave').addEventListener('click', downloadShare);

  window.addEventListener('hashchange', paint);
  window.addEventListener('online', () => flush());
  window.addEventListener('offline', () => { if (!isDemo()) { setSync('offline'); setStatus(COPY.offline, true); } });

  /* ---------- start ---------- */
  paint();
  load().then(() => {
    // First paint runs before data arrives, so the form starts empty. Prefill once data is in.
    const d = ui.draft;
    if (!d.reps && !d.weight) {
      const names = state.exercises.map(e => e.Name);
      const last = ls.get('lastEx');
      const pick = names.includes(d.exercise) ? d.exercise : (names.includes(last) ? last : names[0]);
      if (pick) setExercise(pick);
    }
    paint();
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => { /* offline shell is optional */ });
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded && navigator.serviceWorker.controller) { reloaded = true; location.reload(); } });
  }
})();
