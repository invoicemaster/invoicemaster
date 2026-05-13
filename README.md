# invoicemaster

A simple, offline-first invoice generator for small businesses. Built with pure HTML, CSS, and JavaScript. All your data is stored locally in your browser via IndexedDB — nothing ever leaves your machine.

## Features

- Save your business profile (logo, name, address, contact)
- Reusable client list
- Build invoices with line items, tax, and totals
- Print or save as PDF (via browser print dialog)
- 100% offline — no server, no signup, no tracking

## Run locally

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Tech

- HTML / CSS / vanilla JS (ES modules)
- IndexedDB for persistence
- No build step, no dependencies
