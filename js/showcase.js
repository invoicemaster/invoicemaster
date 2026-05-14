import { CATEGORIES, getTemplate, PAYMENT_TERMS } from './templates.js?v=1778786333403';
import { INDUSTRIES } from './industries.js?v=1778786333403';
import { sheetInnerHtml } from './editor.js?v=1778786333403';

const DEFAULTS = {
  bizAddress: '1912 Harvest Lane\nNew York, NY 12210',
  bizContact: 'hello@business.com',
  bizTaxId: 'EIN 12-3456789',
  clientName: 'John Smith',
  clientAddress: '2 Court Square\nNew York, NY 12210',
  shipName: 'John Smith',
  shipAddress: '3787 Pineview Drive\nCambridge, MA 12210',
  'inv-number': 'INV-001',
  'inv-date': '2025-02-11',
  'inv-due': '2025-02-26',
  taxRate: 6.25,
  paymentTerms: 'Net 30',
};

/* Per-industry sample data so each card on the home page renders
   convincingly different content — business name, line items, and
   populated custom fields specific to that industry. */
const SAMPLES = {
  electrician: {
    bizName: 'Sparks Electric LLC', bizContact: 'crew@sparkselectric.com',
    lines: [{ desc: 'Panel breaker replacement', qty: 1, price: 180 }, { desc: 'Labor', qty: 2, price: 95 }],
    customData: { job: 'Kitchen circuit repair', permit: 'BLD-22481', cert: 'NEC-2023', callout: '75' },
  },
  plumber: {
    bizName: 'AfterHours Plumbing', bizContact: 'dispatch@afterhoursplumbing.com',
    lines: [{ desc: 'Main line clog clear', qty: 1, price: 250 }, { desc: 'Labor (1.5 hrs)', qty: 1.5, price: 140 }],
    customData: { diagnostic: 'Kitchen drain backup', emergency: '125', callTime: '11:40 PM' },
  },
  hvac: {
    bizName: 'CoolAir HVAC Services', bizContact: 'service@coolair.com',
    lines: [{ desc: 'AC refrigerant recharge', qty: 1, price: 195 }, { desc: 'Filter replacement', qty: 1, price: 35 }],
    customData: { equipment: 'Carrier 24ACC6', serial: 'AC-7821-X', epaCert: 'EPA-608', warranty: '90 days parts' },
  },
  handyman: {
    bizName: "Mike's Handyman Service", bizContact: 'mike@mikeshandyman.com',
    lines: [{ desc: 'Drywall patch (3 sq ft)', qty: 1, price: 85 }, { desc: 'Door hinge repair', qty: 1, price: 45 }],
    customData: { job: 'Bedroom + hallway repairs', markup: '15' },
  },
  'general-contractor': {
    bizName: 'Hillcrest Construction', bizContact: 'office@hillcrestbuild.com',
    lines: [{ desc: 'Framing labor', qty: 24, price: 65 }, { desc: 'Lumber package', qty: 1, price: 1850 }],
    customData: { project: 'Maple St. Reno', phase: 'Phase 2 of 4', permit: 'BLD-22481', retainage: '10' },
  },
  mechanic: {
    bizName: 'East Repair Inc.', bizContact: 'shop@eastrepair.com',
    lines: [{ desc: 'Front brake pads', qty: 1, price: 120 }, { desc: 'Labor (2 hrs)', qty: 2, price: 95 }],
    customData: { vin: '1HGCM82633A123456', vehicle: '2019 Honda Accord', mileage: '78420', plate: '7XYZ123' },
  },
  'graphic-designer': {
    bizName: 'Studio Inkwell', bizContact: 'hello@studioinkwell.co',
    lines: [{ desc: 'Logo concepts (3 directions)', qty: 1, price: 1200 }, { desc: 'Final refinement', qty: 1, price: 400 }],
    customData: { project: 'Acme brand refresh', milestone: 'Milestone 2 of 3', license: 'Web + print, perpetual' },
  },
  'web-developer': {
    bizName: 'Lattice Dev', bizContact: 'team@latticedev.io',
    lines: [{ desc: 'Frontend implementation', qty: 32, price: 95 }, { desc: 'API integration', qty: 12, price: 95 }],
    customData: { project: 'Acme marketing site', sprint: 'Sprint 3', repo: 'github.com/acme/site', staging: 'staging.acme.com' },
  },
  copywriter: {
    bizName: 'June Copy Co.', bizContact: 'june@junecopy.com',
    lines: [{ desc: 'Blog post', qty: 1200, price: 0.45 }, { desc: 'Headline variations', qty: 5, price: 25 }],
    customData: { title: 'Q1 product launch blog', wordCount: '1200', revision: '2', url: 'acme.com/blog/launch' },
  },
  photographer: {
    bizName: 'Mira Lane Photography', bizContact: 'studio@miralane.com',
    lines: [{ desc: 'Editorial shoot — full day', qty: 1, price: 2400 }, { desc: 'Image retouching', qty: 15, price: 45 }],
    customData: { campaign: 'Spring lookbook', shootDate: '2025-02-09', usage: 'Web + social, 12 months' },
  },
  videographer: {
    bizName: 'Pinewood Films', bizContact: 'book@pinewoodfilms.com',
    lines: [{ desc: 'Wedding videography — 8 hrs', qty: 8, price: 285 }, { desc: 'Highlights edit', qty: 1, price: 750 }],
    customData: { event: 'Carter Wedding', eventDate: '2025-05-17', venue: 'Hillcrest Manor', deposit: '500' },
  },
  'social-media-manager': {
    bizName: 'Lumen Social', bizContact: 'hi@lumensocial.com',
    lines: [{ desc: 'Content production — 20 posts', qty: 20, price: 65 }, { desc: 'Strategy + reporting', qty: 1, price: 400 }],
    customData: { handles: '@acme · /acmebrand', period: 'Feb 2025', tier: 'Growth tier' },
  },
  'legal-consultant': {
    bizName: 'Carter & Lin LLP', bizContact: 'billing@carterlin.law',
    lines: [{ desc: 'Contract review', qty: 3.4, price: 425 }, { desc: 'Deposition prep', qty: 2.1, price: 425 }],
    customData: { matter: 'Case #2024-0142', trust: 'IOLTA acct ****1947', disbursals: '125' },
  },
  bookkeeper: {
    bizName: 'Ledger Lane Bookkeeping', bizContact: 'books@ledgerlane.co',
    lines: [{ desc: 'Monthly bookkeeping (Jan)', qty: 1, price: 450 }, { desc: 'Bank reconciliation', qty: 4, price: 65 }],
    customData: { period: 'Jan 1 – Jan 31, 2025', accounts: '4' },
  },
  translator: {
    bizName: 'Bridge Translation Co.', bizContact: 'projects@bridgetranslation.com',
    lines: [{ desc: 'Document translation', qty: 4200, price: 0.18 }, { desc: 'Certified notarization', qty: 1, price: 75 }],
    customData: { document: 'Acme product manual', langPair: 'English → Spanish', wordCount: '4200' },
  },
  'hr-consultant': {
    bizName: 'Pivot HR Advisory', bizContact: 'team@pivothr.co',
    lines: [{ desc: 'Handbook drafting', qty: 14, price: 175 }, { desc: 'Policy review', qty: 4, price: 175 }],
    customData: { engagement: 'Employee handbook overhaul', milestone: 'Draft 2', cert: 'SHRM-CP 2024' },
  },
  'voiceover-artist': {
    bizName: 'Calliope Voice', bizContact: 'book@calliopevoice.com',
    lines: [{ desc: '30-sec radio spot', qty: 1, price: 450 }, { desc: 'Source-Connect session', qty: 1, price: 75 }],
    customData: { project: 'Acme spring radio', sessionDate: '2025-02-10', usage: 'Local radio', duration: '12 months' },
  },
  tutor: {
    bizName: 'Bright Path Tutoring', bizContact: 'hello@brightpath.edu',
    lines: [{ desc: 'AP Calculus tutoring', qty: 8, price: 75 }, { desc: 'Practice tests', qty: 2, price: 35 }],
    customData: { subject: 'AP Calculus', student: 'Emma Carter', sessions: '8' },
  },
  'personal-trainer': {
    bizName: 'Ironwood Fitness', bizContact: 'train@ironwoodfit.com',
    lines: [{ desc: '10-session package', qty: 1, price: 850 }, { desc: 'Gym day passes', qty: 5, price: 20 }],
    customData: { package: 'Premium 10-pack', sessionsTotal: '10', sessionsUsed: '3', expires: '2025-05-30' },
  },
  'business-coach': {
    bizName: 'NorthStar Coaching', bizContact: 'connect@northstar.coach',
    lines: [{ desc: 'Executive coaching — Feb', qty: 1, price: 2400 }, { desc: 'Strengths assessment', qty: 1, price: 195 }],
    customData: { program: 'Executive Tier', sessions: '4', period: 'Feb 2025' },
  },
  'music-instructor': {
    bizName: 'Cadence Music Studio', bizContact: 'studio@cadencemusic.co',
    lines: [{ desc: 'Piano lessons (4 × 45 min)', qty: 4, price: 65 }, { desc: 'Method book', qty: 1, price: 28 }],
    customData: { instrument: 'Piano', student: 'Liam Park', slot: 'Wed 4:30 PM' },
  },
  caterer: {
    bizName: 'Sage & Stone Catering', bizContact: 'events@sageandstone.com',
    lines: [{ desc: 'Plated dinner — per head', qty: 120, price: 85 }, { desc: 'Bar service', qty: 1, price: 950 }],
    customData: { event: 'Carter Wedding', eventDate: '2025-05-17', venue: 'Hillcrest Manor', guests: '120', permit: 'FP-3381', deposit: '1500' },
  },
  'event-planner': {
    bizName: 'Vance Events Group', bizContact: 'plan@vanceevents.com',
    lines: [{ desc: 'Coordination hours', qty: 38, price: 125 }, { desc: 'Vendor markup', qty: 1, price: 1800 }],
    customData: { event: 'Acme annual gala', eventDate: '2025-06-14', coordHours: '38', vendorMarkup: '15' },
  },
  'marketing-consultant': {
    bizName: 'Helix Marketing', bizContact: 'growth@helixmarketing.com',
    lines: [{ desc: 'Monthly retainer', qty: 1, price: 5500 }, { desc: 'Overage hours', qty: 6, price: 175 }],
    customData: { account: 'Acme Co.', period: 'Feb 2025', retainerHours: '20', overageHours: '6' },
  },
  'cleaning-service': {
    bizName: 'Crystal Office Cleaning', bizContact: 'office@crystalclean.co',
    lines: [{ desc: 'Nightly office cleaning', qty: 22, price: 145 }, { desc: 'Deep-clean carpets', qty: 1, price: 380 }],
    customData: { site: 'Acme HQ — 12th floor', frequency: 'Nightly, Mon–Fri', period: 'Feb 2025' },
  },
  landscaper: {
    bizName: 'GreenView Landscaping', bizContact: 'crew@greenview.co',
    lines: [{ desc: 'Weekly mowing (4 visits)', qty: 4, price: 85 }, { desc: 'Spring fertilizer', qty: 1, price: 120 }],
    customData: { property: '42 Maple St.', period: 'Feb 2025', seasonal: 'Spring application' },
  },
  'it-msp': {
    bizName: 'Northbridge IT', bizContact: 'noc@northbridge.it',
    lines: [{ desc: 'Managed services (42 seats)', qty: 42, price: 85 }, { desc: 'Out-of-scope helpdesk', qty: 3, price: 195 }],
    customData: { account: 'Acme Co.', period: 'Feb 2025', sla: 'Premium 24/7', seats: '42', devices: '8' },
  },
  'virtual-assistant': {
    bizName: 'Tideline Virtual Assistants', bizContact: 'desk@tidelineva.com',
    lines: [{ desc: 'Inbox + scheduling', qty: 18, price: 55 }, { desc: 'CRM data entry', qty: 12, price: 55 }],
    customData: { period: 'Feb 1 – Feb 14', totalHours: '30', tasks: 'Inbox · Scheduling · CRM' },
  },
  'seo-specialist': {
    bizName: 'Pageline SEO', bizContact: 'hi@pageline.co',
    lines: [{ desc: 'SEO retainer — Feb', qty: 1, price: 2200 }, { desc: 'Technical audit', qty: 1, price: 850 }],
    customData: { domain: 'acme.com', campaign: 'Q1 growth keywords', period: 'Feb 2025', reportUrl: 'reports.pageline.co/acme' },
  },
};

