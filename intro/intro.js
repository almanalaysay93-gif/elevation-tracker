// Elevation intro: one normalized scroll value drives one procedural barbell.
// Three.js pinned to an exact version (minified build, about 167 KB gzip). Loaded after first paint and idle,
// so the text paints first. No GSAP, no Lenis. Scroll is native.
const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const root = document.documentElement;
const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => reduceQuery.matches;
const beats = Array.from(document.querySelectorAll('.beat'));
const navLinks = Array.from(document.querySelectorAll('.progress a'));
const nowEl = document.getElementById('progressNow');
const canvas = document.getElementById('heroCanvas');
const stageArt = document.getElementById('stageArt');
const scroller = document.scrollingElement || root;

// One normalized scroll value: clamp(scrollTop / max(1, scrollHeight - clientHeight), 0, 1)
function readProgress() {
  const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
  return Math.min(1, Math.max(0, scroller.scrollTop / max));
}

// Section reveals and the "Section n of 5" indicator.
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
  const mid = window.innerHeight * 0.5;
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

// Camera keyframes at 0, .25, .5, .75, 1. Rotation is in radians.
const KF = [
  { t: 0.00, pos: [0.0, 0.6, 6.0], rot: 0.0 },
  { t: 0.25, pos: [2.8, 1.0, 4.4], rot: 0.9 },
  { t: 0.50, pos: [0.0, 2.1, 4.8], rot: 1.8 },
  { t: 0.75, pos: [-2.8, 0.8, 4.4], rot: 2.7 },
  { t: 1.00, pos: [0.0, 0.4, 6.0], rot: 3.6 },
];
const smooth = (x) => x * x * (3 - 2 * x);
function sampleKeyframe(p) {
  for (let i = 0; i < KF.length - 1; i++) {
    const a = KF[i];
    const b = KF[i + 1];
    if (p <= b.t) {
      const f = smooth((p - a.t) / (b.t - a.t));
      return {
        pos: a.pos.map((v, k) => v + (b.pos[k] - v) * f),
        rot: a.rot + (b.rot - a.rot) * f,
      };
    }
  }
  const last = KF[KF.length - 1];
  return { pos: last.pos.slice(), rot: last.rot };
}

// Hero state, filled in when WebGL starts.
let gl = null;

async function initHero() {
  let THREE;
  try {
    THREE = await import(THREE_URL);
  } catch (err) {
    return; // CDN blocked: CSS fallback stays visible
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (err) {
    return; // no WebGL: CSS fallback stays visible
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);

  // Procedural barbell: bar, plates, collars. Volt solid, cyan wireframe edges.
  const volt = new THREE.MeshStandardMaterial({ color: 0xc6ff00, metalness: 0.3, roughness: 0.55 });
  const cyan = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0f1314, metalness: 0.1, roughness: 0.8 });

  const group = new THREE.Group();
  const geometries = [];
  const materials = [volt, cyan, dark];

  const bar = new THREE.CylinderGeometry(0.04, 0.04, 3.6, 20);
  bar.rotateZ(Math.PI / 2);
  geometries.push(bar);
  group.add(new THREE.Mesh(bar, volt));

  function addPlate(x, radius, thickness, mat) {
    const g = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    g.rotateZ(Math.PI / 2);
    geometries.push(g);
    const m = new THREE.Mesh(g, mat);
    m.position.x = x;
    group.add(m);
    const edges = new THREE.EdgesGeometry(g, 20);
    geometries.push(edges);
    const line = new THREE.LineSegments(edges, cyan);
    line.position.x = x;
    group.add(line);
  }
  [1.35, 1.6, 1.85].forEach((x, i) => {
    const r = 0.62 - i * 0.08;
    addPlate(x, r, 0.14, dark);
    addPlate(-x, r, 0.14, dark);
  });
  [1.05, -1.05].forEach((x) => addPlate(x, 0.12, 0.12, volt));
  scene.add(group);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 3, 4);
  scene.add(key);

  let zoom = 1;
  function resize() {
    const w = Math.max(1, stageArt.clientWidth);
    const h = Math.max(1, stageArt.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Portrait: pull the camera back so the full barbell fits the width.
    zoom = camera.aspect < 1 ? Math.max(1, 1.3 / camera.aspect) : 1;
    camera.updateProjectionMatrix();
  }

  function renderAt(p) {
    const k = sampleKeyframe(p);
    camera.position.set(k.pos[0] * zoom, k.pos[1] * zoom, k.pos[2] * zoom);
    camera.lookAt(0, 0, 0);
    group.rotation.y = k.rot;
    group.rotation.x = 0.18;
    // Wide screens: the object sits right of centre, clear of the text panel.
    const wide = camera.aspect >= 1;
    group.position.x = wide ? 0.9 : 0;
    group.scale.setScalar(wide ? 0.8 : 1);
    renderer.render(scene, camera);
  }

  function dispose() {
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    renderer.dispose();
  }

  gl = { renderer, renderAt, resize, dispose, THREE };

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    root.classList.remove('webgl');
  });

  resize();
  try {
    renderAt(reduced() ? 0 : readProgress());
  } catch (err) {
    dispose();
    gl = null;
    return;
  }
  root.classList.add('webgl');
  return true;
}

// Render loop: one rAF, reads the scroll value, skips when unchanged or hidden.
let raf = 0;
let lastP = -1;
let needsResize = false;
let stageVisible = true;

function tick() {
  raf = requestAnimationFrame(tick);
  if (!gl || document.hidden || !stageVisible) return;
  const p = readProgress();
  if (!needsResize && Math.abs(p - lastP) < 1e-5) return;
  if (needsResize) { gl.resize(); needsResize = false; }
  lastP = p;
  try { gl.renderAt(p); } catch (err) { root.classList.remove('webgl'); }
  updateSection();
}

function onScrollStatic() {
  updateSection();
}

// Run fn after the window load event and browser idle time, so the text is painted before three.js is fetched.
function whenIdle(fn) {
  const run = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 1500 });
    else setTimeout(fn, 200);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
}

function start() {
  setupReveals();
  updateSection();

  whenIdle(() => initHero().then((ok) => {
    if (!ok || !gl) return;
    if (reduced()) {
      // Static frame only: no loop, no camera travel.
      renderStatic();
      window.addEventListener('resize', renderStatic);
      return;
    }
    raf = requestAnimationFrame(tick);
  }));

  // Keep the nav and indicator current when reduced motion skips the loop.
  window.addEventListener('scroll', () => { if (reduced() || !gl) onScrollStatic(); }, { passive: true });

  // Pause the hero while the stage is off-screen (tab hidden is handled in tick).
  if ('IntersectionObserver' in window) {
    const vis = new IntersectionObserver((entries) => {
      stageVisible = entries.some((e) => e.isIntersecting);
    });
    vis.observe(stageArt);
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { needsResize = true; }).observe(stageArt);
  }
}

function renderStatic() {
  if (!gl) return;
  gl.resize();
  gl.renderAt(0);
}

reduceQuery.addEventListener?.('change', () => {
  // Switching reduced motion on mid-session: stop the loop and freeze the frame.
  if (reduced() && gl) {
    cancelAnimationFrame(raf);
    renderStatic();
  }
});

window.addEventListener('pagehide', () => {
  cancelAnimationFrame(raf);
  if (gl) { gl.dispose(); gl = null; }
});

start();
