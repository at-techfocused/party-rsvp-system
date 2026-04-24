export const PARTY = {
  guestOfHonor: 'Teddy',
  age: 6,
  title: "Teddy's Brickday Party",
  subtitle: 'A LEGO Brickday Party',
  dateLabel: 'Saturday, May 30 · 11 AM – 1 PM',
  locationName: 'FunCity Adventure Park',
  locationAddress: '700 Boston Rd, Billerica, MA 01821',
  locationMapUrl:
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('FunCity Adventure Park, 700 Boston Rd, Billerica, MA 01821'),
  // Static .ics served from /public with Content-Type: text/calendar and
  // Content-Disposition: inline (configured in vercel.json). On iOS Safari
  // this triggers the native "Add to Calendar" sheet directly — no download,
  // no manual open.
  calendarUrl: '/teddy-brickday.ics',
  hostName: 'John (Teddy’s Dad)',
  hostPhone: '617-875-0197',
  waiverUrl: 'https://funcitybillerica.lilypadpos.app/public/onlinewaiver/waiver.php',
};
