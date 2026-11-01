/* Elev signed-out stage: one full-screen hero that morphs scene to scene.
   - Input: GSAP Observer (wheel / touch / pointer) + keys + dots + arrows. One gesture = one scene.
   - Layers: video clip (crop zoom hides date stamp) -> shade -> Three.js equipment -> panel UI.
   - Pointer / gyro parallax drives every layer from one smoothed source.
   - Reduced motion: no 3D, no GSAP, still posters, instant swaps. All content stays reachable.
   Pattern refs: research/REFERENCES.md (parallax landing section). */

const GSAP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
const OBSERVER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Observer.min.js';

// Motion is on by default (owner request). Viewers can switch it off with the in-page toggle; choice is remembered.
const reduceMotion = () => { try { return localStorage.getItem('elev-motion') === 'off'; } catch { return false; } };
const isPhone = () => window.matchMedia && matchMedia('(max-width: 767px)').matches;
const lerp = (a, b, t) => a + (b - a) * t;

function loadScript(src) {
  return new Promise((res, rej) => {
    const found = document.querySelector(`script[src="${src}"]`);
    if (found) { found.dataset.loaded ? res() : found.addEventListener('load', res); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = () => { s.dataset.loaded = '1'; res(); };
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

/* ---------------- charts (example data, labelled in the UI) ---------------- */
const E1RM = [80, 81.5, 82.5, 82.5, 85, 86, 87.5, 87.5, 90, 92.5, 95, 97.5];
const VOLUME = [9.2, 10.1, 9.6, 11.4, 12.0, 11.1, 12.8, 13.6];

function lineChart() {
  const W = 320, H = 150, P = { l: 30, r: 10, t: 14, b: 22 };
  const min = 75, max = 100;
  const x = i => P.l + (i * (W - P.l - P.r)) / (E1RM.length - 1);
  const y = v => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const pts = E1RM.map((v, i) => [x(i), y(v)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const area = d + ` L ${x(E1RM.length - 1)} ${H - P.b} L ${x(0)} ${H - P.b} Z`;
  const grid = [80, 90, 100].map(v => `<line class="grid" x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${P.l - 6}" y="${y(v) + 3}" text-anchor="end">${v}</text>`).join('');
  const ticks = [0, 3, 7, 11].map(i => `<text class="axis" x="${x(i)}" y="${H - 6}" text-anchor="middle">W${i + 1}</text>`).join('');
  const dots = pts.map((p, i) => `<circle class="dot" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3}"/>`).join('');
  const last = pts[pts.length - 1];
  return `<svg class="st-chart st-line" viewBox="0 0 ${W} ${H}" role="img" aria-label="Example chart: estimated one rep max rises from 80 to 97.5 kilograms over 12 weeks">
    <defs><linearGradient id="emberFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF4A3D" stop-opacity=".35"/><stop offset="1" stop-color="#FF4A3D" stop-opacity="0"/></linearGradient></defs>
    ${grid}${ticks}<path class="area" d="${area}"/><path class="line" d="${d}" pathLength="1"/>${dots}
    <text class="tip" x="${last[0] - 8}" y="${last[1] - 12}" text-anchor="end">PR 97.5</text></svg>`;
}
function barChart() {
  const W = 320, H = 140, P = { l: 8, r: 8, t: 10, b: 22 }, max = 14;
  const bw = (W - P.l - P.r) / VOLUME.length;
  const bars = VOLUME.map((v, i) => {
    const h = (v / max) * (H - P.t - P.b);
    return `<rect class="st-bar${i === VOLUME.length - 1 ? ' hot' : ''}" x="${(P.l + i * bw + 5).toFixed(1)}" y="${(H - P.b - h).toFixed(1)}" width="${(bw - 10).toFixed(1)}" height="${h.toFixed(1)}" rx="4"/>
      <text class="axis" x="${(P.l + i * bw + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle">W${i + 5}</text>`;
  }).join('');
  return `<svg class="st-chart st-bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Example chart: weekly deadlift volume grows from 9.2 to 13.6 tonnes over 8 weeks">${bars}</svg>`;
}
function ring() {
  const r = 52, c = 2 * Math.PI * r;
  return `<svg class="st-ring" viewBox="0 0 128 128" role="img" aria-label="Example: 10 of 12 planned sessions done this block">
    <circle class="track" cx="64" cy="64" r="${r}"/>
    <circle class="fill" cx="64" cy="64" r="${r}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${(c * (1 - 10 / 12)).toFixed(2)}" data-c="${c.toFixed(2)}" data-v="${(10 / 12).toFixed(4)}"/>
    <text x="64" y="68" class="ring-n">10</text><text x="64" y="86" class="sub">OF 12 DONE</text></svg>`;
}
export function chartsMarkup() { return { line: lineChart(), bars: barChart(), ring: ring() }; }

/* ---------------- Three.js equipment ---------------- */
async function makeScene3D(canvas, phone) {
  let THREE;
  try { THREE = await import('./assets/three.module.js'); } catch (e) { return null; }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !phone, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, phone ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight(0xdfe3e8, 0x1a0b0a, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-4, 5, 6); scene.add(key);
  const rim = new THREE.PointLight(0xff3b2e, 60, 30, 1.6); rim.position.set(5, -1, 3); scene.add(rim);
  const rim2 = new THREE.PointLight(0xff3b2e, 30, 30, 1.6); rim2.position.set(-6, 2, 2); scene.add(rim2);

  const rubber = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.55, metalness: 0.15 });
  const steel = new THREE.MeshStandardMaterial({ color: 0xc9ccd1, roughness: 0.28, metalness: 0.85 });
  const ember = new THREE.MeshStandardMaterial({ color: 0xc8161f, roughness: 0.4, metalness: 0.3, emissive: 0x3a0503 });
  const iron = new THREE.MeshStandardMaterial({ color: 0x232326, roughness: 0.42, metalness: 0.7 });

  // bumper plate: lathe profile with lip + centre hub
  function plate(radius = 1, width = 0.28, mat = rubber) {
    const g = new THREE.Group();
    const prof = [
      [0.13, -width / 2], [radius * 0.92, -width / 2], [radius, -width * 0.38], [radius, width * 0.38],
      [radius * 0.92, width / 2], [radius * 0.3, width / 2 * 0.7], [0.13, width / 2 * 0.7],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof, phone ? 40 : 72), mat);
    body.rotation.x = Math.PI / 2; g.add(body);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, width * 1.05, 32, 1, true), steel);
    hub.rotation.x = Math.PI / 2; g.add(hub);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.62, 0.012, 8, 72), ember);
    ring.position.z = width / 2 * 0.72; g.add(ring);
    return g;
  }
  function barbell() {
    const g = new THREE.Group();
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6.2, 24), steel); bar.rotation.z = Math.PI / 2; g.add(bar);
    [-1, 1].forEach(s => {
      const sl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.3, 24), steel); sl.rotation.z = Math.PI / 2; sl.position.x = s * 2.55; g.add(sl);
      const p1 = plate(1.05, 0.26); p1.rotation.y = Math.PI / 2; p1.position.x = s * 2.1; g.add(p1);
      const p2 = plate(0.8, 0.2, iron); p2.rotation.y = Math.PI / 2; p2.position.x = s * 2.38; g.add(p2);
    });
    return g;
  }
  function dumbbell() {
    const g = new THREE.Group();
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 20), steel); h.rotation.z = Math.PI / 2; g.add(h);
    [-1, 1].forEach(s => {
      const hex = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.42, 6), rubber); hex.rotation.z = Math.PI / 2; hex.position.x = s * 0.72; g.add(hex);
    });
    return g;
  }
  function kettlebell() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.62, 40, 28), iron); b.scale.y = 0.92; g.add(b);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.075, 14, 40, Math.PI), iron); h.position.y = 0.5; g.add(h);
    [-1, 1].forEach(s => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.28, 14), iron); p.position.set(s * 0.36, 0.4, 0); g.add(p); });
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.02, 8, 60), ember); band.rotation.x = Math.PI / 2; band.position.y = -0.12; g.add(band);
    return g;
  }

  const items = {
    plateA: plate(1, 0.3), plateB: plate(0.7, 0.24, iron), plateC: plate(0.55, 0.2),
    bar: barbell(), db: dumbbell(), kb: kettlebell(),
  };
  Object.values(items).forEach(o => { o.userData = { cur: null, tgt: null, seed: Math.random() * 10 }; scene.add(o); });

  // Arrangements per scene. nx/ny in viewport space (-1..1), z depth, s scale, v visible.
  // side = which half is empty. Objects sit between the lifter and the panel, or at the frame edge.
  const D = (nx, ny, z, s, rx = 0, ry = 0, rz = 0, v = 1) => ({ nx, ny, z, s, rx, ry, rz, v });
  const OFF = D(0, -1.8, -4, 0.2, 0, 0, 0, 0);
  const desk = [
    { plateA: D(0.12, 0.55, -1, 0.8, 0.3, -0.6), plateB: D(0.95, -0.7, 1, 0.7, -0.4, 0.8), plateC: D(0.3, -0.6, -3, 0.9, 0.6, 0.4), bar: OFF, db: OFF, kb: OFF },
    { plateA: OFF, plateB: D(-0.95, 0.72, 0, 0.6, 0.5, 0.7), plateC: OFF, bar: OFF, db: D(-0.12, -0.55, -1, 1.1, 0.4, 0.6, 0.3), kb: D(-0.2, 0.55, -2.5, 0.9, 0.2, 0.5) },
    { plateA: D(0.92, 0.75, -2, 0.7, 0.4, -0.5), plateB: OFF, plateC: D(0.98, -0.75, 1, 0.55, -0.3, 0.6), bar: D(0.45, -0.88, -3, 0.62, 0.15, -0.35, 0.08), db: OFF, kb: OFF },
    { plateA: OFF, plateB: D(-0.15, -0.6, -1.5, 0.9, 0.3, -0.7), plateC: D(-0.95, 0.7, 0.5, 0.6, -0.5, 0.4), bar: OFF, db: OFF, kb: D(-0.92, -0.62, -0.5, 0.75, 0.1, -0.6) },
    { plateA: D(-0.72, 0.5, -3, 1.2, 0.5, 0.6), plateB: D(0.75, -0.55, -2.5, 1, -0.4, -0.5), plateC: D(0.7, 0.62, -4, 1, 0.3, 0.3), bar: OFF, db: OFF, kb: D(-0.68, -0.6, -2, 0.8, 0.2, 0.4) },
  ];
  // phone: video sits top, panel bottom. Keep equipment small in the top band.
  const mobile = [
    { plateA: D(0.62, 0.62, -1, 0.55, 0.3, -0.6), plateB: D(0.85, 0.2, 0, 0.4, -0.4, 0.8), plateC: OFF, bar: OFF, db: OFF, kb: OFF },
    { plateA: OFF, plateB: OFF, plateC: OFF, bar: OFF, db: D(-0.55, 0.55, -1, 0.65, 0.4, 0.6, 0.3), kb: D(-0.75, 0.2, -1, 0.5, 0.2, 0.5) },
    { plateA: D(0.7, 0.6, -1, 0.5, 0.4, -0.5), plateB: OFF, plateC: D(0.8, 0.25, 0, 0.35, -0.3, 0.6), bar: OFF, db: OFF, kb: OFF },
    { plateA: OFF, plateB: D(-0.7, 0.6, -1, 0.5, 0.3, -0.7), plateC: D(-0.8, 0.22, 0, 0.35, -0.5, 0.4), bar: OFF, db: OFF, kb: OFF },
    { plateA: D(-0.7, 0.8, -3, 0.8, 0.5, 0.6), plateB: D(0.75, -0.85, -2.5, 0.7, -0.4, -0.5), plateC: OFF, bar: OFF, db: OFF, kb: OFF },
  ];

  let w = 1, h = 1, layout = desk, idx = 0;
  function resize() {
    w = canvas.clientWidth || innerWidth; h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    layout = isPhone() ? mobile : desk;
    setScene(idx, true);
  }
  function toWorld(a) {
    const dist = camera.position.z - a.z;
    const hh = Math.tan((camera.fov * Math.PI) / 360) * dist;
    return { x: a.nx * hh * camera.aspect, y: a.ny * hh, z: a.z };
  }
  function setScene(i, snap) {
    idx = i;
    const arr = layout[i];
    for (const k in items) {
      const a = arr[k], p = toWorld(a), o = items[k];
      o.userData.tgt = { ...p, s: a.s * a.v, rx: a.rx, ry: a.ry, rz: a.rz, a };
      if (snap || !o.userData.cur) o.userData.cur = { ...o.userData.tgt };
    }
  }

  let raf = 0, running = true, px = 0, py = 0, t0 = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!running) return;
    const t = (now - t0) / 1000;
    const dt = Math.min(0.05, (now - (frame.last || now)) / 1000); frame.last = now;
    const k = 1 - Math.exp(-dt * 3.2); // critically damped-ish follow
    for (const key in items) {
      const o = items[key], c = o.userData.cur, g = o.userData.tgt, sd = o.userData.seed;
      for (const f of ['x', 'y', 'z', 's', 'rx', 'ry', 'rz']) c[f] = lerp(c[f], g[f], k);
      const depth = 1 + (2 - c.z) * 0.12;
      o.position.set(c.x + px * 0.35 * depth, c.y + Math.sin(t * 0.8 + sd) * 0.08 + py * 0.25 * depth, c.z);
      o.rotation.set(c.rx + Math.sin(t * 0.5 + sd) * 0.08 + py * 0.15, c.ry + t * 0.12 + px * 0.25, c.rz);
      o.scale.setScalar(Math.max(0.0001, c.s));
      o.visible = c.s > 0.02;
    }
    camera.position.x = px * 0.25; camera.position.y = py * 0.15; camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  resize();
  raf = requestAnimationFrame(frame);
  addEventListener('resize', resize);

  return {
    setScene: i => setScene(i, false),
    pointer(x, y) { px = x; py = y; },
    pause(v) { running = !v; },
    destroy() {
      cancelAnimationFrame(raf); removeEventListener('resize', resize);
      scene.traverse(o => { if (o.geometry) o.geometry.dispose(); });
      [rubber, steel, ember, iron].forEach(m => m.dispose());
      renderer.dispose();
    },
  };
}

