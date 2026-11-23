// One-shot Cloudflare setup + deploy: D1 database, schema, Pages project, admin secret, upload.
// usage: node tools/deploy.mjs [--password <admin password>]
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { cf, accountId } from './cf.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PROJECT = process.env.PROJECT || 'elmecano';
const DB_NAME = 'elmecano-db';
const argPw = process.argv.indexOf('--password');
const password = argPw > 0 ? process.argv[argPw + 1] : null;

const acc = await accountId();
console.log('account', acc);

// 1. D1 database
let db = (await cf(`/accounts/${acc}/d1/database?name=${DB_NAME}`)).result.find(d => d.name === DB_NAME);
if (!db) db = (await cf(`/accounts/${acc}/d1/database`, { method: 'POST', body: JSON.stringify({ name: DB_NAME }) })).result;
const dbId = db.uuid;
console.log('d1', dbId);
await cf(`/accounts/${acc}/d1/database/${dbId}/query`, { method: 'POST', body: JSON.stringify({ sql: fs.readFileSync(path.join(root, 'schema.sql'), 'utf8') }) });
console.log('schema applied');

// 2. wrangler.toml points at the real database
const tomlPath = path.join(root, 'wrangler.toml');
fs.writeFileSync(tomlPath, fs.readFileSync(tomlPath, 'utf8').replace(/database_id = ".*"/, `database_id = "${dbId}"`));

// 3. Pages project
let project;
try { project = (await cf(`/accounts/${acc}/pages/projects/${PROJECT}`)).result; } catch { /* missing */ }
if (!project) {
  project = (await cf(`/accounts/${acc}/pages/projects`, { method: 'POST', body: JSON.stringify({ name: PROJECT, production_branch: 'main' }) })).result;
  console.log('pages project created');
}
console.log('pages', project.subdomain);

// 4. admin password (secret)
if (password) {
  await cf(`/accounts/${acc}/pages/projects/${PROJECT}`, {
    method: 'PATCH',
    body: JSON.stringify({ deployment_configs: { production: { env_vars: { ADMIN_PASSWORD: { type: 'secret_text', value: password } } }, preview: { env_vars: { ADMIN_PASSWORD: { type: 'secret_text', value: password } } } } }),
  });
  console.log('admin password set');
}

// 5. build + deploy
execFileSync('node', [path.join(root, 'tools/build-site.mjs')], { stdio: 'inherit' });
execFileSync('npx', ['wrangler', 'pages', 'deploy', 'public', '--project-name', PROJECT, '--branch', 'main', '--commit-dirty=true'], {
  cwd: root,
  stdio: 'inherit',
  env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: acc, CLOUDFLARE_API_TOKEN: 'proxy-injected', WRANGLER_SEND_METRICS: 'false' },
});
console.log(`\nLIVE: https://${project.subdomain}`);
