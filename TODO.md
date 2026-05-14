# TODO

Open improvements for InvoiceMaster, ordered by impact. Prune as items ship.

## High priority — user value

1. **JSON export/import of all data** — One-click backup of IndexedDB (business, clients, invoices, prefs) to a `.json` file; one-click restore. Privacy is the pitch, but local-only data means a cleared browser wipes everything. This removes the only real objection. _Done when:_ Business tab has Export/Import; round-trip restores identical state.

2. **Real PDF export** — Replace browser print-to-PDF with `pdf-lib` or `jsPDF`. Browser output varies by OS/browser (margins, page breaks, fonts). _Done when:_ A "Download PDF" button produces consistent output across Chrome/Safari/Firefox.

3. **Autosave for already-saved invoices** — Current autosave only protects new invoices. Editing an existing invoice and refreshing loses changes. _Done when:_ Edits to a loaded invoice persist on reload without explicit Save.

4. **Verify PWA install button fires** — Code is in [js/pwa.js](js/pwa.js); icons are now in manifest. Test on real Chrome/Edge and confirm the floating "Install app" button appears. _Done when:_ Confirmed on three Chromium browsers, deferred prompt fires.

5. **Generate a 512×512 PNG icon** — Manifest currently tops out at 192×192. Chromium installs work, but Android splash screens at high DPI use 512. _Done when:_ `/icon-512.png` exists, registered in manifest.

6. **Dashboard search + filter + sort** — Dashboard lists invoices but lacks search by client/number and sort/filter by status, date, or amount. _Done when:_ Search box filters live; status pill filters; date and amount columns sort.

7. **Duplicate invoice action** — From dashboard, "Duplicate" creates a new invoice cloned from an existing one with a fresh number and today's date. _Done when:_ Button on each dashboard row works.

8. **Mark-as-paid workflow** — Today status is just a select. Capture a `paidAt` timestamp when status → paid and show "Paid on X" badge on the printed invoice. _Done when:_ Status change to paid records date; date is visible on the invoice.

9. **Email invoice button** — A "Send" button opens the user's mail client with the invoice subject + summary in the body, attached PDF if possible. _Done when:_ Clicking Send opens `mailto:` with client name pre-filled in to/subject.

10. **Multi-currency support** — Currently `$` only. Add a per-business currency picker (USD/EUR/GBP/CAD/AUD/JPY/INR/etc.) and locale-aware formatting (1,000.00 vs 1.000,00). _Done when:_ Business profile has a currency dropdown; invoice totals format correctly.

## High priority — growth + SEO

11. **Privacy policy page** — Required for analytics/ads compliance and increases trust given "private" is the value prop. _Done when:_ `/privacy.html` exists, linked in footer, covers GA + local-only data stance.

12. **Per-industry FAQ JSON-LD** — Home already has FAQ schema. Each industry page should answer 2–3 industry-specific questions ("How do I bill for callouts as an electrician?") with `FAQPage` schema. Big rich-result win. _Done when:_ All 29 industry pages have a visible FAQ section + matching JSON-LD.

13. **Comparison pages** — `/compare/wave.html`, `/compare/freshbooks.html`, `/compare/zoho-invoice.html`. Comparison searches convert. _Done when:_ At least 3 comparison pages live, indexed, in sitemap.

14. **Blog with 5 evergreen posts** — "How to invoice as a freelancer in 2026", "Best invoice template for contractors", "What to include on a service invoice", etc. _Done when:_ `/blog/` index + 5 posts published, internal-linked from industry pages.

15. **Add 10 more industries** — Currently 29. Target 40 to widen the SEO long-tail. Suggestions: dog walker, drone operator, notary, lash tech, accountant, real estate agent, freelance editor, locksmith, pool cleaner, pest control. _Done when:_ 10 new industry pages live, in sitemap, in industries.js.

16. **Add 3 more templates** — Especially minimalist / typographic-heavy variants. _Done when:_ 3 new templates with SEO landing pages.

17. **Testimonials section on home** — Once you have real users, 3–5 short quotes near the hero with name + business. Trust signal that converts. _Done when:_ Section exists, populated with real quotes (with permission).

18. **Submit to Product Hunt, Hacker News, Indie Hackers** — Each launch can drive thousands of visitors and a backlink burst. _Done when:_ Submitted to all three with screenshots and a short pitch.

## Medium priority — quality + polish

19. **Lighthouse audit + fixes** — Run once, fix obvious wins (font preload, image dimensions, contrast, unused CSS). _Done when:_ Mobile + desktop Lighthouse scores ≥ 90 in all four categories on the home page.

20. **Sentry (or equivalent) error tracking** — Free tier catches the bugs real users hit that you'd never reproduce locally. _Done when:_ Script loaded, test error visible in dashboard.

21. **Optimize OG images** — Each is ~230 KB. Re-encode with `pngquant` or convert to WebP fallback. _Done when:_ Average OG image under 80 KB; visual quality unchanged.

22. **Accessibility audit (WCAG AA)** — Run axe DevTools. Likely wins: color contrast, missing labels on icon-only buttons, focus states. _Done when:_ axe reports zero critical violations.

23. **Dark mode** — System-preference detection + manual toggle. CSS custom properties make this cheap. _Done when:_ Toggle works; print output stays light-only.

24. **Localization (i18n)** — Start with French and Spanish. Static page versions at `/fr/` and `/es/`. _Done when:_ Home + 5 most-trafficked industry pages translated.

25. **Open-source on GitHub** — Public repo, MIT license, README with screenshots. Builds trust ("the code is right there") and gets backlinks. _Done when:_ Repo public; README links to live site; site links to repo.

## Medium priority — product depth

26. **Recurring invoice templates** — Save an invoice as a "template" you can clone monthly. _Done when:_ Mark-as-recurring + one-click generate next instance.

27. **Per-line tax + discount** — Currently tax and discount are document-level. Some businesses need per-line. _Done when:_ Optional per-line tax/discount columns; totals roll up correctly.

28. **Estimate / Quote mode** — Same form, different document type. Convert estimate → invoice in one click. _Done when:_ Document-type select on the form; "Convert to invoice" button.

29. **Partial payment tracking** — Record multiple payments against one invoice; show balance due. _Done when:_ Payments table per invoice; balance visible on printed PDF.

30. **Client portal links** — Generate a read-only share URL for an invoice that doesn't require login (data already local, so this would mean encoding the invoice in the URL or a one-time JSON export). _Done when:_ "Copy share link" button produces a viewable URL.

---

## Notes

- Items marked _done when_ have a measurable completion criterion. If you can't write one, the item isn't actionable yet — refine before adding.
- New ideas go to the bottom. Reorder when priorities change.
- Delete completed items rather than crossing them out; git history is the changelog.
