// Viewport screenshots of each section below the story. usage: node sections.mjs <w> <h> <outdir> <lang>
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW);
const [w, h, out, lang] = process.argv.slice(2);
const url = 'file://' + new URL('../dist/index.html', import.meta.url).pathname + `?record&lang=${lang}`;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto(url);
await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
const sels = ['#stats', '#services', '#pourquoi', '#avis', '#faq', '#horaires', '.cta'];
let i = 0;
for (const s of sels) {
  await p.evaluate(s => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 40); }, s);
  await p.evaluate(() => window.__renderAt(5000));
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${out}/s${i++}.jpg`, quality: 75 });
}
console.log(errs.join('\n') || 'no errors');
await b.close();
