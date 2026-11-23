// Single-file Cloudflare Pages worker (_worker.js): serves the embedded site files and routes
// /api/* to the same handlers used as Pages Functions. Built by tools/deploy-api.mjs.
import * as demandes from '../functions/api/demandes.js';
import * as adminMw from '../functions/api/admin/_middleware.js';
import * as login from '../functions/api/admin/login.js';
import * as list from '../functions/api/admin/demandes/index.js';
import * as item from '../functions/api/admin/demandes/[id].js';
import * as exportCsv from '../functions/api/admin/export.js';
import { ASSETS } from './.assets.js';

const decoded = new Map();
function body(path) {
  const a = ASSETS[path];
  if (a.text !== undefined) return a.text;
  if (!decoded.has(path)) decoded.set(path, Uint8Array.from(atob(a.b64), c => c.charCodeAt(0)));
  return decoded.get(path);
}

const SEC = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
};

function serveStatic(path, request) {
  if (path === '/admin') return Response.redirect(new URL('/admin/', request.url).toString(), 301);
  let p = path.endsWith('/') ? path + 'index.html' : path;
  if (!ASSETS[p]) {
    if (ASSETS[p + '/index.html']) return Response.redirect(new URL(path + '/', request.url).toString(), 301);
    return new Response('Page introuvable', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8', ...SEC } });
  }
  const a = ASSETS[p];
  const headers = { 'content-type': a.type, etag: `"${a.hash}"`, ...SEC };
  if (p.startsWith('/admin/')) Object.assign(headers, { 'x-frame-options': 'DENY', 'cache-control': 'no-store' });
  else if (p.startsWith('/assets/')) headers['cache-control'] = 'public, max-age=86400';
  else headers['cache-control'] = 'public, max-age=0, must-revalidate';
  if (request.headers.get('if-none-match') === headers.etag) return new Response(null, { status: 304, headers });
  return new Response(request.method === 'HEAD' ? null : body(p), { headers });
}

function run(mod, ctx) {
  const name = 'onRequest' + ctx.request.method[0] + ctx.request.method.slice(1).toLowerCase();
  const h = mod[name] || mod.onRequest;
  return h ? h(ctx) : new Response(JSON.stringify({ ok: false, error: 'method' }), { status: 405, headers: { 'content-type': 'application/json' } });
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    const base = { request, env, params: {}, waitUntil: p => ctx.waitUntil(p) };
    try {
      if (path === '/api/demandes') return await run(demandes, base);
      if (path === '/api/health') {
        const db = await env.DB.prepare('SELECT COUNT(*) AS n FROM sqlite_master WHERE name = ?').bind('demandes').first();
        return new Response(JSON.stringify({ ok: true, db: db?.n === 1, admin: Boolean(env.ADMIN_PASSWORD) }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
      }
      if (path.startsWith('/api/admin/')) {
        const next = async () => {
          if (path === '/api/admin/login') return run(login, base);
          if (path === '/api/admin/demandes') return run(list, base);
          if (path === '/api/admin/export') return run(exportCsv, base);
          const m = path.match(/^\/api\/admin\/demandes\/(\d+)$/);
          if (m) return run(item, { ...base, params: { id: m[1] } });
          return new Response('Not found', { status: 404 });
        };
        return await adminMw.onRequest({ ...base, next });
      }
      if (path.startsWith('/api/')) return new Response('Not found', { status: 404 });
      return serveStatic(path, request);
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ ok: false, error: 'server' }), { status: 500, headers: { 'content-type': 'application/json' } });
    }
  },
};
