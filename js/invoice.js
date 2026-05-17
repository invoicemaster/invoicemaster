import { getAll, get, put, remove } from './db.js?v=1778985349915';
import { loadBusiness, renderBusinessOnInvoice } from './business.js?v=1778985349915';
import { loadClients } from './clients.js?v=1778985349915';
import {
  isValidTemplate,
  DEFAULT_TEMPLATE,
  renderGallery,
  setGallerySelection,
  getTemplate,
  LINE_TYPES,
} from './templates.js?v=1778985349915';
import { getIndustry } from './industries.js?v=1778985349915';
import { formatMoney, normalizeCurrency } from './currency.js?v=1778985349915';

/* === Draft autosave =========================================================
   While a user is creating a new invoice (no currentId), every form change
   serializes the in-progress invoice to localStorage. On page load, if no
   #/invoice/:id is in the URL, the draft is restored. Saving or starting a
   New invoice clears the draft. */
const DRAFT_KEY = 'invoice-draft-v1';
let draftSaveTimer = null;
let draftSuppressed = false;

function scheduleDraftSave() {
  if (draftSuppressed) return;
  clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(async () => {
    try {
      const data = collectInvoice();
      if (currentId) {
        // Editing a saved invoice — autosave straight to the record
        data.id = currentId;
        await put('invoices', data);
      } else {
        // New invoice — keep a draft in localStorage so reload restores it
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
      }
    } catch {
      /* quota / serialization issue — fail silently */
    }
  }, 400);
}

function clearDraft() {
  clearTimeout(draftSaveTimer);
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
}

function readDraft() {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; }
}

function draftHasContent(d) {
  if (!d) return false;
  if (d.clientName || d.clientPhone || d.clientAddress) return true;
  if (d.notes || d.paymentInstructions || d.reference) return true;
  if (Array.isArray(d.lines) && d.lines.some((l) => (l && (l.desc?.trim() || Number(l.price) > 0 || Number(l.qty) > 1)))) return true;
  if (Array.isArray(d.customFields) && d.customFields.some((f) => f && f.value)) return true;
  return false;
}

let prefSaveTimer = null;
function saveIndustryPrefSoon() {
  if (!currentIndustry) return;
  clearTimeout(prefSaveTimer);
  prefSaveTimer = setTimeout(async () => {
    const fields = readCustomFields();
    const fieldTemplate = fields.map(({ id, label, section, type }) => ({ id, label, section, type }));
    const template = document.getElementById('invoice-sheet')?.dataset.template;
    await put('industryPrefs', {
      industryId: currentIndustry.id,
      template, // remember the user's chosen visual template so refresh keeps it
      customFields: fieldTemplate,
      labels: collectLabels(),
    });
    const btn = document.getElementById('reset-pref');
    if (btn) btn.hidden = false;
  }, 500);
}

async function loadIndustryPref(industryId) {
  if (!industryId) return null;
  const pref = await get('industryPrefs', industryId);
  return pref || null;
}

async function clearIndustryPref(industryId) {
  if (!industryId) return;
  await remove('industryPrefs', industryId);
}

let currentId = null;
let currency = 'USD';
let currentIndustry = null;
let currentPaidAt = '';

function effectiveConfig(templateId, industry) {
  const tpl = getTemplate(templateId);
  if (!industry) return { templateId: tpl.id, referenceLabel: tpl.referenceLabel, customFields: tpl.customFields || [], showShipTo: true };
  // The passed templateId wins so the user can switch visual style via the gallery.
  // Industry only contributes its custom fields, labels, and ship-to expectation.
  return {
    templateId: tpl.id,
    referenceLabel: industry.referenceLabel || tpl.referenceLabel,
    customFields: industry.customFields || tpl.customFields || [],
    showShipTo: industry.showShipTo !== false,
  };
}

