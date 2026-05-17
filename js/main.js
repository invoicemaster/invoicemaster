import { initBusinessForm } from './business.js?v=1778985349915';
import { initClientsTab } from './clients.js?v=1778985349915';
import { initInvoiceTab, refreshClientPicker, loadInvoice, restoreDraftIfPresent } from './invoice.js?v=1778985349915';
import { renderDashboard } from './dashboard.js?v=1778985349915';
import { renderEditor, renderBusinessForm, renderClientsForm, renderDashboardSection } from './editor.js?v=1778985349915';
import { isValidTemplate } from './templates.js?v=1778985349915';
import { isValidIndustry } from './industries.js?v=1778985349915';
import { wireEmailLinks } from './contact.js?v=1778985349915';
import { registerServiceWorker } from './pwa.js?v=1778985349915';

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
  document.querySelectorAll('.tab-panel').forEach((p) => p.classList.toggle('active', p.id === `tab-${name}`));
  // Highlight the topbar nav link for the active tab
  document.querySelectorAll('#topnav a[data-tab]').forEach((a) => a.classList.toggle('active', a.dataset.tab === name));
  // The SEO page-header (breadcrumb + H1 + intro) describes the invoice template,
  // so only show it on the Invoice tab. Stays in DOM on other tabs for crawlers.
  const pageHeader = document.querySelector('.page-header');
  if (pageHeader) pageHeader.style.display = name === 'invoice' ? '' : 'none';
  if (name === 'dashboard') renderDashboard(() => switchTab('invoice'));
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function initTabs() {
  // Intercept clicks on topbar nav links that map to in-page tabs.
  // If we're on an editor page (the matching tab-panel exists), switch tab locally
  // instead of navigating; otherwise let the browser follow the href.
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-tab]');
    if (!link) return;
    const tab = link.dataset.tab;
    if (document.getElementById(`tab-${tab}`)) {
      e.preventDefault();
      // Update URL hash so refresh keeps the tab without re-navigating
      history.replaceState(null, '', `${window.location.pathname}#${tab}`);
      switchTab(tab);
    }
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
  const h = window.location.hash;
  const m = h.match(/^#\/invoice\/(\d+)$/);
  if (m) {
    await loadInvoice(Number(m[1]));
    switchTab('invoice');
    return;
  }
  // Plain tab hash, e.g. #business, #clients, #dashboard
  const tab = h.replace(/^#/, '');
  if (['invoice', 'business', 'clients', 'dashboard'].includes(tab)
      && document.getElementById(`tab-${tab}`)) {
    switchTab(tab);
  }
}

async function boot() {
  hydrateShell();
  initTabs();
  initBusinessForm();
  initClientsTab(() => refreshClientPicker());
  await initInvoiceTab({ initialTemplate: getInitialTemplate(), initialIndustry: getInitialIndustry() });
  // If there's no specific invoice in the URL, restore any unsaved draft.
  // handleHashRoute will override this if the URL points to a saved invoice.
  restoreDraftIfPresent();
  await handleHashRoute();
  wireEmailLinks();
  registerServiceWorker();
  window.addEventListener('hashchange', handleHashRoute);
  document.addEventListener('invoices:changed', () => {
    const active = document.querySelector('.tab.active')?.dataset.tab;
    if (active === 'dashboard') renderDashboard(() => switchTab('invoice'));
  });
}

boot();
