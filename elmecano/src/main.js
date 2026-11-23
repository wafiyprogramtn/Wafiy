import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { I18N } from './i18n.js';

/* ------------------------------------------------------------------ *
 *  El Mecano — scroll-driven 3D story
 *  The page scroll inside #story (p: 0 → 1) drives camera, parts,
 *  x-ray scanner, labels and overlay cards. ?record = deterministic.
 * ------------------------------------------------------------------ */

const RECORD = /[?&]record\b/.test(location.search);
const PHONE = '21652351490';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (p, a, b) => clamp((p - a) / (b - a));
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ============================ i18n ============================ */
let lang = 'fr';
let needsLayout = true;

const REVIEWS = [
  { n: 'Hela Ben Bakir', d: { fr: 'Août 2026', ar: 'أوت 2026' }, t: 'Je voulais vraiment vous remercier pour vos précieux conseils et pour le temps que vous m’avez accordé. Votre disponibilité, votre réactivité et surtout votre expertise m’ont beaucoup aidée à faire le bon choix. C’est rassurant de pouvoir compter sur quelqu’un de compétent et de confiance.' },
  { n: 'Mohamed Haykel Ayadi', d: { fr: 'Août 2026', ar: 'أوت 2026' }, t: 'Excellente adresse ! Il a pris le temps de m’écouter pendant une vingtaine de minutes, de répondre à toutes mes questions et de me conseiller, sans rien demander en retour ! Professionnel, honnête et très serviable. Je recommande sans hésitation.' },
  { n: 'Rihab Sellami', d: { fr: 'Août 2026', ar: 'أوت 2026' }, t: 'Ena mchit awel marra w mra wa7di wost errjel w houma ma5alewnich n7ess jemla eli ena menich à l’aise w fassrouli kol chay bkol torbiya w wes3 bel ✌️ Merci elmecano garage ♥️' },
  { n: 'Nafa Ben Haddej', d: { fr: 'Juillet 2026', ar: 'جويلية 2026' }, t: 'Equipe pro yaarfou fech yaamlou et surtt metrobin barcha. Lwehed yefra7 ki yal9a nes mazelet haka fi tounes. Rabi ywafa9kom.' },
  { n: 'Wissem Abidli', d: { fr: 'Juillet 2026', ar: 'جويلية 2026' }, t: 'Travail extraordinaire.' },
  { n: 'Ben Chhida Azmy', d: { fr: 'Juin 2026', ar: 'جوان 2026' }, t: 'Expérience 10/10.' },
];

function renderReviews() {
  const track = $('#reviewsTrack');
  const card = r => {
    const ini = r.n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `<article class="rev"><div class="rev-top"><div class="rev-who"><span class="rev-av">${ini}</span><div><b>${r.n}</b><small>${r.d[lang]}</small></div></div><span class="stars">★★★★★</span></div><p dir="auto">${r.t}</p></article>`;
  };
  const html = REVIEWS.map(card).join('');
  track.innerHTML = html + html;
  track.querySelectorAll('.rev').forEach((el, i) => i >= REVIEWS.length && el.setAttribute('aria-hidden', 'true'));
}

function updateOpen() {
  const badge = $('#openBadge');
  if (!badge) return;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Tunis', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const get = t => parts.find(x => x.type === t)?.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const m = +get('hour') * 60 + +get('minute');
  const slots = day === 0 ? [] : day === 6 ? [[510, 720]] : [[540, 720], [780, 900]];
  const open = slots.some(([a, b]) => m >= a && m < b);
  badge.className = 'open-badge ' + (open ? 'is-open' : 'is-shut');
  badge.querySelector('span').textContent = I18N[lang][open ? 'hours.open' : 'hours.shut'];
  $$('.hours li').forEach(li => {
    const d = li.dataset.day;
    li.classList.toggle('today', d === String(day) || (d === '1-5' && day >= 1 && day <= 5));
  });
}

