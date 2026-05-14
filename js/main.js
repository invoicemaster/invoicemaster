import { initBusinessForm } from './business.js?v=1778730746703';
import { initClientsTab } from './clients.js?v=1778730746703';
import { initInvoiceTab, refreshClientPicker, loadInvoice } from './invoice.js?v=1778730746703';
import { renderDashboard } from './dashboard.js?v=1778730746703';
import { renderEditor, renderBusinessForm, renderClientsForm, renderDashboardSection } from './editor.js?v=1778730746703';
import { isValidTemplate } from './templates.js?v=1778730746703';
import { isValidIndustry } from './industries.js?v=1778730746703';

function getInitialTemplate() {
  const meta = document.querySelector('meta[name="initial-template"]');
  const v = meta?.content?.trim();
  return isValidTemplate(v) ? v : null;
}

function getInitialIndustry() {
  const meta = document.querySelector('meta[name="initial-industry"]');
  const v = meta?.content?.trim();
  return isValidIndustry(v) ? v : null;
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
  // The SEO page-header (breadcrumb + H1 + intro) describes the invoice template,
  // so only show it on the Invoice tab. Stays in DOM on other tabs for crawlers.
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader) pageHeader.style.display = name === 'invoice' ? '' : 'none';
  if (name === 'dashboard') renderDashboard(() => switchTab('invoice'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function initTabs() {
  document.getElementById('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });
}

function hydrateShell() {
  const invoiceTab = document.getElementById('tab-invoice');
  const businessTab = document.getElementById('tab-business');
  const clientsTab = document.getElementById('tab-clients');
  const dashboardTab = document.getElementById('tab-dashboard');
  if (invoiceTab) renderEditor(invoiceTab);
  if (businessTab) renderBusinessForm(businessTab);
  if (clientsTab) renderClientsForm(clientsTab);
  if (dashboardTab) renderDashboardSection(dashboardTab);
}

async function handleHashRoute() {
  const m = window.location.hash.match(/^#\/invoice\/(\d+)$/);
  if (m) {
    await loadInvoice(Number(m[1]));
    const tab = document.querySelector('.tab[data-tab="invoice"]');
    if (tab) switchTab('invoice');
  }
}

async function boot() {
  hydrateShell();
  initTabs();
  initBusinessForm();
  initClientsTab(() => refreshClientPicker());
  await initInvoiceTab({ initialTemplate: getInitialTemplate(), initialIndustry: getInitialIndustry() });
  await handleHashRoute();
  window.addEventListener('hashchange', handleHashRoute);
  document.addEventListener('invoices:changed', () => {
    const active = document.querySelector('.tab.active')?.dataset.tab;
    if (active === 'dashboard') renderDashboard(() => switchTab('invoice'));
  });
}

boot();
