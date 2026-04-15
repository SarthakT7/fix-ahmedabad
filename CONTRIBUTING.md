# Contributing to Fix Ahmedabad

First off — thank you. This project only works if people care.

There are two ways to help: **fixing the world** (filing reports, correcting data) and **fixing the code**. Both matter equally, and the first one doesn't need you to touch a single line of code.

---

## Non-code contributions

### 1. File real reports
The whole point. If you see a garbage dump, photograph it and file it at [fixahm.xyz](https://fixahm.xyz). That's the single most valuable contribution anyone can make.

### 2. Correct representative data
Twitter handles change. Corporators get replaced. Parties switch. If you notice a wrong handle, outdated name, or missing official, [open an issue](https://github.com/SarthakT7/fix-ahmedabad/issues/new) with:
- Ward number and name
- What's wrong
- What it should be
- A source link if possible (AMC official page, verified X profile, news article)

### 3. Improve ward boundaries
The ward polygons come from the official 2025 AMC dataset, but real-world boundaries are messy. If you know a specific boundary is off, open an issue describing where, ideally with a map screenshot.

### 4. Share it
Tell your neighbours. Post it in your apartment WhatsApp group. Tag your ward's X community. This project is only powerful if people actually use it.

---

## Code contributions

### Setting up locally
See the **Getting Started** section of [README.md](README.md). You'll need Node 20+, a free Supabase project, and about 15 minutes.

### Workflow

1. **Fork** the repo.
2. **Create a branch**: `feat/your-feature` or `fix/your-fix`.
3. **Commit** with clear messages. Conventional commits are welcome but not required — just be descriptive.
4. **Test manually**. There is no automated test suite yet, so please walk through the full report flow on your phone (or mobile view) before opening a PR.
5. **Open a PR** against `master`. Describe what you changed and why.

### Good first issues

Look for issues tagged `good first issue`. Some things always on the list:

- Representative data corrections (wrong handle, wrong party, missing phone)
- Ward polygon refinements
- Copy polish — any line of user-facing text that could be clearer or friendlier
- Accessibility improvements (screen reader labels, contrast, keyboard nav)
- Empty-state UX — what the user sees before any reports exist in their ward

### What we're looking for

- **Bug fixes** — anything broken in the report flow is top priority
- **Accessibility** — screen reader support, larger tap targets, contrast
- **Performance** — the mobile home map should stay under 2 seconds on a 4G connection
- **Better data** — ward, rep, and boundary corrections
- **City forks** — if you want Fix Pune, Fix Surat, Fix Hyderabad, fork it. We'll link to you.

### What's off-limits

- **No bulk-automated reporting.** The tool is for real observations by real people. Bots and scripted reporting defeat the point and will break the ward-level signal.
- **No ads or affiliate links.** Ever.
- **No political party promotion.** We tag every elected official equally regardless of party. Fix Ahmedabad is a civic tool, not a campaign tool.
- **No personal attacks in copy.** Tag officials and describe the problem. Don't insult them.

### Code style

- TypeScript — keep types honest, avoid `any` unless there's a real reason.
- Follow the existing file structure. Components live under [`src/components/`](src/components/), routes under [`src/app/`](src/app/), shared logic under [`src/lib/`](src/lib/).
- Tailwind classes over custom CSS. Use the existing colour tokens for severity levels from [`src/lib/constants.ts`](src/lib/constants.ts).
- Responsive. Test both desktop and mobile layouts — the top nav and bottom tab bar are two views of the same feature.

### Database changes

If your change requires a schema change:
1. Add a new migration file in [`supabase/`](supabase/) named `migration-<short-description>.sql`.
2. Update [`supabase/schema.sql`](supabase/schema.sql) to reflect the new shape.
3. Call out the migration in your PR so reviewers can apply it locally.

---

## Code of Conduct

Be decent. This is a civic tool, not a battleground.

- Be kind to first-time contributors. Everyone starts somewhere.
- Assume good faith. If a PR looks wrong, ask questions before criticising.
- Separate the person from the code. Review the diff, not the author.
- No harassment, no slurs, no personal attacks. Full stop.

Maintainers reserve the right to close or lock any issue or PR that violates this.

---

## Questions

Not sure where to start? Open an issue and ask. We'd rather have a conversation than lose a contributor.
