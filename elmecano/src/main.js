import { I18N } from './i18n.js';
import { EXTRA } from './i18n-extra.js';
import { COURSES, CONSULT, CITIES, GUARANTEE } from './courses.js';

/* ------------------------------------------------------------------ *
 *  El Mecano — scroll-driven image story + academy + sign-up popup
 *  Scrolling through #story (p: 0 → 1) drives the keyframe images,
 *  the scanner wipe, labels and overlay cards. ?record = frame-exact.
 * ------------------------------------------------------------------ */

const RECORD = /[?&]record\b/.test(location.search);
const PHONE = '21652351490';
const API = '/api/demandes';
Object.keys(EXTRA).forEach(l => Object.assign(I18N[l], EXTRA[l]));

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ramp = (p, a, b) => clamp((p - a) / (b - a));
const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const smooth = t => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let lang = 'fr';
const T = k => I18N[lang][k] ?? I18N.fr[k] ?? k;
const L = o => (o ? o[lang] ?? o.fr : '');

/* ============================ content ============================ */
const REVIEWS = [
  { n: 'Hela Ben Bakir', d: { fr: 'Août 2026', ar: 'أوت 2026' }, t: 'Je voulais vraiment vous remercier pour vos précieux conseils et pour le temps que vous m’avez accordé. Votre disponibilité, votre réactivité et surtout votre expertise m’ont beaucoup aidée à faire le bon choix. C’est rassurant de pouvoir compter sur quelqu’un de compétent et de confiance.' },
  { n: 'Mohamed Haykel Ayadi', d: { fr: 'Août 2026', ar: 'أوت 2026' }, t: 'Excellente adresse ! Il a pris le temps de m’écouter pendant une vingtaine de minutes, de répondre à toutes mes questions et de me conseiller, sans rien demander en retour ! Professionnel, honnête et très serviable. Je recommande sans hésitation.' },
  { n: 'Rihab Sellami', d: { fr: 'Août 2026', ar: 'أوت 2026' }, t: 'Ena mchit awel marra w mra wa7di wost errjel w houma ma5alewnich n7ess jemla eli ena menich à l’aise w fassrouli kol chay bkol torbiya w wes3 bel ✌️ Merci elmecano garage ♥️' },
  { n: 'Nafa Ben Haddej', d: { fr: 'Juillet 2026', ar: 'جويلية 2026' }, t: 'Equipe pro yaarfou fech yaamlou et surtt metrobin barcha. Lwehed yefra7 ki yal9a nes mazelet haka fi tounes. Rabi ywafa9kom.' },
  { n: 'Wissem Abidli', d: { fr: 'Juillet 2026', ar: 'جويلية 2026' }, t: 'Travail extraordinaire.' },
  { n: 'Ben Chhida Azmy', d: { fr: 'Juin 2026', ar: 'جوان 2026' }, t: 'Expérience 10/10.' },
];

const ICONS = {
  pack: '<path d="M2.5 9 12 4.5 21.5 9 12 13.5 2.5 9Z"/><path d="M6.5 11v4.5c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3V11"/><path d="M21.5 9v5"/>',
  diag: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M6.5 11h2.2l1.3-2.6 2 5.2 1.4-2.6h4.1"/><path d="M9 20h6M12 17v3"/>',
  ecu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2.5v3.5M15 2.5v3.5M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
  hybrid: '<rect x="3" y="7" width="16" height="10" rx="2"/><path d="M19 10.5h2v3h-2"/><path d="M11.5 8.8 8.8 12.4h3.4l-2.7 3.6"/>',
};
const icon = k => `<svg viewBox="0 0 24 24">${ICONS[k] || ''}</svg>`;