/* ---------------- stage controller ---------------- */
export function mountStage(root) {
  const stage = root.querySelector('.stage');
  if (!stage) return null;
  const charts = chartsMarkup();
  stage.querySelectorAll('[data-chart]').forEach(el => { el.innerHTML = charts[el.dataset.chart] || ''; });
  const scenes = Array.from(stage.querySelectorAll('.st-scene'));
  const clips = Object.fromEntries(Array.from(stage.querySelectorAll('.st-clip')).map(v => [v.dataset.clip, v]));
  const dots = Array.from(stage.querySelectorAll('.st-dot'));
  const live = stage.querySelector('.st-live');
  const media = stage.querySelector('.st-media');
  const count = stage.querySelector('.st-count b');
  const prog = stage.querySelector('.st-progress');
  const prevBtn = stage.querySelector('[data-go="prev"]');
  const nextBtn = stage.querySelector('[data-go="next"]');
  const card = stage.querySelector('.st-auth-card');
  const gwrap = stage.querySelector('.st-gwrap');
  const status = stage.querySelector('.st-auth-status');
  const reduce = reduceMotion();
  stage.classList.toggle('is-calm', reduce);
  const mt = stage.querySelector('.st-motion');
  if (mt) {
    mt.setAttribute('aria-pressed', reduce ? 'true' : 'false');
    mt.textContent = reduce ? 'Motion on' : 'Motion off';
    mt.addEventListener('click', () => { try { localStorage.setItem('elev-motion', reduce ? 'on' : 'off'); } catch {} location.reload(); });
  }
  const N = scenes.length;
  let cur = 0, busy = false, gsap = null, three = null, observer = null, alive = true;
  const off = [];
  const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); off.push(() => el.removeEventListener(ev, fn, o)); };

  const sceneClip = i => scenes[i].dataset.clip;
  const sceneDim = i => scenes[i].dataset.dim === '1';

  const hydrate = v => { if (v && v.dataset.src) { v.poster = v.dataset.poster; v.src = v.dataset.src; delete v.dataset.src; } };
  function playOnly(name) {
    hydrate(clips[name]);
    for (const k in clips) {
      const v = clips[k];
      if (k === name) { v.muted = true; const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else v.pause();
    }
    // warm the next clip
    const nx = clips[sceneClip(Math.min(N - 1, cur + 1))];
    if (nx) { hydrate(nx); if (nx.preload !== 'auto') nx.preload = 'auto'; }
  }

  function applyChrome(i) {
    stage.dataset.scene = String(i);
    stage.dataset.side = scenes[i].dataset.side;
    scenes.forEach((s, j) => {
      const act = j === i;
      s.classList.toggle('is-on', act);
      s.toggleAttribute('inert', !act);
      s.setAttribute('aria-hidden', act ? 'false' : 'true');
    });
    dots.forEach((d, j) => d.setAttribute('aria-current', j === i ? 'step' : 'false'));
    if (count) count.textContent = String(i + 1).padStart(2, '0');
    if (prog) prog.style.setProperty('--p', ((i + 1) / N).toFixed(3));
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === N - 1;
    const title = scenes[i].querySelector('.st-title, h2');
    if (live) live.textContent = `Scene ${i + 1} of ${N}: ${title ? title.textContent : ''}`;
  }

  function animateData(scene) {
    if (!gsap) return;
    const line = scene.querySelector('.st-line .line');
    if (line) {
      gsap.fromTo(line, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', delay: 0.35 });
      gsap.fromTo(scene.querySelectorAll('.st-line .dot, .st-line .tip'), { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: 0.4, stagger: 0.08, delay: 0.5, ease: 'back.out(2)' });
      gsap.fromTo(scene.querySelector('.st-line .area'), { scaleY: 0, transformOrigin: 'bottom' }, { scaleY: 1, duration: 1, delay: 1 });
    }
    const bars = scene.querySelectorAll('.st-bars .st-bar');
    bars.forEach((b, i) => {
      const y = +(b.dataset.y ||= b.getAttribute('y')), h = +(b.dataset.h ||= b.getAttribute('height'));
      gsap.fromTo(b, { attr: { y: y + h, height: 0 } }, { attr: { y, height: h }, duration: 0.7, delay: 0.35 + i * 0.06, ease: 'power3.out' });
    });
    const fill = scene.querySelector('.st-ring .fill');
    if (fill) { const c = +fill.dataset.c, v = +fill.dataset.v; gsap.fromTo(fill, { strokeDashoffset: c }, { strokeDashoffset: c * (1 - v), duration: 1.3, delay: 0.4, ease: 'power3.inOut' }); }
    scene.querySelectorAll('[data-count]').forEach(el => {
      const to = +el.dataset.count, dec = (el.dataset.count.split('.')[1] || '').length, o = { v: 0 };
      gsap.to(o, { v: to, duration: 1.3, delay: 0.35, ease: 'power2.out', onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
    });
    const prs = scene.querySelectorAll('.st-prs li');
    if (prs.length) gsap.fromTo(prs, { x: 16 }, { x: 0, duration: 0.5, stagger: 0.08, delay: 0.6, ease: 'power3.out' });
  }

  /* anime.js 3D title text: split to chars, fly each char in on X/Y/Z axes */
  let anime = null;
  function splitTitles() {
    stage.querySelectorAll('.st-title').forEach(el => {
      if (el.dataset.split) return;
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
      const r = anime.splitText(el, { words: { wrap: 'clip' }, chars: true });
      el._chars = r.chars;
      (r.words || []).concat(r.chars).forEach(c => c.setAttribute('aria-hidden', 'true'));
      el.dataset.split = '1';
    });
  }
  function textIn(scene, dir = 1) {
    if (!anime || reduce) return;
    scene.querySelectorAll('.st-title[data-split]').forEach(el => {
      anime.animate(el._chars, {
        rotateX: [dir * -110, 0], rotateY: [dir * 40, 0], z: [-320, 0], y: ['0.9em', '0em'],
        scale: [1.7, 1],
        duration: 520, delay: anime.stagger(14, { from: dir > 0 ? 'first' : 'last' }),
        ease: 'outCubic'
      });
    });
  }
  function textOut(scene, dir = 1) {
    if (!anime || reduce) return;
    scene.querySelectorAll('.st-title[data-split]').forEach(el => {
      anime.animate(el._chars, { rotateX: dir * 95, z: 260, y: '-0.6em',
        duration: 280, delay: anime.stagger(8, { from: 'center' }), ease: 'inCubic' });
    });
  }
  function titleHover(el) {
    if (!anime || reduce || !el._chars) return;
    el._chars.forEach((c, i) => c.addEventListener('pointerenter', () => anime.animate(c, {
      z: [0, 90, 0], rotateY: [0, 360], color: ['#ff3b2f', getComputedStyle(c).color], duration: 900, ease: 'outElastic(1, .5)' })));
  }

  function go(next, dir) {
    if (!alive || busy || next < 0 || next >= N || next === cur) return;
    const prev = cur;
    dir = dir || (next > prev ? 1 : -1);
    cur = next;
    const oldClip = clips[sceneClip(prev)], newClip = clips[sceneClip(next)];
    const sameClip = oldClip === newClip;
    if (three) three.setScene(next);

    if (reduce || !gsap) {
      if (!sameClip) { oldClip.classList.remove('is-on'); newClip.classList.add('is-on'); }
      newClip.classList.toggle('is-dim', sceneDim(next));
      applyChrome(next); playOnly(sceneClip(next));
      return;
    }

    busy = true;
    const outgoing = scenes[prev];
    const incoming = scenes[next];
    const outKids = outgoing.querySelectorAll('.st-panel > *');
    const inKids = incoming.querySelectorAll('.st-panel > *');
    const seam = stage.querySelector('.st-seam');
    const duration = 0.72;
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: () => {
      busy = false;
      outgoing.classList.remove('is-out');
      gsap.set([outKids, inKids], { clearProps: 'transform' });
      if (seam) seam.hidden = true;
    }});

    outgoing.classList.add('is-out');
    tl.to(outKids, { x: -28 * dir, z: -100, rotateY: -7 * dir, duration: 0.46, stagger: 0.025, ease: 'power2.in' }, 0);
    tl.fromTo(inKids,
      { x: 30 * dir, z: 110, rotateY: 8 * dir },
      { x: 0, z: 0, rotateY: 0, duration: 0.58, stagger: 0.035, ease: 'power3.out' }, 0.2);

    if (!sameClip) {
      newClip.classList.add('is-on');
      newClip.classList.toggle('is-dim', sceneDim(next));
      newClip.currentTime = 0;
      playOnly(sceneClip(next));
      gsap.set(newClip, { zIndex: 2, clipPath: dir > 0
        ? 'polygon(-110% 0%, -90% 0%, -110% 100%, -130% 100%)'
        : 'polygon(190% 0%, 210% 0%, 230% 100%, 210% 100%)' });
      if (seam) {
        seam.hidden = false;
        seam.style.left = dir > 0 ? '-12px' : 'calc(100% + 12px)';
      }
      const edge = { p: 0 };
      tl.to(edge, { p: 1, duration, ease: 'power2.inOut', onUpdate: () => {
        const x = dir > 0 ? -12 + edge.p * 124 : 112 - edge.p * 124;
        const top = x - 5, bottom = x + 5;
        newClip.style.clipPath = dir > 0
          ? `polygon(-10% 0%, ${top}% 0%, ${bottom}% 100%, -10% 100%)`
          : `polygon(${top}% 0%, 110% 0%, 110% 100%, ${bottom}% 100%)`;
        if (seam) seam.style.left = `calc(${x}% - 6px)`;
      }, onComplete: () => {
        newClip.style.clipPath = '';
        oldClip.classList.remove('is-on');
        oldClip.pause();
        gsap.set([newClip, oldClip], { clearProps: 'zIndex,clipPath' });
      }}, 0);
    } else {
      newClip.classList.toggle('is-dim', sceneDim(next));
    }

    tl.add(() => applyChrome(next), 0.28);
    tl.add(() => { textOut(outgoing, dir); textIn(incoming, dir); }, 0.22);
    tl.add(() => animateData(incoming), 0.3);
  }
  const step = d => go(cur + d, d);

  /* chrome controls */
  dots.forEach((d, j) => on(d, 'click', () => go(j)));
  if (prevBtn) on(prevBtn, 'click', () => step(-1));
  if (nextBtn) on(nextBtn, 'click', () => step(1));
  stage.querySelectorAll('[data-jump]').forEach(b => on(b, 'click', () => go(+b.dataset.jump)));
  on(document, 'keydown', e => {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (e.target && e.target.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !/BUTTON|A/.test(tag))) { e.preventDefault(); step(1); }
    else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); step(-1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(N - 1); }
  });

  /* pointer + gyro parallax, one smoothed source */
  let tx = 0, ty = 0, sx = 0, sy = 0, praf = 0, lastIn = 0;
  if (!reduce) {
    on(stage, 'pointermove', e => {
      if (e.pointerType === 'touch') return;
      lastIn = performance.now(); if (e.pointerType !== 'mouse') return;
      tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1;
      if (card && cur === N - 1) {
        const r = card.getBoundingClientRect();
        const cx = (e.clientX - r.left) / r.width, cy = (e.clientY - r.top) / r.height;
        const near = cx > -0.4 && cx < 1.4 && cy > -0.4 && cy < 1.4;
        // No tilt: Google ignores clicks on its button when an ancestor is transformed. Sheen only.
        card.style.setProperty('--gx', (cx * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', (cy * 100).toFixed(1) + '%');
      }
    });
    on(stage, 'pointerleave', () => { tx = 0; ty = 0;  });
    on(window, 'deviceorientation', e => {
      if (e.gamma == null) return;
      if (e.gamma == null) return; lastIn = performance.now() + 1e9;
      tx = Math.max(-1, Math.min(1, e.gamma / 25)); ty = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    });
    const tick = () => {
      praf = requestAnimationFrame(tick);
      const now = performance.now();
      if (now - lastIn > 2500) { const t = now / 1000; tx = Math.sin(t * 0.45) * 0.55; ty = Math.sin(t * 0.31 + 1) * 0.4; } // idle drift (touch phones)
      sx = lerp(sx, tx, 0.08); sy = lerp(sy, ty, 0.08);
      stage.style.setProperty('--px', sx.toFixed(4)); stage.style.setProperty('--py', sy.toFixed(4));
      if (media) media.style.transform = `translate3d(${(sx * -12).toFixed(2)}px, ${(sy * -8).toFixed(2)}px, 0)`;
      if (three) three.pointer(sx, sy);
    };
    praf = requestAnimationFrame(tick);
  }

  /* sign-in feedback: the Google button lives in an iframe, so infer the click from focus moving into it */
  if (gwrap && status) {
    let hover = false, waitT = 0;
    on(gwrap, 'pointerenter', () => { hover = true; });
    on(gwrap, 'pointerleave', () => { hover = false; });
    on(window, 'blur', () => {
      if (!hover && !gwrap.contains(document.activeElement)) return;
      status.dataset.state = 'busy'; status.textContent = 'Waiting for Google…';
      clearTimeout(waitT); waitT = setTimeout(() => { if (status.dataset.state === 'busy') { status.dataset.state = ''; status.textContent = ''; } }, 15000);
    });
    on(window, 'focus', () => { clearTimeout(waitT); waitT = setTimeout(() => { if (status.dataset.state === 'busy') { status.dataset.state = ''; status.textContent = ''; } }, 2500); });
  }

  /* pause work when hidden */
  on(document, 'visibilitychange', () => {
    const hid = document.hidden;
    if (three) three.pause(hid);
    const v = clips[sceneClip(cur)];
    if (v) { hid ? v.pause() : v.play().catch(() => {}); }
  });

  /* boot */
  applyChrome(0);
  const first = clips[sceneClip(0)];
  if (first) { first.classList.add('is-on'); first.classList.toggle('is-dim', sceneDim(0)); }
  playOnly(sceneClip(0));

  // fallback swipe/wheel until GSAP Observer arrives (or if the CDN is blocked)
  let acc = 0, accT = 0, sy0 = null;
  const wheel = e => {
    if (observer) return;
    e.preventDefault();
    acc += e.deltaY; clearTimeout(accT); accT = setTimeout(() => { acc = 0; }, 180);
    if (Math.abs(acc) > 40 && !busy) { step(acc > 0 ? 1 : -1); acc = 0; busy = true; setTimeout(() => { busy = false; }, reduce ? 300 : 900); }
  };
  on(stage, 'wheel', wheel, { passive: false });
  on(stage, 'touchstart', e => { if (!observer) sy0 = e.touches[0].clientY; }, { passive: true });
  on(stage, 'touchend', e => {
    if (observer || sy0 == null) return;
    const d = sy0 - e.changedTouches[0].clientY; sy0 = null;
    if (Math.abs(d) > 40) step(d > 0 ? 1 : -1);
  }, { passive: true });

  if (!reduce) {
    loadScript(GSAP_URL).then(() => loadScript(OBSERVER_URL)).then(() => {
      if (!alive || !window.gsap) return;
      gsap = window.gsap;
      if (window.Observer) {
        gsap.registerPlugin(window.Observer);
        observer = window.Observer.create({
          target: stage, type: 'wheel,touch', wheelSpeed: -1, tolerance: 14, preventDefault: true,
          ignore: '.st-gslot, .st-gslot *',
          onDown: () => step(-1), onUp: () => step(1),
        });
      }
      // entrance
      const kids = scenes[0].querySelectorAll('.st-panel > *');
      gsap.fromTo(kids, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: 'expo.out', delay: 0.1 });
      gsap.fromTo(stage.querySelectorAll('.st-top > *, .st-foot, .st-nav'), { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 0.5 });
      animateData(scenes[0]);
      import('./assets/anime.esm.min.js').then(m => { if (!alive) return; anime = m; splitTitles(); stage.querySelectorAll('.st-title').forEach(titleHover); textIn(scenes[cur], 1); }).catch(() => {});
    }).catch(() => { /* CDN blocked: fallback input + instant swaps */ });

    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 1200));
    new Promise(r => idle(r, { timeout: 3000 })).then(() => alive ? makeScene3D(stage.querySelector('.st-3d'), isPhone()) : null).then(t => {
      if (!alive) { if (t) t.destroy(); return; }
      three = t; if (three) three.setScene(cur);
      else stage.querySelector('.st-3d').hidden = true;
    });
  }

  return {
    get index() { return cur; },
    go,
    success() {
      return new Promise(res => {
        if (status) { status.dataset.state = 'ok'; status.textContent = 'Signed in. Loading your log…'; }
        if (card && !reduce) { card.classList.add('is-done'); setTimeout(res, 650); } else res();
      });
    },
    destroy() {
      alive = false;
      off.forEach(f => f()); cancelAnimationFrame(praf);
      if (observer) observer.kill();
      if (three) three.destroy();
      Object.values(clips).forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
    },
  };
}
