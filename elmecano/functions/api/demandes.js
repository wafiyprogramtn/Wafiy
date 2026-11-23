// POST /api/demandes: a visitor signs up for a training or a consultation.
import { json, clean, ipHash, FORMATIONS } from '../../lib/util.js';

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'invalid' }, 400); }

  // anti-spam: hidden field must stay empty, and a human takes a few seconds to fill the form
  if (body.website) return json({ ok: true });
  if (typeof body.elapsed === 'number' && body.elapsed < 2500) return json({ ok: false, error: 'too_fast' }, 400);

  const d = {
    nom: clean(body.nom, 80),
    telephone: clean(body.telephone, 30),
    email: clean(body.email, 120).toLowerCase(),
    ville: clean(body.ville, 60),
    formation: clean(body.formation, 20),
    message: clean(body.message, 1000),
    langue: body.langue === 'ar' ? 'ar' : 'fr',
  };
  const errors = [];
  if (d.nom.length < 2) errors.push('nom');
  const digits = d.telephone.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) errors.push('telephone');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) errors.push('email');
  if (d.ville.length < 2) errors.push('ville');
  if (!FORMATIONS.includes(d.formation)) errors.push('formation');
  if (body.consent !== true) errors.push('consent');
  if (errors.length) return json({ ok: false, error: 'fields', fields: errors }, 422);

  const ip = await ipHash(request, env);
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM demandes WHERE ip_hash = ? AND created_at > strftime('%Y-%m-%dT%H:%M:%SZ', 'now', '-10 minutes')"
  ).bind(ip).first();
  if (recent && recent.n >= 5) return json({ ok: false, error: 'rate' }, 429);

  const res = await env.DB.prepare(
    'INSERT INTO demandes (nom, telephone, email, ville, formation, message, langue, ip_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(d.nom, d.telephone, d.email, d.ville, d.formation, d.message || null, d.langue, ip).run();
  return json({ ok: true, id: res.meta?.last_row_id ?? null }, 201);
}

export const onRequest = () => json({ ok: false, error: 'method' }, 405);
