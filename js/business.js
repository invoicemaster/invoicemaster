import { get, put } from './db.js?v=1778791897844';
import { DEFAULT_TEMPLATE, renderGallery, setGallerySelection } from './templates.js?v=1778791897844';
import { renderSyncCard } from './sync-ui.js?v=1778791897844';

const BIZ_ID = 'me';

export async function loadBusiness() {
  return (await get('business', BIZ_ID)) || {
    id: BIZ_ID,
    name: '',
    address: '',
    contact: '',
    taxId: '',
    license: '',
    logo: '',
    signature: '',
    currency: '$',
    taxRate: 0,
    template: DEFAULT_TEMPLATE,
    paymentTerms: 'net_30',
    paymentInstructions: '',
    numberPrefix: 'INV-',
    numberIncludeYear: false,
    numberPadding: 4,
  };
}

export async function saveBusiness(data) {
  await put('business', { ...data, id: BIZ_ID });
}

export function initBusinessForm() {
  const form = document.getElementById('business-form');
  const preview = document.getElementById('logo-preview');
  const signaturePreview = document.getElementById('signature-preview');
  const galleryEl = document.getElementById('template-gallery-default');
  const syncMount = document.getElementById('sync-mount');
  if (syncMount) renderSyncCard(syncMount);

  loadBusiness().then((biz) => {
    form.name.value = biz.name || '';
    form.address.value = biz.address || '';
    form.contact.value = biz.contact || '';
    form.taxId.value = biz.taxId || '';
    form.license.value = biz.license || '';
    form.currency.value = biz.currency || '$';
    form.taxRate.value = biz.taxRate || 0;
    form.paymentTerms.value = biz.paymentTerms || 'net_30';
    form.paymentInstructions.value = biz.paymentInstructions || '';
    const tpl = biz.template || DEFAULT_TEMPLATE;
    form.template.value = tpl;
    renderGallery(galleryEl, tpl, (picked) => {
      form.template.value = picked;
      setGallerySelection(galleryEl, picked);
    });
    if (biz.logo) preview.innerHTML = `<img src="${biz.logo}" alt="logo" />`;
    if (biz.signature && signaturePreview) signaturePreview.innerHTML = `<img src="${biz.signature}" alt="signature" />`;
    renderBusinessOnInvoice(biz);
  });

  form.logo.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    preview.innerHTML = `<img src="${dataUrl}" alt="logo" />`;
    form.dataset.logo = dataUrl;
  });

  if (form.signature) {
    form.signature.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const dataUrl = await fileToDataURL(file);
      if (signaturePreview) signaturePreview.innerHTML = `<img src="${dataUrl}" alt="signature" />`;
      form.dataset.signature = dataUrl;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const current = await loadBusiness();
    const data = {
      name: form.name.value.trim(),
      address: form.address.value.trim(),
      contact: form.contact.value.trim(),
      taxId: form.taxId.value.trim(),
      license: form.license.value.trim(),
      logo: form.dataset.logo || current.logo || '',
      signature: form.dataset.signature || current.signature || '',
      currency: form.currency.value.trim() || '$',
      taxRate: parseFloat(form.taxRate.value) || 0,
      template: form.template.value || DEFAULT_TEMPLATE,
      paymentTerms: form.paymentTerms.value || 'net_30',
      paymentInstructions: form.paymentInstructions.value.trim(),
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
  const taxIdEl = document.getElementById('biz-taxid');
  if (taxIdEl) taxIdEl.textContent = biz.taxId ? `Tax ID: ${biz.taxId}` : '';
  const licenseEl = document.getElementById('biz-license');
  if (licenseEl) licenseEl.textContent = biz.license ? `License: ${biz.license}` : '';
  const logoEl = document.getElementById('biz-logo');
  if (biz.logo) {
    logoEl.innerHTML = `<img src="${biz.logo}" alt="logo" />`;
    logoEl.classList.remove('empty');
  } else {
    logoEl.innerHTML = '';
    logoEl.classList.add('empty');
  }
  const sigEl = document.getElementById('biz-signature');
  if (sigEl) {
    sigEl.innerHTML = biz.signature ? `<img src="${biz.signature}" alt="signature" />` : '';
    sigEl.classList.toggle('empty', !biz.signature);
  }
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
