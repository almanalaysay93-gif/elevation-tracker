// The gym photo drifts on its own. Scroll and pointer add a short shift. The plate is not drawn.
// Three.js stays local and loads after the page text.
const THREE_URL = '../assets/three.module.js';
const GOOGLE_CLIENT_ID = '569340354084-qn29fee1t48hpk5ivp4a5f2vth838hnp.apps.googleusercontent.com';
const APP_HREF = '../';

const root = document.documentElement;
const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reduceQuery.matches || root.classList.contains('rm');
const beats = Array.from(document.querySelectorAll('.beat'));
const navLinks = Array.from(document.querySelectorAll('.progress a'));
const nowEl = document.getElementById('progressNow');
const canvas = document.getElementById('heroCanvas');
const stageArt = document.getElementById('stageArt');
const scroller = document.scrollingElement || root;

function readProgress() {
  const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
  return Math.min(1, Math.max(0, scroller.scrollTop / max));
}

function setupReveals() {
  if (!('IntersectionObserver' in window)) {
    beats.forEach((b) => b.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.2 });
  beats.forEach((b) => io.observe(b));
}

let activeSection = -1;
function updateSection() {
  const mid = window.innerHeight * 0.45;
  let idx = 0;
  let best = Infinity;
  beats.forEach((b, i) => {
    const r = b.getBoundingClientRect();
    const d = Math.abs((r.top + r.bottom) / 2 - mid);
    if (d < best) { best = d; idx = i; }
  });
  if (idx === activeSection) return;
  activeSection = idx;
  navLinks.forEach((a, i) => {
    if (i === idx) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  if (nowEl) nowEl.textContent = 'Section ' + (idx + 1) + ' of 5';
}

// Camera keyframes at 0, .25, .5, .75, 1. Each has a position and a look target.
const KF = [
  { t: 0.00, pos: [1.55, 0.35, 4.3], look: [0.15, 0.05, 0] },
  { t: 0.25, pos: [0.15, 1.15, 3.35], look: [0.05, 0.2, 0] },
  { t: 0.50, pos: [-1.35, 0.45, 3.5], look: [-0.1, 0.05, 0] },
  { t: 0.75, pos: [0.7, -0.15, 3.15], look: [0.2, -0.05, 0] },
  { t: 1.00, pos: [1.15, 0.25, 4.7], look: [0.1, 0.0, 0] },
];
const smooth = (x) => x * x * (3 - 2 * x);
function sampleKeyframe(p) {
  const mix = (a, b, f) => a.map((v, k) => v + (b[k] - v) * f);
  for (let i = 0; i < KF.length - 1; i++) {
    const a = KF[i];
    const b = KF[i + 1];
    if (p <= b.t) {
      const f = smooth((p - a.t) / (b.t - a.t));
      return { pos: mix(a.pos, b.pos, f), look: mix(a.look, b.look, f) };
    }
  }
  const last = KF[KF.length - 1];
  return { pos: last.pos.slice(), look: last.look.slice() };
}

let gl = null;

function buildPlate(THREE) {
  const group = new THREE.Group();
  const geometries = [];
  const materials = [];
  const outline = new THREE.Shape();
  outline.absarc(0, 0, 1.16, 0, Math.PI * 2, false);
  const axle = new THREE.Path();
  axle.absarc(0, 0, 0.15, 0, Math.PI * 2, true);
  outline.holes.push(axle);
  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3 + Math.PI / 2;
    const grip = new THREE.Path();
    grip.absellipse(Math.cos(angle) * 0.79, Math.sin(angle) * 0.79, 0.13, 0.28, angle, angle + Math.PI * 2, true, angle);
    outline.holes.push(grip);
  }
  const body = new THREE.ExtrudeGeometry(outline, {
    depth: 0.18, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 1, curveSegments: 40,
  });
  body.translate(0, 0, -0.09);
  geometries.push(body);
  const iron = new THREE.MeshStandardMaterial({ color: 0x33373b, metalness: 0.72, roughness: 0.4 });
  materials.push(iron);
  group.add(new THREE.Mesh(body, iron));
  const rimGeo = new THREE.TorusGeometry(1.16, 0.02, 8, 64);
  geometries.push(rimGeo);
  const wire = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  materials.push(wire);
  group.add(new THREE.Mesh(rimGeo, wire));
  const steel = new THREE.MeshStandardMaterial({ color: 0xc5ccd2, metalness: 0.88, roughness: 0.28 });
  materials.push(steel);
  const outerHub = new THREE.TorusGeometry(0.3, 0.034, 10, 36);
  const innerHub = new THREE.TorusGeometry(0.15, 0.018, 8, 24);
  geometries.push(outerHub, innerHub);
  group.add(new THREE.Mesh(outerHub, steel));
  group.add(new THREE.Mesh(innerHub, steel));
  const dashGeo = new THREE.BoxGeometry(0.055, 0.2, 0.02);
  geometries.push(dashGeo);
  const dashMat = new THREE.MeshStandardMaterial({ color: 0xc8161f, metalness: 0.35, roughness: 0.45 });
  materials.push(dashMat);
  const dash = new THREE.Mesh(dashGeo, dashMat);
  dash.position.set(0, 0.66, 0.12);
  group.add(dash);
  return { group, geometries, materials };
}

async function initHero() {
  let THREE;
  try {
    THREE = await import(THREE_URL);
  } catch (err) {
    return false;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    return false;
  }
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 40);
  const built = buildPlate(THREE);
  const group = built.group;
  scene.add(group);
  scene.add(new THREE.AmbientLight(0x243018, 0.45));
  const key = new THREE.DirectionalLight(0xc6ff00, 1.55);
  key.position.set(2.4, 2.2, 3.4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8eee4, 0.35);
  fill.position.set(-2, 0.4, 2);
  scene.add(fill);
  const rim = new THREE.PointLight(0x00e5ff, 4.5, 9);
  rim.position.set(-1.8, 0.2, 2.2);
  scene.add(rim);

  function resize() {
    const w = Math.max(1, stageArt.clientWidth);
    const h = Math.max(1, stageArt.clientHeight);
    const phone = window.innerWidth < 768;
    const cap = phone ? 1.25 : 1.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function renderAt(p) {
    const k = sampleKeyframe(reduced() ? 0 : p);
    const wide = camera.aspect >= 1.05;
    group.position.set(wide ? 1.25 : 0.05, wide ? -0.05 : -0.85, 0);
    group.scale.setScalar(wide ? 0.92 : 0.72);
    group.rotation.z = -0.18;
    group.rotation.y = (reduced() ? 0 : pointerX * 0.08);
    group.rotation.x = (reduced() ? 0.08 : 0.08 + pointerY * 0.05);
    const px = reduced() ? 0 : pointerX;
    const py = reduced() ? 0 : pointerY;
    const z = k.pos[2] * (camera.aspect < 1 ? 1.15 : 1);
    camera.position.set(k.pos[0] + px * 0.1, k.pos[1] - py * 0.06, z);
    const lookX = k.look[0] + (wide ? 0.85 : 0);
    camera.lookAt(lookX, k.look[1], k.look[2]);
    renderer.render(scene, camera);
  }

  function dispose() {
    built.geometries.forEach((g) => g.dispose());
    built.materials.forEach((m) => m.dispose());
    renderer.dispose();
  }

  gl = { renderer, renderAt, resize, dispose };
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    root.classList.remove('webgl');
    cancelAnimationFrame(raf);
  });
  resize();
  try {
    renderAt(reduced() ? 0 : readProgress());
  } catch (err) {
    dispose();
    gl = null;
    return false;
  }
  root.classList.add('webgl');
  return true;
}

