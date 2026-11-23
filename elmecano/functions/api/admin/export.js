// GET /api/admin/export → CSV of every request (opens in Excel, UTF-8 with BOM)
const LABELS = { pack: 'Pack complet', diag: 'Diagnostic automobile', ecu: 'Reprogrammation ECU', hybrid: 'Hybrides & EV', consult: 'Consultation' };
const cell = v => {
  let s = String(v ?? '');
  if (/^\+?[\d\s().-]{6,}$/.test(s)) s = ' ' + s; // phone numbers stay text
  else if (/^[=+\-@]/.test(s)) s = "'" + s; // no spreadsheet formulas
  return `"${s.replace(/"/g, '""')}"`;
};

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT * FROM demandes ORDER BY id DESC').all();
  const head = ['ID', 'Date', 'Nom', 'Téléphone', 'Email', 'Ville', 'Formation', 'Message', 'Langue', 'Statut', 'Notes'];
  const lines = results.map(r => [r.id, r.created_at, r.nom, r.telephone, r.email, r.ville, LABELS[r.formation] || r.formation, r.message, r.langue, r.statut, r.notes].map(cell).join(';'));
  const csv = '﻿' + [head.map(cell).join(';'), ...lines].join('\r\n');
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: { 'content-type': 'text/csv; charset=utf-8', 'content-disposition': `attachment; filename="el-mecano-demandes-${day}.csv"`, 'cache-control': 'no-store' },
  });
}
