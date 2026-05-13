import { get, put } from './db.js';

const BIZ_ID = 'me';

export async function loadBusiness() {
  return (await get('business', BIZ_ID)) || { id: BIZ_ID, name: '', address: '', contact: '', logo: '', currency: '$', taxRate: 0 };
}

export async function saveBusiness(data) {
  await put('business', { ...data, id: BIZ_ID });
}

export function initBusinessForm() {
  const form = document.getElementById('business-form');
  const preview = document.getElementById('logo-preview');

  loadBusiness().then((biz) => {
    form.name.value = biz.name || '';
    form.address.value = biz.address || '';
    form.contact.value = biz.contact || '';
    form.currency.value = biz.currency || '$';
    form.taxRate.value = biz.taxRate || 0;
    if (biz.logo) preview.innerHTML = `<img src="${biz.logo}" alt="logo" />`;
    renderBusinessOnInvoice(biz);
  });

  form.logo.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    preview.innerHTML = `<img src="${dataUrl}" alt="logo" />`;
    form.dataset.logo = dataUrl;
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = await loadBusiness();
    const data = {
      name: form.name.value.trim(),
      address: form.address.value.trim(),
      contact: form.contact.value.trim(),
      logo: form.dataset.logo || current.logo || '',
      currency: form.currency.value.trim() || '$',
      taxRate: parseFloat(form.taxRate.value) || 0,
    };
    await saveBusiness(data);
    renderBusinessOnInvoice(data);
    flash(form, 'Saved');
  });
}

export function renderBusinessOnInvoice(biz) {
  document.getElementById('biz-name').textContent = biz.name || 'Your Business';
  document.getElementById('biz-address').textContent = biz.address || '';
  document.getElementById('biz-contact').textContent = biz.contact || '';
  const logoEl = document.getElementById('biz-logo');
  logoEl.innerHTML = biz.logo ? `<img src="${biz.logo}" alt="logo" />` : '';
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function flash(form, msg) {
  const btn = form.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = msg;
  setTimeout(() => { btn.textContent = original; }, 1200);
}
