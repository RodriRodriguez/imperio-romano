// Salón de columnas en Three.js: la cámara avanza con el scroll y cambia de "clima" por capítulo.
import * as THREE from 'three';

const S = 6.5;          // separación entre columnas
const COUNT = 34;       // columnas por fila
const ROWS = [-4.6, 4.6, -11.5, 11.5];
const LEN = S * (COUNT - 1);
const CAM_START = 9;
const CAM_END = -LEN + 26;

const MOODS = [
  { fog: '#1e0b07', density: 0.05, light: '#ff8a4c', exposure: 1.05, amb: 0.5 },   // I  hero
  { fog: '#21140a', density: 0.055, light: '#ffb45e', exposure: 1.1, amb: 0.55 },  // II Daniel
  { fog: '#170d0a', density: 0.06, light: '#ff9a68', exposure: 1.0, amb: 0.45 },   // III línea
  { fog: '#140b0c', density: 0.062, light: '#f0a070', exposure: 0.95, amb: 0.45 }, // IV zoom
  { fog: '#0b1013', density: 0.06, light: '#9fbad2', exposure: 0.95, amb: 0.5 },   // V mapa
  { fog: '#5a3420', density: 0.035, light: '#ffe2bd', exposure: 1.25, amb: 0.9 },  // VI fin: luz al final
];

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function fluted(radiusTop, radiusBottom, height) {
  const g = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 72, 1, true);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x);
    const k = 1 - 0.045 * Math.pow(Math.max(0, Math.cos(a * 20)), 2);
    p.setXYZ(i, v.x * k, v.y, v.z * k);
  }
  g.computeVertexNormals();
  return g;
}

