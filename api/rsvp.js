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

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      attending BOOLEAN NOT NULL,
      parent_name TEXT NOT NULL,
      contact TEXT NOT NULL,
      child_name TEXT,
      attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
      total_people INT NOT NULL DEFAULT 0,
      total_jumpers INT NOT NULL DEFAULT 0,
      notes TEXT,
      message_to_teddy TEXT
    )
  `;
  schemaReady = true;
}

function bad(res, status, message) {
  res.status(status).json({ error: message });
}

function asString(v) {
  if (v == null) return '';
  return String(v).trim();
}

function validate(body) {
  if (!body || typeof body !== 'object') return 'Invalid request body.';

  const attending = body.attending === true;
  const parentName = asString(body.parentName);
  const contact = asString(body.contact);

  if (!parentName) return 'Parent name is required.';
  if (!contact) return 'Phone or email is required.';

  if (attending) {
    const childName = asString(body.childName);
    if (!childName) return "Child's name is required.";
    if (!Array.isArray(body.attendees) || body.attendees.length === 0) {
      return 'At least one attendee is required.';
    }
    for (const a of body.attendees) {
      if (!a || typeof a !== 'object') return 'Invalid attendee entry.';
      if (!asString(a.name)) return 'Each attendee needs a name.';
    }
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return bad(res, 405, 'Method not allowed.');
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return bad(res, 400, 'Invalid JSON body.');
    }
  }

  const validationError = validate(body);
  if (validationError) return bad(res, 400, validationError);

  const attending = body.attending === true;
  const attendees = Array.isArray(body.attendees)
    ? body.attendees.map((a) => ({
        name: asString(a.name),
        isJumper: !!a.isJumper,
      }))
    : [];
  const totalPeople = attendees.length;
  const totalJumpers = attendees.filter((a) => a.isJumper).length;

  const parentName = asString(body.parentName);
  const contact = asString(body.contact);
  const childName = asString(body.childName) || null;
  const notes = asString(body.notes) || null;
  const messageToTeddy = asString(body.messageToTeddy) || null;
  const attendeesJson = JSON.stringify(attendees);

  try {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO rsvps
        (attending, parent_name, contact, child_name, attendees,
         total_people, total_jumpers, notes, message_to_teddy)
      VALUES
        (${attending}, ${parentName}, ${contact}, ${childName},
         ${attendeesJson}::jsonb, ${totalPeople}, ${totalJumpers},
         ${notes}, ${messageToTeddy})
    `;
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('RSVP insert failed:', err);
    return bad(res, 500, 'Could not save RSVP. Please try again or text the host.');
  }
}
