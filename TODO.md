# TODO

Open improvements for InvoiceMaster, ordered by impact. Prune as items ship.

## High priority — growth + SEO

1. **Per-industry FAQ JSON-LD** — Home already has FAQ schema. Each industry page should answer 2–3 industry-specific questions ("How do I bill for callouts as an electrician?") with `FAQPage` schema. Big rich-result win. _Done when:_ All 29 industry pages have a visible FAQ section + matching JSON-LD.

2. **Comparison pages** — `/compare/wave.html`, `/compare/freshbooks.html`, `/compare/zoho-invoice.html`. Comparison searches convert. _Done when:_ At least 3 comparison pages live, indexed, in sitemap.

3. **Blog with 5 evergreen posts** — "How to invoice as a freelancer in 2026", "Best invoice template for contractors", "What to include on a service invoice", etc. _Done when:_ `/blog/` index + 5 posts published, internal-linked from industry pages.

4. **Add 10 more industries** — Currently 29. Target 40 to widen the SEO long-tail. Suggestions: dog walker, drone operator, notary, lash tech, accountant, real estate agent, freelance editor, locksmith, pool cleaner, pest control. _Done when:_ 10 new industry pages live, in sitemap, in industries.js.

5. **Add 3 more templates** — Especially minimalist / typographic-heavy variants. _Done when:_ 3 new templates with SEO landing pages.

6. **Testimonials section on home** — Once you have real users, 3–5 short quotes near the hero with name + business. Trust signal that converts. _Done when:_ Section exists, populated with real quotes (with permission).

7. **Submit to Product Hunt, Hacker News, Indie Hackers** — Each launch can drive thousands of visitors and a backlink burst. _Done when:_ Submitted to all three with screenshots and a short pitch.

## Medium priority — quality + polish

8. **Lighthouse audit + fixes** — Run once, fix obvious wins (font preload, image dimensions, contrast, unused CSS). _Done when:_ Mobile + desktop Lighthouse scores ≥ 90 in all four categories on the home page.

9. **Sentry (or equivalent) error tracking** — Free tier catches the bugs real users hit that you'd never reproduce locally. _Done when:_ Script loaded, test error visible in dashboard.

10. **Optimize OG images** — Each is ~230 KB. Re-encode with `pngquant` or convert to WebP fallback. _Done when:_ Average OG image under 80 KB; visual quality unchanged.

11. **Accessibility audit (WCAG AA)** — Run axe DevTools. Likely wins: color contrast, missing labels on icon-only buttons, focus states. _Done when:_ axe reports zero critical violations.

12. **Dark mode** — System-preference detection + manual toggle. CSS custom properties make this cheap. _Done when:_ Toggle works; print output stays light-only.

13. **Localization (i18n)** — Start with French and Spanish. Static page versions at `/fr/` and `/es/`. _Done when:_ Home + 5 most-trafficked industry pages translated.

14. **Open-source on GitHub** — Public repo, MIT license, README with screenshots. Builds trust ("the code is right there") and gets backlinks. _Done when:_ Repo public; README links to live site; site links to repo.

## Medium priority — product depth

15. **Recurring invoice templates** — Save an invoice as a "template" you can clone monthly. _Done when:_ Mark-as-recurring + one-click generate next instance.

16. **Per-line tax + discount** — Currently tax and discount are document-level. Some businesses need per-line. _Done when:_ Optional per-line tax/discount columns; totals roll up correctly.

17. **Estimate / Quote mode** — Same form, different document type. Convert estimate → invoice in one click. _Done when:_ Document-type select on the form; "Convert to invoice" button.

18. **Partial payment tracking** — Record multiple payments against one invoice; show balance due. _Done when:_ Payments table per invoice; balance visible on printed PDF.

19. **Client portal links** — Generate a read-only share URL for an invoice that doesn't require login (data already local, so this would mean encoding the invoice in the URL or a one-time JSON export). _Done when:_ "Copy share link" button produces a viewable URL.

---

## Notes

- Items marked _done when_ have a measurable completion criterion. If you can't write one, the item isn't actionable yet — refine before adding.
- New ideas go to the bottom. Reorder when priorities change.
- Delete completed items rather than crossing them out; git history is the changelog.
