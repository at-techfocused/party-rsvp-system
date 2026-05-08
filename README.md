# Teddy's Brickday Party RSVP

Mobile-first RSVP web app for Teddy's LEGO-themed 6th birthday party. Parents scan a QR code, RSVP in under 30 seconds, get an "Add to Calendar" / "Get directions" / "Sign the jump waiver" link on the way out, and the host gets a real-time email alert plus a private dashboard. No app to install, no account to create on the parent side.

## What it does

**For parents (one screen → 30 seconds):**

- Scan QR → land on a single-page React app on their phone.
- "Yes, we'll be there!" or "Sorry, can't make it."
- If yes: name, contact, child's name, jumper / non-jumper toggle, optional additional guests with their own toggles, optional notes.
- If no: just name (contact and message to Teddy are optional).
- On submit, the app sets an HttpOnly cookie tying the parent to their RSVP. Coming back later (same device / browser) shows a banner: "You've already RSVP'd as attending. Edit my RSVP." Tapping it pre-fills the form so they can change anything — same row gets updated, no duplicates.
- After a yes: confirmation card with their submitted attendees, a yellow waiver-required reminder, a big red "Sign the jump waiver" button, an "Add to calendar" link, and a "Get directions" link.

**For the host (`/admin`):**

- Bookmark `https://YOUR-URL.vercel.app/admin`.
- Password sign-in (your `ADMIN_PASSWORD`) sets a 30-day session cookie on that device.
- See running totals (saying yes / saying no / total people / total jumpers), every response newest-first, and per-row **Edit** and **Delete** buttons (delete prompts a JS confirm).
- "Email me when an RSVP is submitted" card lets you set / clear the alert recipient on the fly without redeploying.
- Log out clears the session.

## Tech stack and external services