function sample(industry) {
  return { ...DEFAULTS, bizName: 'Your Business', lines: [], customData: {}, ...(SAMPLES[industry.id] || {}) };
}

function sheetHtml(industry) {
  const s = sample(industry);
  const tpl = getTemplate(industry.template);
  const accent = industry.color || '';

  // Build customFields list with sample values — show all of them so the card
  // matches the editor's structure 1:1 (no field cap).
  const customFields = (industry.customFields || [])
    .filter((f) => s.customData[f.id])
    .map((f) => ({ ...f, value: s.customData[f.id] }));

  const values = {
    bizName: s.bizName,
    bizAddress: s.bizAddress,
    bizContact: s.bizContact,
    bizTaxId: s.bizTaxId,
    clientName: s.clientName,
    clientAddress: s.clientAddress,
    shipName: industry.showShipTo ? s.shipName : '',
    shipAddress: industry.showShipTo ? s.shipAddress : '',
    'inv-number': s['inv-number'],
    'inv-date': s['inv-date'],
    'inv-due': s['inv-due'],
    lines: s.lines,
    taxRate: s.taxRate,
    paymentTerms: s.paymentTerms,
  };
  const labels = (industry.labels) || {};

  return `
    <div class="invoice-sheet showcase-sheet" data-template="${tpl.id}" data-mode="preview"${accent ? ` style="--tpl-accent: ${accent};"` : ''}>
      ${sheetInnerHtml({ mode: 'preview', values, customFields, labels, hideShipTo: !industry.showShipTo })}
    </div>
  `;
}

