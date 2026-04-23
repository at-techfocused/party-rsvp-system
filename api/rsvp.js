import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const SHEET_HEADERS = [
  'Timestamp',
  'Attending',
  'Parent Name',
  'Contact',
  'Child Name',
  'Attendees',
  'Jumpers',
  'Non-Jumpers',
  'Total People',
  'Total Jumpers',
  'Notes',
  'Message to Teddy',
];

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

async function getSheet() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !email || !rawKey) {
    throw new Error('Missing Google Sheets environment variables.');
  }

  const privateKey = rawKey.replace(/\\n/g, '\n');

  const jwt = new JWT({
    email,
    key: privateKey,
    scopes: SCOPES,
  });

  const doc = new GoogleSpreadsheet(sheetId, jwt);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  if (!sheet) throw new Error('No sheet found in spreadsheet.');

  // Ensure header row exists and matches.
  try {
    await sheet.loadHeaderRow();
    const current = sheet.headerValues || [];
    const headersMissing = SHEET_HEADERS.some((h, i) => current[i] !== h);
    if (headersMissing) {
      await sheet.setHeaderRow(SHEET_HEADERS);
    }
  } catch {
    await sheet.setHeaderRow(SHEET_HEADERS);
  }

  return sheet;
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
  const attendees = Array.isArray(body.attendees) ? body.attendees : [];

  const jumpers = attendees.filter((a) => a.isJumper).map((a) => asString(a.name));
  const nonJumpers = attendees.filter((a) => !a.isJumper).map((a) => asString(a.name));
  const allNames = attendees.map((a) => asString(a.name));

  const row = {
    Timestamp: new Date().toISOString(),
    Attending: attending ? 'Yes' : 'No',
    'Parent Name': asString(body.parentName),
    Contact: asString(body.contact),
    'Child Name': asString(body.childName),
    Attendees: allNames.join('; '),
    Jumpers: jumpers.join('; '),
    'Non-Jumpers': nonJumpers.join('; '),
    'Total People': attendees.length,
    'Total Jumpers': jumpers.length,
    Notes: asString(body.notes),
    'Message to Teddy': asString(body.messageToTeddy),
  };

  try {
    const sheet = await getSheet();
    await sheet.addRow(row);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('RSVP append failed:', err);
    return bad(res, 500, 'Could not save RSVP. Please try again or text the host.');
  }
}