function applyLang(l) {
  lang = l;
  const dict = I18N[l];
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  document.title = dict['meta.title'];
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  const wa = `https://wa.me/${PHONE}?text=${encodeURIComponent(dict['wa.msg'])}`;
  $$('.js-wa').forEach(a => (a.href = wa));
  renderReviews();
  updateOpen();
  buildLabels();
  formatCounters(true);
  try { localStorage.setItem('em-lang', l); } catch (e) { /* private mode */ }
  needsLayout = true;
}

/* ====================== scroll-linked DOM ====================== */
const counters = $$('[data-count]');
function formatCounters(force) {
  const vh = innerHeight;
  counters.forEach(el => {
    const r = el.getBoundingClientRect();
    const t = ease(ramp(vh - r.top, vh * 0.05, vh * 0.45));
    const target = parseFloat(el.dataset.count);
    const dec = +(el.dataset.dec || 0);
    const v = target * t;
    const key = v.toFixed(dec);
    if (force || el._k !== key) {
      el._k = key;
      el.textContent = lang === 'fr' ? key.replace('.', ',') : key;
    }
  });
}

/* ============================ 3D ============================ */
const canvas = $('#gl');
const stage = $('#stage');
const story = $('#story');
let renderer, scene, camera, car, xray, laser, laserSheet, shadow, ring, streaks;
let parts = {};
let anchors = [];
let normalMats = [];
let xrayMats = [];
const planeN = new THREE.Plane(new THREE.Vector3(0, 0, -1), 100);
const planeX = new THREE.Plane(new THREE.Vector3(0, 0, 1), -100);
let headMats = [];
let glOK = true;

const LABELS = [
  { id: 'engine', grp: 1, hm: 58, h: 96, node: 'Engine', off: [0, 0.22, 0], k: 'l1.engine', v: 'l1.engine.v', cls: 'ok' },
  { id: 'brakes', grp: 1, hm: 18, h: 34, node: 'WheelFrontL', off: [0.15, 0.05, 0], k: 'l1.brakes', v: 'l1.brakes.v', cls: 'warn' },
  { id: 'battery', grp: 1, hm: 98, h: 150, node: 'Engine', off: [0.45, 0.25, -0.35], k: 'l1.battery', v: 'l1.battery.v', cls: 'ok' },
  { id: 'elec', grp: 1, hm: 138, h: 46, node: 'InteriorDashMid', off: [0, 0.12, 0], k: 'l1.elec', v: 'l1.elec.v', cls: 'ok' },
  { id: 'susp', grp: 1, hm: 40, h: 60, node: 'WheelRearL', off: [0.1, 0.3, 0], k: 'l1.susp', v: 'l1.susp.v', cls: 'ok' },
  { id: 'body', grp: 2, node: 'BodyRoofPanel', off: [0, 0.12, 0], k: 'l2.body', cls: 'red' },
  { id: 'engine2', grp: 2, node: 'Engine', off: [0, 0.18, 0], k: 'l2.engine', cls: 'red' },
  { id: 'cabin', grp: 2, node: 'InteriorSeatsColor1', off: [0, 0.25, 0], k: 'l2.cabin', cls: 'red' },
  { id: 'trans', grp: 2, node: 'Axles', off: [0, 0.05, -1.0], k: 'l2.trans', cls: 'red' },
  { id: 'brk2', grp: 2, node: 'WheelFrontL', off: [0.25, 0.25, 0], k: 'l2.brakes', cls: 'red' },
];

function buildLabels() {
  const box = $('#labels');
  const dict = I18N[lang];
  box.innerHTML = LABELS.map(l => `<div class="lbl ${l.cls}" data-id="${l.id}" style="--h:${l.h || 46}px;--hm:${l.hm || 30}px"><span class="stem"></span><span class="pin"></span><div class="box">${dict[l.k]}${l.v ? `<small>${dict[l.v]}</small>` : ''}</div></div>`).join('');
  LABELS.forEach(l => (l.el = box.querySelector(`[data-id="${l.id}"]`)));
}