function renderCourses() {
  const fmt = n => n.toLocaleString(lang === 'ar' ? 'ar-TN' : 'fr-FR').replace(/ | /g, ' ');
  $('#courseGrid').innerHTML = COURSES.map(c => `
    <article class="course${c.featured ? ' featured' : ''} reveal" data-course="${c.id}">
      <div class="course-top">
        <span class="course-ic">${icon(c.icon)}</span>
        <span class="course-badge">${esc(L(c.badge))}</span>
      </div>
      <h3>${esc(L(c.title))}</h3>
      <p class="course-tag">${esc(L(c.tagline))}</p>
      <div class="course-chips">${c.chips.map(x => `<span>${esc(L(x))}</span>`).join('')}</div>
      <ul class="course-list">${c.bullets.map(b => `<li>${esc(L(b))}</li>`).join('')}</ul>
      <div class="course-foot">
        <div class="price">${c.oldPrice ? `<s>${fmt(c.oldPrice)} ${T('courses.currency')}</s>` : ''}<b>${fmt(c.price)}</b><span>${T('courses.currency')}</span></div>
        <div class="course-btns">
          <button class="btn btn-ghost btn-sm" data-program="${c.id}" type="button">${T('courses.program')}</button>
          <button class="btn btn-red btn-sm js-signup" data-type="${c.id}" type="button">${T('courses.signup')}</button>
        </div>
      </div>
    </article>`).join('');
  $('#guaranteeText').textContent = L(GUARANTEE);
}

function renderReviews() {
  const track = $('#reviewsTrack');
  const card = r => {
    const ini = r.n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return `<article class="rev"><div class="rev-top"><div class="rev-who"><span class="rev-av">${ini}</span><div><b>${esc(r.n)}</b><small>${r.d[lang]}</small></div></div><span class="stars">★★★★★</span></div><p dir="auto">${esc(r.t)}</p></article>`;
  };
  const html = REVIEWS.map(card).join('');
  track.innerHTML = html + html;
  track.querySelectorAll('.rev').forEach((el, i) => i >= REVIEWS.length && el.setAttribute('aria-hidden', 'true'));
}

function updateOpen() {
  const badge = $('#openBadge');
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Tunis', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
  const get = t => parts.find(x => x.type === t)?.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  const m = +get('hour') * 60 + +get('minute');
  const slots = day === 0 ? [] : day === 6 ? [[510, 720]] : [[540, 720], [780, 900]];
  const open = slots.some(([a, b]) => m >= a && m < b);
  badge.className = 'open-badge ' + (open ? 'is-open' : 'is-shut');
  badge.querySelector('span').textContent = T(open ? 'hours.open' : 'hours.shut');
  $$('.hours li').forEach(li => {
    const d = li.dataset.day;
    li.classList.toggle('today', d === String(day) || (d === '1-5' && day >= 1 && day <= 5));
  });
}

function applyLang(l) {
  lang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => {
    const v = I18N[l][el.dataset.i18n];
    if (v != null) el.innerHTML = v;
  });
  document.title = T('meta.title');
  $$('.lang button').forEach(b => b.classList.toggle('on', b.dataset.lang === l));
  const wa = `https://wa.me/${PHONE}?text=${encodeURIComponent(T('wa.msg'))}`;
  $$('.js-wa').forEach(a => (a.href = wa));
  renderReviews();
  renderCourses();
  updateOpen();
  buildLabels();
  formatCounters(true);
  if (!$('#modal').hidden) closeModal();
  try { localStorage.setItem('em-lang', l); } catch (e) { /* private mode */ }
  needsLayout = true;
}

/* ====================== story: keyframe images ====================== */
// Labels are anchored on the keyframe images in normalised coordinates (0..1).
const LABELS = [
  { id: 'engine', grp: 1, k: 1, x: 0.30, y: 0.47, h: 96, hm: 58, t: 'l1.engine', v: 'l1.engine.v', cls: 'ok' },
  { id: 'brakes', grp: 1, k: 1, x: 0.32, y: 0.62, h: 34, hm: 18, t: 'l1.brakes', v: 'l1.brakes.v', cls: 'warn' },
  { id: 'battery', grp: 1, k: 1, x: 0.37, y: 0.44, h: 150, hm: 98, t: 'l1.battery', v: 'l1.battery.v', cls: 'ok' },
  { id: 'elec', grp: 1, k: 1, x: 0.46, y: 0.45, h: 46, hm: 138, t: 'l1.elec', v: 'l1.elec.v', cls: 'ok' },
  { id: 'susp', grp: 1, k: 1, x: 0.68, y: 0.58, h: 60, hm: 40, t: 'l1.susp', v: 'l1.susp.v', cls: 'ok' },
  { id: 'body', grp: 2, k: 2, x: 0.56, y: 0.22, h: 40, hm: 30, t: 'l2.body', cls: 'red' },
  { id: 'engine2', grp: 2, k: 2, x: 0.40, y: 0.62, h: 40, hm: 30, t: 'l2.engine', cls: 'red' },
  { id: 'cabin', grp: 2, k: 2, x: 0.55, y: 0.45, h: 40, hm: 30, t: 'l2.cabin', cls: 'red' },
  { id: 'trans', grp: 2, k: 2, x: 0.60, y: 0.62, h: 70, hm: 50, t: 'l2.trans', cls: 'red' },
  { id: 'brk2', grp: 2, k: 2, x: 0.56, y: 0.83, h: 40, hm: 30, t: 'l2.brakes', cls: 'red' },
];

