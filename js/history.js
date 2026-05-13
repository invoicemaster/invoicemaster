import { getAll } from './db.js';
import { loadInvoice, deleteInvoice } from './invoice.js';

export async function renderHistory(switchToInvoice) {
  const list = document.getElementById('invoice-list');
  const all = (await getAll('invoices')).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  list.innerHTML = '';
  if (all.length === 0) {
    list.innerHTML = '<li class="meta">No invoices saved yet.</li>';
    return;
  }
  for (const inv of all) {
    const li = document.createElement('li');
    const total = computeTotal(inv);
    li.innerHTML = `
      <div>
        <div><strong></strong> · <span class="meta" data-client></span></div>
        <div class="meta" data-line></div>
      </div>
      <div class="row-actions">
        <button class="btn-ghost" data-open>Open</button>
        <button class="btn-ghost" data-del>Delete</button>
      </div>
    `;
    li.querySelector('strong').textContent = inv.number || '(no number)';
    li.querySelector('[data-client]').textContent = inv.clientName || '—';
    li.querySelector('[data-line]').textContent = `${inv.date || ''} · Total ${total.toFixed(2)}`;
    li.querySelector('[data-open]').addEventListener('click', async () => {
      await loadInvoice(inv.id);
      switchToInvoice();
    });
    li.querySelector('[data-del]').addEventListener('click', async () => {
      if (!confirm(`Delete invoice ${inv.number || ''}?`)) return;
      await deleteInvoice(inv.id);
      renderHistory(switchToInvoice);
    });
    list.appendChild(li);
  }
}

function computeTotal(inv) {
  const sub = (inv.lines || []).reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
  const tax = sub * ((inv.taxRate || 0) / 100);
  return sub + tax;
}
