// POST /api/admin/login {password} → session cookie. DELETE → logout. GET → session check.
import { json, safeEqual, makeSession, sessionCookie, checkSession, ipHash } from '../../../lib/util.js';

export async function onRequestPost({ request, env }) {
  const ip = await ipHash(request, env);
  const since = Date.now() - 15 * 60e3;
  await env.DB.prepare('DELETE FROM login_attempts WHERE at < ?').bind(Date.now() - 864e5).run();
  const fails = await env.DB.prepare('SELECT COUNT(*) AS n FROM login_attempts WHERE ip_hash = ? AND at > ?').bind(ip, since).first();
  if (fails && fails.n >= 10) return json({ ok: false, error: 'locked' }, 429);

  let body = {};
  try { body = await request.json(); } catch { /* empty */ }
  if (!body.password || !(await safeEqual(body.password, env.ADMIN_PASSWORD))) {
    await env.DB.prepare('INSERT INTO login_attempts (ip_hash, at) VALUES (?, ?)').bind(ip, Date.now()).run();
    return json({ ok: false, error: 'password' }, 401);
  }
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie(await makeSession(env), 7 * 86400) });
}

export async function onRequestGet({ request, env }) {
  return json({ ok: await checkSession(request, env) });
}

export async function onRequestDelete() {
  return json({ ok: true }, 200, { 'set-cookie': sessionCookie('', 0) });
}
