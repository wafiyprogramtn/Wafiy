// Screenshots of the story at given progress values. usage: node shots.mjs <w> <h> <outdir> <lang> p1 p2 ...
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW);
const [w, h, out, lang, ...ps] = process.argv.slice(2);
const url = 'file://' + new URL('../dist/index.html', import.meta.url).pathname + `?record&lang=${lang}`;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errs = [];
p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text()); });
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
const t0 = Date.now();
await p.goto(url);
await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
console.log('ready in', Date.now() - t0, 'ms');
for (const v of ps) {
  const pv = parseFloat(v);
  await p.evaluate(pv => {
    const s = document.getElementById('story');
    const y = s.offsetTop + (s.offsetHeight - innerHeight) * pv;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
  }, pv);
  const t1 = Date.now();
  await p.evaluate(() => window.__renderAt(5000));
  await p.waitForTimeout(350);
  await p.evaluate(() => window.__renderAt(5000));
  await p.screenshot({ path: `${out}/p${v}.jpg`, quality: 80 });
  console.log('p', v, 'render+shot', Date.now() - t1, 'ms');
}
console.log(errs.slice(0, 15).join('\n'));
await b.close();
