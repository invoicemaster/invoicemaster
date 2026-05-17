/* Backup & restore — exports every IndexedDB store to a single JSON file the
   user can save, and imports it back. Because the site is local-only, this is
   the only safety net against a cleared browser. */

import { getAll, put, openDB } from './db.js?v=1778985349915';

const STORES = ['business', 'clients', 'invoices', 'industryPrefs'];
const FORMAT_VERSION = 1;

export async function exportAll() {
  const data = {};
  for (const store of STORES) data[store] = await getAll(store);
  return {
    format: 'invoicemaster-backup',
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup(bundle) {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `invoicemaster-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function importAll(bundle, { mode = 'merge' } = {}) {
  if (!bundle || bundle.format !== 'invoicemaster-backup') {
    throw new Error('Not an InvoiceMaster backup file.');
  }
  if (bundle.version > FORMAT_VERSION) {
    throw new Error(`Backup was created by a newer version (v${bundle.version}).`);
  }
  const data = bundle.data || {};

  const db = await openDB();
  for (const store of STORES) {
    const rows = Array.isArray(data[store]) ? data[store] : [];
    await new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      const s = tx.objectStore(store);
      if (mode === 'replace') s.clear();
      for (const row of rows) {
        try { s.put(row); } catch (e) { /* skip malformed row */ }
      }
    });
  }

  return summarize(data);
}

function summarize(data) {
  return {
    business: (data.business || []).length,
    clients: (data.clients || []).length,
    invoices: (data.invoices || []).length,
    industryPrefs: (data.industryPrefs || []).length,
  };
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      try { resolve(JSON.parse(r.result)); } catch (e) { reject(e); }
    };
    r.onerror = () => reject(r.error);
    r.readAsText(file);
  });
}
