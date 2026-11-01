/* Elevation Gym Tracker — front end. Talks to the Apps Script web app; falls back to a local demo store. */
(() => {
  'use strict';
  const LB = 2.20462;
  const GROUPS = ['Upper', 'Lower', 'Arms & Shoulders'];
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = s => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => iso(new Date());
  const r1 = n => Math.round(n * 10) / 10;

  let state = { exercises: [], log: [], schedule: [] };
  let unit = ls.get('unit', 'kg');
  const ui = { exercise: ls.get('lastEx', ''), entryUnit: ls.get('entryUnit', 'kg'), intensity: 'Med', date: today(), progEx: '', calMonth: null, calDay: today() };

  /* ---------- data layer ---------- */
  const apiUrl = () => ls.get('apiUrl', '');

  const demoSeed = () => ({
    exercises: [
      ['Chest Press', 'Chest press machine', 'Upper'], ['Lat Pulldown', 'Cable pulldown', 'Upper'], ['Seated Row', 'Cable row', 'Upper'],
      ['Leg Press', 'Leg press sled', 'Lower'], ['Leg Extension', 'Extension machine', 'Lower'], ['Leg Curl', 'Seated curl machine', 'Lower'],
      ['Shoulder Press', 'Shoulder press machine', 'Arms & Shoulders'], ['Bicep Curl', 'Preacher curl machine', 'Arms & Shoulders'], ['Tricep Pushdown', 'Cable', 'Arms & Shoulders'],
    ].map(([Name, Machine, Group]) => ({ Name, Machine, Group, Favorite: false })),
    log: [],
    schedule: [['Monday', 'Upper'], ['Tuesday', 'Rest'], ['Wednesday', 'Lower'], ['Thursday', 'Rest'], ['Friday', 'Upper'], ['Saturday', 'Rest'], ['Sunday', 'Rest']]
      .map(([Day, Split]) => ({ Day, Split, Active: true })),
  });

  const local = {
    load() { return ls.get('demoState', null) || demoSeed(); },
    save(s) { ls.set('demoState', s); },
    act(p) {
      const s = this.load();
      if (p.action === 'addSet') {
        const ex = s.exercises.find(e => e.Name === p.exercise);
        if (!ex) throw new Error('Pick an exercise first');
        const w = Number(p.weight), reps = Number(p.reps);
        const kg = p.unit === 'lbs' ? w / LB : w;
        const setNo = s.log.filter(r => r.Date === p.date && r.Exercise === p.exercise).length + 1;
        s.log.push({ ID: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), Date: p.date, Exercise: p.exercise, Group: ex.Group, Set: setNo,
          Reps: reps, Weight: w, Unit: p.unit, KG: Math.round(kg * 100) / 100, LBS: r1(kg * LB), Volume: r1(kg * reps), E1RM: r1(kg * (1 + reps / 30)),
          Intensity: p.intensity, Notes: p.notes || '' });
      } else if (p.action === 'deleteSet') {
        s.log = s.log.filter(r => r.ID !== p.id);
      } else if (p.action === 'addExercise') {
        if (s.exercises.some(e => e.Name.toLowerCase() === p.name.toLowerCase())) throw new Error('Exercise already exists');
        s.exercises.push({ Name: p.name, Machine: p.machine || '', Group: p.group, Favorite: false });
      } else if (p.action === 'toggleFav') {
        const ex = s.exercises.find(e => e.Name === p.name); if (ex) ex.Favorite = !ex.Favorite;
      }
      this.save(s);
      return s;
    },
  };

  function normalize(s) {
    s.exercises.forEach(e => { e.Favorite = e.Favorite === true || e.Favorite === 'TRUE'; });
    s.schedule.forEach(d => { d.Active = d.Active === true || d.Active === 'TRUE'; });
    s.log.forEach(r => ['Set', 'Reps', 'Weight', 'KG', 'LBS', 'Volume', 'E1RM'].forEach(k => { r[k] = Number(r[k]) || 0; }));
    return s;
  }

  function setStatus(msg, err) { const el = $('#status'); el.textContent = msg || ''; el.classList.toggle('err', !!err); }

  async function load() {
    const url = apiUrl();
    if (!url) { state = normalize(local.load()); setStatus('Demo mode — data stays on this device. Connect your Google Sheet in Setup.'); return; }
    setStatus('Syncing with Google Sheet…');
    try {
      const res = await fetch(url, { redirect: 'follow' });
      const j = await res.json();
      if (!j.ok) throw new Error(j.error);
      state = normalize(j.state); ls.set('cache', state); setStatus('');
    } catch (e) {
      state = normalize(ls.get('cache', local.load()));
      setStatus('Offline — showing last synced data. ' + e.message, true);
    }
  }

  async function act(payload) {
    const url = apiUrl();
    if (!url) { state = normalize(local.act(payload)); return; }
    setStatus('Saving…');
    // text/plain avoids a CORS preflight, which Apps Script cannot answer.
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), redirect: 'follow' });
    const j = await res.json();
    if (!j.ok) throw new Error(j.error);
    state = normalize(j.state); ls.set('cache', state); setStatus('Saved to Google Sheet.');
  }

  /* ---------- analytics ---------- */
  const fmtW = kg => unit === 'kg' ? `${r1(kg)} kg` : `${r1(kg * LB)} lbs`;
  const both = r => `${r1(r.KG)} kg · ${r1(r.LBS)} lbs`;
  const weekStart = s => { const d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
  const pct = (c, p) => p > 0 ? (c - p) / p * 100 : null;
  const verdict = x => x === null ? 'BASELINE' : x > 2 ? 'PROGRESS' : x < -2 ? 'DIP' : 'HOLD';
  const fmtPct = x => x === null ? '—' : `${x > 0 ? '+' : ''}${r1(x)}%`;
  const cls = x => x === null ? '' : x > 0 ? 'up' : x < 0 ? 'down' : '';
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
        e.volD = last ? pct(e.vol, last.vol) : null; e.e1D = last ? pct(e.e1rm, last.e1rm) : null;
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
    rows.forEach(r => { const d = byDate[r.Date] = byDate[r.Date] || { date: r.Date, e1rm: 0, vol: 0, top: 0 }; d.e1rm = Math.max(d.e1rm, r.E1RM); d.vol += r.Volume; d.top = Math.max(d.top, r.KG); });
    const sessions = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    const last = rows.length ? rows.reduce((a, b) => (b.Date > a.Date || (b.Date === a.Date && b.Set > a.Set)) ? b : a) : null;
    const best = rows.reduce((a, b) => (!a || b.E1RM > a.E1RM) ? b : a, null);
    const heavy = rows.reduce((a, b) => (!a || b.KG > a.KG) ? b : a, null);
    return { rows, sessions, last, best, heavy };
  }

  /* ---------- views ---------- */
  const views = {};

  function exOptions(sel) {
    return GROUPS.map(g => `<optgroup label="${esc(g)}">${state.exercises.filter(e => e.Group === g)
      .map(e => `<option value="${esc(e.Name)}"${e.Name === sel ? ' selected' : ''}>${e.Favorite ? '★ ' : ''}${esc(e.Name)}</option>`).join('')}</optgroup>`).join('');
  }

  function splitFor(dateStr) {
    const day = parse(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
    const s = state.schedule.find(d => d.Day === day);
    return s && s.Active && s.Split !== 'Rest' ? s.Split : null;
  }

  views.log = () => {
    if (!state.exercises.some(e => e.Name === ui.exercise)) ui.exercise = state.exercises[0]?.Name || '';
    const ex = state.exercises.find(e => e.Name === ui.exercise);
    const st = ex ? exStats(ex.Name) : null;
    const todays = state.log.filter(r => r.Date === ui.date).sort((a, b) => a.Exercise.localeCompare(b.Exercise) || a.Set - b.Set);
    const plan = splitFor(ui.date);
    return `
      <h1>Log a set</h1>
      <p class="mono" style="color:var(--muted)">${plan ? `Planned: ${plan} day${plan === 'Upper' ? ' (+ Arms & Shoulders)' : ''}` : 'Rest day on plan — training anyway counts.'}</p>
      <form class="card stack" id="setForm" novalidate>
        <div class="two">
          <div><label for="fDate">Date</label><input type="date" id="fDate" value="${esc(ui.date)}" required></div>
          <div><label for="fEx">Exercise / machine</label>
            <div class="row" style="flex-wrap:nowrap"><select id="fEx" required>${exOptions(ui.exercise)}</select>
            ${ex ? `<button type="button" class="star" data-fav="${esc(ex.Name)}" aria-pressed="${ex.Favorite}" aria-label="${ex.Favorite ? 'Remove from' : 'Add to'} favorites">★</button>` : ''}</div>
          </div>
        </div>
        ${st && st.last ? `<p class="mono" style="margin:0;color:var(--cyan)">Last: ${both(st.last)} × ${st.last.Reps} (${esc(st.last.Intensity)}) · Best e1RM ${fmtW(st.best.E1RM)}</p>` : ''}
        <div class="two">
          <div><label for="fReps">Reps</label><input type="number" id="fReps" inputmode="numeric" min="1" max="100" required value="${esc(st?.last?.Reps || '')}"></div>
          <div><label for="fW">Weight (${ui.entryUnit})</label><input type="number" id="fW" inputmode="decimal" min="0" step="0.5" required
            value="${st?.last ? r1(ui.entryUnit === 'kg' ? st.last.KG : st.last.LBS) : ''}"></div>
        </div>
        <div class="row" role="group" aria-label="Entry unit">
          ${['kg', 'lbs'].map(u => `<button type="button" class="chip" data-eunit="${u}" aria-pressed="${ui.entryUnit === u}">${u}</button>`).join('')}
          <span class="mono" id="conv" style="color:var(--muted)"></span>
        </div>
        <div><span class="lbl" id="intLbl" style="font:600 .75rem var(--display);text-transform:uppercase;color:var(--muted);letter-spacing:.08em">Intensity</span>
          <div class="row" role="group" aria-labelledby="intLbl">
            ${['Easy', 'Med', 'Hard'].map(i => `<button type="button" class="chip ${i.toLowerCase()}" data-int="${i}" aria-pressed="${ui.intensity === i}">${i}</button>`).join('')}
          </div>
        </div>
        <div><label for="fNotes">Notes (optional)</label><input id="fNotes" maxlength="200" placeholder="Seat 4, slow negatives"></div>
        <button class="btn wide" type="submit">Log set</button>
      </form>

      <details class="card"><summary>＋ New exercise or machine</summary>
        <form id="exForm" class="stack" style="margin-top:12px">
          <div><label for="nName">Exercise name</label><input id="nName" required maxlength="60"></div>
          <div><label for="nMach">Machine / equipment</label><input id="nMach" maxlength="60"></div>
          <div><label for="nGroup">Group</label><select id="nGroup">${GROUPS.map(g => `<option>${g}</option>`).join('')}</select></div>
          <button class="btn" type="submit">Add to sheet</button>
        </form>
      </details>

      <section class="card">
        <div class="row" style="justify-content:space-between"><h2 style="margin:0">Sets on ${esc(ui.date)} (${todays.length})</h2>
          ${todays.length ? `<button class="btn ghost" data-share-day="${esc(ui.date)}">Share day</button>` : ''}</div>
        ${todays.length ? `<ul class="sets">${todays.map(r => `<li><div><strong>${esc(r.Exercise)}</strong> <span class="mono">#${r.Set}</span><br>
          <span class="mono">${r.Reps} × ${both(r)}</span> <span class="tag ${esc(r.Intensity)}">${esc(r.Intensity)}</span></div>
          <button class="del" data-del="${esc(r.ID)}" aria-label="Delete set ${r.Set} of ${esc(r.Exercise)}">✕</button></li>`).join('')}</ul>`
          : `<p class="empty">No sets yet. Log your first one above.</p>`}
      </section>`;
  };

  views.favorites = () => {
    const favs = state.exercises.filter(e => e.Favorite);
    return `<h1>Favorites</h1>
      <p style="color:var(--muted)">Tap ★ next to any machine on the Log screen to pin it here. Tap a card to log it.</p>
      ${GROUPS.map(g => {
        const list = favs.filter(e => e.Group === g);
        return `<section class="fav-group"><h2><span>${esc(g)}</span><span class="mono">${list.length}</span></h2>
          ${list.length ? `<div class="grid">${list.map(e => {
            const s = exStats(e.Name);
            return `<button class="card fav" data-goto="${esc(e.Name)}">
              <strong style="font-family:var(--display);text-transform:uppercase">${esc(e.Name)}</strong>
              <span style="color:var(--muted);font-size:.85rem">${esc(e.Machine)}</span>
              <span class="mono">${s.last ? `Last: ${s.last.Reps} × ${both(s.last)}` : 'Not logged yet'}</span>
              ${s.best ? `<span class="mono" style="color:var(--accent)">Best e1RM ${fmtW(s.best.E1RM)}</span>` : ''}
              ${spark(s.sessions.map(x => x.e1rm))}
            </button>`;
          }).join('')}</div>` : `<p class="empty">No favorites yet — tap ★ on any machine.</p>`}
        </section>`;
      }).join('')}
      <section class="card"><h2>All machines</h2><ul class="sets">${state.exercises.map(e => `<li><span><strong>${esc(e.Name)}</strong> <span style="color:var(--muted)">· ${esc(e.Group)}</span></span>
        <button class="star" data-fav="${esc(e.Name)}" aria-pressed="${e.Favorite}" aria-label="${e.Favorite ? 'Remove' : 'Add'} ${esc(e.Name)} ${e.Favorite ? 'from' : 'to'} favorites">★</button></li>`).join('')}</ul></section>`;
  };

  function spark(vals) {
    if (vals.length < 2) return '';
    const min = Math.min(...vals), max = Math.max(...vals), w = 200, h = 36;
    const pts = vals.map((v, i) => `${(i / (vals.length - 1) * w).toFixed(1)},${(h - 4 - (max === min ? .5 : (v - min) / (max - min)) * (h - 8)).toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${w} ${h}" class="chart" style="height:36px" aria-hidden="true"><polyline class="line" points="${pts}"/></svg>`;
  }

  function chart(sessions) {
    if (!sessions.length) return '<p class="empty">Log this exercise to see a chart.</p>';
    const W = 640, H = 220, P = 36, conv = v => unit === 'kg' ? v : v * LB;
    const a = sessions.map(s => conv(s.e1rm)), b = sessions.map(s => conv(s.top));
    const all = a.concat(b), min = Math.min(...all) * .95, max = Math.max(...all) * 1.05 || 1;
    const x = i => P + (sessions.length === 1 ? (W - 2 * P) / 2 : i / (sessions.length - 1) * (W - 2 * P));
    const y = v => H - P - (v - min) / (max - min || 1) * (H - 2 * P);
    const line = arr => arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const ticks = [0, .5, 1].map(t => min + t * (max - min));
    return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Estimated 1 rep max and top set over ${sessions.length} sessions">
      ${ticks.map(t => `<line class="grid-l" x1="${P}" x2="${W - P}" y1="${y(t)}" y2="${y(t)}"/><text x="2" y="${y(t) + 4}">${Math.round(t)}</text>`).join('')}
      <polyline class="line" points="${line(a)}"/><polyline class="line2" points="${line(b)}"/>
      ${a.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="var(--accent)"><title>${sessions[i].date}: e1RM ${r1(v)} ${unit}</title></circle>`).join('')}
      <text x="${P}" y="${H - 8}">${sessions[0].date}</text><text x="${W - P}" y="${H - 8}" text-anchor="end">${sessions[sessions.length - 1].date}</text>
    </svg><div class="legend"><span><i style="background:var(--accent)"></i>Est. 1RM (${unit})</span><span><i style="background:var(--cyan)"></i>Top set (${unit})</span></div>`;
  }

  views.progress = () => {
    const logged = [...new Set(state.log.map(r => r.Exercise))];
    if (!ui.progEx || !state.exercises.some(e => e.Name === ui.progEx)) ui.progEx = logged[0] || state.exercises[0]?.Name || '';
    const s = exStats(ui.progEx);
    const first = s.sessions[0], last = s.sessions[s.sessions.length - 1];
    const gain = first && last && s.sessions.length > 1 ? pct(last.e1rm, first.e1rm) : null;
    return `<h1>Progress</h1>
      <div class="card"><label for="pEx">Exercise / machine</label><select id="pEx">${exOptions(ui.progEx)}</select></div>
      <div class="kpi-grid">
        <div class="card"><label>Best e1RM</label><div class="stat">${s.best ? fmtW(s.best.E1RM) : '—'}</div></div>
        <div class="card"><label>Heaviest set</label><div class="stat">${s.heavy ? fmtW(s.heavy.KG) : '—'}<br><small>${s.heavy ? `× ${s.heavy.Reps} on ${s.heavy.Date}` : ''}</small></div></div>
        <div class="card"><label>Sessions</label><div class="stat">${s.sessions.length}</div></div>
        <div class="card"><label>Since first</label><div class="stat ${cls(gain)}">${fmtPct(gain)}</div></div>
      </div>
      <div class="card">${chart(s.sessions)}</div>
      ${s.rows.length ? `<div class="card"><h2>History</h2><ul class="sets">${s.rows.slice().reverse().slice(0, 30).map(r => `<li><span class="mono">${r.Date} #${r.Set}</span>
        <span class="mono">${r.Reps} × ${both(r)}</span><span class="tag ${esc(r.Intensity)}">${esc(r.Intensity)}</span></li>`).join('')}</ul></div>` : ''}`;
  };

  views.calendar = () => {
    const m = ui.calMonth || (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
    ui.calMonth = m;
    const done = new Set(state.log.map(r => r.Date));
    const start = new Date(m); start.setDate(1 - ((m.getDay() + 6) % 7));
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const s = iso(d), plan = splitFor(s), isDone = done.has(s);
      const c = [d.getMonth() !== m.getMonth() && 'out', isDone && 'done', !isDone && plan && s >= today() && 'plan', s === today() && 'today'].filter(Boolean).join(' ');
      cells.push(`<button class="${c}" data-day="${s}" aria-selected="${s === ui.calDay}" aria-label="${d.toDateString()}${isDone ? ', workout logged' : ''}${plan ? ', planned ' + plan : ''}">${d.getDate()}${plan ? `<small>${plan === 'Upper' ? 'UP' : 'LOW'}</small>` : ''}</button>`);
    }
    const sets = state.log.filter(r => r.Date === ui.calDay);
    const byEx = {};
    sets.forEach(r => { (byEx[r.Exercise] = byEx[r.Exercise] || []).push(r); });
    const plan = splitFor(ui.calDay);
    return `<h1>Calendar</h1>
      <div class="card">
        <div class="row" style="justify-content:space-between;margin-bottom:12px">
          <button class="icon-btn" data-mon="-1" aria-label="Previous month">‹</button>
          <h2 style="margin:0;color:var(--text)">${m.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
          <button class="icon-btn" data-mon="1" aria-label="Next month">›</button>
        </div>
        <div class="cal">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<div class="dow" aria-hidden="true">${d}</div>`).join('')}${cells.join('')}</div>
        <div class="legend" style="margin-top:12px"><span><i style="background:var(--accent);height:10px"></i>Done</span><span><i style="border:2px dashed var(--cyan);height:10px"></i>Planned</span></div>
      </div>
      <section class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">${esc(ui.calDay)} ${plan ? '· ' + plan : ''}</h2>
        ${sets.length ? `<button class="btn ghost" data-share-day="${esc(ui.calDay)}">Share</button>` : ''}</div>
        ${sets.length ? Object.entries(byEx).map(([n, rs]) => `<div style="margin-top:12px"><strong>${esc(n)}</strong><div class="mono">${rs.map(r => `${r.Reps}×${fmtW(r.KG)}`).join(' · ')}</div></div>`).join('')
          : `<p class="empty">${plan ? `Planned ${plan} day. Nothing logged yet.` : 'Rest day.'}</p>`}
        <button class="btn" style="margin-top:12px" data-logday="${esc(ui.calDay)}">Log on this day</button>
      </section>`;
  };

  views.week = () => {
    const wk = weekly();
    if (!wk.length) return `<h1>Weekly KPI</h1><p class="empty">Log a week of training to see your Progress Score.</p>`;
    return `<h1>Weekly KPI</h1>
      <p style="color:var(--muted);font-size:.9rem">Progress Score = 40% volume change + 40% avg e1RM change + 20% consistency (sessions vs ${planned()} planned). Above +2% = PROGRESS · ±2% = HOLD · below −2% = DIP.</p>
      ${wk.map((w, i) => `<section class="card">
        <div class="row" style="justify-content:space-between"><h2 style="margin:0">Week of ${w.week}</h2><span class="verdict ${w.verdict}">${w.verdict}</span></div>
        <div class="kpi-grid" style="margin-top:12px">
          <div><label>Score</label><div class="stat ${cls(w.score)}">${fmtPct(w.score)}</div></div>
          <div><label>Volume</label><div class="stat">${fmtW(w.vol)}<br><small class="${cls(w.volD)}">${fmtPct(w.volD)}</small></div></div>
          <div><label>Avg e1RM Δ</label><div class="stat ${cls(w.e1Avg)}">${fmtPct(w.e1Avg)}</div></div>
          <div><label>Sessions</label><div class="stat">${w.sessions}<small>/${planned()}</small></div></div>
        </div>
        <details><summary>Per exercise</summary><ul class="sets">${Object.values(w.ex).sort((a, b) => (b.e1D ?? -999) - (a.e1D ?? -999)).map(e => `<li>
          <span><strong>${esc(e.name)}</strong><br><span class="mono" style="color:var(--muted)">${e.sets} sets · ${fmtW(e.vol)} vol</span></span>
          <span class="mono ${cls(e.e1D)}">${fmtPct(e.e1D)}</span></li>`).join('')}</ul></details>
        <button class="btn ghost" style="margin-top:8px" data-share-week="${i}">Share week</button>
      </section>`).join('')}`;
  };

  views.settings = () => `<h1>Setup</h1>
    <form class="card stack" id="cfgForm">
      <div><label for="cUrl">Apps Script web app URL</label><input id="cUrl" type="url" placeholder="https://script.google.com/macros/s/…/exec" value="${esc(apiUrl())}"></div>
      <p style="color:var(--muted);font-size:.9rem;margin:0">Leave empty for demo mode (data stays in this browser). Full steps are in the README on GitHub.</p>
      <div class="row"><button class="btn" type="submit">Save & sync</button><button class="btn ghost" type="button" id="cTest">Test connection</button></div>
    </form>
    <div class="card"><h2>Plan</h2><ul class="sets">${state.schedule.map(d => `<li><span>${esc(d.Day)}</span><span class="mono">${esc(d.Split)}</span></li>`).join('')}</ul>
      <p style="color:var(--muted);font-size:.9rem">Edit the <b>Schedule</b> tab in the Sheet to change your split. Reminders read it every night.</p></div>`;

  /* ---------- share card ---------- */
  let shareBlob = null, shareName = 'workout.png';
  function cssVar(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

  function drawCard(title, sub, stats, lines) {
    const c = $('#shareCanvas'), g = c.getContext('2d'), W = c.width, H = c.height;
    const bg = '#0b0d0e', acc = '#c6ff00', cy = '#00e5ff', tx = '#e8f0ec', mu = '#93a39d';
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#1b2124'; g.lineWidth = 2;
    for (let yy = 0; yy < H; yy += 54) { g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
    g.fillStyle = acc; g.beginPath(); g.moveTo(W - 220, 0); g.lineTo(W, 0); g.lineTo(W, 220); g.fill();
    g.fillStyle = acc; g.font = '700 40px "Chakra Petch", sans-serif'; g.fillText('▲ ELEVATION', 72, 110);
    g.fillStyle = tx; g.font = '700 92px "Chakra Petch", sans-serif'; g.fillText(title.toUpperCase(), 72, 240);
    g.fillStyle = cy; g.font = '500 38px "JetBrains Mono", monospace'; g.fillText(sub, 72, 300);
    stats.forEach(([k, v], i) => {
      const x = 72 + i * 320;
      g.fillStyle = mu; g.font = '600 26px "Chakra Petch", sans-serif'; g.fillText(k.toUpperCase(), x, 400);
      g.fillStyle = acc; g.font = '700 64px "JetBrains Mono", monospace'; g.fillText(v, x, 470);
    });
    g.fillStyle = acc; g.fillRect(72, 520, W - 144, 4);
    g.font = '500 36px "JetBrains Mono", monospace';
    lines.slice(0, 12).forEach((l, i) => {
      g.fillStyle = i % 2 ? mu : tx; g.fillText(l.length > 44 ? l.slice(0, 43) + '…' : l, 72, 600 + i * 58);
    });
    g.fillStyle = mu; g.font = '500 28px "JetBrains Mono", monospace'; g.fillText('Tracked with Elevation', 72, H - 60);
    return new Promise(res => c.toBlob(res, 'image/png'));
  }

  async function shareDay(date) {
    const sets = state.log.filter(r => r.Date === date);
    const byEx = {};
    sets.forEach(r => { (byEx[r.Exercise] = byEx[r.Exercise] || []).push(r); });
    const vol = sets.reduce((a, r) => a + r.Volume, 0);
    const lines = [];
    Object.entries(byEx).forEach(([n, rs]) => { lines.push(n); lines.push('  ' + rs.map(r => `${r.Reps}×${r1(unit === 'kg' ? r.KG : r.LBS)}`).join('  ') + ' ' + unit); });
    const plan = splitFor(date);
    shareName = `workout-${date}.png`;
    shareBlob = await drawCard(plan ? `${plan} day` : 'Workout', date, [['Sets', String(sets.length)], ['Volume', fmtW(vol).replace(' ', '')], ['Moves', String(Object.keys(byEx).length)]], lines);
    $('#shareDialog').showModal();
  }

  async function shareWeek(i) {
    const w = weekly()[i];
    const lines = Object.values(w.ex).sort((a, b) => (b.e1D ?? -999) - (a.e1D ?? -999)).map(e => `${e.name}  ${fmtPct(e.e1D)}`);
    shareName = `week-${w.week}.png`;
    shareBlob = await drawCard(w.verdict, `Week of ${w.week}`, [['Score', fmtPct(w.score)], ['Volume', fmtW(w.vol).replace(' ', '')], ['Sessions', `${w.sessions}/${planned()}`]], lines);
    $('#shareDialog').showModal();
  }

  $('#shareGo').addEventListener('click', async () => {
    if (!shareBlob) return;
    const file = new File([shareBlob], shareName, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'My workout', text: 'Workout logged with Elevation' }); } catch (e) { /* user cancelled */ }
    } else { download(); setStatus('Sharing is not supported in this browser — image downloaded instead.'); }
  });
  function download() { const a = document.createElement('a'); a.href = URL.createObjectURL(shareBlob); a.download = shareName; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }
  $('#shareSave').addEventListener('click', download);
  $('#shareClose').addEventListener('click', () => $('#shareDialog').close());

  /* ---------- router + events ---------- */
  function route() { const r = location.hash.slice(1) || 'log'; return views[r] ? r : 'log'; }

  function render() {
    const r = route();
    $('#view').innerHTML = views[r]();
    document.querySelectorAll('.nav a').forEach(a => { if (a.dataset.route === r) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    $('#unitToggle').textContent = unit;
    if (r === 'log') updateConv();
  }

  function updateConv() {
    const w = Number($('#fW')?.value);
    const el = $('#conv'); if (!el) return;
    el.textContent = w > 0 ? (ui.entryUnit === 'kg' ? `= ${r1(w * LB)} lbs` : `= ${r1(w / LB)} kg`) : '';
  }

  async function run(fn, btn) {
    if (btn) btn.disabled = true;
    try { await fn(); render(); } catch (e) { setStatus(e.message, true); } finally { if (btn) btn.disabled = false; }
  }

  document.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    const d = t.dataset;
    if (d.fav) run(() => act({ action: 'toggleFav', name: d.fav }), t);
    else if (d.eunit) { ui.entryUnit = d.eunit; ls.set('entryUnit', d.eunit); render(); }
    else if (d.int) { ui.intensity = d.int; document.querySelectorAll('[data-int]').forEach(b => b.setAttribute('aria-pressed', b.dataset.int === d.int)); }
    else if (d.del) run(() => act({ action: 'deleteSet', id: d.del }), t);
    else if (d.goto) { ui.exercise = d.goto; location.hash = 'log'; }
    else if (d.mon) { const m = ui.calMonth; ui.calMonth = new Date(m.getFullYear(), m.getMonth() + Number(d.mon), 1); render(); }
    else if (d.day) { ui.calDay = d.day; render(); }
    else if (d.logday) { ui.date = d.logday; location.hash = 'log'; }
    else if (d.shareDay) shareDay(d.shareDay);
    else if (d.shareWeek) shareWeek(Number(d.shareWeek));
    else if (t.id === 'cTest') run(load, t);
  });

  document.addEventListener('change', e => {
    if (e.target.id === 'fEx') { ui.exercise = e.target.value; ls.set('lastEx', ui.exercise); render(); }
    else if (e.target.id === 'fDate') { ui.date = e.target.value || today(); render(); }
    else if (e.target.id === 'pEx') { ui.progEx = e.target.value; render(); }
  });
  document.addEventListener('input', e => { if (e.target.id === 'fW') updateConv(); });

  document.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, btn = f.querySelector('[type=submit]');
    if (f.id === 'setForm') {
      const reps = Number($('#fReps').value), weight = Number($('#fW').value);
      if (!(reps > 0) || !($('#fW').value !== '' && weight >= 0)) { setStatus('Enter reps and weight.', true); return; }
      run(async () => {
        await act({ action: 'addSet', date: ui.date, exercise: ui.exercise, reps, weight, unit: ui.entryUnit, intensity: ui.intensity, notes: $('#fNotes').value });
        ls.set('lastEx', ui.exercise);
      }, btn);
    } else if (f.id === 'exForm') {
      const name = $('#nName').value.trim(); if (!name) { setStatus('Name the exercise.', true); return; }
      run(async () => { await act({ action: 'addExercise', name, machine: $('#nMach').value.trim(), group: $('#nGroup').value }); ui.exercise = name; }, btn);
    } else if (f.id === 'cfgForm') {
      ls.set('apiUrl', $('#cUrl').value.trim());
      run(load, btn);
    }
  });

  $('#unitToggle').addEventListener('click', () => { unit = unit === 'kg' ? 'lbs' : 'kg'; ls.set('unit', unit); render(); });
  $('#themeToggle').addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  window.addEventListener('hashchange', () => { render(); $('#main').focus({ preventScroll: true }); window.scrollTo(0, 0); });

  load().then(render);
})();