function makeXrayMaterial(color, base, rim) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uBase: { value: base },
      uRim: { value: rim },
      uScan: { value: 10 },
    },
    vertexShader: /* glsl */ `
      #include <common>
      #include <clipping_planes_pars_vertex>
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vW = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        vN = normalize(normalMatrix * normal);
        vV = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
        #include <clipping_planes_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <clipping_planes_pars_fragment>
      uniform vec3 uColor; uniform float uBase; uniform float uRim; uniform float uScan;
      varying vec3 vN; varying vec3 vV; varying vec3 vW;
      void main(){
        #include <clipping_planes_fragment>
        float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
        f = pow(f, 2.0);
        float lines = 0.75 + 0.25 * step(0.5, fract(vW.y * 22.0));
        float front = exp(-abs(vW.z - uScan) * 7.0);
        vec3 c = uColor * (uBase + f * uRim) * lines + vec3(1.0, 0.18, 0.2) * front * 0.9;
        gl_FragColor = vec4(c, 1.0);
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    clipping: true,
    clippingPlanes: [planeX],
  });
}

function radialTexture(stops, size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function sheetTexture() {
  const w = 64, h = 256;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const gx = g.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, 'rgba(255,40,50,0)');
  gx.addColorStop(0.5, 'rgba(255,60,70,1)');
  gx.addColorStop(1, 'rgba(255,40,50,0)');
  g.fillStyle = gx;
  g.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'destination-in';
  const gy = g.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, 'rgba(0,0,0,0)');
  gy.addColorStop(0.25, 'rgba(0,0,0,1)');
  gy.addColorStop(0.85, 'rgba(0,0,0,1)');
  gy.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gy;
  g.fillRect(0, 0, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function initGL() {
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    glOK = false;
    document.body.classList.add('no-gl');
    return false;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.localClippingEnabled = true;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.85;

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 7, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xff1a1f, 40, 18, 1.6);
  rim.position.set(-3.5, 2.2, -4);
  scene.add(rim);
  const rim2 = new THREE.PointLight(0x7cc8ff, 14, 14, 1.8);
  rim2.position.set(4, 1.2, -3);
  scene.add(rim2);

  // contact shadow
  shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(3.3, 5.6),
    new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(0,0,0,0.85)'], [0.55, 'rgba(0,0,0,0.45)'], [1, 'rgba(0,0,0,0)']]), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.003;
  scene.add(shadow);

  // studio floor ring
  ring = new THREE.Group();
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff2028, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const r1 = new THREE.Mesh(new THREE.RingGeometry(3.05, 3.08, 160), ringMat);
  const r2 = new THREE.Mesh(new THREE.RingGeometry(3.35, 3.355, 160), ringMat.clone());
  r2.material.opacity = 0.18;
  const glow = new THREE.Mesh(new THREE.CircleGeometry(3.6, 96), new THREE.MeshBasicMaterial({ map: radialTexture([[0, 'rgba(237,0,5,0.22)'], [0.7, 'rgba(237,0,5,0.06)'], [1, 'rgba(237,0,5,0)']]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  [r1, r2, glow].forEach(m => { m.rotation.x = -Math.PI / 2; ring.add(m); });
  glow.position.y = -0.001;
  ring.position.y = 0.001;
  ring.userData = { ringMat, glow };
  scene.add(ring);

  // scanner
  laser = new THREE.Group();
  laserSheet = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.9), new THREE.MeshBasicMaterial({ map: sheetTexture(), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  laserSheet.scale.x = 1;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.012, 0.012), new THREE.MeshBasicMaterial({ color: 0xff3a40, blending: THREE.AdditiveBlending, transparent: true }));
  beam.position.y = -0.9;
  const beamTop = beam.clone();
  beamTop.position.y = 0.9;
  const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.012, 1.8, 0.012), beam.material);
  post1.position.x = 1.7;
  const post2 = post1.clone();
  post2.position.x = -1.7;
  laser.add(laserSheet, beam, beamTop, post1, post2);
  laser.position.y = 0.92;
  laser.visible = false;
  scene.add(laser);

  // speed streaks (ECU step)
  const N = 260;
  const pos = new Float32Array(N * 6);
  const seeds = [];
  for (let i = 0; i < N; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 1.7 + Math.random() * 2.6;
    const x = Math.cos(a) * r, y = 0.15 + Math.abs(Math.sin(a)) * 2.2 * Math.random();
    seeds.push({ x, y, z: Math.random() * 16 - 8, len: 0.4 + Math.random() * 1.2, sp: 0.6 + Math.random() });
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  streaks = new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ color: 0xff4a50, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  streaks.userData.seeds = seeds;
  streaks.frustumCulled = false;
  scene.add(streaks);
  return true;
}

function setupCar(gltf) {
  const root = gltf.scene;
  car = new THREE.Group();
  car.add(root);
  scene.add(car);
  root.updateMatrixWorld(true);

  // center the car on the origin (z) and sit it on the floor
  const box = new THREE.Box3().setFromObject(root);
  const c = box.getCenter(new THREE.Vector3());
  root.position.x -= c.x;
  root.position.z -= c.z;
  root.position.y -= box.min.y;
  root.updateMatrixWorld(true);

  const byName = n => root.getObjectByName(n);
  const under = byName('BodyUnderside');

  // hood: re-pivot on its rear edge so it opens like a real bonnet
  const hood = byName('BodyHood');
  if (hood && under) {
    const hb = new THREE.Box3().setFromObject(hood);
    const pivotWorld = new THREE.Vector3((hb.min.x + hb.max.x) / 2, hb.max.y - 0.02, hb.min.z + 0.05);
    const pivot = new THREE.Object3D();
    pivot.name = 'HoodPivot';
    under.add(pivot);
    pivot.position.copy(under.worldToLocal(pivotWorld.clone()));
    pivot.updateMatrixWorld(true);
    pivot.attach(hood);
  }

  // materials: brand red paint, cheap glass, glowing lights
  root.traverse(o => {
    if (!o.isMesh) return;
    const m = o.material;
    if (m.transmission > 0) {
      m.transmission = 0;
      m.transparent = true;
      m.opacity = 0.32;
      m.color.set(0x0b0d14);
      m.roughness = 0.04;
      m.metalness = 0.2;
    }
    if (/Paint 1/.test(m.name)) {
      m.color.set('#d8000a');
      if ('clearcoat' in m) { m.clearcoat = 1; m.clearcoatRoughness = 0.06; }
    }
    if (/Headlight|Signallight/.test(m.name)) {
      m.emissive = new THREE.Color(0xffffff);
      m.emissiveIntensity = 1.2;
      if (!headMats.includes(m)) headMats.push(m);
    }
    if (/Brakelight/.test(m.name)) {
      m.emissive = new THREE.Color(0xff1010);
      m.emissiveIntensity = 1.0;
      if (!headMats.includes(m)) headMats.push(m);
    }
    if (/^(Hardware|Mirror|Brake|Rim1|Rim2)$/.test(m.name) || (!m.name && m.map)) {
      m.map = null;
      if (m.name === 'Rim2') { m.color.set(0x9aa0aa); m.metalness = 1; m.roughness = 0.28; }
      if (m.name === 'Brake') m.color.set('#e0000a');
    }
    m.envMapIntensity = 1;
    if (!normalMats.includes(m)) normalMats.push(m);
  });
  normalMats.forEach(m => { m.clippingPlanes = [planeN]; m.needsUpdate = true; });

  // x-ray twin (shares geometry)
  xray = root.clone(true);
  xray.position.copy(root.position);
  car.add(xray);
  const internal = /Engine|Axles|Brake|InteriorSeats|InteriorSteering|InteriorDash|Pedal/;
  const matBody = makeXrayMaterial('#7cc8ff', 0.035, 0.9);
  const matGlass = makeXrayMaterial('#7cc8ff', 0.0, 0.35);
  const matInt = makeXrayMaterial('#ff2a36', 0.16, 1.2);
  xrayMats = [matBody, matGlass, matInt];
  xray.traverse(o => {
    if (!o.isMesh) return;
    const chain = [];
    let q = o;
    while (q) { chain.push(q.name); q = q.parent; }
    const isInt = chain.some(x => internal.test(x || ''));
    o.material = isInt ? matInt : o.material.opacity < 1 ? matGlass : matBody;
    o.renderOrder = 2;
  });
  xray.visible = false;

  // movable parts (original model only)
  const shell = [];
  under.children.forEach(ch => {
    if (/^Body|License|HoodPivot/.test(ch.name)) shell.push(ch);
  });
  const interior = under.children.filter(ch => /^Interior/.test(ch.name));
  const wheels = ['WheelFrontL', 'WheelFrontR', 'WheelRearL', 'WheelRearR'].map(byName).filter(Boolean);
  const engine = byName('Engine');
  const doors = ['BodyDoorLColor1', 'BodyDoorRColor1'].map(byName).filter(Boolean);
  const store = o => { o.userData.rest = { p: o.position.clone(), q: o.quaternion.clone() }; return o; };
  [...shell, ...interior, ...wheels, engine, ...doors].filter(Boolean).forEach(store);
  const pivot = root.getObjectByName('HoodPivot');
  if (pivot) store(pivot);
  parts = { under, shell, interior, wheels, engine, doors, pivot };

  // label anchors: center of each node's geometry, stored in node space
  root.updateMatrixWorld(true);
  anchors = LABELS.map(l => {
    const node = byName(l.node);
    if (!node) return null;
    const b = new THREE.Box3().setFromObject(node);
    const cw = b.getCenter(new THREE.Vector3());
    return { node, local: node.worldToLocal(cw.clone()), off: new THREE.Vector3(...l.off), def: l };
  });
}

/* --------------------- timeline --------------------- */
// [p, azimuth°, elevation°, distance, targetY]
const CAM = [
  [0.00, 36, 8, 9.6, 0.55],
  [0.08, 46, 9, 9.6, 0.55],
  [0.17, 74, 6, 12.4, 0.6],
  [0.36, 80, 8, 12.4, 0.6],
  [0.44, 52, 16, 12.2, 0.85],
  [0.53, 36, 22, 12.8, 1.1],
  [0.61, 26, 26, 13.0, 1.1],
  [0.68, 8, 5, 8.4, 0.55],
  [0.79, -6, 3, 7.6, 0.5],
  [0.86, -55, 11, 11.4, 0.6],
  [1.00, -205, 12, 11.6, 0.6],
];
function camAt(p) {
  let i = 0;
  while (i < CAM.length - 2 && p > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1];
  const t = smooth(ramp(p, a[0], b[0]));
  return a.map((v, k) => lerp(v, b[k], t));
}

const SCAN_FRONT = 2.75, SCAN_BACK = -2.75;
function scanAt(p) {
  if (p < 0.19) return SCAN_FRONT;
  if (p < 0.33) return lerp(SCAN_FRONT, SCAN_BACK, smooth(ramp(p, 0.19, 0.33)));
  if (p < 0.37) return SCAN_BACK;
  if (p < 0.43) return lerp(SCAN_BACK, SCAN_FRONT, smooth(ramp(p, 0.37, 0.43)));
  return SCAN_FRONT;
}

let vw = 0, vh = 0, mobile = false, offFrac = 0.18, offY = 0.27;
const OFFY = [[0, 0.25], [0.09, 0.25], [0.16, 0.1], [0.62, 0.12], [0.68, 0.0], [0.83, 0.0], [0.88, -0.02], [1, -0.02]];
function offYAt(p) {
  let i = 0;
  while (i < OFFY.length - 2 && p > OFFY[i + 1][0]) i++;
  return lerp(OFFY[i][1], OFFY[i + 1][1], smooth(ramp(p, OFFY[i][0], OFFY[i + 1][0])));
}
function layout() {
  vw = stage.clientWidth;
  vh = stage.clientHeight;
  mobile = vw < 760;
  if (!renderer) return;
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(vw, vh, false);
  camera.aspect = vw / vh;
  // push the car away from the text column
  const rtl = document.documentElement.dir === 'rtl';
  if (mobile) camera.setViewOffset(vw, vh, 0, -vh * offY, vw, vh);
  else if (vw / vh > 1.15) camera.setViewOffset(vw, vh, (rtl ? 1 : -1) * vw * offFrac, 0, vw, vh);
  else camera.setViewOffset(vw, vh, 0, -vh * 0.12, vw, vh);
  camera.updateProjectionMatrix();
  stage.style.setProperty('--spot-x', mobile ? '50%' : rtl ? '35%' : '65%');
  needsLayout = false;
}

/* --------------------- per-frame update --------------------- */
const panels = {};
$$('[data-panel]').forEach(el => (panels[el.dataset.panel] = el));
const repItems = $$('.rep-list li');
const repBadge = $('.rep-badge');
const ecuStage = $('#ecuStage');
const ecuLen = ecuStage.getTotalLength ? ecuStage.getTotalLength() : 400;
ecuStage.style.strokeDasharray = ecuLen;
const railItems = $$('#rail li');
const tmp = new THREE.Vector3();

function setPanel(el, op, dy = 26) {
  if (!el) return;
  if (el._op === op) return;
  el._op = op;
  el.style.opacity = op;
  el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
  const base = el.classList.contains('panel') && !mobile ? 'translateY(-50%) ' : '';
  el.style.transform = `${base}translateY(${((1 - op) * dy).toFixed(1)}px)`;
}

function updateDOM(p) {
  setPanel(panels.hero, 1 - ramp(p, 0.045, 0.095), -30);
  setPanel(panels.cue, 1 - ramp(p, 0.005, 0.03), 0);
  setPanel(panels.s1, ramp(p, 0.135, 0.175) * (1 - ramp(p, 0.365, 0.405)));
  setPanel(panels.s2, ramp(p, 0.445, 0.485) * (1 - ramp(p, 0.6, 0.635)));
  setPanel(panels.s3, ramp(p, 0.655, 0.69) * (1 - ramp(p, 0.79, 0.825)));
  setPanel(panels.s4, ramp(p, 0.84, 0.875));
  setPanel(panels.ecu, ramp(p, 0.675, 0.71) * (1 - ramp(p, 0.79, 0.825)), 40);
  setPanel(panels.report, ramp(p, 0.85, 0.885), 40);

  ecuStage.style.strokeDashoffset = (ecuLen * (1 - ease(ramp(p, 0.69, 0.77)))).toFixed(1);
  repItems.forEach((li, i) => li.classList.toggle('done', p > 0.875 + i * 0.016));
  repBadge.classList.toggle('on', p > 0.975);

  const step = p < 0.42 ? 1 : p < 0.64 ? 2 : p < 0.83 ? 3 : 4;
  $('#rail').classList.toggle('on', p > 0.12 && p < 0.995);
  railItems.forEach(li => li.classList.toggle('on', +li.dataset.step === step));
  $('#progress').style.transform = `scaleX(${p.toFixed(4)})`;

  const scanning = p > 0.185 && p < 0.34;
  const sl = $('#scanLabel');
  sl.style.opacity = scanning ? 1 : 0;
  $('#scanPct').textContent = Math.round(ramp(p, 0.19, 0.33) * 100) + '%';
}

function updateScene(p, t) {
  if (!car) return;
  const of = lerp(0.18, 0.07, smooth(ramp(p, 0.83, 0.88)));
  const oy = offYAt(p);
  if (Math.abs(of - offFrac) > 0.0005 || (mobile && Math.abs(oy - offY) > 0.0005)) { offFrac = of; offY = oy; layout(); }
  // camera
  const [, az0, el, dist0, ty] = camAt(p);
  const az = (az0 + Math.sin(t * 0.00025) * 2.2) * D2R;
  const e = el * D2R;
  let dist = dist0;
  const aspect = vw / vh;
  if (aspect < 1.25) {
    const hfov = 2 * Math.atan(Math.tan((camera.fov * D2R) / 2) * aspect);
    const span = 2.8 + 2.0 * Math.abs(Math.sin(az));
    dist = Math.max(dist, (span / 2) / Math.tan(hfov / 2) * 1.12);
  }
  camera.position.set(Math.sin(az) * Math.cos(e) * dist, ty + Math.sin(e) * dist, Math.cos(az) * Math.cos(e) * dist);
  camera.lookAt(0, ty, 0);

  // parts: doors + hood open, then explode
  const open = ease(ramp(p, 0.43, 0.49)) * (1 - ease(ramp(p, 0.615, 0.665)));
  const ex = ease(ramp(p, 0.48, 0.56)) * (1 - ease(ramp(p, 0.6, 0.655)));
  const { shell, interior, wheels, engine, doors, pivot } = parts;
  // local frame of BodyUnderside: +z is up, ±x is the side
  shell.forEach(o => { const r = o.userData.rest; o.position.copy(r.p); o.position.z += ex * 1.05; });
  interior.forEach(o => { const r = o.userData.rest; o.position.copy(r.p); o.position.z += ex * 0.2; });
  if (engine) { engine.position.copy(engine.userData.rest.p); engine.position.z += ex * 0.42; }
  wheels.forEach(o => {
    const r = o.userData.rest;
    o.position.copy(r.p);
    o.position.x += Math.sign(r.p.x) * ex * 0.6;
    o.position.z -= ex * 0.05;
  });
  doors.forEach(o => {
    const r = o.userData.rest;
    o.quaternion.copy(r.q);
    o.rotateX(open * 1.15);
    o.rotateY(Math.sign(r.p.x) * open * 0.12);
  });
  if (pivot) {
    pivot.quaternion.copy(pivot.userData.rest.q);
    pivot.rotateX(-open * 1.05 - ex * 0.25);
  }
  shadow.material.opacity = 1 - ex * 0.45;

  // scanner + x-ray
  const s = scanAt(p);
  const scanActive = s < SCAN_FRONT - 0.01;
  planeN.constant = scanActive ? s : 100;
  planeX.constant = scanActive ? -s : -100;
  xray.visible = scanActive;
  xrayMats.forEach(m => (m.uniforms.uScan.value = s));
  const moving = (p > 0.185 && p < 0.335) || (p > 0.365 && p < 0.435);
  laser.visible = moving && scanActive && s > SCAN_BACK + 0.01;
  laser.position.z = s;
  laserSheet.material.opacity = 0.42 + Math.sin(t * 0.012) * 0.08;

  // ECU: lights + streaks
  const ecu = ramp(p, 0.665, 0.71) * (1 - ramp(p, 0.8, 0.84));
  const pulse = 0.5 + 0.5 * Math.sin(t * 0.006);
  headMats.forEach(m => (m.emissiveIntensity = 1.1 + ecu * (2.4 + pulse * 1.6)));
  ring.userData.ringMat.opacity = 0.45 + ecu * 0.5 * (0.6 + 0.4 * pulse);
  ring.userData.glow.material.opacity = 0.8 + ecu * 0.6;
  streaks.material.opacity = ecu * 0.75;
  if (ecu > 0.001) {
    const arr = streaks.geometry.attributes.position.array;
    streaks.userData.seeds.forEach((sd, i) => {
      let z = ((sd.z - t * 0.012 * sd.sp) % 16 + 16) % 16 - 8;
      arr.set([sd.x, sd.y, z, sd.x, sd.y, z + sd.len], i * 6);
    });
    streaks.geometry.attributes.position.needsUpdate = true;
  }
  ring.rotation.y = t * 0.0001;

  renderer.render(scene, camera);
  placeLabels(p, s);
}

function placeLabels(p, s) {
  const g1 = p > 0.185 && p < 0.42;
  const g2 = p > 0.535 && p < 0.605;
  anchors.forEach(a => {
    if (!a) return;
    const el = a.def.el;
    if (!el) return;
    a.node.localToWorld(tmp.copy(a.local));
    tmp.add(a.off);
    let on = false;
    if (a.def.grp === 1) on = g1 && tmp.z > s + 0.05;
    if (a.def.grp === 2) on = g2;
    if (on) {
      tmp.project(camera);
      if (tmp.z > 1) on = false;
      const x = (tmp.x * 0.5 + 0.5) * vw;
      const y = (-tmp.y * 0.5 + 0.5) * vh;
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    }
    if (el._on !== on) { el._on = on; el.style.opacity = on ? 1 : 0; }
  });
}

/* --------------------- loop --------------------- */
let pTarget = 0, pCur = 0, last = performance.now(), recTime = 0, stageVisible = true;
function storyProgress() {
  const r = story.getBoundingClientRect();
  const total = story.offsetHeight - innerHeight;
  return clamp(-r.top / total);
}

function tick(now) {
  if (needsLayout) layout();
  pTarget = storyProgress();
  const dt = Math.min(64, now - last);
  last = now;
  pCur = RECORD ? pTarget : pCur + (pTarget - pCur) * (1 - Math.exp(-dt / 110));
  if (Math.abs(pTarget - pCur) < 0.00005) pCur = pTarget;
  const t = RECORD ? recTime : now;
  updateDOM(pCur);
  if (glOK && stageVisible) updateScene(pCur, t);
  formatCounters();
  $('#nav').classList.toggle('solid', scrollY > 40);
}

function loop(now) {
  requestAnimationFrame(loop);
  tick(now);
}

// deterministic hook used for the pitch video recording
// CSS animations/transitions are paused and stepped so every frame is exact.
window.__renderAt = (ms, dt = 1000 / 30) => {
  recTime = ms;
  document.getAnimations().forEach(a => {
    if (a.timeline !== document.timeline) return;
    if (a.playState !== 'paused') a.pause();
    if (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) a.currentTime = (a.currentTime || 0) + dt;
    else a.currentTime = ms;
  });
  tick(performance.now());
  return true;
};

/* --------------------- boot --------------------- */
function decodeCar() {
  const raw = $('#car-data').textContent.trim();
  if (raw && raw[0] !== '%') {
    const bin = atob(raw);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return Promise.resolve(out.buffer);
  }
  return fetch('../model/car.glb').then(r => r.arrayBuffer());
}

async function boot() {
  let saved = 'fr';
  try { saved = localStorage.getItem('em-lang') || 'fr'; } catch (e) { /* ignore */ }
  const q = new URLSearchParams(location.search).get('lang');
  applyLang(q === 'ar' || q === 'fr' ? q : saved);
  $$('.lang button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  $('#discover').addEventListener('click', e => {
    e.preventDefault();
    const total = story.offsetHeight - innerHeight;
    scrollTo({ top: story.offsetTop + total * 0.3, behavior: 'smooth' });
  });
  addEventListener('resize', () => (needsLayout = true));
  setInterval(updateOpen, 60000);
  new IntersectionObserver(([en]) => (stageVisible = en.isIntersecting)).observe(story);

  if (initGL()) {
    layout();
    try {
      const buf = await decodeCar();
      const loader = new GLTFLoader();
      loader.setMeshoptDecoder(MeshoptDecoder);
      const gltf = await loader.parseAsync(buf, '');
      setupCar(gltf);
      renderer.compile(scene, camera);
    } catch (err) {
      console.error(err);
      glOK = false;
    }
  }
  tick(performance.now());
  document.body.classList.add('ready');
  window.__ready = true;
  if (!RECORD) requestAnimationFrame(loop);
}

boot();
