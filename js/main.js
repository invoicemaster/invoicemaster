import { initBusinessForm } from './business.js';
import { initClientsTab } from './clients.js';
import { initInvoiceTab, refreshClientPicker } from './invoice.js';
import { renderHistory } from './history.js';

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
  if (name === 'history') renderHistory(() => switchTab('invoice'));
}

function initTabs() {
  document.getElementById('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });
}

async function boot() {
  initTabs();
  initBusinessForm();
  initClientsTab(() => refreshClientPicker());
  await initInvoiceTab();
  document.addEventListener('invoices:changed', () => {
    const active = document.querySelector('.tab.active')?.dataset.tab;
    if (active === 'history') renderHistory(() => switchTab('invoice'));
  });
}

boot();
