// Every /api/admin/* route needs a valid session cookie, except login.
import { json, checkSession } from '../../../lib/util.js';

export async function onRequest({ request, env, next }) {
  const path = new URL(request.url).pathname;
  if (path === '/api/admin/login') return next();
  if (!(await checkSession(request, env))) return json({ ok: false, error: 'auth' }, 401);
  return next();
}
