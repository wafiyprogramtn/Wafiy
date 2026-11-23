// Renders a 512x128 "El Mecano" texture to replace the Khronos logo texture in the model.
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)(process.env.PW || 'playwright');
import fs from 'fs';
const logo = fs.readFileSync(new URL('../assets/logo.png', import.meta.url)).toString('base64');
const font = fs.readFileSync(new URL('../node_modules/@fontsource/montserrat/files/montserrat-latin-800-normal.woff2', import.meta.url)).toString('base64');
const html = `<html><head><style>
@font-face{font-family:M;src:url(data:font/woff2;base64,${font})}
body{margin:0;background:#000}
#c{width:512px;height:128px;background:#050505;display:flex;align-items:center;justify-content:center;gap:14px}
img{height:118px}
</style></head><body><div id=c><img src="data:image/png;base64,${logo}"></div></body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 512, height: 128 } });
await p.setContent(html); await p.waitForTimeout(300);
await p.locator('#c').screenshot({ path: process.argv[2] });
await b.close();
