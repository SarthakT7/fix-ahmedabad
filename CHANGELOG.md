# Changelog

All notable changes to Fix Ahmedabad are documented in this file.

This project follows [Semantic Versioning](https://semver.org/) and [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions.

## [0.1.0] — 2026-04-15

**First public release.** Fix Ahmedabad goes live at [fixahm.xyz](https://fixahm.xyz).

### For users

- You can now report a garbage dump in Ahmedabad in under a minute — snap a photo, confirm the severity, hit submit.
- Your ward is detected automatically from your phone's GPS against the official 48-ward AMC boundaries, so you never have to look up which ward you're standing in.
- Every report shows your Corporator, MLA, and MP with their Twitter handles. One tap builds a pre-written X post that tags all three at once.
- You can browse every report on the public map, filter by severity and status, and see which wards have the most dumps in the stats dashboard.
- Each report gets its own shareable page with an upvote button — so one dump can become one public campaign.
- The UI is responsive — top nav on desktop, bottom tab bar on mobile. Same app, two layouts.

### What's covered

- **48 wards** across 7 administrative zones
- **192 AMC councillors** + all relevant MLAs and MPs mapped to their wards
- Official 2025 ward names and polygon boundaries

### For contributors

- Next.js 16 App Router with React 19 and TypeScript
- Tailwind CSS v4 for styling
- Leaflet + react-leaflet for the interactive map
- Turf.js `boolean-point-in-polygon` for client-side ward detection
- Supabase Postgres with Row Level Security for public reads and public inserts on reports
- Supabase Storage public bucket (`report-images`) for uploaded photos, with client-side compression to 1200px max width and 80% JPEG quality
- Three internal API routes: `/api/detect-ward`, `/api/reports` (GET and POST), `/api/stats`
- In-memory IP rate limiter — 10 reports per IP per hour on POST `/api/reports`
- Fingerprint-deduplicated upvotes so one device counts exactly once per report
- Recharts for the stats dashboard
- Full SEO metadata, Open Graph images, JSON-LD structured data, sitemap, robots.txt, and a web app manifest
- Vercel Analytics integrated for traffic visibility
- MIT license, open-source starter set (README, CONTRIBUTING, CHANGELOG, LICENSE, .env.example)
