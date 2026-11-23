// GET /api/admin/demandes?q=&formation=&statut= → list + counters
import { json, FORMATIONS, STATUTS } from '../../../../lib/util.js';

export async function onRequestGet({ request, env }) {
  const u = new URL(request.url);
  const where = [];
  const args = [];
  const f = u.searchParams.get('formation');
  const s = u.searchParams.get('statut');
  const q = (u.searchParams.get('q') || '').trim().slice(0, 60);
  if (FORMATIONS.includes(f)) { where.push('formation = ?'); args.push(f); }
  if (STATUTS.includes(s)) { where.push('statut = ?'); args.push(s); }
  if (q) {
    where.push('(nom LIKE ? OR telephone LIKE ? OR email LIKE ? OR ville LIKE ?)');
    const like = `%${q.replace(/[%_]/g, '')}%`;
    args.push(like, like, like, like);
  }
  const sql = `SELECT id, created_at, nom, telephone, email, ville, formation, message, langue, statut, notes FROM demandes ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT 1000`;
  const [rows, byStatut, byFormation] = await Promise.all([
    env.DB.prepare(sql).bind(...args).all(),
    env.DB.prepare('SELECT statut, COUNT(*) AS n FROM demandes GROUP BY statut').all(),
    env.DB.prepare('SELECT formation, COUNT(*) AS n FROM demandes GROUP BY formation').all(),
  ]);
  return json({ ok: true, items: rows.results, byStatut: byStatut.results, byFormation: byFormation.results });
}
