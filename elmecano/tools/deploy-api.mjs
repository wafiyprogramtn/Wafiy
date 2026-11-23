// Deploy to Cloudflare Pages as one _worker.js (site files embedded) using only the API token.
// usage: PROJECT=elmecano-garage CLOUDFLARE_ACCOUNT_ID=... node tools/deploy-api.mjs [--build-only]
import { build } from 'esbuild';
import { execFileSync } from 'child_process';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { cf, accountId } from './cf.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = process.env.PROJECT || 'elmecano-garage';
const TYPES = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'application/javascript; charset=utf-8', txt: 'text/plain; charset=utf-8', json: 'application/json', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', woff2: 'font/woff2', ico: 'image/x-icon' };
const TEXT = new Set(['html', 'css', 'js', 'txt', 'json', 'svg']);

execFileSync('node', [path.join(root, 'tools/build-site.mjs')], { stdio: 'inherit' });

// embed every file of public/ in a module
const pub = path.join(root, 'public');
const assets = {};
(function walk(dir) {
  for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, d.name);
    if (d.isDirectory()) { walk(full); continue; }
    const rel = '/' + path.relative(pub, full).split(path.sep).join('/');
    if (rel === '/_headers') continue;
    const ext = d.name.split('.').pop().toLowerCase();
    const buf = fs.readFileSync(full);
    const entry = { type: TYPES[ext] || 'application/octet-stream', hash: crypto.createHash('sha1').update(buf).digest('hex').slice(0, 16) };
    if (TEXT.has(ext)) entry.text = buf.toString('utf8'); else entry.b64 = buf.toString('base64');
    assets[rel] = entry;
  }
})(pub);
fs.writeFileSync(path.join(root, 'tools/.assets.js'), 'export const ASSETS = ' + JSON.stringify(assets) + ';\n');

const outDir = path.join(root, '.worker');
fs.mkdirSync(outDir, { recursive: true });
await build({ entryPoints: [path.join(root, 'tools/worker-entry.js')], outfile: path.join(outDir, '_worker.js'), bundle: true, format: 'esm', minify: true, target: 'es2022', legalComments: 'none', logLevel: 'error' });
const size = fs.statSync(path.join(outDir, '_worker.js')).size;
console.log('_worker.js', (size / 1024 / 1024).toFixed(2), 'MB,', Object.keys(assets).length, 'files');
if (process.argv.includes('--build-only')) process.exit(0);

// project bindings: D1 + compatibility date (the admin password secret is set separately)
const acc = await accountId();
const db = (await cf(`/accounts/${acc}/d1/database?name=elmecano-db`)).result.find(d => d.name === 'elmecano-db');
const cfg = { compatibility_date: '2025-09-01', d1_databases: { DB: { id: db.uuid } } };
await cf(`/accounts/${acc}/pages/projects/${PROJECT}`, { method: 'PATCH', body: JSON.stringify({ deployment_configs: { production: cfg, preview: cfg } }) });

// deployment: empty asset manifest + the worker
const fd = new FormData();
fd.append('manifest', '{}');
fd.append('branch', 'main');
fd.append('commit_message', 'El Mecano site');
fd.append('_worker.js', new Blob([fs.readFileSync(path.join(outDir, '_worker.js'))], { type: 'application/javascript+module' }), '_worker.js');
const dep = await cf(`/accounts/${acc}/pages/projects/${PROJECT}/deployments`, { method: 'POST', body: fd });
console.log('deployment', dep.result.id, dep.result.url, dep.result.latest_stage?.status);
