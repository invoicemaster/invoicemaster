export const TEMPLATES = [
  {
    id: 'contractor',
    label: 'Contractor',
    referenceLabel: 'Project #',
    category: 'trades',
    customFields: [
      { id: 'project', label: 'Project', section: 'header', type: 'text' },
      { id: 'phase', label: 'Phase / Milestone', section: 'header', type: 'text' },
      { id: 'permit', label: 'Permit #', section: 'header', type: 'text' },
      { id: 'retainage', label: 'Retainage %', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'autoshop',
    label: 'Auto Shop',
    referenceLabel: 'VIN',
    category: 'trades',
    customFields: [
      { id: 'vin', label: 'VIN', section: 'header', type: 'text' },
      { id: 'vehicle', label: 'Make / Model / Year', section: 'header', type: 'text' },
      { id: 'mileage', label: 'Mileage', section: 'header', type: 'number' },
      { id: 'plate', label: 'License plate', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'retail',
    label: 'Retail',
    referenceLabel: 'Order #',
    category: 'trades',
    customFields: [
      { id: 'order', label: 'Order #', section: 'header', type: 'text' },
      { id: 'po', label: 'PO #', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'freelancer',
    label: 'Freelancer',
    referenceLabel: 'Project',
    category: 'creative',
    customFields: [
      { id: 'project', label: 'Project', section: 'header', type: 'text' },
      { id: 'milestone', label: 'Milestone', section: 'header', type: 'text' },
      { id: 'license', label: 'License / usage rights', section: 'footer', type: 'text' },
    ],
  },
  {
    id: 'modern',
    label: 'Modern',
    referenceLabel: 'Reference',
    category: 'creative',
    customFields: [
      { id: 'project', label: 'Project', section: 'header', type: 'text' },
      { id: 'repo', label: 'Repository', section: 'header', type: 'text' },
      { id: 'staging', label: 'Staging URL', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'bandblue',
    label: 'Band Blue',
    referenceLabel: 'Reference',
    category: 'creative',
    customFields: [],
  },
  {
    id: 'modernred',
    label: 'Modern Red',
    referenceLabel: 'Invoice #',
    category: 'creative',
    customFields: [],
  },
  {
    id: 'letterheadblue',
    label: 'Letterhead Blue',
    referenceLabel: 'Invoice #',
    category: 'professional',
    customFields: [],
  },
  {
    id: 'classic',
    label: 'Classic',
    referenceLabel: 'Reference',
    category: 'professional',
    customFields: [
      { id: 'matter', label: 'Matter / Case #', section: 'header', type: 'text' },
      { id: 'trust', label: 'Trust account', section: 'footer', type: 'text' },
    ],
  },
  {
    id: 'academic',
    label: 'Academic',
    referenceLabel: 'Course',
    category: 'academic',
    customFields: [
      { id: 'subject', label: 'Subject / Course', section: 'header', type: 'text' },
      { id: 'term', label: 'Term / Period', section: 'header', type: 'text' },
      { id: 'student', label: 'Student', section: 'header', type: 'text' },
      { id: 'sessions', label: 'Sessions', section: 'header', type: 'number' },
    ],
  },
  {
    id: 'hospitality',
    label: 'Hospitality',
    referenceLabel: 'Event',
    category: 'hospitality',
    customFields: [
      { id: 'event', label: 'Event', section: 'header', type: 'text' },
      { id: 'venue', label: 'Venue', section: 'header', type: 'text' },
      { id: 'eventDate', label: 'Event date', section: 'header', type: 'date' },
      { id: 'guests', label: 'Guests', section: 'header', type: 'number' },
      { id: 'deposit', label: 'Deposit paid', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'agency',
    label: 'Agency',
    referenceLabel: 'Account',
    category: 'agency',
    customFields: [
      { id: 'account', label: 'Account / Domain', section: 'header', type: 'text' },
      { id: 'period', label: 'Billing period', section: 'header', type: 'text' },
      { id: 'sla', label: 'SLA tier', section: 'header', type: 'text' },
      { id: 'seats', label: 'Managed seats', section: 'header', type: 'number' },
    ],
  },
];

export const CATEGORIES = [
  { id: 'trades', label: 'Trades & on-site work', blurb: 'Dense layouts for service calls, parts + labor, and job-site invoicing.' },
  { id: 'creative', label: 'Creative & studio', blurb: 'Generous whitespace and modern typography for designers, devs, writers, and media work.' },
  { id: 'professional', label: 'Professional & executive', blurb: 'Formal, conservative layouts for legal, finance, and corporate services.' },
  { id: 'academic', label: 'Academic & coaching', blurb: 'Warm, schedule-friendly layouts for tutors, trainers, coaches, and instructors.' },
  { id: 'hospitality', label: 'Hospitality & events', blurb: 'Elegant layouts for catering, venues, and premium hospitality services.' },
  { id: 'agency', label: 'Virtual agency & recurring', blurb: 'Modern B2B layouts for MSPs, marketing, SEO, VAs, and recurring contracts.' },
];

export const TEMPLATE_IDS = TEMPLATES.map((t) => t.id);
export const DEFAULT_TEMPLATE = 'freelancer';

export function isValidTemplate(id) {
  return TEMPLATE_IDS.includes(id);
}

export function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}

export const PAYMENT_TERMS = [
  { value: 'on_receipt', label: 'Due on Receipt' },
  { value: 'net_7', label: 'Net 7' },
  { value: 'net_14', label: 'Net 14' },
  { value: 'net_30', label: 'Net 30' },
  { value: 'net_60', label: 'Net 60' },
  { value: 'net_90', label: 'Net 90' },
  { value: 'custom', label: 'Custom…' },
];

export const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
];

export const LINE_TYPES = [
  { value: 'product', label: 'Item' },
  { value: 'time', label: 'Hours' },
  { value: 'flat', label: 'Flat' },
];

export function renderGallery(container, selectedId, onPick) {
  container.innerHTML = '';
  for (const t of TEMPLATES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'template-card' + (t.id === selectedId ? ' selected' : '');
    btn.dataset.template = t.id;
    btn.setAttribute('aria-label', `Select template: ${t.label}`);
    btn.innerHTML = `
      <div class="tpl-mini" data-tpl="${t.id}">
        <div class="m-head">
          <div class="m-logo"></div>
          <div class="m-title">INVOICE</div>
        </div>
        <div class="m-row mid"></div>
        <div class="m-row short"></div>
        <div class="m-table">
          <div class="m-table-head"></div>
          <div class="m-row long"></div>
          <div class="m-row long"></div>
          <div class="m-row mid"></div>
        </div>
        <div class="m-total"></div>
      </div>
      <span class="tpl-label">${t.label}</span>
    `;
    btn.addEventListener('click', () => {
      setGallerySelection(container, t.id);
      onPick(t.id);
    });
    container.appendChild(btn);
  }
}

export function setGallerySelection(container, id) {
  container.querySelectorAll('.template-card').forEach((c) => {
    c.classList.toggle('selected', c.dataset.template === id);
  });
}

export function renderGalleryAsLinks(container, options = {}) {
  const { excludeId = null, pathPrefix = '/templates/' } = options;
  container.innerHTML = '';
  for (const t of TEMPLATES) {
    if (t.id === excludeId) continue;
    const a = document.createElement('a');
    a.className = 'template-card';
    a.href = `${pathPrefix}${t.id}.html`;
    a.dataset.template = t.id;
    a.setAttribute('aria-label', `Use the ${t.label} invoice template`);
    a.innerHTML = miniHtml(t);
    container.appendChild(a);
  }
}

function miniHtml(t) {
  return `
    <div class="tpl-mini" data-tpl="${t.id}">
      <div class="m-head">
        <div class="m-logo"></div>
        <div class="m-title">INVOICE</div>
      </div>
      <div class="m-row mid"></div>
      <div class="m-row short"></div>
      <div class="m-table">
        <div class="m-table-head"></div>
        <div class="m-row long"></div>
        <div class="m-row long"></div>
        <div class="m-row mid"></div>
      </div>
      <div class="m-total"></div>
    </div>
    <span class="tpl-label">${t.label}</span>
  `;
}
