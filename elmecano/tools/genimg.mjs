// Generate an image with Cloudflare Workers AI (FLUX.2). Token is injected by the network proxy.
// usage: node genimg.mjs <out.jpg|png> <width> <height> <model> "<prompt>" [refImage ...]
import fs from 'fs';

const [out, w, h, model, prompt, ...refs] = process.argv.slice(2);
const ACC = process.env.CLOUDFLARE_ACCOUNT_ID;
const fd = new FormData();
fd.append('prompt', prompt);
fd.append('width', String(w));
fd.append('height', String(h));
if (process.env.STEPS) fd.append('steps', process.env.STEPS);
if (process.env.SEED) fd.append('seed', process.env.SEED);
refs.forEach((r, i) => fd.append(`input_image_${i}`, new Blob([fs.readFileSync(r)], { type: r.endsWith('.png') ? 'image/png' : 'image/jpeg' }), r.split('/').pop()));

const t0 = Date.now();
const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACC}/ai/run/@cf/black-forest-labs/${model}`, { method: 'POST', body: fd });
const ct = res.headers.get('content-type') || '';
if (ct.includes('json')) {
  const j = await res.json();
  const img = j.result?.image;
  if (!img) { console.error(res.status, JSON.stringify(j).slice(0, 600)); process.exit(1); }
  fs.writeFileSync(out, Buffer.from(img, 'base64'));
} else if (res.ok) {
  fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
} else {
  console.error(res.status, (await res.text()).slice(0, 600));
  process.exit(1);
}
console.log(out, ((Date.now() - t0) / 1000).toFixed(1) + 's');
