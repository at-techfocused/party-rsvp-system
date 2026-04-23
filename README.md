# Teddy's Brickday Party RSVP

Mobile-first RSVP app for Teddy's LEGO-themed 6th birthday party. Guests scan a QR code, land on the page, and RSVP in under 30 seconds. Responses are stored in Vercel Postgres and viewable at a private admin URL.

- **Frontend:** React + Vite + Tailwind CSS
- **API:** Vercel serverless functions (Node)
- **Storage:** Neon Postgres via the Vercel Marketplace integration — auto-provisioned, no GCP, no Sheets, no manual API keys

## Deploy (one-time, ~5 minutes, all in the Vercel dashboard)

### 1. Import the repo

1. Sign in to [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project** → pick `party-rsvp-system` → **Import**.
3. Vercel auto-detects Vite. Don't touch the build settings.

### 2. Add a Neon Postgres database

1. In the project dashboard: **Storage** tab → **Create Database** → **Neon (Postgres)**.
2. Pick a region (e.g., `us-east-1` / Washington D.C.) → **Continue** → **Connect**.
3. Vercel auto-injects the database connection string as `DATABASE_URL` (Neon's free tier is plenty for a party).

That's it for storage. The app creates its `rsvps` table on the first submission — no SQL to run yourself.

### 3. Set the admin password

In **Settings → Environment Variables**, add:

| Key              | Value                              |
| ---------------- | ---------------------------------- |
| `ADMIN_PASSWORD` | any string you'll remember         |

Apply it to **Production** (and **Preview** if you want previews to share data).

### 4. Deploy

Click **Deploy** in the Vercel dashboard (or just push to the production branch — every push auto-deploys). You'll get a URL like `teddy-brickday.vercel.app`.

That's the entire backend setup. No service accounts, no API keys to copy, no spreadsheet to create or share.

### 5. View RSVPs

Open `https://YOUR-URL.vercel.app/api/admin?key=YOUR_PASSWORD` in any browser and bookmark it. You'll see a sortable table with totals (yes / no / total people / total jumpers) plus every response, newest first. Refresh to see the latest.

### 6. Generate the QR code

Point a QR code at the production URL:

```bash
npx qrcode "https://teddy-brickday.vercel.app" -o teddy-rsvp.png
```

Or paste the URL into [qr-code-generator.com](https://www.qr-code-generator.com/) and download the PNG. Print at ~2 inches or larger for reliable scans.

## Run locally (optional)

The Vite dev server can render the UI but won't execute the `/api` serverless functions. To test the full flow, use the Vercel CLI:

```bash
npm install
npm i -g vercel
vercel link            # connects this folder to your Vercel project
vercel env pull        # downloads DATABASE_URL + ADMIN_PASSWORD to .env.development.local
vercel dev             # runs both the Vite frontend and the API functions
```

For UI-only iteration (no API):

```bash
npm run dev
```

## Project layout

```
api/
  rsvp.js                 POST endpoint; validates + inserts into Postgres
  admin.js                GET endpoint; password-gated HTML table of all RSVPs
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

## Database schema

Auto-created on first write:

```sql
CREATE TABLE rsvps (
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
);
```

If you ever want the raw data, use Vercel's **Storage → your database → Data** tab to run any SQL you like (e.g., `SELECT * FROM rsvps WHERE attending = true ORDER BY created_at`).
