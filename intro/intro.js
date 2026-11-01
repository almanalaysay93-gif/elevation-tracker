// The scroll and pointer move a procedural barbell over a second gym depth layer.
// Three.js stays local to avoid a CDN dependency and loads after the page text.
const THREE_URL = '../assets/three.module.js';

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
    return; // Module unavailable: CSS fallback stays visible
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

  // Brushed steel bar, graphite plates, restrained red collars.
  const steel = new THREE.MeshStandardMaterial({ color: 0xa7b0ba, metalness: 0.85, roughness: 0.32 });
  const red = new THREE.MeshStandardMaterial({ color: 0xc8161f, metalness: 0.48, roughness: 0.42 });
  const edge = new THREE.LineBasicMaterial({ color: 0xb7c0c6, transparent: true, opacity: 0.38 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x24272a, metalness: 0.58, roughness: 0.55 });

  const group = new THREE.Group();
  const geometries = [];
  const materials = [steel, red, edge, dark];

  const bar = new THREE.CylinderGeometry(0.04, 0.04, 3.6, 20);
  bar.rotateZ(Math.PI / 2);
  geometries.push(bar);
  group.add(new THREE.Mesh(bar, steel));

  function addPlate(x, radius, thickness, mat) {
    const g = new THREE.CylinderGeometry(radius, radius, thickness, 32);
    g.rotateZ(Math.PI / 2);
    geometries.push(g);
    const m = new THREE.Mesh(g, mat);
    m.position.x = x;
    group.add(m);
    const edges = new THREE.EdgesGeometry(g, 20);
    geometries.push(edges);
    const line = new THREE.LineSegments(edges, edge);
    line.position.x = x;
    group.add(line);
  }
  [1.35, 1.6, 1.85].forEach((x, i) => {
    const r = 0.62 - i * 0.08;
    addPlate(x, r, 0.14, dark);
    addPlate(-x, r, 0.14, dark);
  });
  [1.05, -1.05].forEach((x) => addPlate(x, 0.12, 0.12, red));
  scene.add(group);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rimLight = new THREE.PointLight(0xc8161f, 9, 9);
  rimLight.position.set(3, -1, 3);
  scene.add(rimLight);

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
    camera.position.set(k.pos[0] * zoom + pointerX * 0.26, k.pos[1] * zoom - pointerY * 0.18, k.pos[2] * zoom);
    camera.lookAt(0, 0, 0);
    group.rotation.y = k.rot + pointerX * 0.12;
    group.rotation.x = 0.18 + pointerY * 0.07;
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
let pointerX = 0;
let pointerY = 0;
let lastPointerX = 0;
let lastPointerY = 0;

function updateBackdrop(p) {
  if (reduced()) return;
  root.style.setProperty('--parallax-scroll', (-p * 28).toFixed(1) + 'px');
  root.style.setProperty('--parallax-x', (pointerX * -16).toFixed(1) + 'px');
  root.style.setProperty('--parallax-y', (pointerY * -12).toFixed(1) + 'px');
}

function tick() {
  raf = requestAnimationFrame(tick);
  if (!gl || document.hidden || !stageVisible) return;
  const p = readProgress();
  if (!needsResize && Math.abs(p - lastP) < 1e-5 && Math.abs(pointerX - lastPointerX) < 1e-3 && Math.abs(pointerY - lastPointerY) < 1e-3) return;
  if (needsResize) { gl.resize(); needsResize = false; }
  lastP = p;
  lastPointerX = pointerX;
  lastPointerY = pointerY;
  updateBackdrop(p);
  try { gl.renderAt(p); } catch (err) { root.classList.remove('webgl'); }
  updateSection();
}

function onScrollStatic() {
  updateSection();
  if (!gl) updateBackdrop(readProgress());
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
  updateBackdrop(readProgress());

  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      if (reduced()) return;
      pointerX = (event.clientX / innerWidth - 0.5) * 2;
      pointerY = (event.clientY / innerHeight - 0.5) * 2;
      if (!gl) updateBackdrop(readProgress());
    }, { passive: true });
  }

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
  root.classList.toggle('rm', reduced());
  // Switching reduced motion on mid-session: stop the loop and freeze the frame.
  if (reduced() && gl) {
    cancelAnimationFrame(raf);
    pointerX = 0;
    pointerY = 0;
    root.style.setProperty('--parallax-scroll', '0px');
    root.style.setProperty('--parallax-x', '0px');
    root.style.setProperty('--parallax-y', '0px');
    renderStatic();
  } else if (gl) {
    lastP = -1;
    raf = requestAnimationFrame(tick);
  }
});

window.addEventListener('pagehide', () => {
  cancelAnimationFrame(raf);
  if (gl) { gl.dispose(); gl = null; }
});

start();