function buildLabels() {
  $('#labels').innerHTML = LABELS.map(l => `<div class="lbl ${l.cls}" data-id="${l.id}" style="--h:${l.h}px;--hm:${l.hm}px"><span class="stem"></span><span class="pin"></span><div class="box">${T(l.t)}${l.v ? `<small>${T(l.v)}</small>` : ''}</div></div>`).join('');
  LABELS.forEach(l => (l.el = $(`#labels [data-id="${l.id}"]`)));
}

const stage = $('#stage');
const story = $('#story');
const framesBox = $('#frames');
const frames = $$('#frames .fr');
const scanbar = $('#scanbar');
let vw = 0, vh = 0, mobile = false, needsLayout = true;

function layout() {
  vw = stage.clientWidth;
  vh = stage.clientHeight;
  mobile = vw < 760;
  stage.style.setProperty('--spot-x', mobile ? '50%' : document.documentElement.dir === 'rtl' ? '36%' : '64%');
  needsLayout = false;
}

// mobile: vertical centre of the car per step (fraction of the screen height)
const MOB_Y = [[0, 0.71], [0.09, 0.71], [0.16, 0.6], [0.62, 0.6], [0.68, 0.53], [0.83, 0.5], [0.88, 0.47], [1, 0.47]];
function track(points, p) {
  let i = 0;
  while (i < points.length - 2 && p > points[i + 1][0]) i++;
  return lerp(points[i][1], points[i + 1][1], smooth(ramp(p, points[i][0], points[i + 1][0])));
}

// the frame box (16:9) position for progress p
function boxAt(p) {
  const rtl = document.documentElement.dir === 'rtl';
  if (mobile) {
    const w = vw * 1.22;
    return { w, h: w * 9 / 16, cx: vw / 2, cy: vh * track(MOB_Y, p) };
  }
  const end = smooth(ramp(p, 0.83, 0.88));
  const w = Math.min(vw * lerp(0.62, 0.52, end), (vh - 90) * 1.7);
  const cx = vw * (rtl ? lerp(0.36, 0.44, end) : lerp(0.64, 0.56, end));
  return { w, h: w * 9 / 16, cx, cy: vh * 0.54 };
}

// opacity / scale / clip of every keyframe for progress p
function framesAt(p) {
  const scan = smooth(ramp(p, 0.17, 0.33));
  const f = [
    { o: 1, s: lerp(1.07, 1, ease(ramp(p, 0, 0.12))) },
    { o: scan > 0 ? 1 : 0, s: 1, clip: scan },
    { o: ramp(p, 0.4, 0.47), s: lerp(1.08, 1, ease(ramp(p, 0.4, 0.52))) },
    { o: ramp(p, 0.62, 0.68), s: lerp(1.16, 1, ease(ramp(p, 0.62, 0.76))) },
    { o: ramp(p, 0.82, 0.87), s: lerp(1.05, 1, ease(ramp(p, 0.82, 1))), x: lerp(-0.015, 0.015, ramp(p, 0.82, 1)) },
  ];
  return { f, scan };
}

const panels = {};
$$('[data-panel]').forEach(el => (panels[el.dataset.panel] = el));
const repItems = $$('.rep-list li');
const repBadge = $('.rep-badge');
const ecuStage = $('#ecuStage');
const ecuLen = ecuStage.getTotalLength ? ecuStage.getTotalLength() : 400;
ecuStage.style.strokeDasharray = ecuLen;
const railItems = $$('#rail li');

function setPanel(el, op, dy = 26) {
  if (!el || el._op === op) return;
  el._op = op;
  el.style.opacity = op;
  el.style.visibility = op < 0.01 ? 'hidden' : 'visible';
  const base = el.classList.contains('panel') && !mobile ? 'translateY(-50%) ' : '';
  el.style.transform = `${base}translateY(${((1 - op) * dy).toFixed(1)}px)`;
}

