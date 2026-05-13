import { getAll, get, put, remove } from './db.js';
import { loadBusiness, renderBusinessOnInvoice } from './business.js';
import { loadClients } from './clients.js';

let currentId = null;
let currency = '$';

export async function initInvoiceTab() {
  const biz = await loadBusiness();
  currency = biz.currency || '$';
  renderBusinessOnInvoice(biz);

  document.getElementById('inv-date').value = today();
  document.getElementById('inv-number').value = await suggestNumber();
  document.getElementById('tax-rate').value = biz.taxRate || 0;

  document.getElementById('add-line').addEventListener('click', () => addLine());
  document.getElementById('tax-rate').addEventListener('input', recalc);
  document.getElementById('save-invoice').addEventListener('click', saveCurrent);
  document.getElementById('new-invoice').addEventListener('click', resetInvoice);
  document.getElementById('print-invoice').addEventListener('click', () => window.print());

  document.getElementById('client-select').addEventListener('change', onClientPick);

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
  document.getElementById('client-address').value = c.address || '';
}

function addLine(line = { desc: '', qty: 1, price: 0 }) {
  const body = document.getElementById('lines-body');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td class="col-desc"><input type="text" data-f="desc" placeholder="Item or service" /></td>
    <td class="col-qty"><input type="number" data-f="qty" min="0" step="1" /></td>
    <td class="col-price"><input type="number" data-f="price" min="0" step="0.01" /></td>
    <td class="col-amt" data-amt>0.00</td>
    <td class="col-rm no-print"><button class="rm-line" title="Remove">×</button></td>
  `;
  tr.querySelector('[data-f="desc"]').value = line.desc;
  tr.querySelector('[data-f="qty"]').value = line.qty;
  tr.querySelector('[data-f="price"]').value = line.price;
  tr.addEventListener('input', recalc);
  tr.querySelector('.rm-line').addEventListener('click', () => {
    tr.remove();
    recalc();
  });
  body.appendChild(tr);
}

function getLines() {
  return Array.from(document.querySelectorAll('#lines-body tr')).map((tr) => ({
    desc: tr.querySelector('[data-f="desc"]').value,
    qty: parseFloat(tr.querySelector('[data-f="qty"]').value) || 0,
    price: parseFloat(tr.querySelector('[data-f="price"]').value) || 0,
  }));
}

function recalc() {
  let subtotal = 0;
  document.querySelectorAll('#lines-body tr').forEach((tr) => {
    const qty = parseFloat(tr.querySelector('[data-f="qty"]').value) || 0;
    const price = parseFloat(tr.querySelector('[data-f="price"]').value) || 0;
    const amt = qty * price;
    tr.querySelector('[data-amt]').textContent = fmt(amt);
    subtotal += amt;
  });
  const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + tax;
  document.getElementById('sum-subtotal').textContent = fmt(subtotal);
  document.getElementById('sum-tax').textContent = fmt(tax);
  document.getElementById('sum-total').textContent = `${currency}${fmt(total)}`;
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
  return {
    number: document.getElementById('inv-number').value.trim(),
    date: document.getElementById('inv-date').value,
    due: document.getElementById('inv-due').value,
    clientName: document.getElementById('client-name').value.trim(),
    clientAddress: document.getElementById('client-address').value.trim(),
    lines: getLines(),
    taxRate: parseFloat(document.getElementById('tax-rate').value) || 0,
    notes: document.getElementById('inv-notes').value.trim(),
    updatedAt: Date.now(),
  };
}

async function saveCurrent() {
  const data = collectInvoice();
  if (currentId) data.id = currentId;
  const id = await put('invoices', data);
  currentId = data.id || id;
  flashButton('save-invoice', 'Saved');
  document.dispatchEvent(new CustomEvent('invoices:changed'));
}

export async function loadInvoice(id) {
  const inv = await get('invoices', id);
  if (!inv) return;
  currentId = id;
  document.getElementById('inv-number').value = inv.number || '';
  document.getElementById('inv-date').value = inv.date || '';
  document.getElementById('inv-due').value = inv.due || '';
  document.getElementById('client-name').value = inv.clientName || '';
  document.getElementById('client-address').value = inv.clientAddress || '';
  document.getElementById('tax-rate').value = inv.taxRate || 0;
  document.getElementById('inv-notes').value = inv.notes || '';
  document.getElementById('lines-body').innerHTML = '';
  (inv.lines || []).forEach((l) => addLine(l));
  if (!inv.lines || inv.lines.length === 0) addLine();
  recalc();
}

async function resetInvoice() {
  currentId = null;
  document.getElementById('inv-number').value = await suggestNumber();
  document.getElementById('inv-date').value = today();
  document.getElementById('inv-due').value = '';
  document.getElementById('client-name').value = '';
  document.getElementById('client-address').value = '';
  document.getElementById('client-select').value = '';
  document.getElementById('inv-notes').value = '';
  document.getElementById('lines-body').innerHTML = '';
  addLine();
  recalc();
}

export async function deleteInvoice(id) {
  await remove('invoices', id);
  if (currentId === id) currentId = null;
}

function flashButton(id, msg) {
  const btn = document.getElementById(id);
  const original = btn.textContent;
  btn.textContent = msg;
  setTimeout(() => { btn.textContent = original; }, 1200);
}
