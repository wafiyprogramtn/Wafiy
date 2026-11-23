// PATCH /api/admin/demandes/:id {statut?, notes?} · DELETE /api/admin/demandes/:id
import { json, clean, STATUTS } from '../../../../lib/util.js';

export async function onRequestPatch({ request, env, params }) {
  const id = parseInt(params.id, 10);
  if (!id) return json({ ok: false }, 400);
  let body = {};
  try { body = await request.json(); } catch { /* empty */ }
  const sets = [];
  const args = [];
  if (body.statut !== undefined) {
    if (!STATUTS.includes(body.statut)) return json({ ok: false, error: 'statut' }, 422);
    sets.push('statut = ?'); args.push(body.statut);
  }
  if (body.notes !== undefined) { sets.push('notes = ?'); args.push(clean(body.notes, 2000) || null); }
  if (!sets.length) return json({ ok: false }, 400);
  await env.DB.prepare(`UPDATE demandes SET ${sets.join(', ')} WHERE id = ?`).bind(...args, id).run();
  return json({ ok: true });
}

export async function onRequestDelete({ env, params }) {
  const id = parseInt(params.id, 10);
  if (!id) return json({ ok: false }, 400);
  await env.DB.prepare('DELETE FROM demandes WHERE id = ?').bind(id).run();
  return json({ ok: true });
}