let raf = 0;
let lastP = -1;
let needsResize = false;
let stageVisible = true;
let pointerX = 0;
let pointerY = 0;
let lastPointerX = 0;
let lastPointerY = 0;

function updateBackdrop(p) {
  if (reduced()) {
    root.style.setProperty('--parallax-scroll', '0px');
    root.style.setProperty('--parallax-x', '0px');
    root.style.setProperty('--parallax-y', '0px');
    return;
  }
  root.style.setProperty('--parallax-scroll', (-p * 28).toFixed(1) + 'px');
  root.style.setProperty('--parallax-x', (pointerX * -16).toFixed(1) + 'px');
  root.style.setProperty('--parallax-y', (pointerY * -12).toFixed(1) + 'px');
}

function tick() {
  raf = requestAnimationFrame(tick);
  if (document.hidden || !stageVisible) return;
  const p = readProgress();
  const still = Math.abs(p - lastP) < 1e-5 && Math.abs(pointerX - lastPointerX) < 1e-3 && Math.abs(pointerY - lastPointerY) < 1e-3;
  if (!needsResize && still) return;
  if (needsResize && gl) { gl.resize(); needsResize = false; }
  lastP = p;
  lastPointerX = pointerX;
  lastPointerY = pointerY;
  updateBackdrop(p);
  updateSection();
  if (!gl) return;
  try { gl.renderAt(p); } catch (err) { root.classList.remove('webgl'); }
}

function renderStatic() {
  if (!gl) return;
  gl.resize();
  pointerX = 0;
  pointerY = 0;
  updateBackdrop(0);
  gl.renderAt(0);
}