function applyTemplate(name, presetFields) {
  const cfg = effectiveConfig(name, currentIndustry);
  document.getElementById('invoice-sheet').dataset.template = cfg.templateId;
  const gallery = document.getElementById('template-gallery');
  if (gallery) setGallerySelection(gallery, cfg.templateId);
  const labelEl = document.getElementById('inv-reference-label');
  if (labelEl) labelEl.textContent = cfg.referenceLabel;
  // Hide the generic Reference field whenever there are header custom fields —
  // they cover the same purpose and a separate Reference row is redundant.
  const refRow = document.getElementById('inv-reference-row');
  const hasHeaderCustom = (cfg.customFields || []).some((f) => f.section === 'header');
  if (refRow) refRow.style.display = hasHeaderCustom ? 'none' : '';

  // Field source priority:
  //   1. Explicit presetFields (loading a saved invoice with its own customFields)
  //   2. Template/industry defaults with empty values (fresh invoice / template switch)
  const fields = Array.isArray(presetFields) && presetFields.length
    ? presetFields
    : (cfg.customFields || []).map((f) => ({ ...f, value: '' }));
  renderCustomFieldsFromList(fields);
  applyShipToVisibility(cfg.showShipTo);

  // Apply industry's label overrides as the starting point (user can still edit them)
  const industryLabels = (currentIndustry && currentIndustry.labels) || {};
  const labelMap = {
    materials: industryLabels.materials || 'Materials',
    labor: industryLabels.labor || 'Labor',
    subtotal: industryLabels.subtotal || 'Subtotal',
  };
  applyLabels(labelMap);
}

function applyShipToVisibility(show) {
  const ship = document.querySelector('.ship-to');
  if (!ship) return;
  ship.classList.toggle('ship-to-hidden', !show);
}