function cardHtml(industry) {
  const accent = industry.color || 'var(--ink)';
  return `
    <a class="showcase-card industry-card" href="/industries/${industry.id}.html"
       style="--card-accent: ${accent};"
       aria-label="Use the ${industry.label} invoice template">
      <div class="card-accent-band"></div>
      <div class="showcase-frame">${sheetHtml(industry)}</div>
      <div class="showcase-meta">
        <div>
          <div class="showcase-name">${industry.label}</div>
          <div class="showcase-blurb">${industry.blurb}</div>
        </div>
        <span class="showcase-cta">Use →</span>
      </div>
    </a>
  `;
}

export function renderShowcase(container) {
  container.innerHTML = '';
  for (const cat of CATEGORIES) {
    const items = INDUSTRIES.filter((i) => i.category === cat.id);
    if (items.length === 0) continue;
    const section = document.createElement('section');
    section.className = 'showcase-category';
    section.innerHTML = `
      <header class="category-header">
        <h3 class="category-label">${cat.label}</h3>
        <p class="category-blurb">${cat.blurb}</p>
      </header>
      <div class="showcase-grid industry-grid">${items.map(cardHtml).join('')}</div>
    `;
    container.appendChild(section);
  }
  applyCardScales();
  // Recompute on window resize so cards stay correctly scaled
  if (!window.__showcaseResizeBound) {
    window.addEventListener('resize', applyCardScales);
    window.__showcaseResizeBound = true;
  }
}

function applyCardScales() {
  const SHEET_WIDTH = 794;
  document.querySelectorAll('.showcase-frame').forEach((frame) => {
    const w = frame.clientWidth;
    if (!w) return;
    const scale = Math.min(1, w / SHEET_WIDTH);
    frame.style.setProperty('--card-scale', scale.toFixed(4));
  });
}
