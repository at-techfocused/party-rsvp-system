export const PARTY = {
  guestOfHonor: 'Teddy',
  age: 6,
  title: "Teddy's Brickday Party",
  subtitle: 'A LEGO Brickday Party',
  dateLabel: 'Saturday, May 30 · 11 AM – 1 PM',
  // 11 AM – 1 PM Eastern (May 30, 2026 is during DST → UTC-4).
  startUtc: '2026-05-30T15:00:00Z',
  endUtc: '2026-05-30T17:00:00Z',
  locationName: 'FunCity Adventure Park',
  locationAddress: '700 Boston Rd, Billerica, MA 01821',
  locationMapUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('FunCity Adventure Park, 700 Boston Rd, Billerica, MA 01821'),
  hostName: 'John (Teddy’s Dad)',
  hostPhone: '617-875-0197',
  waiverUrl: 'https://funcitybillerica.lilypadpos.app/public/onlinewaiver/waiver.php',
};

function toIcsStamp(iso) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function foldLine(line) {
  // iCalendar RFC 5545: lines should be folded at 75 octets. Simple char-based fold is fine
  // for the short values we use (no multi-byte glyphs beyond an emoji or two).
  if (line.length <= 75) return line;
  const out = [];
  let rest = line;
  out.push(rest.slice(0, 75));
  rest = rest.slice(75);
  while (rest.length > 0) {
    out.push(' ' + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return out.join('\r\n');
}

function escapeIcsText(s) {
  return String(s == null ? '' : s)
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function buildCalendarDataUrl() {
  const stamp = toIcsStamp(new Date().toISOString());
  const dtStart = toIcsStamp(PARTY.startUtc);
  const dtEnd = toIcsStamp(PARTY.endUtc);

  const summary = `${PARTY.title} 🎉`;
  const location = `${PARTY.locationName}, ${PARTY.locationAddress}`;
  const description = `Come celebrate ${PARTY.guestOfHonor} turning ${PARTY.age}! ${PARTY.subtitle}. Host: ${PARTY.hostName} ${PARTY.hostPhone}.`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Brickday RSVP//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:teddy-brickday-2026@brickday-rsvp',
    `DTSTAMP:${stamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `URL:${PARTY.waiverUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].map(foldLine);

  return (
    'data:text/calendar;charset=utf-8,' +
    encodeURIComponent(lines.join('\r\n'))
  );
}
