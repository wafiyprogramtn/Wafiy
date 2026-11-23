// Builds dist/index.html: one self-contained file (JS, CSS, fonts, logo and 3D model inlined),
// so the site opens by double-click, offline, with no server.
import { build } from 'esbuild';
import fs from 'fs';
import path from 'path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rel = p => path.join(root, p);
const b64 = p => fs.readFileSync(rel(p)).toString('base64');

const js = await build({
  entryPoints: [rel('src/main.js')],
  bundle: true,
  format: 'iife',
  minify: true,
  write: false,
  target: ['es2020'],
  legalComments: 'none',
});

const fontDirs = ['montserrat', 'lato', 'cairo'].map(f => rel(`node_modules/@fontsource/${f}/files`));
let css = fs.readFileSync(rel('src/styles.css'), 'utf8').replace(/url\(@fonts\/([^)]+)\)/g, (_, name) => {
  const dir = fontDirs.find(d => fs.existsSync(path.join(d, name)));
  if (!dir) throw new Error('missing font ' + name);
  return `url(data:font/woff2;base64,${fs.readFileSync(path.join(dir, name)).toString('base64')})`;
});

const logo = `data:image/png;base64,${b64('assets/logo-480.png')}`;
const favicon = `data:image/png;base64,${b64('assets/favicon-64.png')}`;

let html = fs.readFileSync(rel('src/index.html'), 'utf8');
html = html
  .replace('%CSS%', () => css)
  .replace('%FAVICON%', () => favicon)
  .replaceAll('%LOGO%', () => logo)
  .replace('%CARDATA%', () => b64('model/car.glb'))
  .replace('%JS%', () => js.outputFiles[0].text.replace(/<\/script/gi, '<\\/script'));

fs.mkdirSync(rel('dist'), { recursive: true });
fs.writeFileSync(rel('dist/index.html'), html);
console.log('dist/index.html', (html.length / 1024 / 1024).toFixed(2), 'MB');
