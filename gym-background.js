import * as THREE from './assets/three.module.js';

const host = document.querySelector('.gym-scene');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (host && !reduceMotion.matches && !navigator.connection?.saveData) {
  try {
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4, 4, 2.5, -2.5, 0.1, 30);
    camera.position.set(0, 0, 10);
    scene.add(new THREE.AmbientLight(0xb7bec5, 1.5));
    const redLight = new THREE.PointLight(0xc8161f, 22, 12);
    redLight.position.set(3, 1.8, 4);
    scene.add(redLight);
    const edgeLight = new THREE.DirectionalLight(0xd6dbe0, 2.3);
    edgeLight.position.set(-2, 3, 6);
    scene.add(edgeLight);

    // img2threejs reconstruction: plate silhouette, grip cutouts, steel hub, and red index mark.
    // Hidden back face is approximated from the single reference view.
    function createWeightPlate() {
      const plate = new THREE.Group();
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
      const iron = new THREE.MeshStandardMaterial({ color: 0x33373b, metalness: 0.62, roughness: 0.55, transparent: true, opacity: 0.72 });
      const steel = new THREE.MeshStandardMaterial({ color: 0xa2a6a7, metalness: 0.88, roughness: 0.28, transparent: true, opacity: 0.8 });
      const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(outline, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 2, curveSegments: 48 }), iron);
      plate.add(rim);
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.017, 6, 64), steel);
      outerRing.position.z = 0.225;
      plate.add(outerRing);
      const hub = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.047, 8, 48), steel);
      hub.position.z = 0.24;
      plate.add(hub);
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.2, 0.012), new THREE.MeshStandardMaterial({ color: 0xc8161f, emissive: 0x5a050a, metalness: 0.3, roughness: 0.6 }));
      dash.position.set(0, 0.66, 0.235);
      plate.add(dash);
      return plate;
    }

    const weights = new THREE.Group();
    const rear = createWeightPlate();
    rear.position.set(0.18, 0.1, -0.42);
    rear.scale.setScalar(0.87);
    weights.add(rear);
    weights.add(createWeightPlate());
    scene.add(weights);

    function resize() {
      const width = innerWidth;
      const height = innerHeight;
      const aspect = width / height;
      camera.left = -2.6 * aspect;
      camera.right = 2.6 * aspect;
      camera.top = 2.6;
      camera.bottom = -2.6;
      camera.updateProjectionMatrix();
      weights.position.set(Math.max(1.45, 2.6 * aspect - 0.7), -1.05, 0);
      weights.scale.setScalar(width < 600 ? 0.85 : 1.15);
      renderer.setSize(width, height);
      renderer.render(scene, camera);
    }

    let frame = 0;
    let last = 0;
    function animate(now) {
      frame = requestAnimationFrame(animate);
      if (document.hidden || now - last < 33) return;
      last = now;
      weights.rotation.y = -0.28 + Math.sin(now * 0.00028) * 0.12;
      weights.rotation.z = Math.sin(now * 0.00017) * 0.025;
      weights.position.y = -1.05 + Math.sin(now * 0.0004) * 0.045;
      renderer.render(scene, camera);
    }
    addEventListener('resize', resize, { passive: true });
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) cancelAnimationFrame(frame);
      else frame = requestAnimationFrame(animate);
    });
    resize();
    frame = requestAnimationFrame(animate);
  } catch (error) {
    host.replaceChildren();
    console.warn('Gym background uses static image because WebGL is unavailable.', error);
  }
}
