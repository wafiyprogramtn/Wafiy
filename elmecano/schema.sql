-- El Mecano: sign-up requests from the website (Cloudflare D1)
CREATE TABLE IF NOT EXISTS demandes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  nom         TEXT    NOT NULL,
  telephone   TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  ville       TEXT    NOT NULL,
  formation   TEXT    NOT NULL,
  message     TEXT,
  langue      TEXT,
  statut      TEXT    NOT NULL DEFAULT 'nouveau',
  notes       TEXT,
  ip_hash     TEXT
);
CREATE INDEX IF NOT EXISTS idx_demandes_created ON demandes (created_at);
CREATE INDEX IF NOT EXISTS idx_demandes_ip ON demandes (ip_hash, created_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip_hash TEXT    NOT NULL,
  at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts (ip_hash, at);
