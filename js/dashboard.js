import { getAll, put } from './db.js?v=1778786723368';
import { loadInvoice, deleteInvoice } from './invoice.js?v=1778786723368';
import { loadBusiness } from './business.js?v=1778786723368';
import { STATUSES } from './templates.js?v=1778786723368';

let state = {
  filter: 'all',
  search: '',
  sort: 'recent',
};

let switchToInvoice = null;

export async function renderDashboard(switchToInvoiceFn) {
  if (switchToInvoiceFn) switchToInvoice = switchToInvoiceFn;
  const biz = await loadBusiness();
  const currency = biz.currency || '$';
  const all = await getAll('invoices');

  const stats = computeStats(all);
  renderStats(stats, currency);
  wireControls();
  renderList(all, currency);
}

function computeTotal(inv) {
  const sub = (inv.lines || []).reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
  const taxed = Math.max(0, sub - (inv.discount || 0));
  const tax = taxed * ((inv.taxRate || 0) / 100);
  return taxed + tax;
}

function effectiveStatus(inv) {
  const status = inv.status || 'draft';
  if (status === 'sent' && inv.due && isPastDue(inv.due)) return 'overdue';
  return status;
}

function isPastDue(dueStr) {
  if (!dueStr) return false;
  const due = new Date(dueStr + 'T23:59:59');
  return due.getTime() < Date.now();
}

function computeStats(invoices) {
  let outstanding = 0;
  let paid = 0;
  let overdueCount = 0;
  let draftCount = 0;
  let sentCount = 0;
  let paidCount = 0;

  for (const inv of invoices) {
    const total = computeTotal(inv);
    const eff = effectiveStatus(inv);
    if (eff === 'paid') {
      paid += total;
      paidCount++;
    } else {
      outstanding += total;
    }
    if (eff === 'overdue') overdueCount++;
    if (eff === 'draft' || (inv.status || 'draft') === 'draft') draftCount++;
    if (eff === 'sent') sentCount++;
  }

  return { outstanding, paid, overdueCount, draftCount, sentCount, paidCount, total: invoices.length };
}

