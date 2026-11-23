// Builds public/ for Cloudflare Pages: site + admin dashboard (+ functions/ deployed alongside).
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rel = (...p) => path.join(root, ...p);
const out = rel('public');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(rel('public/assets/fonts'), { recursive: true });
fs.mkdirSync(rel('public/assets/frames'), { recursive: true });
fs.mkdirSync(rel('public/admin'), { recursive: true });

const common = { bundle: true, minify: true, target: ['es2020'], legalComments: 'none', logLevel: 'error' };
await build({ ...common, entryPoints: [rel('src/main.js')], outfile: rel('public/assets/site.js'), format: 'iife' });
await build({ ...common, entryPoints: [rel('src/styles.css')], outfile: rel('public/assets/site.css') });
await build({ ...common, entryPoints: [rel('src/admin/admin.js')], outfile: rel('public/admin/admin.js'), format: 'iife' });
await build({ ...common, entryPoints: [rel('src/admin/admin.css')], outfile: rel('public/admin/admin.css') });

// fonts
const fontsCss = fs.readFileSync(rel('src/fonts.css'), 'utf8');
for (const [, name] of fontsCss.matchAll(/url\(fonts\/([^)]+)\)/g)) {
  const fam = name.split('-')[0];
  fs.copyFileSync(rel(`node_modules/@fontsource/${fam}/files/${name}`), rel('public/assets/fonts', name));
}
fs.writeFileSync(rel('public/assets/fonts.css'), fontsCss);

// images
fs.copyFileSync(rel('assets/logo-480.png'), rel('public/assets/logo.png'));
fs.copyFileSync(rel('assets/favicon-64.png'), rel('public/assets/favicon-64.png'));
for (const f of fs.readdirSync(rel('assets/frames'))) fs.copyFileSync(rel('assets/frames', f), rel('public/assets/frames', f));
for (const f of ['og.jpg']) if (fs.existsSync(rel('assets', f))) fs.copyFileSync(rel('assets', f), rel('public/assets', f));
if (fs.existsSync(rel('assets/parts'))) {
  fs.mkdirSync(rel('public/assets/parts'), { recursive: true });
  for (const f of fs.readdirSync(rel('assets/parts'))) fs.copyFileSync(rel('assets/parts', f), rel('public/assets/parts', f));
}

// pages
fs.copyFileSync(rel('src/index.html'), rel('public/index.html'));
fs.copyFileSync(rel('src/admin/index.html'), rel('public/admin/index.html'));
fs.writeFileSync(rel('public/robots.txt'), 'User-agent: *\nDisallow: /admin/\nDisallow: /api/\n');
fs.writeFileSync(rel('public/_headers'), `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
/admin/*
  X-Frame-Options: DENY
  Cache-Control: no-store
/assets/*
  Cache-Control: public, max-age=86400
`);

const size = dir => fs.readdirSync(dir, { withFileTypes: true }).reduce((a, d) => a + (d.isDirectory() ? size(path.join(dir, d.name)) : fs.statSync(path.join(dir, d.name)).size), 0);
console.log('public/ built', (size(out) / 1024 / 1024).toFixed(2), 'MB');
