# InvoiceMaster — project notes

Static, vanilla-JS invoice generator. No build step, no framework, no backend.
Data lives in the browser (IndexedDB).

## Stack & constraints

- **Vanilla JS modules** (ES `import` syntax). No React/Vue/Tailwind. Keep it that way.
- **No build step.** Files are served as-is.
- **IndexedDB** for all persistence. Stores: `business`, `clients`, `invoices`, `industryPrefs`.
- **Mobile-first chrome** (tabs, toolbar, page header). But the **invoice sheet itself is locked to A4 width (794px)** — see `.sheet-fit` + `.invoice-sheet` in [css/styles.css](css/styles.css). Internal layout never reflows; narrow viewports get horizontal scroll on the sheet area only.
- **Ink-light templates.** Never use large solid color fills — businesses print these. Color belongs on thin accent lines, borders, and headings only. See [memory/feedback_design_principles.md](../../.claude/projects/-Users-gradikayamba-invoicemaster/memory/feedback_design_principles.md) for the full rule.

## Architecture

### Two-level entry concept
- **Templates** (10 in `js/templates.js`) = *visual styles* — Contractor, Auto Shop, Modern, Classic, etc. Each is a `data-template="..."` value on `.invoice-sheet` that picks up template-specific CSS.
- **Industries** (29 in `js/industries.js`) = *user-facing entry points* — Electrician, Plumber, Photographer, Tutor, etc. Each industry maps to a template + brings its own `customFields`, `referenceLabel`, `showShipTo`, and accent `color`. Industries are the home-page cards and the `/industries/<id>.html` SEO pages.

### Shared sheet markup — single source of truth
`sheetInnerHtml(opts)` in [js/editor.js](js/editor.js) returns the invoice-sheet inner markup. Both the editor and the home-page showcase call it. **Always edit the sheet structure here — never duplicate markup.**

Modes:
- `mode: 'editor'` — interactive form inputs, editable labels (contenteditable), IDs for JS hooks, dynamic `#custom-fields-header` containers
- `mode: 'preview'` — static `<span class="value-text">` elements with pre-filled sample values, no IDs (avoid DOM collisions across 29 cards), `data-mode="preview"` triggers CSS that strips input chrome

Visibility flags applied symmetrically in both modes:
- `hideShipTo` (industry's `showShipTo: false`)
- Materials/Labor rows hidden unless both have non-zero totals (`showSplit`)
- Reference row hidden when industry/template has header custom fields

### Editable everything
- All standard labels (`Number`, `Date`, `Bill to`, `Description`, `Tax`, etc.) are `<span class="editable-label" data-label-key="..." contenteditable="true">`. Saved as `invoice.labels` per invoice AND in `industryPrefs.labels` as the user's per-industry preference.
- Custom fields are fully user-editable: rename labels, remove (×), add new ones (+ Add field). Saved as `invoice.customFields` per invoice AND in `industryPrefs.customFields`.
- A **Reset fields** button in the editor toolbar clears the `industryPrefs` entry and reverts to the industry's built-in defaults.

### File map
- [index.html](index.html) — SEO home page (hero, 29-industry showcase, features, FAQ)
- [templates/<id>.html](templates/) — 10 SEO landing pages for each visual template
- [industries/<id>.html](industries/) — 29 SEO landing pages for each industry; each sets `<meta name="initial-industry">` so the editor loads with correct config
- [js/editor.js](js/editor.js) — `sheetInnerHtml` + form/dashboard/business markup builders
- [js/invoice.js](js/invoice.js) — editor logic, saves/loads invoices, manages industry prefs
- [js/showcase.js](js/showcase.js) — home page card grid; calls `sheetInnerHtml({ mode: 'preview' })`
- [js/dashboard.js](js/dashboard.js) — Dashboard tab (stats cards, filters, search, sort, status badges)
- [js/templates.js](js/templates.js) — `TEMPLATES`, `CATEGORIES`, `PAYMENT_TERMS`, `STATUSES`, `LINE_TYPES`
- [js/industries.js](js/industries.js) — `INDUSTRIES` array (29 entries with `template`, `customFields`, `showShipTo`, `color`, `labels` overrides, `blurb`)
- [js/db.js](js/db.js) — IndexedDB wrapper. **DB_VERSION bump required when adding stores.**

## Cache busting

The codebase has no build step, so ES module imports cache aggressively in browsers — including the `import` statements **inside** JS files (these cache independently of the entry script). Updating CSS/JS without busting the cache means stale content on reload.

**To bust the cache after any CSS/JS change:**

```bash
node bust-cache.mjs
```

[bust-cache.mjs](bust-cache.mjs) walks every `.html` and `.js` file, strips any existing `?v=<timestamp>` query string, and appends a fresh one to:
- `<link href="css/*.css">` and `<script src="js/*.js">` in HTML
- All `import ... from './*.js'` and `import('./...js')` statements in JS

It also injects/updates a `<span class="version-stamp">v <timestamp></span>` inside every `.site-footer` so you can verify in the browser that the latest version is loaded. Subtle monospace text in the footer; on first run, the stamp is auto-inserted into the `.wrap` of each footer.

Re-running is idempotent. A single run touches ~49 files in under a second.

## Generators

Two HTML pages are too repetitive to write by hand. Use the generators when adding/changing templates or industries:

- **Template pages** — regenerate from `js/templates.js` when adding a new template or renaming SEO copy. The generator pattern lives in past bash one-liners; create a fresh one if needed. Each page sets `<meta name="initial-template">`.
- **Industry pages** — same idea, reading `js/industries.js`. Each page sets `<meta name="initial-industry">`.
- **Sitemap** — regenerate `sitemap.xml` from `TEMPLATES` + `INDUSTRIES`. Pattern documented in chat history; node script.

After regenerating pages, **always run `node bust-cache.mjs`**.

## Conventions

- Memory rules apply (see CLAUDE memory dir). Most important:
  - **Ink-light** for any printable surface
  - **Mobile-first** for page chrome (not the sheet itself)
  - **Logo is first-class** — every template gives it a slot, even when empty (shows "LOGO" placeholder)
- Use IDs in editor mode for JS hooks; never in preview mode (would collide across 29 cards).
- Keyboard handling on contenteditable labels: Enter blurs (commits change), paste is sanitized to single-line plain text.
- IndexedDB schema changes require bumping `DB_VERSION` in [js/db.js](js/db.js).
- All custom field rows hide on print when their value is blank (`.custom-field-row:has([data-cf-value]:placeholder-shown)`).
