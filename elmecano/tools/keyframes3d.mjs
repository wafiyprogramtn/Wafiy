// Placeholder story keyframes rendered from the 3D build (used until the realistic images exist).
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PW);
const out = process.argv[2];
const url = 'file://' + new URL('../dist/index.html', import.meta.url).pathname + '?record&lang=fr';
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1920, height: 900 } });
await p.goto(url);
await p.waitForFunction(() => window.__ready, null, { timeout: 120000 });
await p.addStyleTag({ content: '.panel,.card-float,.labels,.nav,.mobile-bar,.rail,.progress,.scroll-cue,.scanline-label,#loader{display:none!important}.stage-bg::after{display:none}' });
const keys = [['k0', 0.0, 0.18], ['k1', 0.355, 0.18], ['k2', 0.585, 0.18], ['k3', 0.76, 0.18], ['k4', 0.95, 0.07]];
for (const [name, pv, off] of keys) {
  await p.evaluate(pv => { document.documentElement.style.scrollBehavior = 'auto'; const s = document.getElementById('story'); scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * pv); }, pv);
  await p.evaluate(() => window.__renderAt(5000));
  await p.waitForTimeout(200);
  await p.evaluate(() => window.__renderAt(5000));
  const cx = 960 + off * 1920;
  await p.screenshot({ path: `${out}/${name}.jpg`, quality: 88, clip: { x: Math.round(cx - 600), y: 112, width: 1200, height: 675 } });
}
await b.close();
console.log('ok');
