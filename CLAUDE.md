# Protected project: El Mecano (do not touch)

The `elmecano/` folder is a finished, live client website for **El Mecano Garage**:
- Live site: https://elmecano-garage.pages.dev (admin at `/admin`)
- Cloudflare Pages project `elmecano-garage`, D1 database `elmecano-db`
  (Cloudflare account `b1db5ba3fb9703592a62e867d4205f56`)
- Source of truth: branch `claude/capability-discussion-qcyzxz`, folder `elmecano/`

## Rule

Do NOT change anything that belongs to El Mecano unless the user's own message explicitly asks
for a change to El Mecano (names "El Mecano" / "elmecano" / "Rabie's site"). This covers:
- any file under `elmecano/` (edit, move, delete, rebuild, reformat)
- the Cloudflare Pages project `elmecano-garage`: never redeploy, rename, delete it, or change
  its settings, bindings or the `ADMIN_PASSWORD` secret
- the D1 database `elmecano-db` and its data (client sign-ups): never write, migrate or delete
- the branch `claude/capability-discussion-qcyzxz`: never force-push, rebase or delete it

## For any other website or app

- Create it in a new folder (or a new repository), never inside `elmecano/`.
- Use a new Cloudflare project name and a new database; never reuse `elmecano-garage` or `elmecano-db`.
- If a task could affect El Mecano in any way, stop and ask the user first.