function whenIdle(fn) {
  const run = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 200);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
}

function rawSession() {
  try { return JSON.parse(localStorage.getItem('session') || 'null'); } catch (e) { return null; }
}
function validSession(v) {
  return !!(v && v.token && v.email && v.exp * 1000 > Date.now() + 30000);
}
function decodeJwt(t) {
  try {
    const b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(b).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch (e) { return null; }
}

function mountSignIn() {
  const slots = Array.from(document.querySelectorAll('[data-gsi]'));
  const notes = Array.from(document.querySelectorAll('[data-gsi-note]'));
  const continues = Array.from(document.querySelectorAll('[data-continue]'));
  const opens = Array.from(document.querySelectorAll('[data-open]'));
  const showContinue = (label) => {
    slots.forEach((el) => { el.hidden = true; });
    notes.forEach((el) => { el.hidden = true; });
    opens.forEach((el) => { el.hidden = true; });
    continues.forEach((el) => { el.hidden = false; el.textContent = label; });
  };
  if (validSession(rawSession())) {
    showContinue('Continue');
    return;
  }
  if (!GOOGLE_CLIENT_ID) {
    showContinue('Enter demo');
    return;
  }
  const paintButtons = () => {
    const theme = root.dataset.theme === 'light' ? 'outline' : 'filled_black';
    slots.forEach((el) => {
      el.hidden = false;
      const width = Math.max(200, Math.min(320, el.clientWidth || 280));
      google.accounts.id.renderButton(el, {
        type: 'standard', theme, size: 'large', text: 'continue_with', shape: 'pill', width,
      });
    });
    notes.forEach((el) => { el.textContent = ''; });
  };
  const fail = () => {
    notes.forEach((el) => { el.hidden = false; el.textContent = 'Google sign-in did not load. Use Open app.'; });
  };
  let tries = 0;
  const whenGsi = () => {
    if (window.google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: true,
        cancel_on_tap_outside: false,
        callback: (resp) => {
          const claims = decodeJwt(resp && resp.credential);
          if (!claims || claims.aud !== GOOGLE_CLIENT_ID || !claims.email) {
            notes.forEach((el) => { el.hidden = false; el.textContent = 'Sign-in did not finish. Try again.'; });
            return;
          }
          const email = String(claims.email).toLowerCase();
          const prev = rawSession();
          if (prev && prev.email && String(prev.email).toLowerCase() !== email) {
            try { localStorage.removeItem('cache'); localStorage.removeItem('outbox'); } catch (e) { /* blocked */ }
          }
          try {
            localStorage.setItem('session', JSON.stringify({
              token: resp.credential,
              email,
              name: claims.name || email,
              picture: claims.picture || '',
              exp: claims.exp,
            }));
          } catch (e) {
            notes.forEach((el) => { el.hidden = false; el.textContent = 'This browser blocked storage. Use Open app.'; });
            return;
          }
          location.href = APP_HREF;
        },
      });
      paintButtons();
      return;
    }
    if (tries++ < 40) setTimeout(whenGsi, 150);
    else fail();
  };
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client?hl=en';
  s.async = true;
  s.onload = whenGsi;
  s.onerror = fail;
  document.head.appendChild(s);
}

function start() {
  setupReveals();
  updateSection();
  updateBackdrop(readProgress());
  mountSignIn();

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      if (reduced()) return;
      pointerX = (event.clientX / innerWidth - 0.5) * 2;
      pointerY = (event.clientY / innerHeight - 0.5) * 2;
      if (!gl) updateBackdrop(readProgress());
    }, { passive: true });
  }

  window.addEventListener('scroll', () => {
    if (reduced() || !gl) {
      updateSection();
      updateBackdrop(readProgress());
    }
  }, { passive: true });

  if ('IntersectionObserver' in window && stageArt) {
    const vis = new IntersectionObserver((entries) => {
      stageVisible = entries.some((e) => e.isIntersecting);
    });
    vis.observe(stageArt);
  }
  if ('ResizeObserver' in window && stageArt) {
    new ResizeObserver(() => {
      needsResize = true;
      if (reduced()) renderStatic();
    }).observe(stageArt);
  }
}

reduceQuery.addEventListener?.('change', () => {
  root.classList.toggle('rm', reduceQuery.matches);
  if (reduced() && gl) {
    cancelAnimationFrame(raf);
    renderStatic();
  } else if (gl && !reduced()) {
    lastP = -1;
    raf = requestAnimationFrame(tick);
  }
});

window.addEventListener('pagehide', () => {
  cancelAnimationFrame(raf);
  if (gl) { gl.dispose(); gl = null; }
});

start();
