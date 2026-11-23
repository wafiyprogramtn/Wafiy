// El Mecano admin dashboard: lists sign-up requests stored in Cloudflare D1.
const FORMATIONS = { pack: 'Pack complet', diag: 'Diagnostic automobile', ecu: 'Reprogrammation ECU', hybrid: 'Hybrides & EV', consult: 'Consultation' };
const STATUTS = { nouveau: 'Nouveau', contacte: 'Contacté', inscrit: 'Inscrit', annule: 'Annulé' };
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let items = [];
let seen = +(localStorage.getItem('em-seen') || 0);
let timer;

async function api(path, opts = {}) {
  const r = await fetch(path, { credentials: 'same-origin', headers: { 'content-type': 'application/json' }, ...opts });
  if (r.status === 401) { showLogin(); throw new Error('auth'); }
  return r.json();
}

function showLogin() {
  clearInterval(timer);
  $('#app').hidden = true;
  $('#login').hidden = false;
  $('#pw').focus();
}

async function showApp() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  await load();
  clearInterval(timer);
  timer = setInterval(load, 60000);
}

function waLink(tel, nom, formation) {
  let d = tel.replace(/\D/g, '');
  if (d.length === 8) d = '216' + d;
  if (d.startsWith('00')) d = d.slice(2);
  const text = `Bonjour ${nom}, ici El Mecano Garage. Merci pour votre demande (${FORMATIONS[formation] || formation}).`;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

function ago(iso) {
  const t = new Date(iso).getTime();
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'à l’instant';
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return new Date(t).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function render() {
  const list = $('#list');
  list.innerHTML = items.map(it => `
    <article class="item ${esc(it.statut)}${it.id > seen ? ' fresh' : ''}" data-id="${it.id}">
      <div class="who">
        <b>${esc(it.nom)}</b>
        <small>${esc(ago(it.created_at))} · ${esc(it.ville)}${it.langue === 'ar' ? ' · AR' : ''}</small><br>
        <span class="tag">${esc(FORMATIONS[it.formation] || it.formation)}</span>
      </div>
      <div class="contact">
        <a href="tel:${esc(it.telephone.replace(/[^\d+]/g, ''))}">📞 <span dir="ltr">${esc(it.telephone)}</span></a>
        <a href="mailto:${esc(it.email)}">✉️ ${esc(it.email)}</a>
      </div>
      <div class="acts">
        <a class="btn btn-wa" target="_blank" rel="noopener" href="${esc(waLink(it.telephone, it.nom, it.formation))}">WhatsApp</a>
        <button class="btn btn-del" data-del="${it.id}" title="Supprimer">Supprimer</button>
      </div>
      <div class="side">
        <select data-statut="${it.id}" aria-label="Statut">${Object.entries(STATUTS).map(([k, v]) => `<option value="${k}"${k === it.statut ? ' selected' : ''}>${v}</option>`).join('')}</select>
      </div>
      ${it.message ? `<p class="msg">${esc(it.message)}</p>` : ''}
      <div class="notes"><textarea data-notes="${it.id}" placeholder="Notes internes (ex : rappelé le 12/12, paiement reçu…)">${esc(it.notes || '')}</textarea></div>
    </article>`).join('');
  $('#empty').hidden = items.length > 0;
}

function renderStats(byStatut) {
  const n = k => (byStatut.find(x => x.statut === k) || {}).n || 0;
  const total = byStatut.reduce((a, x) => a + x.n, 0);
  const cur = $('#fStatut').value;
  const box = (k, label, val, c) => `<div class="stat${cur === k ? ' on' : ''}" data-filter="${k}" style="--c:${c}"><b>${val}</b><span>${c ? '<i></i>' : ''}${label}</span></div>`;
  $('#stats').innerHTML = box('', 'Total des demandes', total, '') + box('nouveau', 'Nouveaux', n('nouveau'), '#ff3a40') + box('contacte', 'Contactés', n('contacte'), '#5aa9ff') + box('inscrit', 'Inscrits', n('inscrit'), '#2bd67b') + box('annule', 'Annulés', n('annule'), '#777');
  const fresh = items.filter(i => i.id > seen).length;
  document.title = `${fresh ? `(${fresh}) ` : ''}Demandes — El Mecano Admin`;
}

async function load() {
  const p = new URLSearchParams();
  if ($('#q').value.trim()) p.set('q', $('#q').value.trim());
  if ($('#fFormation').value) p.set('formation', $('#fFormation').value);
  if ($('#fStatut').value) p.set('statut', $('#fStatut').value);
  const data = await api('/api/admin/demandes?' + p);
  items = data.items || [];
  render();
  renderStats(data.byStatut || []);
  $('#updated').textContent = 'Mis à jour ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function markSeen() {
  const max = items.reduce((a, i) => Math.max(a, i.id), 0);
  if (max > seen) { seen = max; localStorage.setItem('em-seen', String(seen)); }
}

// ---- events
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  $('#loginErr').textContent = '';
  const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: $('#pw').value }) });
  if (r.ok) { $('#pw').value = ''; showApp(); }
  else $('#loginErr').textContent = r.status === 429 ? 'Trop de tentatives. Réessayez dans 15 minutes.' : 'Mot de passe incorrect.';
});
$('#logout').addEventListener('click', async () => { await fetch('/api/admin/login', { method: 'DELETE' }); showLogin(); });
$('#refresh').addEventListener('click', () => { markSeen(); load(); });
let qt;
$('#q').addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(load, 300); });
$('#fFormation').addEventListener('change', load);
$('#fStatut').addEventListener('change', load);
$('#stats').addEventListener('click', e => {
  const s = e.target.closest('[data-filter]');
  if (!s) return;
  $('#fStatut').value = s.dataset.filter;
  load();
});
$('#list').addEventListener('change', async e => {
  const id = e.target.dataset.statut;
  if (!id) return;
  await api(`/api/admin/demandes/${id}`, { method: 'PATCH', body: JSON.stringify({ statut: e.target.value }) });
  load();
});
$('#list').addEventListener('focusout', async e => {
  const id = e.target.dataset.notes;
  if (!id) return;
  const it = items.find(i => String(i.id) === id);
  if (it && (it.notes || '') === e.target.value) return;
  await api(`/api/admin/demandes/${id}`, { method: 'PATCH', body: JSON.stringify({ notes: e.target.value }) });
  if (it) it.notes = e.target.value;
});
$('#list').addEventListener('click', async e => {
  const id = e.target.dataset.del;
  if (!id) return;
  const it = items.find(i => String(i.id) === id);
  if (!confirm(`Supprimer la demande de ${it ? it.nom : ''} ?`)) return;
  await api(`/api/admin/demandes/${id}`, { method: 'DELETE' });
  load();
});
addEventListener('visibilitychange', () => { if (document.hidden) markSeen(); });

for (const [k, v] of Object.entries(FORMATIONS)) $('#fFormation').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`);
for (const [k, v] of Object.entries(STATUTS)) $('#fStatut').insertAdjacentHTML('beforeend', `<option value="${k}">${v}</option>`);

fetch('/api/admin/login', { credentials: 'same-origin' }).then(r => r.json()).then(d => (d.ok ? showApp() : showLogin())).catch(showLogin);