function setIndustryBadge() {
  const badge = document.getElementById('industry-badge');
  if (!badge) return;
  if (currentIndustry) {
    badge.textContent = currentIndustry.label;
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function setupResetPrefButton(prefExists) {
  const btn = document.getElementById('reset-pref');
  if (!btn) return;
  btn.hidden = !prefExists || !currentIndustry;
  if (!btn.dataset.wired) {
    btn.addEventListener('click', async () => {
      if (!currentIndustry) return;
      if (!confirm(`Reset ${currentIndustry.label} fields to the defaults? Your customized field names will be cleared.`)) return;
      await clearIndustryPref(currentIndustry.id);
      // Re-apply with industry defaults (preserves currently-entered values where field IDs match)
      applyTemplate(document.getElementById('invoice-sheet').dataset.template, null);
      btn.hidden = true;
    });
    btn.dataset.wired = '1';
  }
}

function renderCustomFieldsFromList(fields) {
  const headerHost = document.getElementById('custom-fields-header');
  const footerHost = document.getElementById('custom-fields-footer');
  if (!headerHost || !footerHost) return;
  headerHost.innerHTML = '';
  footerHost.innerHTML = '';
  for (const f of fields || []) {
    const host = f.section === 'footer' ? footerHost : headerHost;
    appendCustomFieldRow(host, f);
  }
  appendAddButton(headerHost, 'header');
  appendAddButton(footerHost, 'footer');
}

function appendCustomFieldRow(host, field) {
  const row = document.createElement('label');
  row.className = 'meta-row custom-field-row';
  row.dataset.fieldId = field.id || `cf_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  row.dataset.section = field.section || 'header';
  row.dataset.type = field.type || 'text';
  row.innerHTML = `
    <span class="cf-label-wrap">
      <button class="cf-remove no-print" type="button" aria-label="Remove field" title="Remove">×</button>
      <input type="text" class="cf-label-input" data-cf-label placeholder="Field name" />
    </span>
    <input class="cf-value-input" data-cf-value placeholder="—" />
  `;
  const labelInput = row.querySelector('[data-cf-label]');
  const valueInput = row.querySelector('[data-cf-value]');
  labelInput.value = field.label || '';
  valueInput.type = field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text';
  if (field.value != null && field.value !== '') valueInput.value = field.value;
  row.querySelector('.cf-remove').addEventListener('click', (e) => {
    e.preventDefault();
    row.remove();
  });
  // Insert before the trailing "+ Add field" button if present
  const addBtn = host.querySelector('.cf-add');
  if (addBtn) host.insertBefore(row, addBtn);
  else host.appendChild(row);
}

function appendAddButton(host, section) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'cf-add no-print';
  btn.textContent = '+ Add field';
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    appendCustomFieldRow(host, { label: '', section, type: 'text', value: '' });
    const rows = host.querySelectorAll('.custom-field-row');
    const newRow = rows[rows.length - 1];
    if (newRow) newRow.querySelector('[data-cf-label]').focus();
  });
  host.appendChild(btn);
}

function legacyDataToFields(customData, templateId, industryId) {
  const industry = industryId ? getIndustry(industryId) : null;
  const defaults = (industry && industry.customFields) || (getTemplate(templateId).customFields) || [];
  return defaults.map((f) => ({ ...f, value: (customData && customData[f.id]) || '' }));
}

function collectLabels() {
  const labels = {};
  document.querySelectorAll('.editable-label[data-label-key]').forEach((el) => {
    const key = el.dataset.labelKey;
    const text = el.textContent.trim();
    if (key && text) labels[key] = text;
  });
  return labels;
}

function applyLabels(labels = {}) {
  document.querySelectorAll('.editable-label[data-label-key]').forEach((el) => {
    const key = el.dataset.labelKey;
    if (key && labels[key]) el.textContent = labels[key];
  });
}

function readCustomFields() {
  const out = [];
  document.querySelectorAll('.custom-field-row').forEach((row) => {
    const labelInput = row.querySelector('[data-cf-label]');
    const valueInput = row.querySelector('[data-cf-value]');
    const label = (labelInput?.value || '').trim();
    const value = (valueInput?.value || '').trim();
    if (!label && !value) return;
    out.push({
      id: row.dataset.fieldId,
      label,
      section: row.dataset.section || 'header',
      type: row.dataset.type || 'text',
      value,
    });
  });
  return out;
}

function applyStatus(status, paidAt) {
  const pill = document.querySelector('.status-pill');
  if (pill) pill.dataset.status = status || 'draft';
  const sheet = document.getElementById('invoice-sheet');
  if (sheet) sheet.dataset.status = status || 'draft';
  const stamp = document.getElementById('paid-stamp');
  const stampDate = document.getElementById('paid-stamp-date');
  if (stamp) {
    if (status === 'paid' && paidAt) {
      stamp.hidden = false;
      if (stampDate) stampDate.textContent = paidAt;
    } else {
      stamp.hidden = true;
    }
  }
}

function onPaymentTermsChange() {
  const sel = document.getElementById('inv-payment-terms');
  const row = document.getElementById('inv-payment-terms-custom-row');
  if (!sel || !row) return;
  row.style.display = sel.value === 'custom' ? '' : 'none';
}

export async function initInvoiceTab(opts = {}) {
  const biz = await loadBusiness();
  currency = normalizeCurrency(biz.currency);
  renderBusinessOnInvoice(biz);

  currentIndustry = opts.initialIndustry ? getIndustry(opts.initialIndustry) : null;

  // If the user has previously customized this industry, use those overrides;
  // otherwise fall back to the industry's defaults.
  const savedPref = currentIndustry ? await loadIndustryPref(currentIndustry.id) : null;
  // Visual template priority: user's saved choice → industry default → page meta → business default → DEFAULT
  const initial = (savedPref && isValidTemplate(savedPref.template) ? savedPref.template : null)
    || (currentIndustry && currentIndustry.template)
    || opts.initialTemplate
    || biz.template
    || DEFAULT_TEMPLATE;
  // Gallery click → apply visual + persist the choice so refresh remembers it
  renderGallery(document.getElementById('template-gallery'), initial, (id) => {
    applyTemplate(id);
    saveIndustryPrefSoon();
  });

  const presetFields = savedPref && savedPref.customFields ? savedPref.customFields.map((f) => ({ ...f, value: '' })) : null;
  applyTemplate(initial, presetFields);
  if (savedPref && savedPref.labels) applyLabels(savedPref.labels);
  setIndustryBadge();
  setupResetPrefButton(!!savedPref);

  // Auto-save the user's field + label customization as their preference for this industry
  document.addEventListener('input', (e) => {
    if (e.target.matches?.('[data-cf-label], .editable-label')) saveIndustryPrefSoon();
  });
  document.addEventListener('click', (e) => {
    if (e.target.matches?.('.cf-remove, .cf-add')) saveIndustryPrefSoon();
  });

  // Draft autosave: any input/change inside the invoice tab snapshots to localStorage
  document.addEventListener('input', (e) => {
    if (e.target.closest?.('#tab-invoice')) scheduleDraftSave();
  });
  document.addEventListener('change', (e) => {
    if (e.target.closest?.('#tab-invoice')) scheduleDraftSave();
  });
  // Keep contenteditable labels single-line and plain-text
  document.addEventListener('keydown', (e) => {
    if (e.target.matches?.('.editable-label') && e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  });
  document.addEventListener('paste', (e) => {
    if (!e.target.matches?.('.editable-label')) return;
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    document.execCommand('insertText', false, text.replace(/\r?\n/g, ' '));
  });

  document.getElementById('inv-date').value = today();
  document.getElementById('inv-number').value = await suggestNumber();
  document.getElementById('tax-rate').value = biz.taxRate || 0;
  document.getElementById('inv-payment-terms').value = biz.paymentTerms || 'net_30';
  document.getElementById('inv-payment-instructions').value = biz.paymentInstructions || '';
  applyStatus('draft');
  onPaymentTermsChange();

  document.getElementById('add-line').addEventListener('click', () => addLine());
  document.getElementById('tax-rate').addEventListener('input', recalc);
  document.getElementById('discount').addEventListener('input', recalc);
  document.getElementById('save-invoice').addEventListener('click', saveCurrent);
  document.getElementById('new-invoice').addEventListener('click', resetInvoice);
  document.getElementById('print-invoice').addEventListener('click', () => window.print());
  document.getElementById('email-invoice').addEventListener('click', emailCurrentInvoice);
  document.getElementById('download-pdf').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    const orig = btn.textContent;
    btn.textContent = 'Building PDF…';
    btn.disabled = true;
    try {
      const { downloadInvoicePDF } = await import('./pdf.js?v=1778985349915');
      const number = (document.getElementById('inv-number').value || 'invoice').trim();
      await downloadInvoicePDF({ filename: `${number}.pdf` });
      btn.textContent = 'Downloaded';
    } catch (err) {
      console.error(err);
      btn.textContent = 'Failed — try Print';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 1500);
    }
  });
  document.getElementById('inv-status').addEventListener('change', (e) => {
    const newStatus = e.target.value;
    // When marking paid for the first time, capture today as paidAt
    if (newStatus === 'paid' && !currentPaidAt) {
      currentPaidAt = today();
    } else if (newStatus !== 'paid') {
      currentPaidAt = '';
    }
    applyStatus(newStatus, currentPaidAt);
  });
  document.getElementById('inv-payment-terms').addEventListener('change', onPaymentTermsChange);

  document.getElementById('client-select').addEventListener('change', onClientPick);
  document.getElementById('copy-bill-to-ship').addEventListener('click', () => {
    document.getElementById('ship-name').value = document.getElementById('client-name').value;
    document.getElementById('ship-address').value = document.getElementById('client-address').value;
  });

  addLine();
  recalc();
  await refreshClientPicker();
}

export async function refreshClientPicker() {
  const sel = document.getElementById('client-select');
  const clients = await loadClients();
  sel.innerHTML = '<option value="">— Select a client or type below —</option>';
  for (const c of clients) {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  }
}

async function onClientPick(e) {
  const id = Number(e.target.value);
  if (!id) return;
  const c = await get('clients', id);
  if (!c) return;
  document.getElementById('client-name').value = c.name || '';
  document.getElementById('client-phone').value = c.phone || '';
  document.getElementById('client-address').value = c.address || '';
}

function lineTypeOptions(selected) {
  return LINE_TYPES.map(
    (t) => `<option value="${t.value}"${t.value === selected ? ' selected' : ''}>${t.label}</option>`
  ).join('');
}

const PLACEHOLDERS = {
  product: { desc: 'Item or service', qty: 'Qty', price: 'Price' },
  time: { desc: 'Service or task', qty: 'Hours', price: 'Rate' },
  flat: { desc: 'Service or deliverable', qty: '1', price: 'Amount' },
};

function applyLineTypeToRow(tr) {
  const type = tr.dataset.lineType || 'product';
  const desc = tr.querySelector('[data-f="desc"]');
  const qty = tr.querySelector('[data-f="qty"]');
  const price = tr.querySelector('[data-f="price"]');
  const p = PLACEHOLDERS[type] || PLACEHOLDERS.product;
  desc.placeholder = p.desc;
  qty.placeholder = p.qty;
  price.placeholder = p.price;
  if (type === 'flat') {
    qty.value = 1;
    qty.disabled = true;
    qty.step = '1';
  } else {
    qty.disabled = false;
    qty.step = type === 'time' ? '0.1' : '1';
  }
}

function addLine(line = { type: 'product', desc: '', qty: 1, price: 0 }) {
  const body = document.getElementById('lines-body');
  const tr = document.createElement('tr');
  const type = line.type || 'product';
  tr.dataset.lineType = type;
  tr.innerHTML = `
    <td class="col-type no-print">
      <select data-f="type" aria-label="Line type">${lineTypeOptions(type)}</select>
    </td>
    <td class="col-desc"><input type="text" data-f="desc" /></td>
    <td class="col-qty"><input type="number" data-f="qty" min="0" /></td>
    <td class="col-price"><input type="number" data-f="price" min="0" step="0.01" /></td>
    <td class="col-amt" data-amt>0.00</td>
    <td class="col-rm no-print"><button class="rm-line" title="Remove">×</button></td>
  `;
  tr.querySelector('[data-f="desc"]').value = line.desc || '';
  tr.querySelector('[data-f="qty"]').value = line.qty ?? 1;
  tr.querySelector('[data-f="price"]').value = line.price ?? 0;
  applyLineTypeToRow(tr);
  tr.addEventListener('input', recalc);
  tr.querySelector('[data-f="type"]').addEventListener('change', (e) => {
    tr.dataset.lineType = e.target.value;
    applyLineTypeToRow(tr);
    recalc();
  });
  tr.querySelector('.rm-line').addEventListener('click', () => {
    tr.remove();
    recalc();
  });
  body.appendChild(tr);
}

function getLines() {
  return Array.from(document.querySelectorAll('#lines-body tr')).map((tr) => ({
    type: tr.dataset.lineType || 'product',
    desc: tr.querySelector('[data-f="desc"]').value,
    qty: parseFloat(tr.querySelector('[data-f="qty"]').value) || 0,
    price: parseFloat(tr.querySelector('[data-f="price"]').value) || 0,
  }));
}

function recalc() {
  let subtotal = 0;
  let materials = 0;
  let labor = 0;
  document.querySelectorAll('#lines-body tr').forEach((tr) => {
    const type = tr.dataset.lineType || 'product';
    const qty = parseFloat(tr.querySelector('[data-f="qty"]').value) || 0;
    const price = parseFloat(tr.querySelector('[data-f="price"]').value) || 0;
    const amt = qty * price;
    tr.querySelector('[data-amt]').textContent = fmt(amt);
    subtotal += amt;
    if (type === 'time') labor += amt;
    else materials += amt; // 'product' = materials; 'flat' rolls into materials/services
  });
  const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const taxed = Math.max(0, subtotal - discount);
  const tax = taxed * (taxRate / 100);
  const total = taxed + tax;

  // Materials / Labor split — show only when both have non-zero values
  const showSplit = materials > 0 && labor > 0;
  document.getElementById('materials-label').hidden = !showSplit;
  document.getElementById('sum-materials').hidden = !showSplit;
  document.getElementById('labor-label').hidden = !showSplit;
  document.getElementById('sum-labor').hidden = !showSplit;
  if (showSplit) {
    document.getElementById('sum-materials').textContent = fmt(materials);
    document.getElementById('sum-labor').textContent = fmt(labor);
  }
  // Labels are set once by applyTemplate / applyLabels — recalc only updates values.
  document.getElementById('sum-subtotal').textContent = fmt(subtotal);
  document.getElementById('sum-discount').textContent = `-${fmt(discount)}`;
  document.getElementById('sum-tax').textContent = fmt(tax);
  document.getElementById('sum-total').textContent = formatMoney(total, currency);
}

function fmt(n) {
  return (Math.round(n * 100) / 100).toFixed(2);
}

function today() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

async function suggestNumber() {
  const all = await getAll('invoices');
  const n = all.length + 1;
  return `INV-${String(n).padStart(4, '0')}`;
}

function collectInvoice() {
  const status = document.getElementById('inv-status').value;
  return {
    number: document.getElementById('inv-number').value.trim(),
    date: document.getElementById('inv-date').value,
    due: document.getElementById('inv-due').value,
    reference: document.getElementById('inv-reference').value.trim(),
    status,
    paidAt: status === 'paid' ? (currentPaidAt || today()) : '',
    clientName: document.getElementById('client-name').value.trim(),
    clientPhone: document.getElementById('client-phone').value.trim(),
    clientAddress: document.getElementById('client-address').value.trim(),
    shipName: document.getElementById('ship-name').value.trim(),
    shipAddress: document.getElementById('ship-address').value.trim(),
    lines: getLines(),
    taxRate: parseFloat(document.getElementById('tax-rate').value) || 0,
    discount: parseFloat(document.getElementById('discount').value) || 0,
    paymentTerms: document.getElementById('inv-payment-terms').value,
    paymentTermsCustom: document.getElementById('inv-payment-terms-custom').value.trim(),
    paymentInstructions: document.getElementById('inv-payment-instructions').value.trim(),
    notes: document.getElementById('inv-notes').value.trim(),
    template: document.getElementById('invoice-sheet').dataset.template || 'freelancer',
    industry: currentIndustry ? currentIndustry.id : null,
    customFields: readCustomFields(),
    labels: collectLabels(),
    updatedAt: Date.now(),
  };
}

async function saveCurrent() {
  const data = collectInvoice();
  if (currentId) data.id = currentId;
  const id = await put('invoices', data);
  currentId = data.id || id;
  updateHashForInvoice(currentId);
  clearDraft();
  flashButton('save-invoice', 'Saved');
  document.dispatchEvent(new CustomEvent('invoices:changed'));
}

function updateHashForInvoice(id) {
  const target = `#/invoice/${id}`;
  if (window.location.hash !== target) {
    history.replaceState(null, '', target);
  }
}

function populateFormFromInvoice(inv) {
  document.getElementById('inv-number').value = inv.number || '';
  document.getElementById('inv-date').value = inv.date || '';
  document.getElementById('inv-due').value = inv.due || '';
  document.getElementById('inv-reference').value = inv.reference || '';
  document.getElementById('inv-status').value = inv.status || 'draft';
  document.getElementById('client-name').value = inv.clientName || '';
  document.getElementById('client-phone').value = inv.clientPhone || '';
  document.getElementById('client-address').value = inv.clientAddress || '';
  document.getElementById('ship-name').value = inv.shipName || '';
  document.getElementById('ship-address').value = inv.shipAddress || '';
  document.getElementById('tax-rate').value = inv.taxRate || 0;
  document.getElementById('discount').value = inv.discount || 0;
  document.getElementById('inv-payment-terms').value = inv.paymentTerms || 'net_30';
  document.getElementById('inv-payment-terms-custom').value = inv.paymentTermsCustom || '';
  document.getElementById('inv-payment-instructions').value = inv.paymentInstructions || '';
  document.getElementById('inv-notes').value = inv.notes || '';
  currentIndustry = inv.industry ? getIndustry(inv.industry) : currentIndustry;
  // Prefer new customFields array; fall back to legacy customData by mapping into the current template's fields
  const presetFields = Array.isArray(inv.customFields)
    ? inv.customFields
    : inv.customData
      ? legacyDataToFields(inv.customData, inv.template, inv.industry)
      : null;
  applyTemplate(inv.template || 'freelancer', presetFields);
  if (inv.labels) applyLabels(inv.labels);
  setIndustryBadge();
  currentPaidAt = inv.paidAt || '';
  applyStatus(inv.status || 'draft', currentPaidAt);
  onPaymentTermsChange();
  document.getElementById('lines-body').innerHTML = '';
  (inv.lines || []).forEach((l) => addLine(l));
  if (!inv.lines || inv.lines.length === 0) addLine();
  recalc();
}

export async function loadInvoice(id) {
  const inv = await get('invoices', id);
  if (!inv) return;
  currentId = id;
  updateHashForInvoice(id);
  clearDraft();
  draftSuppressed = true;
  try { populateFormFromInvoice(inv); } finally { draftSuppressed = false; }
}

/* Restore an unsaved-in-progress invoice from localStorage. Called from main.js
   only when no #/invoice/:id route is active. Returns true if a draft was
   restored so the caller can avoid overwriting it with defaults. */
export function restoreDraftIfPresent() {
  if (window.location.hash.startsWith('#/invoice/')) return false;
  const draft = readDraft();
  if (!draftHasContent(draft)) return false;
  draftSuppressed = true;
  try { populateFormFromInvoice(draft); } finally { draftSuppressed = false; }
  return true;
}

async function resetInvoice() {
  currentId = null;
  currentPaidAt = '';
  clearDraft();
  if (window.location.hash.startsWith('#/invoice/')) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  const biz = await loadBusiness();
  document.getElementById('inv-number').value = await suggestNumber();
  document.getElementById('inv-date').value = today();
  document.getElementById('inv-due').value = '';
  document.getElementById('inv-reference').value = '';
  document.getElementById('inv-status').value = 'draft';
  document.getElementById('client-name').value = '';
  document.getElementById('client-phone').value = '';
  document.getElementById('client-address').value = '';
  document.getElementById('ship-name').value = '';
  document.getElementById('ship-address').value = '';
  document.getElementById('client-select').value = '';
  document.getElementById('inv-notes').value = '';
  document.getElementById('discount').value = 0;
  document.getElementById('inv-payment-terms').value = biz.paymentTerms || 'net_30';
  document.getElementById('inv-payment-terms-custom').value = '';
  document.getElementById('inv-payment-instructions').value = biz.paymentInstructions || '';
  applyTemplate(biz.template || 'freelancer', {});
  applyStatus('draft');
  onPaymentTermsChange();
  document.getElementById('lines-body').innerHTML = '';
  addLine();
  recalc();
}

export async function deleteInvoice(id) {
  await remove('invoices', id);
  if (currentId === id) currentId = null;
}

async function emailCurrentInvoice() {
  const inv = collectInvoice();
  const biz = await loadBusiness();
  const number = inv.number || 'Invoice';
  const bizName = biz.name || 'us';

  // Compute total
  const sub = (inv.lines || []).reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
  const taxed = Math.max(0, sub - (inv.discount || 0));
  const total = taxed + taxed * ((inv.taxRate || 0) / 100);
  const cur = normalizeCurrency(biz.currency);

  // Best-effort email lookup: match client by name in the clients store
  let toEmail = '';
  if (inv.clientName) {
    try {
      const clients = await loadClients();
      const match = clients.find((c) => (c.name || '').trim().toLowerCase() === inv.clientName.trim().toLowerCase());
      if (match) toEmail = match.email || '';
    } catch {}
  }

  const subject = `Invoice ${number} from ${bizName}`;
  const lines = [
    `Hi${inv.clientName ? ' ' + inv.clientName.split(' ')[0] : ''},`,
    '',
    `Please find invoice ${number} attached.`,
    '',
    `Amount due: ${formatMoney(total, cur)}`,
    inv.due ? `Due: ${inv.due}` : '',
    '',
    inv.paymentInstructions ? `Payment: ${inv.paymentInstructions}` : '',
    '',
    `Thanks,`,
    bizName,
  ].filter((l) => l !== null);
  const body = lines.join('\n');

  const mailto = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
}

function flashButton(id, msg) {
  const btn = document.getElementById(id);
  const original = btn.textContent;
  btn.textContent = msg;
  setTimeout(() => { btn.textContent = original; }, 1200);
}
