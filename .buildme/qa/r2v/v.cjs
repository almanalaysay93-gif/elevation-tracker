const { chromium } = require('../node_modules/playwright');
const fs = require('fs');
const path = require('path');
const BASE = 'http://127.0.0.1:5184';
const SCR = 'C:/Users/Admin/AppData/Local/Temp/claude/E--ai-claude-ALAi-elevation-progress-tracker/811cab6d-39a2-41ad-a9af-706de46daa19/scratchpad/r2v';
const R = {};
const LB = 2.20462;
function seed() {
  const ex = [['Chest Press', 'Upper'], ['Leg Press', 'Lower']].map(([Name, Group]) => ({ Name, Machine: 'm', Group, Favorite: false }));
  const rows = []; let n = 0;
  const add = (Date, Exercise, Group, Set, Reps, kg) => { n++; rows.push({ ID: 'seed-' + n, Date, Exercise, Group, Set, Reps, Weight: kg, Unit: 'kg', KG: kg, LBS: +(kg * LB).toFixed(1), Volume: kg * Reps, E1RM: +(kg * (1 + Reps / 30)).toFixed(1), Intensity: 'Med', Notes: '' }); };
  add('2026-10-19', 'Chest Press', 'Upper', 1, 8, 60); add('2026-10-26', 'Chest Press', 'Upper', 1, 8, 62.5);
  const d = new Date(); const td = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  add(td, 'Chest Press', 'Upper', 1, 8, 60); add(td, 'Chest Press', 'Upper', 2, 8, 62.5); add(td, 'Chest Press', 'Upper', 3, 6, 65);
  return JSON.stringify({ exercises: ex, log: rows, schedule: [] });
}
async function open(b, o = {}) {
  const c = await b.newContext({ viewport: o.vp || { width: 390, height: 844 }, serviceWorkers: 'block', colorScheme: 'dark' });
  await c.addInitScript(([s, api]) => { if (!sessionStorage.__i) { sessionStorage.__i = 1; if (s) localStorage.setItem('demoState', s); if (api) localStorage.setItem('apiUrl', JSON.stringify(api)); } }, [o.seed === false ? null : seed(), o.api || null]);
  const p = await c.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto(BASE + (o.path ?? '/') + (o.hash ?? '#log')); await p.waitForTimeout(o.wait ?? 800); return { c, p };
}
const step = async (k, fn) => { try { await fn(); } catch (e) { R[k + '_EXC'] = e.message.split('\n')[0]; } };
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });

  // R2-1 week label: view + history + share canvas text
  for (const w of [390, 1440]) await step('r2_1_' + w, async () => {
    const { c, p } = await open(b, { vp: { width: w, height: 844 }, hash: '#week', wait: 1200 });
    const kick = await p.$$eval('.hero .kicker', e => e.map(x => x.textContent.trim()));
    const hist = await p.$$eval('.week-h h2', e => e.map(x => x.textContent.trim()));
    R['r2_1_view_' + w] = { kicker: kick[0] || null, history: hist, iso: [...kick, ...hist].some(t => /\d{4}-\d{2}-\d{2}/.test(t)) };
    await p.evaluate(() => { window.__t = []; const o = CanvasRenderingContext2D.prototype.fillText; CanvasRenderingContext2D.prototype.fillText = function (t, ...r) { window.__t.push(String(t)); return o.call(this, t, ...r); }; });
    await p.click('[data-share-week="0"]'); await p.waitForTimeout(1200);
    const txt = await p.evaluate(() => window.__t);
    R['r2_1_share_' + w] = { weekLines: txt.filter(t => /Week of/.test(t)), iso: txt.some(t => /\d{4}-\d{2}-\d{2}/.test(t)) };
    R['r2_1_errs_' + w] = p.errs; await c.close();
  });

  // R2-2 occlusion: scroll each log control to the bottom edge at 320 and 390
  for (const w of [320, 390]) await step('r2_2_' + w, async () => {
    const { c, p } = await open(b, { vp: { width: w, height: 844 }, hash: '#log' });
    const sels = ['#fW', '[data-eunit=kg]', '[data-eunit=lbs]', '#fNotes', '[data-int="Hard"]', '#fReps', '#fEx'];
    const out = {};
    for (const s of sels) {
      out[s] = await p.evaluate(s => {
        const el = document.querySelector(s); if (!el) return 'missing';
        el.scrollIntoView({ block: 'end' }); const cta = document.querySelector('#setForm .cta').getBoundingClientRect();
        const r = el.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const hit = document.elementFromPoint(cx, cy);
        const overlapCta = !(r.bottom <= cta.top || r.top >= cta.bottom);
        return { ok: !!hit && el.contains(hit) && !overlapCta, overlapCta, covered: hit ? (hit.id || hit.className || hit.tagName) : null };
      }, s);
      await p.evaluate(s => { const el = document.querySelector(s); el && el.focus(); }, s);
      out[s + ' focus'] = await p.evaluate(s => { const el = document.querySelector(s); const r = el.getBoundingClientRect(); const cta = document.querySelector('#setForm .cta').getBoundingClientRect(); return !(r.bottom > cta.top && r.top < cta.bottom); }, s);
    }
    const bad = Object.entries(out).filter(([k, v]) => (v && v.ok === false) || v === false).map(([k]) => k);
    R['r2_2_' + w] = { bad, detail: out, scroll: await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]) };
    await p.evaluate(() => document.querySelector('#fNotes').scrollIntoView({ block: 'end' }));
    await p.waitForTimeout(150); await p.screenshot({ path: SCR + '/log-' + w + '-bottom.png' });
    R['r2_2_errs_' + w] = p.errs; await c.close();
  });

  // R2-3 week animation sequencing
  await step('r2_3', async () => {
    const { c, p } = await open(b, { vp: { width: 390, height: 844 }, hash: '#week', wait: 50 });
    const t = await p.evaluate(() => document.getAnimations().map(a => {
      const tm = a.effect.getComputedTiming(); const tg = a.effect.target;
      return { name: a.animationName, cls: String(tg.className && tg.className.baseVal !== undefined ? tg.className.baseVal : tg.className), start: tm.delay, end: tm.delay + tm.duration };
    }).filter(x => /viewIn|reveal|grow/.test(x.name)));
    const view = t.find(x => x.name === 'viewIn'), verdict = t.find(x => x.name === 'reveal'), bars = t.filter(x => x.name === 'grow');
    const barStart = bars.length ? Math.min(...bars.map(x => x.start)) : null;
    R.r2_3 = { anims: t, viewEnd: view && view.end, verdictStart: verdict && verdict.start, verdictEnd: verdict && verdict.end, barStart, seq: !!view && !!verdict && view.end <= verdict.start && bars.length > 0 && verdict.end <= barStart };
    R.r2_3_errs = p.errs; await c.close();
  });

  // R2-4 CLS on /, 390 and 1440, three loads each
  for (const w of [390, 1440]) await step('r2_4_' + w, async () => {
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const c = await b.newContext({ viewport: { width: w, height: 844 }, serviceWorkers: 'block' }); const p = await c.newPage();
      await p.addInitScript(() => { window.__cls = 0; window.__src = []; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; window.__src.push(+e.value.toFixed(4)); } }).observe({ type: 'layout-shift', buffered: true }); });
      await p.goto(BASE + '/'); await p.waitForTimeout(2500);
      runs.push(await p.evaluate(() => ({ cls: +window.__cls.toFixed(4), n: window.__src.length })));
      await c.close();
    }
    R['r2_4_' + w] = runs;
  });

  // Console errors on every route at 390 and 1440, plus /intro/
  const hashes = ['#log', '#favorites', '#progress', '#calendar', '#week', '#settings', '#main'];
  for (const w of [320, 390, 1440]) {
    for (const h of hashes) await step('route_' + w + '_' + h, async () => {
      const { c, p } = await open(b, { vp: { width: w, height: 844 }, hash: h, wait: 700 });
      const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      R['route_' + w + '_' + h] = { errs: p.errs, overflowPx: ov, viewFilled: await p.evaluate(() => { const v = document.querySelector('#view'); return !!v && v.children.length > 0; }) };
      await c.close();
    });
    await step('intro_' + w, async () => {
      const { c, p } = await open(b, { vp: { width: w, height: 844 }, path: '/intro/', hash: '', wait: 1500 }); R['intro_ov_'+w]=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
      R['intro_' + w] = { errs: p.errs }; await c.close();
    });
  }

  // Demo banner: shown in demo, hidden when a sheet URL is set
  await step('banner', async () => {
    const { c, p } = await open(b, { hash: '#log' });
    R.banner_demo = await p.evaluate(() => ({ attr: document.documentElement.dataset.demo, visible: getComputedStyle(document.getElementById('demoBanner')).display !== 'none' }));
    await c.close();
    const c2 = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }); const p2 = await c2.newPage();
    await p2.addInitScript(() => { if (!sessionStorage.__i) { sessionStorage.__i = 1; localStorage.setItem('apiUrl', JSON.stringify('https://script.google.com/macros/s/TEST/exec')); } });
    await p2.route('https://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, state: { exercises: [], log: [], schedule: [] } }) }));
    await p2.goto(BASE + '/#log'); await p2.waitForTimeout(1200);
    R.banner_connected = await p2.evaluate(() => ({ attr: document.documentElement.dataset.demo, visible: getComputedStyle(document.getElementById('demoBanner')).display !== 'none' }));
    await c2.close();
  });

  // SW cache name
  await step('sw', async () => {
    const c = await b.newContext({ serviceWorkers: 'allow' }); const p = await c.newPage(); await p.goto(BASE + '/');
    await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 }).catch(() => {}); await p.waitForTimeout(800);
    R.sw = await p.evaluate(async () => ({ keys: await caches.keys(), controlled: !!navigator.serviceWorker.controller }));
    await c.close();
  });


  await step('offline', async () => {
    const c = await b.newContext({ serviceWorkers: 'allow' }); const p = await c.newPage();
    await p.goto(BASE + '/'); await p.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 15000 }); await p.waitForTimeout(1000);
    await p.goto(BASE + '/intro/'); await p.waitForTimeout(1500);
    await c.setOffline(true);
    await p.goto(BASE + '/'); await p.waitForTimeout(1200);
    const a = await p.evaluate(() => ({ title: document.title, app: !!document.querySelector('script[src*="app.js"]'), intro: !!document.querySelector('script[src*="intro"]'), view: (document.querySelector('#view')||{children:[]}).children.length }));
    await p.goto(BASE + '/#week'); await p.waitForTimeout(1000);
    a.week = await p.evaluate(() => (document.querySelector('#view')||{children:[]}).children.length);
    a.keys = await p.evaluate(async () => caches.keys());
    R.offline = a; await c.close();
  });
  await step('seo', async () => {
    const c = await b.newContext(); const p = await c.newPage(); const o = {};
    for (const u of ['/', '/intro/']) { await p.goto(BASE + u); o[u] = await p.evaluate(() => { const q = s => (document.querySelector(s)||{}).content; let ld = []; document.querySelectorAll('script[type="application/ld+json"]').forEach(x => { try { ld.push(JSON.parse(x.textContent)); } catch (e) { ld.push('PARSE_ERR ' + e.message); } }); return { canonical: (document.querySelector('link[rel=canonical]')||{}).href, ogt: q('meta[property="og:title"]'), ogu: q('meta[property="og:url"]'), ogd: q('meta[property="og:description"]'), tw: q('meta[name="twitter:card"]'), title: document.title, ld }; }); }
    R.seo = o; await c.close();
  });
  await b.close();
  fs.writeFileSync(path.join(SCR, 'verify.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
})();