function updateStory(p) {
  // text panels and cards
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
  const scanning = p > 0.17 && p < 0.335;
  $('#scanLabel').style.opacity = scanning ? 1 : 0;
  $('#scanPct').textContent = Math.round(ramp(p, 0.17, 0.33) * 100) + '%';

  // keyframes
  const b = boxAt(p);
  framesBox.style.cssText = `width:${b.w.toFixed(1)}px;height:${b.h.toFixed(1)}px;transform:translate(${(b.cx - b.w / 2).toFixed(1)}px,${(b.cy - b.h / 2).toFixed(1)}px)`;
  const { f, scan } = framesAt(p);
  let covered = false;
  for (let i = f.length - 1; i >= 0; i--) {
    const el = frames[i], st = f[i];
    const vis = !covered && st.o > 0.001;
    el.style.visibility = vis ? 'visible' : 'hidden';
    if (vis) {
      el.style.opacity = st.o.toFixed(3);
      el.style.transform = `translateX(${((st.x || 0) * 100).toFixed(2)}%) scale(${st.s.toFixed(4)})`;
      el.style.clipPath = st.clip !== undefined ? `inset(0 ${((1 - st.clip) * 100).toFixed(2)}% 0 0)` : '';
    }
    if (st.o >= 0.999 && st.clip === undefined) covered = true;
  }
  scanbar.style.opacity = scanning && scan < 0.995 ? 1 : 0;
  scanbar.style.left = (scan * 100).toFixed(2) + '%';

  // labels
  const g1 = p > 0.19 && p < 0.41;
  const g2 = p > 0.5 && p < 0.61;
  LABELS.forEach(l => {
    if (!l.el) return;
    let on = l.grp === 1 ? g1 && scan >= l.x : g2;
    if (on) {
      const s = f[l.k].s;
      const x = b.cx + (l.x - 0.5) * b.w * s;
      const y = b.cy + (l.y - 0.5) * b.h * s;
      if (x < 8 || x > vw - 8) on = false;
      l.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    }
    if (l.el._on !== on) { l.el._on = on; l.el.style.opacity = on ? 1 : 0; }
  });
}

/* ====================== counters ====================== */
const counters = $$('[data-count]');
function formatCounters(force) {
  counters.forEach(el => {
    const r = el.getBoundingClientRect();
    const t = ease(ramp(innerHeight - r.top, innerHeight * 0.05, innerHeight * 0.45));
    const key = (parseFloat(el.dataset.count) * t).toFixed(+(el.dataset.dec || 0));
    if (force || el._k !== key) {
      el._k = key;
      el.textContent = lang === 'fr' ? key.replace('.', ',') : key;
    }
  });
}

/* ====================== modal: course details + sign-up ====================== */
const modal = $('#modal');
const body = $('#modalBody');
let lastFocus = null;

