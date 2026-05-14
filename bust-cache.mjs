#!/usr/bin/env node
/* Run this script after CSS/JS changes to force browsers to re-fetch.
   - Adds/refreshes ?v=<timestamp> on all HTML link/script tags and JS module imports
   - Updates a visible "v <timestamp>" stamp in every site-footer so you can
     verify in the browser that the latest version is loaded */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = '/Users/gradikayamba/invoicemaster';
const v = Date.now();

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let count = 0;

const stamp = `<span class="version-stamp" title="cache-bust version">v ${v}</span>`;

const CACHE_META = `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
  <meta http-equiv="Pragma" content="no-cache" />
  <meta http-equiv="Expires" content="0" />`;

for (const f of files.filter((p) => p.endsWith('.html'))) {
  let src = readFileSync(f, 'utf8');
  const before = src;
  // Strip existing ?v= on CSS/JS refs and add fresh ones
  src = src.replace(/(href|src)="([^"]+\.(?:css|js))\?v=\d+"/g, '$1="$2"');
  src = src.replace(/(href|src)="([^"]+\.(?:css|js))"/g, `$1="$2?v=${v}"`);
  // Inject no-cache meta tags once (development-only — strip these before going live for SEO)
  if (!src.includes('http-equiv="Cache-Control"')) {
    src = src.replace(
      /(<meta name="viewport"[^>]*\/>)/,
      `$1\n  ${CACHE_META}`
    );
  }
  // Update or inject the version stamp inside the site-footer's wrap
  if (src.match(/<span class="version-stamp"[^>]*>[^<]*<\/span>/)) {
    src = src.replace(/<span class="version-stamp"[^>]*>[^<]*<\/span>/, stamp);
  } else {
    src = src.replace(
      /(<footer class="site-footer[^"]*">\s*<div class="wrap">[\s\S]*?)(<\/div>\s*<\/footer>)/,
      `$1      ${stamp}\n    $2`
    );
  }
  if (src !== before) {
    writeFileSync(f, src);
    count++;
  }
}

for (const f of files.filter((p) => p.endsWith('.js') && p.includes('/js/'))) {
  let src = readFileSync(f, 'utf8');
  const before = src;
  src = src.replace(/(from\s+['"])(\.\/[\w-]+\.js)\?v=\d+(['"])/g, '$1$2$3');
  src = src.replace(/(import\(['"])(\.\/[\w-]+\.js)\?v=\d+(['"]\))/g, '$1$2$3');
  src = src.replace(/(from\s+['"])(\.\/[\w-]+\.js)(['"])/g, `$1$2?v=${v}$3`);
  src = src.replace(/(import\(['"])(\.\/[\w-]+\.js)(['"]\))/g, `$1$2?v=${v}$3`);
  if (src !== before) {
    writeFileSync(f, src);
    count++;
  }
}

console.log(`Cache-busted ${count} files with v=${v}`);
