import { neon } from '@neondatabase/serverless';

let _sql;
function getSql() {
  if (_sql) return _sql;
  const conn =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL;
  if (!conn) {
    throw new Error(
      'No database connection string set. Add a Neon database in Vercel → Storage.'
    );
  }
  _sql = neon(conn);
  return _sql;
}

const ET = 'America/New_York';

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmtDate(d) {
  return new Date(d).toLocaleString('en-US', {
    timeZone: ET,
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function attendeesHtml(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return '<span class="muted">—</span>';
  return rows
    .map((a) => {
      const tag = a.isJumper
        ? '<span class="tag tag-blue">🦘 Jumper</span>'
        : '<span class="tag tag-gray">Non-jumper</span>';
      return `<div class="attendee">${escapeHtml(a.name)} ${tag}</div>`;
    })
    .join('');
}

function page({ rows, totals }) {
  const rowsHtml = rows.length === 0
    ? `<tr><td colspan="6" class="empty">No RSVPs yet.</td></tr>`
    : rows
        .map(
          (r) => `
        <tr class="${r.attending ? 'yes' : 'no'}">
          <td class="nowrap">${escapeHtml(fmtDate(r.created_at))}</td>
          <td>
            <div class="who">${escapeHtml(r.parent_name)}</div>
            <div class="muted small">${escapeHtml(r.contact)}</div>
          </td>
          <td>${
            r.attending
              ? '<span class="badge badge-green">Yes</span>'
              : '<span class="badge badge-gray">No</span>'
          }</td>
          <td>${attendeesHtml(r.attendees)}</td>
          <td>${escapeHtml(r.notes) || '<span class="muted">—</span>'}</td>
          <td>${escapeHtml(r.message_to_teddy) || '<span class="muted">—</span>'}</td>
        </tr>`
        )
        .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Brickday RSVPs</title>
<style>
  :root { --blue:#0055BF; --green:#237841; --red:#C91A09; --bg:#F5F3EE; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif; background: var(--bg); color:#1a1a1a; }
  header { background: var(--blue); color:#fff; padding: 18px 20px; }
  header h1 { margin:0; font-size:20px; }
  header .sub { opacity:.85; font-size:13px; margin-top:2px; }
  main { max-width: 1100px; margin: 0 auto; padding: 16px; }
  .totals { display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
  .stat { background:#fff; border-radius:10px; padding:10px 14px; box-shadow:0 1px 0 rgba(0,0,0,.04), 0 4px 14px rgba(0,0,0,.06); }
  .stat .n { font-size: 22px; font-weight:700; color: var(--blue); }
  .stat .l { font-size: 12px; color:#555; text-transform: uppercase; letter-spacing: .04em; }
  table { width:100%; background:#fff; border-collapse: collapse; border-radius: 10px; overflow: hidden; box-shadow:0 1px 0 rgba(0,0,0,.04), 0 4px 14px rgba(0,0,0,.06); }
  th, td { text-align:left; padding: 10px 12px; vertical-align: top; border-bottom: 1px solid #eee; font-size: 14px; }
  th { background:#fafaf7; font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:.04em; color:#555; }
  tr.no { opacity: .75; }
  tr:last-child td { border-bottom: none; }
  .who { font-weight:600; }
  .muted { color:#888; }
  .small { font-size:12px; }
  .nowrap { white-space: nowrap; }
  .empty { text-align:center; padding: 28px; color:#777; }
  .badge { display:inline-block; padding:2px 8px; border-radius: 9999px; font-size:12px; font-weight:600; }
  .badge-green { background: #e6f4eb; color: var(--green); }
  .badge-gray { background:#eee; color:#555; }
  .tag { display:inline-block; padding:1px 6px; border-radius: 9999px; font-size:11px; font-weight:600; margin-left: 4px; }
  .tag-blue { background: var(--blue); color:#fff; }
  .tag-gray { background:#eee; color:#444; }
  .attendee { padding: 1px 0; }
  footer { text-align:center; color:#888; padding: 18px; font-size: 12px; }
  @media (max-width: 640px) {
    th, td { font-size: 13px; padding: 8px; }
    .stat .n { font-size: 18px; }
  }
</style>
</head>
<body>
<header>
  <h1>Teddy's Brickday RSVPs</h1>
  <div class="sub">${rows.length} response${rows.length === 1 ? '' : 's'} · times in Eastern</div>
</header>
<main>
  <div class="totals">
    <div class="stat"><div class="n">${totals.yes}</div><div class="l">Saying yes</div></div>
    <div class="stat"><div class="n">${totals.no}</div><div class="l">Saying no</div></div>
    <div class="stat"><div class="n">${totals.people}</div><div class="l">Total people</div></div>
    <div class="stat"><div class="n">${totals.jumpers}</div><div class="l">Total jumpers</div></div>
  </div>
  <table>
    <thead>
      <tr>
        <th>When</th>
        <th>From</th>
        <th>Coming?</th>
        <th>Attendees</th>
        <th>Notes</th>
        <th>Msg to Teddy</th>
      </tr>
    </thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</main>
<footer>Bookmark this URL — refresh to see the latest.</footer>
</body>
</html>`;
}

function unauthorized(res) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.status(401).send(
    `<!doctype html><meta charset="utf-8"><title>Unauthorized</title>
     <body style="font-family:system-ui;padding:40px;max-width:480px;margin:auto;">
       <h1 style="color:#C91A09;margin:0 0 8px;">Unauthorized</h1>
       <p>Append <code>?key=YOUR_PASSWORD</code> to the URL.</p>
     </body>`
  );
}

export default async function handler(req, res) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res
      .status(500)
      .send('<h1>Admin not configured</h1><p>Set the <code>ADMIN_PASSWORD</code> env var in Vercel.</p>');
  }

  const provided = (req.query && req.query.key) || '';
  if (provided !== expected) return unauthorized(res);

  try {
    const sql = getSql();
    const rows = await sql`
      SELECT id, created_at, attending, parent_name, contact, child_name,
             attendees, total_people, total_jumpers, notes, message_to_teddy
      FROM rsvps
      ORDER BY created_at DESC
    `;

    const totals = rows.reduce(
      (acc, r) => {
        if (r.attending) {
          acc.yes += 1;
          acc.people += r.total_people || 0;
          acc.jumpers += r.total_jumpers || 0;
        } else {
          acc.no += 1;
        }
        return acc;
      },
      { yes: 0, no: 0, people: 0, jumpers: 0 }
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(page({ rows, totals }));
  } catch (err) {
    // Table may not exist yet (no submissions). Show an empty page.
    if (err && /relation .* does not exist/i.test(err.message || '')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res
        .status(200)
        .send(page({ rows: [], totals: { yes: 0, no: 0, people: 0, jumpers: 0 } }));
    }
    console.error('Admin query failed:', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<h1>Error loading RSVPs</h1>');
  }
}
