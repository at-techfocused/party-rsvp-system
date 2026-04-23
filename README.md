# Teddy's Brickday Party RSVP

Mobile-first RSVP app for Teddy's LEGO-themed 6th birthday party. Guests scan a QR code, land on the page, and RSVP in under 30 seconds. Responses append to a Google Sheet — no database, no admin UI.

- **Frontend:** React + Vite + Tailwind CSS
- **API:** Vercel serverless function (Node)
- **Storage:** Google Sheets via a service account

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server does not execute the `/api` serverless function. To test the full flow locally, install the Vercel CLI and run `vercel dev` after completing the Google Sheets setup below.

```bash
npm i -g vercel
vercel dev
```

## Deploy

### 1. Create the Google Sheet

1. In Google Drive, create a new Google Sheet called **Teddy Brickday RSVPs**.
2. Paste this header row into row 1 (the API will also create it if missing, but doing it up front avoids a race on the first submit):

```
Timestamp	Attending	Parent Name	Contact	Child Name	Attendees	Jumpers	Non-Jumpers	Total People	Total Jumpers	Notes	Message to Teddy
```

3. Copy the Sheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/`**`<THIS_IS_THE_ID>`**`/edit`

### 2. Create a Google Cloud service account

1. Open [console.cloud.google.com](https://console.cloud.google.com/) and create (or select) a project.
2. Enable the **Google Sheets API**: APIs & Services → Library → search "Google Sheets API" → Enable.
3. APIs & Services → Credentials → **Create credentials** → **Service account**.
4. Give it a name (e.g., `brickday-rsvp`). No roles are required at the project level.
5. Open the new service account → **Keys** → **Add key** → **Create new key** → **JSON**. A JSON file downloads — keep it safe, it is the only copy.

From that JSON file you need:
- `client_email` → `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key`  → `GOOGLE_PRIVATE_KEY` (keep the literal `\n` escapes — the server un-escapes them at runtime)

### 3. Share the Sheet with the service account

Open the Sheet → **Share** → paste the service account's `client_email` → give it **Editor** access → Send. Without this step the API returns a 500.

### 4. Set env vars in Vercel

In the Vercel project dashboard, go to **Settings → Environment Variables** and add all three for **Production** (and **Preview** if you want previews to write too):

| Key                              | Value                                                           |
| -------------------------------- | --------------------------------------------------------------- |
| `GOOGLE_SHEET_ID`                | The Sheet ID from step 1                                        |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`   | `client_email` from the JSON key                                |
| `GOOGLE_PRIVATE_KEY`             | `private_key` from the JSON key, newlines kept as literal `\n`  |

When pasting `GOOGLE_PRIVATE_KEY` into Vercel, include the full value starting with `-----BEGIN PRIVATE KEY-----\n` and ending with `\n-----END PRIVATE KEY-----\n`. Don't wrap it in quotes in the Vercel UI.

### 5. Deploy

```bash
npm i -g vercel
vercel            # first run: link / create the project
vercel --prod     # promote to production
```

Vercel auto-detects Vite (static build output in `dist/`) and picks up `api/rsvp.js` as a Node serverless function.

### 6. Generate the QR code

Point a QR code at the production URL (e.g., `https://teddy-brickday.vercel.app`):

```bash
npx qrcode "https://teddy-brickday.vercel.app" -o teddy-rsvp.png
```

Or paste the URL into [qr-code-generator.com](https://www.qr-code-generator.com/) and download the PNG. Print it at ~2 inches or larger for reliable scans.

## Viewing RSVPs

Open the Google Sheet. Each submission is one row. Nobody needs an account or a login — sharing the Sheet with yourself (the host) is enough.

## Project layout

```
api/
  rsvp.js                 POST endpoint; validates + appends to the Sheet
src/
  App.jsx                 screen router
  main.jsx
  index.css               Tailwind + theme variables + brick styles
  partyDetails.js         hardcoded party info
  components/
    BrickHeader.jsx       colored band + 5 studs
    BrickButton.jsx       chunky brick CTA with drop shadow
    Input.jsx             labeled input / textarea
    AttendeeRow.jsx       name + jumper toggle, removable
    JumperToggle.jsx      segmented control
  screens/
    Welcome.jsx
    RSVPForm.jsx
    Declined.jsx
    ThankYou.jsx
vercel.json               SPA rewrites
```
