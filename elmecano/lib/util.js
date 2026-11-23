// Shared helpers for the Pages Functions (bundled by wrangler).
export const FORMATIONS = ['pack', 'diag', 'ecu', 'hybrid', 'consult'];
export const STATUTS = ['nouveau', 'contacte', 'inscrit', 'annule'];
export const COOKIE = 'em_admin';
const enc = new TextEncoder();

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

async function hmac(keyText, msg) {
  const key = await crypto.subtle.importKey('raw', enc.encode(keyText), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(msg));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// constant-time string comparison (compares HMACs of both values)
export async function safeEqual(a, b) {
  const [x, y] = await Promise.all([hmac('cmp', String(a)), hmac('cmp', String(b))]);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  return diff === 0 && String(a).length === String(b).length;
}

function secret(env) {
  if (!env.ADMIN_PASSWORD) throw new Error('ADMIN_PASSWORD is not set');
  return 'em-session:' + env.ADMIN_PASSWORD;
}

export async function ipHash(request, env) {
  const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'local';
  return (await hmac(secret(env), 'ip:' + ip)).slice(0, 32);
}

export async function makeSession(env, days = 7) {
  const exp = Date.now() + days * 864e5;
  return `${exp}.${await hmac(secret(env), 'admin|' + exp)}`;
}

export async function checkSession(request, env) {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!m) return false;
  const [exp, sig] = decodeURIComponent(m[1]).split('.');
  if (!exp || !sig || +exp < Date.now()) return false;
  return safeEqual(sig, await hmac(secret(env), 'admin|' + exp));
}

export function sessionCookie(value, maxAge) {
  return `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

export const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
