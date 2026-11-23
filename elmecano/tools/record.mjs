// Frame-exact scroll-through video of dist/index.html.
// usage: node record.mjs <viewportW> <viewportH> <dpr> <fps> <framesDir> <lang>
import { createRequire } from 'module';
import fs from 'fs';
const { chromium } = createRequire(import.meta.url)(process.env.PW);
const [W, H, DPR, FPS, out, lang] = process.argv.slice(2);
const fps = +FPS;
fs.mkdirSync(out, { recursive: true });

const url = 'file://' + new URL('../dist/index.html', import.meta.url).pathname + `?record&lang=${lang}`;
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars'] });
const p = await b.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: +DPR });
await p.goto(url);
await p.waitForFunction(() => window.__ready, null, { timeout: 180000 });

// resolve scroll targets: story progress values and section tops
const geo = await p.evaluate(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  const s = document.getElementById('story');
  const top = el => document.querySelector(el).getBoundingClientRect().top + scrollY;
  return {
    sTop: s.offsetTop, sLen: s.offsetHeight - innerHeight, vh: innerHeight,
    stats: top('#stats'), services: top('#services'), avis: top('#avis'), hours: top('#horaires'),
    cta: top('.cta'), max: document.documentElement.scrollHeight - innerHeight,
  };
});
const P = v => geo.sTop + geo.sLen * v;
const S = (y, off = 0) => Math.min(geo.max, y + off);
// [seconds, scrollY]
const KEYS = [
  [0, P(0)], [1.4, P(0)],
  [3.2, P(0.17)],
  [6.2, P(0.335)], [6.9, P(0.35)],
  [8.6, P(0.47)],
  [10.4, P(0.575)], [11.2, P(0.595)],
  [13.2, P(0.73)], [14.4, P(0.765)],
  [16.4, P(0.9)],
  [18.4, P(1)], [19.0, P(1)],
  [20.6, S(geo.stats, -geo.vh * 0.12)], [21.4, S(geo.stats, -geo.vh * 0.1)],
  [23.0, S(geo.services, -20)], [24.6, S(geo.services, geo.vh * 0.55)],
  [26.4, S(geo.avis, -20)], [27.4, S(geo.avis, -10)],
  [29.0, S(geo.hours, -20)], [29.8, S(geo.hours, -10)],
  [31.2, S(geo.cta, -geo.vh * 0.2)], [32.6, S(geo.cta, -geo.vh * 0.2)],
];
const smooth = t => t * t * (3 - 2 * t);
function yAt(t) {
  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [t0, y0] = KEYS[i], [t1, y1] = KEYS[i + 1];
  const k = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  return y0 + (y1 - y0) * smooth(k);
}

const total = +process.env.NF || Math.round(KEYS[KEYS.length - 1][0] * fps);
const t0 = Date.now();
for (let f = 0; f < total; f++) {
  const t = f / fps;
  await p.evaluate(([y, ms, dt]) => { window.scrollTo(0, y); window.__renderAt(ms, dt); }, [yAt(t), 4000 + t * 1000, 1000 / fps]);
  await p.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, quality: 88 });
  if (f % 30 === 0) console.log(`frame ${f}/${total}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await b.close();
console.log('done', total, 'frames');
