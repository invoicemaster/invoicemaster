import { PAYMENT_TERMS, STATUSES } from './templates.js?v=1779039163817';
import { CURRENCIES } from './currency.js?v=1779039163817';

function paymentTermsOptions(selected = 'net_30') {
  return PAYMENT_TERMS.map(
    (t) => `<option value="${t.value}"${t.value === selected ? ' selected' : ''}>${t.label}</option>`
  ).join('');
}

function statusOptions() {
  return STATUSES.map((s) => `<option value="${s.value}">${s.label}</option>`).join('');
}

function currencyOptions() {
  return CURRENCIES.map((c) => `<option value="${c.code}">${c.label}</option>`).join('');
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/**
 * Single source of truth for the invoice-sheet inner markup.
 * Both the editor (form mode) and the home-page showcase (preview mode)
 * render the same structure so the previews always match reality.
 *
 * Modes:
 *   'editor'  — interactive: real form inputs, editable labels, IDs for JS hooks
 *   'preview' — static: values shown as plain text, no IDs, no contenteditable
 *
 * Values for preview mode are passed via opts.values and opts.customFields.
 */
export function sheetInnerHtml(opts = {}) {
  const mode = opts.mode === 'preview' ? 'preview' : 'editor';
  const v = opts.values || {};
  const isEditor = mode === 'editor';
  // Visibility flags — applied at render time in preview; editor JS toggles them dynamically
  const hideShipTo = opts.hideShipTo === true;
  const customFields = opts.customFields || [];
  const hideReference = !isEditor && customFields.some((f) => (f.section || 'header') === 'header');

  // Helpers
  const id = (name) => (isEditor ? ` id="${name}"` : '');
  const editable = (key, text) => isEditor
    ? `<span class="editable-label" data-label-key="${key}" contenteditable="true">${esc(text)}</span>`
    : `<span class="label-text" data-label-key="${key}">${esc(text)}</span>`;
  const labelText = (key, fallback) => esc((opts.labels && opts.labels[key]) || fallback);

  const textInput = (name, attrs = {}) => {
    const placeholder = attrs.placeholder || '';
    const type = attrs.type || 'text';
    if (isEditor) {
      return `<input type="${type}"${id(name)} placeholder="${esc(placeholder)}" />`;
    }
    return `<span class="value-text">${esc(v[name] ?? '')}</span>`;
  };

  const textArea = (name, attrs = {}) => {
    const rows = attrs.rows || 2;
    const placeholder = attrs.placeholder || '';
    if (isEditor) {
      return `<textarea${id(name)} rows="${rows}" placeholder="${esc(placeholder)}"></textarea>`;
    }
    return `<div class="value-text value-text-block">${esc(v[name] ?? '').replace(/\n/g, '<br>')}</div>`;
  };

  // Lines
  const lines = v.lines || [];
  const fmt = (n) => Number(n || 0).toFixed(2);
  const subtotal = lines.reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
  const materialsTotal = lines.filter((l) => (l.type || 'product') !== 'time').reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
  const laborTotal = lines.filter((l) => l.type === 'time').reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
  const showSplit = !isEditor && materialsTotal > 0 && laborTotal > 0;
  const taxRate = v.taxRate ?? 0;
  const tax = subtotal * (taxRate / 100);
  const discount = v.discount || 0;
  const total = Math.max(0, subtotal - discount) + tax;

  const linesHtml = isEditor
    ? '' // populated dynamically by invoice.js
    : lines.map((l) => `
        <tr>
          <td class="col-desc">${esc(l.desc || '')}</td>
          <td class="col-qty">${esc(l.qty || '')}</td>
          <td class="col-price">${fmt(l.price)}</td>
          <td class="col-amt">${fmt((l.qty || 0) * (l.price || 0))}</td>
        </tr>
      `).join('');

  // Custom fields
  const renderCustom = (section) => {
    if (isEditor) return ''; // dynamic in editor
    return (opts.customFields || [])
      .filter((f) => (f.section || 'header') === section && f.value)
      .map((f) => `<div class="meta-row"><span class="label-text">${esc(f.label)}</span><span class="value-text">${esc(f.value)}</span></div>`)
      .join('');
  };

  // Totals figures for preview
  const sumOrPreset = (key, value) => isEditor ? '0.00' : fmt(value);

  return `
    <div class="invoice-head">
      <div class="biz-block">
        <div class="biz-logo empty"${id('biz-logo')}>${isEditor ? '' : (v.bizLogo ? `<img src="${esc(v.bizLogo)}" alt="logo" />` : '')}</div>
        <div class="biz-meta">
          <div class="biz-name"${id('biz-name')}>${esc(v.bizName ?? (isEditor ? 'Your Business' : ''))}</div>
          <div class="biz-line"${id('biz-address')}>${esc(v.bizAddress ?? '')}</div>
          <div class="biz-line"${id('biz-contact')}>${esc(v.bizContact ?? '')}</div>
          <div class="biz-line"${id('biz-taxid')}>${v.bizTaxId ? `Tax ID: ${esc(v.bizTaxId)}` : ''}</div>
          <div class="biz-line"${id('biz-license')}>${v.bizLicense ? `License: ${esc(v.bizLicense)}` : ''}</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title ${isEditor ? 'editable-label' : 'label-text'}" data-label-key="invoice-title"${isEditor ? ' contenteditable="true"' : ''}>${labelText('invoice-title', 'INVOICE')}</div>
        <div class="paid-stamp"${id('paid-stamp')} hidden>PAID <span class="paid-date"${id('paid-stamp-date')}></span></div>
        <label class="meta-row">
          ${editable('number', labelText('number', 'Number'))}
          ${textInput('inv-number', { placeholder: 'INV-0001' })}
        </label>
        <label class="meta-row">
          ${editable('date', labelText('date', 'Date'))}
          ${textInput('inv-date', { type: 'date' })}
        </label>
        <label class="meta-row">
          ${editable('due', labelText('due', 'Due'))}
          ${textInput('inv-due', { type: 'date' })}
        </label>
        <label class="meta-row"${id('inv-reference-row')}${hideReference ? ' style="display:none"' : ''}>
          ${isEditor
            ? `<span id="inv-reference-label" class="editable-label" data-label-key="reference" contenteditable="true">${labelText('reference', 'Reference')}</span>${textInput('inv-reference', { placeholder: '—' })}`
            : `<span class="label-text" data-label-key="reference">${labelText('reference', 'Reference')}</span><span class="value-text">${esc(v.reference || '')}</span>`}
        </label>
        ${isEditor ? '<div id="custom-fields-header" class="custom-fields"></div>' : renderCustom('header')}
      </div>
    </div>

    <div class="addresses">
      <div class="bill-to address-block">
        <div class="section-label">${editable('bill-to', labelText('bill-to', 'Bill to'))}</div>
        ${isEditor ? '<select id="client-select" class="no-print"><option value="">— Select a client or type below —</option></select>' : ''}
        ${isEditor
          ? textInput('client-name', { placeholder: 'Client name' })
          : `<div class="value-text"><strong>${esc(v.clientName || '')}</strong></div>`}
        ${isEditor
          ? textInput('client-phone', { type: 'tel', placeholder: 'Client phone (optional)' })
          : `<div class="value-text">${esc(v.clientPhone || '')}</div>`}
        ${isEditor
          ? textArea('client-address', { placeholder: 'Client address' })
          : `<div class="value-text">${esc(v.clientAddress || '')}</div>`}
      </div>
      <div class="ship-to address-block${hideShipTo ? ' ship-to-hidden' : ''}">
        <div class="section-label ship-to-label">
          ${editable('ship-to', labelText('ship-to', 'Ship to'))}
          ${isEditor ? '<button type="button" class="link-btn no-print" id="copy-bill-to-ship">same as bill to</button>' : ''}
        </div>
        ${isEditor
          ? textInput('ship-name', { placeholder: 'Ship to name (optional)' })
          : `<div class="value-text"><strong>${esc(v.shipName || '')}</strong></div>`}
        ${isEditor
          ? textArea('ship-address', { placeholder: 'Ship to address (if different)' })
          : `<div class="value-text">${esc(v.shipAddress || '')}</div>`}
      </div>
    </div>

    <table class="lines">
      <thead>
        <tr>
          ${isEditor ? '<th class="col-type no-print">Type</th>' : ''}
          <th class="col-desc">${editable('col-desc', labelText('col-desc', 'Description'))}</th>
          <th class="col-qty">${editable('col-qty', labelText('col-qty', 'Qty'))}</th>
          <th class="col-price">${editable('col-price', labelText('col-price', 'Price'))}</th>
          <th class="col-amt">${editable('col-amt', labelText('col-amt', 'Amount'))}</th>
          ${isEditor ? '<th class="col-rm no-print"></th>' : ''}
        </tr>
      </thead>
      <tbody${id('lines-body')}>${linesHtml}</tbody>
    </table>
    ${isEditor ? '<button id="add-line" class="btn-ghost no-print">+ Add line</button>' : ''}

    <div class="totals">
      <div class="totals-grid">
        <div id="materials-label" class="${isEditor ? 'editable-label' : 'label-text'}" data-label-key="materials"${isEditor ? ' contenteditable="true"' : ''}${(isEditor || !showSplit) ? ' hidden' : ''}>${labelText('materials', 'Materials')}</div>
        <div id="sum-materials"${(isEditor || !showSplit) ? ' hidden' : ''}>${isEditor ? '0.00' : fmt(materialsTotal)}</div>
        <div id="labor-label" class="${isEditor ? 'editable-label' : 'label-text'}" data-label-key="labor"${isEditor ? ' contenteditable="true"' : ''}${(isEditor || !showSplit) ? ' hidden' : ''}>${labelText('labor', 'Labor')}</div>
        <div id="sum-labor"${(isEditor || !showSplit) ? ' hidden' : ''}>${isEditor ? '0.00' : fmt(laborTotal)}</div>
        <div id="subtotal-label" class="${isEditor ? 'editable-label' : 'label-text'}" data-label-key="subtotal"${isEditor ? ' contenteditable="true"' : ''}>${labelText('subtotal', 'Subtotal')}</div>
        <div id="sum-subtotal">${sumOrPreset('subtotal', subtotal)}</div>
        <div>
          ${editable('tax', labelText('tax', 'Tax'))}
          ${isEditor
            ? `<input type="number" id="tax-rate" min="0" step="0.01" value="0" />`
            : `<span class="value-text">${esc(taxRate)}</span>`}
          %
        </div>
        <div id="sum-tax">${sumOrPreset('tax', tax)}</div>
        <div>
          ${editable('discount', labelText('discount', 'Discount'))}
          ${isEditor
            ? `<input type="number" id="discount" min="0" step="0.01" value="0" />`
            : `<span class="value-text">${fmt(discount)}</span>`}
        </div>
        <div id="sum-discount">${isEditor ? '0.00' : `-${fmt(discount)}`}</div>
        <div class="total-label ${isEditor ? 'editable-label' : 'label-text'}" data-label-key="total"${isEditor ? ' contenteditable="true"' : ''}>${labelText('total', 'Total')}</div>
        <div class="total-value" id="sum-total">${sumOrPreset('total', total)}</div>
      </div>
    </div>

    <div class="signature-block">
      <div class="signature${(isEditor || v.bizSignature) ? '' : ' empty'}"${id('biz-signature')}>${
        isEditor ? '' : (v.bizSignature ? `<img src="${esc(v.bizSignature)}" alt="signature" />` : '')
      }</div>
    </div>

    <div class="payment-block">
      <div class="section-label">${editable('payment', labelText('payment', 'Payment'))}</div>
      <div class="payment-row">
        <label class="meta-row">
          ${editable('terms', labelText('terms', 'Terms'))}
          ${isEditor
            ? `<select id="inv-payment-terms">${paymentTermsOptions()}</select>`
            : `<span class="value-text">${esc(v.paymentTerms || '')}</span>`}
        </label>
        ${isEditor
          ? `<label class="meta-row" id="inv-payment-terms-custom-row" style="display:none;">
               ${editable('custom-terms', labelText('custom-terms', 'Custom terms'))}
               <input type="text" id="inv-payment-terms-custom" placeholder="e.g. 50% deposit, balance on delivery" />
             </label>`
          : ''}
      </div>
      ${isEditor
        ? textArea('inv-payment-instructions', { rows: 2, placeholder: 'Bank wire, Stripe link, Venmo @handle, etc.' })
        : `<div class="value-text">${esc(v.paymentInstructions || '')}</div>`}
      ${isEditor ? '<div id="custom-fields-footer" class="custom-fields"></div>' : renderCustom('footer')}
    </div>

    <div class="notes">
      <div class="section-label">${editable('notes', labelText('notes', 'Notes'))}</div>
      ${isEditor
        ? textArea('inv-notes', { rows: 3, placeholder: 'Thank-you note, late-fee policy, etc.' })
        : `<div class="value-text">${esc(v.notes || '')}</div>`}
    </div>
  `;
}

export function renderEditor(root) {
  root.innerHTML = `
    <div class="section-label no-print" style="margin-bottom: 6px;">Choose a template</div>
    <div id="template-gallery" class="template-gallery no-print"></div>

    <div class="editor-toolbar no-print">
      <span id="industry-badge" class="industry-badge" hidden></span>
      <div class="toolbar-right">
        <button type="button" id="reset-pref" class="btn-ghost reset-pref-btn" hidden title="Restore industry default fields">Reset fields</button>
        <div class="status-pill" data-status="draft">
          <label>Status</label>
          <select id="inv-status" aria-label="Invoice status">${statusOptions()}</select>
        </div>
      </div>
    </div>

    <div class="sheet-fit">
      <div class="invoice-sheet" id="invoice-sheet" data-template="freelancer">${sheetInnerHtml({ mode: 'editor' })}</div>
    </div>

    <div class="actions no-print">
      <button id="save-invoice" class="btn-primary">Save invoice</button>
      <button id="download-pdf" class="btn">Download PDF</button>
      <button id="email-invoice" class="btn">Email</button>
      <button id="print-invoice" class="btn">Print</button>
      <button id="new-invoice" class="btn-ghost">New invoice</button>
    </div>
  `;
}

export function renderBusinessForm(root) {
  root.innerHTML = `
    <h2>Your business</h2>
    <p class="hint">Saved locally in your browser. Appears on every invoice.</p>
    <form id="business-form" class="form-card">
      <label>Business name<input type="text" name="name" /></label>
      <label>Default template
        <input type="hidden" name="template" value="freelancer" />
        <div id="template-gallery-default" class="template-gallery"></div>
      </label>
      <label>Address<textarea name="address" rows="3"></textarea></label>
      <label>Contact (email, phone)<textarea name="contact" rows="2"></textarea></label>
      <label>Tax / business ID (EIN, VAT)<input type="text" name="taxId" placeholder="optional" /></label>
      <label>License / certification (electrician, EPA, SAG, contractor, etc.)<input type="text" name="license" placeholder="optional" /></label>
      <label>Logo (PNG/JPG/SVG)<input type="file" name="logo" accept="image/*" /></label>
      <div class="logo-preview" id="logo-preview"></div>
      <label>Signature (PNG/JPG/SVG, transparent background recommended)<input type="file" name="signature" accept="image/*" /></label>
      <div class="signature-preview" id="signature-preview"></div>
      <label>Default currency<select name="currency">${currencyOptions()}</select></label>
      <label>Default tax rate (%)<input type="number" name="taxRate" step="0.01" value="0" /></label>
      <label>Default payment terms
        <select name="paymentTerms">${paymentTermsOptions()}</select>
      </label>
      <label>Default payment instructions
        <textarea name="paymentInstructions" rows="3" placeholder="Bank wire info, Stripe link, Venmo, etc."></textarea>
      </label>
      <div class="form-actions">
        <button type="submit" class="btn-primary">Save</button>
      </div>
    </form>

    <div id="sync-mount" class="sync-mount"></div>

    <div class="backup-card">
      <h3>Backup &amp; restore</h3>
      <p class="hint">Your invoices live only in this browser. Export a JSON backup any time — restore it on a new browser or after clearing site data.</p>
      <div class="backup-actions">
        <button type="button" id="backup-export" class="btn">Export backup</button>
        <label class="btn-ghost" for="backup-import-input" style="cursor:pointer">
          Import backup
          <input type="file" id="backup-import-input" accept="application/json,.json" hidden />
        </label>
      </div>
      <p id="backup-status" class="backup-status" aria-live="polite"></p>
    </div>
  `;
}

export function renderClientsForm(root) {
  root.innerHTML = `
    <h2>Clients</h2>
    <p class="hint">Reusable client records. Stored locally.</p>
    <form id="client-form" class="form-card">
      <input type="hidden" name="id" />
      <label>Name<input type="text" name="name" required /></label>
      <label>Address<textarea name="address" rows="3"></textarea></label>
      <label>Email<input type="email" name="email" /></label>
      <label>Phone<input type="tel" name="phone" /></label>
      <div class="form-actions">
        <button type="submit" class="btn-primary">Save client</button>
        <button type="reset" class="btn-ghost">Clear</button>
      </div>
    </form>
    <ul id="client-list" class="record-list"></ul>
  `;
}

export function renderDashboardSection(root) {
  root.innerHTML = `
    <h2>Dashboard</h2>
    <p class="hint">Track outstanding, paid, and overdue invoices.</p>

    <div id="dashboard-stats" class="stats-grid"></div>

    <div class="dashboard-controls">
      <div id="dashboard-filters" class="filter-chips">
        <button class="filter-chip active" data-filter="all">All</button>
        <button class="filter-chip" data-filter="draft">Draft</button>
        <button class="filter-chip" data-filter="sent">Sent</button>
        <button class="filter-chip" data-filter="overdue">Overdue</button>
        <button class="filter-chip" data-filter="paid">Paid</button>
      </div>
      <div class="dashboard-search-sort">
        <input type="search" id="dashboard-search" placeholder="Search number, client, reference…" />
        <select id="dashboard-sort">
          <option value="recent">Recent</option>
          <option value="due">Due date</option>
          <option value="amount">Amount</option>
          <option value="client">Client</option>
        </select>
      </div>
    </div>

    <ul id="invoice-list" class="record-list dashboard-list"></ul>
  `;
}