| Layer | Tech | Why |
| --- | --- | --- |
| Frontend | React 18 + Vite + Tailwind CSS | Fast mobile build, ~50 KB gzipped JS, custom LEGO "brick" component system |
| API | Vercel serverless functions (Node) | Two endpoints: `api/rsvp.js`, `api/admin.js` |
| Validation | [Zod](https://zod.dev/) | Strict schema on every public POST — rejects unknown keys, type-checks attendees, enforces length caps |
| Database | [Neon Postgres](https://neon.com/) via the Vercel Marketplace | One-click provision; `DATABASE_URL` auto-injected |
| DB driver | [`@neondatabase/serverless`](https://www.npmjs.com/package/@neondatabase/serverless) | HTTP-tunnelled Postgres, fast cold starts on Vercel |
| Background work | [`@vercel/functions`](https://www.npmjs.com/package/@vercel/functions) `waitUntil()` | Serverless function returns 200 instantly while the email finishes in the background |
| Email alerts (optional) | [Resend](https://resend.com/) | Sends "New RSVP" / "Updated RSVP" emails to the host |
| Hosting / CI / CDN | [Vercel](https://vercel.com/) | Auto-deploys on push, edge-cached static assets, env-var management |
| Calendar file | Static `text/calendar` file at `/teddy-brickday.ics` | Served `inline` so iOS Safari pops the native "Add Event" sheet directly |
| Maps | Google Maps universal search URL | One link works on iOS, Android, and desktop |
| Waiver | FunCity's online waiver page | External link; opens in a new tab |

The only **required** external services are Vercel + Neon. Resend is optional — disable it by leaving `RESEND_API_KEY` unset and the rest of the app works exactly the same.

## Deploy (one-time, ~5 minutes, all in the Vercel dashboard)

### 1. Import the repo

1. Sign in to [vercel.com](https://vercel.com) with your GitHub account.
2. **Add New → Project** → pick `party-rsvp-system` → **Import**.
3. Vercel auto-detects Vite. Don't touch the build settings.

### 2. Add a Neon Postgres database

1. In the project dashboard: **Storage** tab → **Create Database** → **Neon (Postgres)**.
2. Pick a region (e.g., `us-east-1` / Washington D.C.) → **Continue** → **Connect**.
3. Vercel auto-injects the database connection string as `DATABASE_URL` (Neon's free tier is plenty for a party).

That's it for storage. The app creates its `rsvps` and `app_settings` tables on the first request — no SQL to run yourself.

### 3. Set the admin password

In **Settings → Environment Variables**, add:

| Key              | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | any string you'll remember (longer is better — guessable picks like "teddy" are weak) |

Apply it to **Production** (and **Preview** if you want previews to share data).

### 4. Deploy

Click **Deploy** in the Vercel dashboard (or just push to the production branch — every push auto-deploys). You'll get a URL like `teddy-brickday.vercel.app`.

That's the entire required backend setup. No service accounts, no API keys to copy, no spreadsheet to create or share.

### 5. View RSVPs

Open `https://YOUR-URL.vercel.app/admin`. You'll get a password prompt — enter `ADMIN_PASSWORD` and the dashboard remembers you on that device for 30 days via an HttpOnly cookie.

Bookmark `/admin`. You'll see:

- Totals: yes, no, total people, total jumpers
- A "Email me when an RSVP is submitted" card (see step 6)
- Every response, newest first, with **Edit** and **Delete** buttons
- A **Log out** button in the header when you want to clear the session

### 6. (Optional) Email alerts when someone RSVPs

If you want to be emailed on every new or updated RSVP:

1. Sign up at [resend.com](https://resend.com) (free tier). **Sign up with the email you want the alerts to land in** — Resend's shared `onboarding@resend.dev` sender can only deliver to the account owner's email until you verify your own domain.
2. Create an API key in the Resend dashboard.
3. In Vercel: **Settings → Environment Variables** → add `RESEND_API_KEY` with the value from step 2. Redeploy (any new deploy picks it up).
4. Back at `/admin`, there's a **"Email me when an RSVP is submitted"** card at the top. Enter your email, click **Save**. You'll get an email whenever a parent submits or updates their RSVP.

You can change or clear the recipient at any time from the same card. The email is dispatched via Vercel's `waitUntil()` so it doesn't delay the parent's Thank-You screen.

### 7. Generate the QR code

Point a QR code at the production URL:

```bash
npx qrcode "https://teddy-brickday.vercel.app" -o teddy-rsvp.png
```

Or paste the URL into [qr-code-generator.com](https://www.qr-code-generator.com/) and download the PNG. Print at ~2 inches or larger for reliable scans.

## Environment variables

| Variable | Required? | Source | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Auto-injected by Vercel when you connect Neon | Postgres connection string |
| `ADMIN_PASSWORD` | Yes | You set it manually | Sign-in password for `/admin` |
| `RESEND_API_KEY` | No (alerts disabled if absent) | resend.com | Sends email alerts to the host |

`POSTGRES_URL` and `NEON_DATABASE_URL` are accepted as fallbacks for the database, in case Vercel's auto-injection naming changes.

See [`.env.example`](./.env.example) for a copy-paste template.

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
  rsvp.js                  GET (cookie-keyed lookup) + POST (Zod-validated upsert)
  admin.js                 /admin dashboard: login form, list, edit, delete, logout, settings
src/
  App.jsx                  screen router; calls GET /api/rsvp on mount to detect existing RSVP
  main.jsx
  index.css                Tailwind + theme variables + brick styles
  partyDetails.js          hardcoded party info (date, location, host, waiver URL)
  components/
    BrickHeader.jsx        colored band + 5 studs
    BrickButton.jsx        chunky brick CTA with drop shadow
    Input.jsx              labeled input / textarea
    AttendeeRow.jsx        name + jumper toggle, removable
    JumperToggle.jsx       segmented control
  screens/
    Welcome.jsx            invite + edit-banner + Yes/No CTAs
    RSVPForm.jsx           "yes" form, pre-fills from existingRsvp when editing
    Declined.jsx           "no" form, pre-fills from existingRsvp when editing
    ThankYou.jsx           recap + waiver CTA + add-to-calendar + map link
public/
  teddy-brickday.ics       static iCalendar file linked from the "Add to calendar" links
vercel.json                SPA rewrite + /admin → /api/admin + headers for the .ics file
```

## Database schema

Auto-created on first request — no manual SQL needed:

```sql
CREATE TABLE rsvps (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  attending BOOLEAN NOT NULL,
  parent_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  child_name TEXT,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_people INT NOT NULL DEFAULT 0,
  total_jumpers INT NOT NULL DEFAULT 0,
  notes TEXT,
  message_to_teddy TEXT,
  edit_token TEXT                     -- opaque token stored in the parent's cookie
);

CREATE TABLE app_settings (            -- e.g. notification_email
  key TEXT PRIMARY KEY,
  value TEXT
);
```

Subsequent schema changes go through `ALTER TABLE … ADD COLUMN IF NOT EXISTS` so existing rows are preserved across deploys.

## How the flows are wired

**Parent identity (returning visits / edits)**

- On successful POST to `/api/rsvp`, the server generates a 48-hex-char `edit_token`, stores it on the row, and sets it as `Set-Cookie: brickday_rsvp=…; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=1y`.
- On any subsequent visit, the SPA fetches `GET /api/rsvp` from inside the page (always same-origin → cookie sent under SameSite=Strict). The server returns the matching row or `{ rsvp: null }`.
- If a row is returned, `App.jsx` shows the edit banner on Welcome and pre-fills the form. POST to `/api/rsvp` with that cookie present **updates** the existing row instead of inserting — no duplicate RSVPs from the same device.

**Admin auth**

- Login form posts the password to `/admin`. The server compares it with `crypto.timingSafeEqual` over SHA-256 digests (constant-time, length-safe).
- On match, the server sets `Set-Cookie: brickday_admin=<HMAC>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=30d`. The cookie value is `HMAC_SHA256(ADMIN_PASSWORD, "admin-v1")`, so rotating `ADMIN_PASSWORD` in Vercel invalidates every existing admin session automatically.
- `vercel.json` rewrites `/admin` → `/api/admin` so the host types `/admin`, not `/api/admin`.

**Validation**

- All POST bodies to `/api/rsvp` go through a strict Zod schema with `.strict()` (rejects unknown keys), per-field length caps (200 chars for names, 2000 for free-text), an attendees array capped at 20, and a `superRefine` block that enforces "if attending=true, contact + childName + at least one attendee are required."
- Postgres queries use the Neon SDK's tagged-template form, which parameterises every value — Zod is defense-in-depth on top of that.

**Email alerts**

- After a successful insert/update, the server invokes `waitUntil(notifyHost(...))` from `@vercel/functions`. The HTTP response goes out immediately; Vercel keeps the function alive in the background while the Resend POST completes.
- If `RESEND_API_KEY` isn't configured, `notifyHost` short-circuits and returns immediately. The admin card surfaces a yellow warning so the host knows alerts are off.

If you ever want the raw data, open Vercel's **Storage → your database → Data** tab and run any SQL you like (e.g., `SELECT * FROM rsvps WHERE attending = true ORDER BY created_at`).

## Security notes

- **Cookies:** Both `brickday_admin` and `brickday_rsvp` are `HttpOnly` (no JS access), `Secure` (HTTPS-only), and `SameSite=Strict` (no cross-site sends → blocks CSRF on the admin endpoints and the parent edit endpoint).
- **No PII in cookies:** the admin cookie holds an HMAC, not the password; the parent cookie holds an opaque random token, not personal data.
- **No client-side secrets:** the `RESEND_API_KEY` only ever lives in Vercel env vars; the front-end bundle never sees it.
- **Password rotation:** changing `ADMIN_PASSWORD` invalidates all admin sessions automatically (HMAC keys change → all existing cookies fail comparison).
- **Public POST surface:** `/api/rsvp` is unauthenticated by design (parents shouldn't need accounts), but Zod + length caps + the attendees-cap-of-20 keep the worst payloads out and bound the size of any one row.

## Acknowledgments / external dependencies

Direct npm dependencies (see [`package.json`](./package.json) for versions):

- [`react`](https://react.dev/) and [`react-dom`](https://react.dev/) — UI runtime
- [`@vitejs/plugin-react`](https://vitejs.dev/) and [`vite`](https://vitejs.dev/) — build / dev server
- [`tailwindcss`](https://tailwindcss.com/), [`postcss`](https://postcss.org/), [`autoprefixer`](https://github.com/postcss/autoprefixer) — styling pipeline
- [`@neondatabase/serverless`](https://www.npmjs.com/package/@neondatabase/serverless) — Postgres driver
- [`@vercel/functions`](https://www.npmjs.com/package/@vercel/functions) — `waitUntil` for background work
- [`zod`](https://zod.dev/) — request schema validation

External SaaS used at runtime: **Vercel** (hosting + CI), **Neon** (Postgres), **Resend** (optional email), **Google Maps** (directions link), **FunCity Adventure Park** (waiver page link).
