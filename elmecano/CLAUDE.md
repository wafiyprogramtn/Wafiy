# El Mecano: protected live client site

Read the root `CLAUDE.md`. Do not edit, rebuild or redeploy anything in this folder, or the Cloudflare
project `elmecano-garage` / database `elmecano-db`, unless the user explicitly asks for a change to El Mecano.
When they do: edit `src/`, test locally (`tools/uitest.mjs`), then deploy with
`PROJECT=elmecano-garage CLOUDFLARE_ACCOUNT_ID=b1db5ba3fb9703592a62e867d4205f56 NODE_USE_ENV_PROXY=1 node tools/deploy-api.mjs`.