function openModal(html) {
  lastFocus = document.activeElement;
  body.innerHTML = html;
  modal.hidden = false;
  document.documentElement.classList.add('modal-open');
  requestAnimationFrame(() => modal.classList.add('in'));
  const first = body.querySelector('input, select, button.btn');
  if (first && !mobile) first.focus();
}
function closeModal() {
  modal.classList.remove('in');
  document.documentElement.classList.remove('modal-open');
  modal.hidden = true;
  body.innerHTML = '';
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function showProgram(id) {
  const c = COURSES.find(x => x.id === id);
  if (!c) return;
  const fmt = n => n.toLocaleString(lang === 'ar' ? 'ar-TN' : 'fr-FR').replace(/ | /g, ' ');
  openModal(`
    <div class="m-head">
      <span class="course-ic">${icon(c.icon)}</span>
      <div><span class="course-badge">${esc(L(c.badge))}</span><h2 id="modalTitle">${esc(L(c.title))}</h2></div>
    </div>
    <p class="m-lead">${esc(L(c.tagline))}</p>
    <h3 class="m-sub">${T('courses.modules')}</h3>
    <ol class="m-modules">${c.modules.map(m => `<li><b>${esc(L(m.t))}</b><span>${esc(L(m.d))}</span></li>`).join('')}</ol>
    <h3 class="m-sub">${T('courses.perks')}</h3>
    <div class="m-perks">${c.perks.map(m => `<div><b>${esc(L(m.t))}</b><span>${esc(L(m.d))}</span></div>`).join('')}</div>
    <div class="m-foot">
      <div class="price">${c.oldPrice ? `<s>${fmt(c.oldPrice)} ${T('courses.currency')}</s>` : ''}<b>${fmt(c.price)}</b><span>${T('courses.currency')}</span><small>${esc(L(GUARANTEE))}</small></div>
      <button class="btn btn-red js-signup" data-type="${c.id}" type="button">${T('courses.signupThis')}</button>
    </div>`);
}

function showForm(type = '') {
  const opts = [...COURSES.map(c => [c.id, `${L(c.title)} — ${c.price} ${T('courses.currency')}`]), [CONSULT.id, L(CONSULT.title)]];
  openModal(`
    <h2 id="modalTitle" class="f-title">${T('form.title')}</h2>
    <p class="m-lead">${T('form.sub')}</p>
    <form class="f" id="signupForm" novalidate>
      <div class="f-row"><label for="f-nom">${T('form.name')} *</label><input id="f-nom" name="nom" autocomplete="name" required maxlength="80"><em></em></div>
      <div class="f-2">
        <div class="f-row"><label for="f-tel">${T('form.phone')} *</label><input id="f-tel" name="telephone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+216 •• ••• •••" dir="ltr" required maxlength="30"><em></em></div>
        <div class="f-row"><label for="f-email">${T('form.email')} *</label><input id="f-email" name="email" type="email" autocomplete="email" dir="ltr" required maxlength="120"><em></em></div>
      </div>
      <div class="f-2">
        <div class="f-row"><label for="f-ville">${T('form.city')} *</label><input id="f-ville" name="ville" list="f-cities" autocomplete="address-level2" placeholder="${T('form.city.ph')}" required maxlength="60"><em></em>
          <datalist id="f-cities">${CITIES.map(c => `<option value="${c}">`).join('')}</datalist></div>
        <div class="f-row"><label for="f-type">${T('form.type')} *</label><select id="f-type" name="formation" required><option value="">${T('form.type.ph')}</option>${opts.map(([v, t]) => `<option value="${v}"${v === type ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select><em></em></div>
      </div>
      <div class="f-row"><label for="f-msg">${T('form.msg')}</label><textarea id="f-msg" name="message" rows="3" maxlength="1000" placeholder="${T('form.msg.ph')}"></textarea></div>
      <label class="f-check"><input type="checkbox" name="consent" required><span>${T('form.consent')}</span></label>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <p class="f-err" id="f-err" role="alert"></p>
      <button class="btn btn-red f-submit" type="submit">${T('form.submit')}</button>
    </form>`);
  const form = $('#signupForm');
  form.dataset.t0 = String(Date.now());
  form.addEventListener('submit', submitForm);
  form.addEventListener('input', e => { const em = e.target.parentElement.querySelector('em'); if (em) em.textContent = ''; e.target.classList.remove('bad'); });
}

function waFor(d) {
  const type = d.formation === 'consult' ? L(CONSULT.title) : L((COURSES.find(c => c.id === d.formation) || {}).title);
  const lines = [T('form.wa.msg'), '', `${T('form.name')} : ${d.nom}`, `${T('form.phone')} : ${d.telephone}`, `${T('form.email')} : ${d.email}`, `${T('form.city')} : ${d.ville}`, `${T('form.type')} : ${type}`];
  if (d.message) lines.push('', d.message);
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

async function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const d = Object.fromEntries(['nom', 'telephone', 'email', 'ville', 'formation', 'message'].map(k => [k, String(fd.get(k) || '').trim()]));
  const bad = (name, msg) => { const el = form.elements[name]; el.classList.add('bad'); el.parentElement.querySelector('em').textContent = msg; return el; };
  const errs = [];
  if (d.nom.length < 2) errs.push(bad('nom', T('form.required')));
  const digits = d.telephone.replace(/\D/g, '');
  if (!d.telephone) errs.push(bad('telephone', T('form.required')));
  else if (digits.length < 8 || digits.length > 15) errs.push(bad('telephone', T('form.badPhone')));
  if (!d.email) errs.push(bad('email', T('form.required')));
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errs.push(bad('email', T('form.badEmail')));
  if (d.ville.length < 2) errs.push(bad('ville', T('form.required')));
  if (!d.formation) errs.push(bad('formation', T('form.required')));
  const consent = form.elements.consent.checked;
  form.querySelector('.f-check').classList.toggle('bad', !consent);
  if (errs.length || !consent) { (errs[0] || form.elements.consent).focus(); return; }

  const btn = form.querySelector('.f-submit');
  btn.disabled = true;
  btn.textContent = T('form.sending');
  let status = 0;
  try {
    const r = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...d, consent: true, langue: lang, website: fd.get('website') || '', elapsed: Date.now() - +form.dataset.t0 }),
    });
    status = r.status;
  } catch (err) { status = 0; }

  const first = esc(d.nom.split(' ')[0]);
  if (status === 201 || status === 200) {
    body.innerHTML = `<div class="f-done"><span class="f-ok"><svg viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg></span><h2 id="modalTitle">${T('form.ok.title')}</h2><p>${first}, ${T('form.ok.text')}</p>
      <div class="btns center"><a class="btn btn-ghost" href="${esc(waFor(d))}" target="_blank" rel="noopener">${T('form.wa')}</a><button class="btn btn-red" data-close type="button">${T('form.close')}</button></div></div>`;
  } else {
    body.innerHTML = `<div class="f-done"><span class="f-ok warn">!</span><h2 id="modalTitle">${T('form.fail.title')}</h2><p>${T(status === 429 ? 'form.rate' : 'form.fail.text')}</p>
      <div class="btns center"><a class="btn btn-red" href="${esc(waFor(d))}" target="_blank" rel="noopener">${T('form.wa')}</a><button class="btn btn-ghost" data-close type="button">${T('form.close')}</button></div></div>`;
  }
}

document.addEventListener('click', e => {
  const sign = e.target.closest('.js-signup');
  if (sign) { e.preventDefault(); showForm(sign.dataset.type || ''); return; }
  const prog = e.target.closest('[data-program]');
  if (prog) { showProgram(prog.dataset.program); return; }
  if (e.target.closest('[data-close]')) closeModal();
});
addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

/* ====================== loop ====================== */
let pTarget = 0, pCur = 0, last = performance.now();
function storyProgress() {
  const r = story.getBoundingClientRect();
  return clamp(-r.top / (story.offsetHeight - innerHeight));
}

function tick(now) {
  if (needsLayout) layout();
  pTarget = storyProgress();
  const dt = Math.min(64, now - last);
  last = now;
  pCur = RECORD ? pTarget : pCur + (pTarget - pCur) * (1 - Math.exp(-dt / 90));
  if (Math.abs(pTarget - pCur) < 0.00005) pCur = pTarget;
  updateStory(pCur);
  formatCounters();
  $('#nav').classList.toggle('solid', scrollY > 40);
}
function loop(now) {
  requestAnimationFrame(loop);
  tick(now);
}

// deterministic hook used for the pitch video recording
window.__renderAt = (ms, dt = 1000 / 30) => {
  document.getAnimations().forEach(a => {
    if (a.timeline !== document.timeline) return;
    if (a.playState !== 'paused') a.pause();
    if (typeof CSSTransition !== 'undefined' && a instanceof CSSTransition) a.currentTime = (a.currentTime || 0) + dt;
    else a.currentTime = ms;
  });
  tick(performance.now());
  return true;
};

/* ====================== boot ====================== */
function boot() {
  let saved = 'fr';
  try { saved = localStorage.getItem('em-lang') || 'fr'; } catch (e) { /* ignore */ }
  const q = new URLSearchParams(location.search).get('lang');
  applyLang(q === 'ar' || q === 'fr' ? q : saved);
  $$('.lang button').forEach(b => b.addEventListener('click', () => applyLang(b.dataset.lang)));
  addEventListener('resize', () => (needsLayout = true));
  setInterval(updateOpen, 60000);
  const ready = () => {
    if (window.__ready) return;
    tick(performance.now());
    document.body.classList.add('ready');
    window.__ready = true;
    if (!RECORD) requestAnimationFrame(loop);
  };
  Promise.all(frames.map(img => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()))).then(ready);
  setTimeout(() => { if (!window.__ready) ready(); }, 4000);
  if (location.hash === '#inscription') showForm();
}
boot();
