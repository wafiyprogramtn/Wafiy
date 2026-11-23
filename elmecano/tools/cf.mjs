// Tiny Cloudflare API helper. The network proxy injects the API token (never stored here).
const BASE = 'https://api.cloudflare.com/client/v4';

export async function cf(path, opts = {}) {
  const r = await fetch(BASE + path, { ...opts, headers: { ...(opts.body && !(opts.body instanceof FormData) ? { 'content-type': 'application/json' } : {}), ...(opts.headers || {}) } });
  const ct = r.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const j = await r.json();
    if (!j.success && j.success !== undefined) throw new Error(`${r.status} ${JSON.stringify(j.errors)}`);
    return j;
  }
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return Buffer.from(await r.arrayBuffer());
}

export async function accountId() {
  if (process.env.CLOUDFLARE_ACCOUNT_ID) return process.env.CLOUDFLARE_ACCOUNT_ID;
  const j = await cf('/accounts');
  if (!j.result.length) throw new Error('no account');
  return j.result[0].id;
}