export function createHall(canvas, { reduced = false } = {}) {
  const DPR = window.devicePixelRatio || 1;
  // En pantallas retina el antialias por hardware cuesta mucho y casi no se nota: se usa solo en DPR 1.
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: DPR < 1.5, powerPreference: 'high-performance', stencil: false });
  const MAX_RATIO = Math.min(DPR, 1.25);
  const quality = { ratio: MAX_RATIO, detail: 1 };
  renderer.setPixelRatio(quality.ratio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const fogColor = new THREE.Color(MOODS[0].fog);
  scene.background = fogColor;
  scene.fog = new THREE.FogExp2(fogColor, MOODS[0].density);

  const camera = new THREE.PerspectiveCamera(56, 1, 0.1, 260);
  camera.position.set(0, 2.6, CAM_START);

  // ——— materiales
  const porphyry = new THREE.MeshStandardMaterial({ color: '#7a1d14', roughness: 0.38, metalness: 0.12 });
  const gilt = new THREE.MeshStandardMaterial({ color: '#b98a3a', roughness: 0.32, metalness: 0.75 });
  const marble = new THREE.MeshStandardMaterial({ color: '#d9cbb4', roughness: 0.55, metalness: 0.0 });

  // ——— columnas instanciadas
  const shaftH = 8;
  const parts = [
    { geo: new THREE.BoxGeometry(1.7, 0.36, 1.7), mat: marble, y: 0.18 },
    { geo: new THREE.TorusGeometry(0.66, 0.13, 12, 48).rotateX(Math.PI / 2), mat: gilt, y: 0.48 },
    { geo: fluted(0.52, 0.6, shaftH), mat: porphyry, y: 0.6 + shaftH / 2 },
    { geo: new THREE.CylinderGeometry(0.86, 0.56, 0.55, 48), mat: gilt, y: 0.6 + shaftH + 0.27 },
    { geo: new THREE.BoxGeometry(1.8, 0.28, 1.8), mat: marble, y: 0.6 + shaftH + 0.69 },
  ];
  const n = ROWS.length * COUNT;
  const m4 = new THREE.Matrix4();
  for (const part of parts) {
    const inst = new THREE.InstancedMesh(part.geo, part.mat, n);
    let k = 0;
    for (const x of ROWS) for (let i = 0; i < COUNT; i++) {
      m4.makeTranslation(x, part.y, -i * S);
      inst.setMatrixAt(k++, m4);
    }
    inst.instanceMatrix.needsUpdate = true;
    scene.add(inst);
  }
  const CEIL = 0.6 + shaftH + 0.83;

  // ——— vigas del techo
  const beam = new THREE.InstancedMesh(new THREE.BoxGeometry(26, 0.6, 0.9), new THREE.MeshStandardMaterial({ color: '#2a120d', roughness: 0.8 }), COUNT);
  for (let i = 0; i < COUNT; i++) { m4.makeTranslation(0, CEIL + 0.3, -i * S); beam.setMatrixAt(i, m4); }
  scene.add(beam);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(40, LEN + 120), new THREE.MeshStandardMaterial({ color: '#160806', roughness: 1 }));
  ceiling.rotation.x = Math.PI / 2; ceiling.position.set(0, CEIL + 0.6, -LEN / 2);
  scene.add(ceiling);

  // ——— piso de losas
  const floorTex = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#3a120c'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = `rgba(${200 + Math.random() * 55},${120 + Math.random() * 60},${90 + Math.random() * 40},${Math.random() * 0.05})`;
      g.beginPath(); g.ellipse(Math.random() * w, Math.random() * h, Math.random() * 60, Math.random() * 6, Math.random() * 3, 0, 7); g.fill();
    }
    g.strokeStyle = 'rgba(217,164,65,.35)'; g.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * w / 4, 0); g.lineTo(i * w / 4, h); g.stroke(); g.beginPath(); g.moveTo(0, i * h / 4); g.lineTo(w, i * h / 4); g.stroke(); }
    g.strokeStyle = 'rgba(217,164,65,.5)'; g.lineWidth = 2;
    g.strokeRect(w * .5 - 70, h * .5 - 70, 140, 140);
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(5, 52);
  floorTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(52, LEN + 120), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.22, metalness: 0.35, color: '#ffffff' }));
  floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -LEN / 2);
  scene.add(floor);

  // ——— luz al final del salón
  const portalTex = canvasTex(512, 512, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h * .62, 10, w / 2, h * .62, w * .62);
    r.addColorStop(0, 'rgba(255,244,220,1)'); r.addColorStop(.35, 'rgba(255,196,130,.75)'); r.addColorStop(1, 'rgba(255,140,80,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const portal = new THREE.Mesh(new THREE.PlaneGeometry(46, 30), new THREE.MeshBasicMaterial({ map: portalTex, transparent: true, fog: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  portal.position.set(0, 8, -LEN - 18);
  scene.add(portal);
  const haloTex = canvasTex(256, 256, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(255,214,160,.9)'); r.addColorStop(.2, 'rgba(255,170,100,.35)'); r.addColorStop(.6, 'rgba(255,120,60,.08)'); r.addColorStop(1, 'rgba(255,100,50,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, fog: false, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 }));
  halo.scale.set(70, 70, 1);
  halo.position.set(0, 4.5, -LEN - 10);
  halo.renderOrder = 10;
  scene.add(halo);

  // ——— haces de luz
  const rayTex = canvasTex(64, 512, (g, w, h) => {
    const l = g.createLinearGradient(0, 0, 0, h);
    l.addColorStop(0, 'rgba(255,220,170,.0)'); l.addColorStop(.15, 'rgba(255,220,170,.55)'); l.addColorStop(1, 'rgba(255,220,170,0)');
    g.fillStyle = l; g.fillRect(0, 0, w, h);
    const s = g.createLinearGradient(0, 0, w, 0);
    s.addColorStop(0, 'rgba(0,0,0,1)'); s.addColorStop(.5, 'rgba(0,0,0,0)'); s.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = s; g.fillRect(0, 0, w, h);
  });
  const rayMat = new THREE.MeshBasicMaterial({ map: rayTex, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  for (let i = 0; i < 14; i++) {
    const r = new THREE.Mesh(new THREE.PlaneGeometry(2.2 + Math.random() * 2, 14), rayMat);
    r.position.set((Math.random() - .5) * 6, CEIL - 5, -i * S * 2.3 - 6);
    r.rotation.z = 0.32; r.rotation.y = (Math.random() - .5) * .6;
    scene.add(r);
  }

  // ——— luces
  const hemi = new THREE.HemisphereLight('#ffd2a8', '#2a0805', 0.5);
  scene.add(hemi);
  const key = new THREE.DirectionalLight('#ffcf9c', 0.6);
  key.position.set(3, 10, 6);
  scene.add(key);

  const flameTex = canvasTex(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(.25, 'rgba(255,170,80,.8)'); r.addColorStop(1, 'rgba(255,90,30,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
  const torches = [];
  for (let i = 0; i < 4; i++) {
    const light = new THREE.PointLight('#ff8a4c', 40, 24, 1.6);
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, color: '#ffb066', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    flame.scale.set(1.4, 1.8, 1);
    scene.add(light, flame);
    torches.push({ light, flame, seed: Math.random() * 100 });
  }

  // ——— polvo en suspensión
  const DUST = reduced ? 300 : 900;
  const dPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) { const side = Math.random() < .5 ? -1 : 1; dPos[i * 3] = side * (1.6 + Math.random() * 8); dPos[i * 3 + 1] = Math.random() * 9; dPos[i * 3 + 2] = -Math.random() * 40; }
  const dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
  const dust = new THREE.Points(dGeo, new THREE.PointsMaterial({ size: 0.03, color: '#ffd9a6', transparent: true, opacity: 0.7, alphaTest: 0.01, depthWrite: false, blending: THREE.AdditiveBlending, map: flameTex }));
  scene.add(dust);

  // ——— estado
  const state = { target: 0, p: 0, mood: 0, mx: 0, my: 0, sx: 0, sy: 0 };
  const cur = { fog: new THREE.Color(MOODS[0].fog), light: new THREE.Color(MOODS[0].light), density: MOODS[0].density, exposure: MOODS[0].exposure, amb: MOODS[0].amb };
  const tmp = new THREE.Color();

  function applyRatio() {
    renderer.setPixelRatio(Math.max(0.5, quality.ratio * quality.detail));
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    applyRatio();
    camera.aspect = w / h;
    camera.fov = w < 700 ? 68 : 56;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // Compila todos los shaders antes del primer cuadro (evita el tirón la primera vez que algo aparece).
  renderer.compile(scene, camera);

  // Calidad adaptativa: si la compu no llega a ~50 fps baja la resolución interna del 3D; si sobra, la sube.
  const perf = { acc: 0, n: 0, cool: 0 };
  function adapt(rawDt) {
    perf.acc += rawDt; perf.n++;
    if (perf.n < 45) return;
    const avg = perf.acc / perf.n; perf.acc = 0; perf.n = 0;
    if (perf.cool-- > 0) return;
    if (avg > 0.021 && quality.ratio > 0.6) { quality.ratio = Math.max(0.6, quality.ratio - 0.15); applyRatio(); perf.cool = 2; }
    else if (avg < 0.0135 && quality.ratio < MAX_RATIO) { quality.ratio = Math.min(MAX_RATIO, quality.ratio + 0.1); applyRatio(); perf.cool = 4; }
  }

  const clock = new THREE.Clock();
  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { clock.getDelta(); return; }
    const rawDt = clock.getDelta();
    adapt(rawDt);
    const dt = Math.min(rawDt, 0.05);
    const t = clock.elapsedTime;

    state.p += (state.target - state.p) * (reduced ? 1 : 1 - Math.pow(0.0015, dt));
    state.sx += (state.mx - state.sx) * (1 - Math.pow(0.02, dt));
    state.sy += (state.my - state.sy) * (1 - Math.pow(0.02, dt));

    const p = state.p;
    const z = CAM_START + (CAM_END - CAM_START) * p;
    camera.position.set(Math.sin(p * Math.PI * 3) * 1.1 + state.sx * 0.5, 2.5 + Math.sin(p * Math.PI * 2) * 0.35 - state.sy * 0.25 + Math.sin(t * .5) * .03, z);
    camera.lookAt(state.sx * 1.6 + Math.sin(p * Math.PI * 3 + .6) * .6, 3.2 - state.sy * 0.8, z - 12);
    camera.rotation.z += Math.sin(p * Math.PI * 3) * 0.015;

    // clima
    const m = MOODS[state.mood];
    const k = 1 - Math.pow(0.15, dt);
    cur.fog.lerp(tmp.set(m.fog), k);
    cur.light.lerp(tmp.set(m.light), k);
    cur.density += (m.density - cur.density) * k;
    cur.exposure += (m.exposure - cur.exposure) * k;
    cur.amb += (m.amb - cur.amb) * k;
    scene.fog.color.copy(cur.fog); scene.background.copy(cur.fog);
    scene.fog.density = cur.density;
    renderer.toneMappingExposure = cur.exposure;
    hemi.intensity = cur.amb;

    // antorchas: se reubican en las columnas cercanas por delante de la cámara
    const base = Math.floor(-z / S);
    torches.forEach((tc, i) => {
      const idx = base + 1 + i;
      const side = idx % 2 ? 1 : -1;
      const tz = -idx * S + 0.0;
      const tx = side * (4.6 - 0.8);
      tc.light.position.set(tx, 4.6, tz);
      tc.flame.position.set(tx, 4.6, tz);
      const f = 0.82 + 0.18 * Math.sin(t * 9 + tc.seed) * Math.sin(t * 5.3 + tc.seed * 2);
      tc.light.intensity = 46 * f;
      tc.light.color.copy(cur.light);
      tc.flame.material.color.copy(cur.light);
      tc.flame.scale.set(1.2 * f, 1.7 * f, 1);
    });

    // polvo que acompaña a la cámara
    dust.position.z = z - 4;
    dust.rotation.y = t * 0.01;
    dust.position.y = Math.sin(t * 0.25) * 0.15;

    portal.material.opacity = 0.25 + 0.75 * p;
    portal.material.color.copy(cur.light).lerp(tmp.set('#ffffff'), 0.4);
    halo.material.opacity = 0.18 + 0.5 * p * p;
    halo.material.color.copy(cur.light);
    renderer.render(scene, camera);
  }
  frame();

  return {
    setProgress(p) { state.target = Math.max(0, Math.min(1, p)); },
    setMood(i) { state.mood = Math.max(0, Math.min(MOODS.length - 1, i)); },
    // en capítulos con mucho contenido el 3D está oscurecido: se dibuja a menor resolución
    setDetail(d) { if (d !== quality.detail) { quality.detail = d; applyRatio(); } },
    setPointer(x, y) { state.mx = x; state.my = y; },
    destroy() { cancelAnimationFrame(raf); renderer.dispose(); },
  };
}
