# Fix Ahmedabad

> Report garbage. Tag your neta. Fix Ahmedabad.

**Live at [fixahm.xyz](https://fixahm.xyz)**

---

## Why this exists

Ahmedabad has a garbage problem. That's not a secret.

What is less talked about is that there's no easy way to document it, no way to know which politician is responsible for which dump, and no public pressure mechanism when nothing gets done. A complaint buried inside a government app does nothing. A public post with the politician's handle attached is a different story.

Fix Ahmedabad is a public, ward-by-ward record of the city's garbage. The more reports we have, the harder it gets for anyone to claim they didn't know, and the clearer it becomes which wards have been ignored.

Heavily inspired by **[NammaKasa](https://www.nammakasa.in/)**, which does this for Bengaluru.

## How it works

1. **Spot a garbage dump.** Take a photo.
2. **App auto-detects your ward** using your phone's location.
3. **See who's responsible** — the Corporator, MLA, and MP for that area.
4. **Tag them publicly on X** with one tap. A pre-written post with their handles, the ward, the severity, and the photo.
5. **Your report joins a public map** so the whole city can see the pattern.

That's it. No login. No gatekeeping. Just receipts.

## What's inside

- **Interactive map** of Ahmedabad with every reported dump, colour-coded by severity
- **Auto ward detection** using GPS and the official ward polygon boundaries
- **Photo upload** with client-side compression so it works on weak mobile connections
- **Four severity levels**, each with a plain-language description — "a few bags" vs. "entire stretch of road covered"
- **Representative lookup** — every ward knows its Corporator, MLA, and MP
- **One-tap X share** with hashtags and handles pre-filled
- **Public feed** of all reports
- **Stats dashboard** — total reports, breakdown by severity, top 10 offending wards (the accountability scoreboard)
- **Per-ward pages** and **per-report pages** with upvotes and shareable links
- **Rate limiting** so the system can't be spammed
- **Responsive design** — works on desktop and phone, with a bottom tab bar on mobile and a top nav on desktop

## Coverage

- **48 wards** across **7 zones** (Central, East, West, North, South, North West, South West)
- **192 AMC councillors** + MLAs + MPs mapped to their wards
- Official 2025 ward names and boundaries

## Tech stack

| Layer | What | Why |
|---|---|---|
| Framework | [Next.js 16](https://nextjs.org) App Router | Fast, SEO-friendly, server components |
| UI | React 19, TypeScript, [Tailwind CSS v4](https://tailwindcss.com) | Standard Vercel-stack |
| Map | [Leaflet](https://leafletjs.com) + [react-leaflet](https://react-leaflet.js.org) | Free, open, no API key |
| Geospatial | [Turf.js](https://turfjs.org) (`boolean-point-in-polygon`) | Ward detection from GPS |
| Database | [Supabase](https://supabase.com) (Postgres + Storage) | Free tier covers us, handles auth-free public writes |
| Charts | [Recharts](https://recharts.org) | Stats dashboard |
| Hosting | [Vercel](https://vercel.com) + Vercel Analytics | One-click deploys |

## Project structure

```
fix-ahmedabad/
├── public/
│   └── ahmedabad-wards.geojson    # Official ward polygon data
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── detect-ward/       # POST lat/lng → ward info
│   │   │   ├── reports/           # GET list, POST new (rate-limited)
│   │   │   └── stats/             # GET aggregated stats
│   │   ├── feed/                  # Public report feed
│   │   ├── report/[reportId]/     # Individual report page
│   │   ├── stats/                 # Stats dashboard
│   │   ├── ward/[wardId]/         # Per-ward page
│   │   ├── layout.tsx             # Root layout, metadata, analytics
│   │   └── page.tsx               # Home map
│   ├── components/
│   │   ├── layout/                # Header, mobile nav
│   │   ├── map/                   # Leaflet map wrapper
│   │   ├── report/                # Form, photo upload, severity picker
│   │   └── representative/        # Rep card
│   ├── lib/
│   │   ├── geo/                   # Ward lookup (point-in-polygon)
│   │   ├── social/                # Twitter/X intent URL builder
│   │   └── supabase/              # DB client
│   └── types/                     # Shared TypeScript types
├── supabase/
│   ├── schema.sql                 # Tables, indexes, RLS policies
│   ├── migration-consolidate-reps.sql
│   └── seed.sql                   # Zones, wards, initial data
└── scripts/
    └── parse-and-seed-councillors.mjs  # Loads 192 councillors into DB
```

## Getting started

### Prerequisites

- **Node.js 20+**
- A free **Supabase** project ([supabase.com](https://supabase.com))

### 1. Clone and install

```bash
git clone https://github.com/SarthakT7/fix-ahmedabad.git
cd fix-ahmedabad
npm install
```

### 2. Environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase dashboard → Project Settings → API
- `SUPABASE_SERVICE_ROLE_KEY` — only needed to run the councillor seed script, **never expose this in the browser**

### 3. Set up the database

In the Supabase SQL editor, run these in order:

1. `supabase/schema.sql` — creates tables, indexes, and Row Level Security policies
2. `supabase/migration-consolidate-reps.sql` — reshapes the representatives schema
3. `supabase/seed.sql` — seeds zones and ward polygons

Then seed the 192 councillors locally:

```bash
node scripts/parse-and-seed-councillors.mjs
```

### 4. Create the storage bucket

In Supabase dashboard → Storage → **New bucket**:
- Name: `report-images`
- Public: **Yes**
- File size limit: `5 MB`
- Allowed MIME types: `image/*`

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The UI is responsive — the top nav collapses to a bottom tab bar below the `md` breakpoint, so you can test both layouts by resizing the window.

## Data model

Five core tables:

- **`zones`** — 7 administrative zones (Central, East, West, etc.)
- **`wards`** — 48 wards, each with a geojson polygon boundary and centroid
- **`representatives`** — elected officials with role (`corporator` / `mla` / `mp`), party, Twitter handle
- **`ward_representatives`** — many-to-many: corporators cover 1 ward, MLAs ~3, MPs ~18
- **`reports`** — a report is a lat/lng, a ward, severity, status, photo URL, optional description
- **`report_upvotes`** — fingerprint-deduped upvotes so one device counts once

Full schema in [`supabase/schema.sql`](supabase/schema.sql).

## API

Three internal routes, all under `/api/`:

| Route | Method | What |
|---|---|---|
| `/api/detect-ward` | POST | Body `{latitude, longitude}` → returns the matching ward, or 404 if outside Ahmedabad |
| `/api/reports` | GET | Paginated list with optional `ward_id`, `severity`, `status` filters |
| `/api/reports` | POST | Creates a report. Rate limited to **10 per IP per hour** |
| `/api/stats` | GET | Totals, severity breakdown, top 10 wards |

## Contributing

**Yes, please.** This project is only useful if people care, and it gets more useful every time someone fixes a wrong Twitter handle, corrects a ward boundary, or files a real report.

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to help — both code and non-code ways.

Good first issues:
- Fix a wrong representative handle or party
- Improve a ward polygon
- Add a severity example
- Polish user-facing copy
- Fork it to another city (Fix Pune? Fix Surat? go for it)

## Acknowledgements

- **[NammaKasa](https://www.nammakasa.in/)** — the Bengaluru project this is heavily inspired by. They did this first.
- Every person who files a report. That's the whole point.

## License

[MIT](LICENSE) — do what you want with it. If you fork it to another city, I'd love to hear about it.

## Questions

Open an issue. Happy to answer.