function fmt(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function renderStats(stats, currency) {
  const el = document.getElementById('dashboard-stats');
  if (!el) return;
  el.innerHTML = `
    <div class="stat-card stat-outstanding">
      <div class="stat-label">Outstanding</div>
      <div class="stat-value">${currency}${fmt(stats.outstanding)}</div>
    </div>
    <div class="stat-card stat-paid">
      <div class="stat-label">Paid</div>
      <div class="stat-value">${currency}${fmt(stats.paid)}</div>
    </div>
    <div class="stat-card stat-overdue">
      <div class="stat-label">Overdue</div>
      <div class="stat-value">${stats.overdueCount}</div>
    </div>
    <div class="stat-card stat-drafts">
      <div class="stat-label">Drafts</div>
      <div class="stat-value">${stats.draftCount}</div>
    </div>
  `;
}

function wireControls() {
  const filterBar = document.getElementById('dashboard-filters');
  const search = document.getElementById('dashboard-search');
  const sort = document.getElementById('dashboard-sort');

  if (filterBar && !filterBar.dataset.wired) {
    filterBar.addEventListener('click', async (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      state.filter = chip.dataset.filter;
      filterBar.querySelectorAll('.filter-chip').forEach((c) => c.classList.toggle('active', c === chip));
      await renderDashboard();
    });
    filterBar.dataset.wired = '1';
  }
  if (search && !search.dataset.wired) {
    search.addEventListener('input', async (e) => {
      state.search = e.target.value.trim().toLowerCase();
      await renderDashboard();
    });
    search.dataset.wired = '1';
  }
  if (sort && !sort.dataset.wired) {
    sort.addEventListener('change', async (e) => {
      state.sort = e.target.value;
      await renderDashboard();
    });
    sort.dataset.wired = '1';
  }
}

function filterAndSort(invoices) {
  let out = invoices;
  if (state.filter !== 'all') {
    out = out.filter((inv) => effectiveStatus(inv) === state.filter);
  }
  if (state.search) {
    const q = state.search;
    out = out.filter((inv) => {
      return (
        (inv.number || '').toLowerCase().includes(q) ||
        (inv.clientName || '').toLowerCase().includes(q) ||
        (inv.reference || '').toLowerCase().includes(q)
      );
    });
  }
  const sorted = [...out];
  switch (state.sort) {
    case 'due':
      sorted.sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
      break;
    case 'amount':
      sorted.sort((a, b) => computeTotal(b) - computeTotal(a));
      break;
    case 'client':
      sorted.sort((a, b) => (a.clientName || '').localeCompare(b.clientName || ''));
      break;
    case 'recent':
    default:
      sorted.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }
  return sorted;
}

async function markStatus(inv, status) {
  inv.status = status;
  inv.updatedAt = Date.now();
  await put('invoices', inv);
  document.dispatchEvent(new CustomEvent('invoices:changed'));
}

function statusLabel(value) {
  return STATUSES.find((s) => s.value === value)?.label || value;
}

function daysFromNow(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return Math.round((d.getTime() - Date.now()) / 86400000);
}

function dueLabel(inv, eff) {
  if (!inv.due) return '';
  const days = daysFromNow(inv.due);
  if (eff === 'paid') return `Due ${inv.due}`;
  if (days < 0) return `Due ${inv.due} · ${Math.abs(days)}d overdue`;
  if (days === 0) return `Due today`;
  if (days <= 7) return `Due in ${days}d`;
  return `Due ${inv.due}`;
}

function renderList(allInvoices, currency) {
  const list = document.getElementById('invoice-list');
  if (!list) return;
  const filtered = filterAndSort(allInvoices);

  if (filtered.length === 0) {
    list.innerHTML = `<li class="meta empty-state">${
      allInvoices.length === 0 ? 'No invoices yet. Start one from the Invoice tab.' : 'No invoices match this filter.'
    }</li>`;
    return;
  }

  list.innerHTML = '';
  for (const inv of filtered) {
    const eff = effectiveStatus(inv);
    const total = computeTotal(inv);
    const li = document.createElement('li');
    li.className = 'dashboard-row';
    li.innerHTML = `
      <div class="row-main">
        <div class="row-line-1">
          <strong class="row-number"></strong>
          <span class="status-badge" data-status="${eff}"></span>
          <span class="row-client"></span>
        </div>
        <div class="row-line-2">
          <span class="row-amount"></span>
          <span class="row-due"></span>
        </div>
      </div>
      <div class="row-actions">
        ${eff !== 'paid' ? '<button class="btn-ghost" data-action="paid">Mark paid</button>' : ''}
        ${eff === 'draft' ? '<button class="btn-ghost" data-action="sent">Mark sent</button>' : ''}
        <button class="btn-ghost" data-action="open">Open</button>
        <button class="btn-ghost" data-action="delete">Delete</button>
      </div>
    `;
    li.querySelector('.row-number').textContent = inv.number || '(no number)';
    li.querySelector('.status-badge').textContent = statusLabel(eff);
    li.querySelector('.row-client').textContent = inv.clientName || '—';
    li.querySelector('.row-amount').textContent = `${currency}${fmt(total)}`;
    li.querySelector('.row-due').textContent = dueLabel(inv, eff);

    li.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === 'paid') {
        await markStatus(inv, 'paid');
        await renderDashboard();
      } else if (action === 'sent') {
        await markStatus(inv, 'sent');
        await renderDashboard();
      } else if (action === 'open') {
        await loadInvoice(inv.id);
        if (switchToInvoice) switchToInvoice();
      } else if (action === 'delete') {
        if (!confirm(`Delete invoice ${inv.number || ''}?`)) return;
        await deleteInvoice(inv.id);
        await renderDashboard();
      }
    });
    list.appendChild(li);
  }
}
