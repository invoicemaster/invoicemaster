/* Industries — first-class entry points. Each one maps to a visual template
   and brings its own field set, reference label, and ship-to expectation.
   This is the layer the home page surfaces and that we track per invoice. */

export const INDUSTRIES = [
  // ===== Trades & on-site =====
  {
    id: 'electrician', label: 'Residential Electrician', category: 'trades',
    template: 'contractor', referenceLabel: 'Job #', showShipTo: false, labels: { materials: 'Parts', labor: 'Labor' }, color: '#d97706',
    blurb: 'Service calls, parts, and labor for residential electrical work.',
    customFields: [
      { id: 'job', label: 'Job description', section: 'header', type: 'text' },
      { id: 'permit', label: 'Permit #', section: 'header', type: 'text' },
      { id: 'cert', label: 'Safety cert', section: 'header', type: 'text' },
      { id: 'callout', label: 'Callout fee', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'plumber', label: 'Emergency Plumber', category: 'trades',
    template: 'contractor', referenceLabel: 'Service call', showShipTo: false, labels: { materials: 'Parts', labor: 'Labor' }, color: '#0891b2',
    blurb: 'After-hours plumbing service calls with emergency surcharges.',
    customFields: [
      { id: 'diagnostic', label: 'Diagnostic notes', section: 'header', type: 'text' },
      { id: 'emergency', label: 'After-hours fee', section: 'header', type: 'number' },
      { id: 'callTime', label: 'Call time', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'hvac', label: 'HVAC Technician', category: 'trades',
    template: 'contractor', referenceLabel: 'Service ticket', showShipTo: false, labels: { materials: 'Parts', labor: 'Labor' }, color: '#059669',
    blurb: 'Heating, cooling, and refrigeration service with equipment details.',
    customFields: [
      { id: 'equipment', label: 'Equipment model', section: 'header', type: 'text' },
      { id: 'serial', label: 'Serial number', section: 'header', type: 'text' },
      { id: 'epaCert', label: 'EPA cert #', section: 'header', type: 'text' },
      { id: 'warranty', label: 'Warranty terms', section: 'footer', type: 'text' },
    ],
  },
  {
    id: 'handyman', label: 'Local Handyman', category: 'trades',
    template: 'contractor', referenceLabel: 'Job #', showShipTo: false, labels: { materials: 'Parts', labor: 'Labor' }, color: '#92400e',
    blurb: 'Varied small repairs with itemized labor and material markups.',
    customFields: [
      { id: 'job', label: 'Job description', section: 'header', type: 'text' },
      { id: 'markup', label: 'Materials markup %', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'general-contractor', label: 'General Contractor', category: 'trades',
    template: 'contractor', referenceLabel: 'Project #', showShipTo: true, labels: { subtotal: 'Gross Phase Total', materials: 'Materials', labor: 'Labor' }, color: '#b45309',
    blurb: 'Multi-phase construction with retainage and subcontractor draws.',
    customFields: [
      { id: 'project', label: 'Project', section: 'header', type: 'text' },
      { id: 'phase', label: 'Phase / Milestone', section: 'header', type: 'text' },
      { id: 'permit', label: 'Permit #', section: 'header', type: 'text' },
      { id: 'retainage', label: 'Retainage %', section: 'footer', type: 'number' },
      { id: 'subDraw', label: 'Sub draw balance', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'mechanic', label: 'Automotive Mechanic', category: 'trades',
    template: 'autoshop', referenceLabel: 'VIN', showShipTo: false, labels: { materials: 'Parts', labor: 'Labor' }, color: '#dc2626',
    blurb: 'Vehicle repair with VIN, mileage, parts and labor split.',
    customFields: [
      { id: 'vin', label: 'VIN', section: 'header', type: 'text' },
      { id: 'vehicle', label: 'Make / Model / Year', section: 'header', type: 'text' },
      { id: 'mileage', label: 'Mileage', section: 'header', type: 'number' },
      { id: 'plate', label: 'License plate', section: 'header', type: 'text' },
      { id: 'dtc', label: 'Diagnostic codes', section: 'header', type: 'text' },
    ],
  },

  // ===== Creative & studio =====
  {
    id: 'graphic-designer', label: 'Graphic Designer', category: 'creative',
    template: 'freelancer', referenceLabel: 'Project', showShipTo: false, color: '#7c3aed',
    blurb: 'Design milestones, deliverables, and usage rights.',
    customFields: [
      { id: 'project', label: 'Project', section: 'header', type: 'text' },
      { id: 'milestone', label: 'Milestone', section: 'header', type: 'text' },
      { id: 'license', label: 'Usage / license terms', section: 'footer', type: 'text' },
    ],
  },
  {
    id: 'web-developer', label: 'Web Developer', category: 'creative',
    template: 'modern', referenceLabel: 'Project', showShipTo: false, color: '#2563eb',
    blurb: 'Sprint cycles, repo links, and staging URLs for development work.',
    customFields: [
      { id: 'project', label: 'Project', section: 'header', type: 'text' },
      { id: 'sprint', label: 'Sprint / Scope', section: 'header', type: 'text' },
      { id: 'repo', label: 'Repository', section: 'header', type: 'text' },
      { id: 'staging', label: 'Staging URL', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'copywriter', label: 'Copywriter', category: 'creative',
    template: 'freelancer', referenceLabel: 'Asset', showShipTo: false, color: '#db2777',
    blurb: 'Word-count billing, revision tracking, and asset links.',
    customFields: [
      { id: 'title', label: 'Article / asset title', section: 'header', type: 'text' },
      { id: 'wordCount', label: 'Word count', section: 'header', type: 'number' },
      { id: 'revision', label: 'Revision round', section: 'header', type: 'number' },
      { id: 'url', label: 'Publication URL', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'photographer', label: 'Photographer', category: 'creative',
    template: 'modern', referenceLabel: 'Shoot', showShipTo: false, color: '#4f46e5',
    blurb: 'Day rates, shoot dates, and image usage rights.',
    customFields: [
      { id: 'campaign', label: 'Campaign / shoot', section: 'header', type: 'text' },
      { id: 'shootDate', label: 'Shoot date', section: 'header', type: 'date' },
      { id: 'usage', label: 'Image usage rights', section: 'footer', type: 'text' },
    ],
  },
  {
    id: 'videographer', label: 'Videographer', category: 'creative',
    template: 'freelancer', referenceLabel: 'Event', showShipTo: false, color: '#9333ea',
    blurb: 'Event shoots, deliverable checklists, and deposits.',
    customFields: [
      { id: 'event', label: 'Event / project', section: 'header', type: 'text' },
      { id: 'eventDate', label: 'Event date', section: 'header', type: 'date' },
      { id: 'venue', label: 'Venue / location', section: 'header', type: 'text' },
      { id: 'deposit', label: 'Deposit paid', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'social-media-manager', label: 'Social Media Manager', category: 'creative',
    template: 'modern', referenceLabel: 'Account', showShipTo: false, color: '#e11d48',
    blurb: 'Content packages, channel handles, and publishing periods.',
    customFields: [
      { id: 'handles', label: 'Channels / handles', section: 'header', type: 'text' },
      { id: 'period', label: 'Content period', section: 'header', type: 'text' },
      { id: 'tier', label: 'Package tier', section: 'header', type: 'text' },
    ],
  },

  // ===== Professional & executive =====
  {
    id: 'legal-consultant', label: 'Legal Consultant', category: 'professional',
    template: 'classic', referenceLabel: 'Matter', showShipTo: false, color: '#1e3a8a',
    blurb: 'Billable tenths of an hour, matter references, and trust accounts.',
    customFields: [
      { id: 'matter', label: 'Matter / Case #', section: 'header', type: 'text' },
      { id: 'trust', label: 'Trust account (IOLTA)', section: 'footer', type: 'text' },
      { id: 'disbursals', label: 'Disbursals', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'bookkeeper', label: 'Bookkeeper', category: 'professional',
    template: 'classic', referenceLabel: 'Period', showShipTo: false, color: '#475569',
    blurb: 'Statement periods and accounts balanced.',
    customFields: [
      { id: 'period', label: 'Statement period', section: 'header', type: 'text' },
      { id: 'accounts', label: 'Accounts balanced', section: 'header', type: 'number' },
    ],
  },
  {
    id: 'translator', label: 'Translator', category: 'professional',
    template: 'classic', referenceLabel: 'Document', showShipTo: false, color: '#0d9488',
    blurb: 'Source-target language pairs and per-word or per-page rates.',
    customFields: [
      { id: 'document', label: 'Document title', section: 'header', type: 'text' },
      { id: 'langPair', label: 'Source → Target', section: 'header', type: 'text' },
      { id: 'wordCount', label: 'Word count', section: 'header', type: 'number' },
    ],
  },
  {
    id: 'hr-consultant', label: 'HR Consultant', category: 'professional',
    template: 'classic', referenceLabel: 'Engagement', showShipTo: false, color: '#166534',
    blurb: 'Recruiting placements, handbook drafting, and HR advisory work.',
    customFields: [
      { id: 'engagement', label: 'Engagement name', section: 'header', type: 'text' },
      { id: 'milestone', label: 'Milestone', section: 'header', type: 'text' },
      { id: 'cert', label: 'SHRM / HRCI ref', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'voiceover-artist', label: 'Voiceover Artist', category: 'professional',
    template: 'classic', referenceLabel: 'Project', showShipTo: false, color: '#a16207',
    blurb: 'Recording sessions, usage scope, and broadcast rights.',
    customFields: [
      { id: 'project', label: 'Project / script', section: 'header', type: 'text' },
      { id: 'sessionDate', label: 'Session date', section: 'header', type: 'date' },
      { id: 'usage', label: 'Usage / media scope', section: 'footer', type: 'text' },
      { id: 'duration', label: 'License duration', section: 'footer', type: 'text' },
    ],
  },

  // ===== Academic & coaching =====
  {
    id: 'tutor', label: 'Private Tutor', category: 'academic',
    template: 'academic', referenceLabel: 'Subject', showShipTo: false, color: '#7c3aed',
    blurb: 'Weekly tutoring sessions with subject and student tracking.',
    customFields: [
      { id: 'subject', label: 'Subject', section: 'header', type: 'text' },
      { id: 'student', label: 'Student', section: 'header', type: 'text' },
      { id: 'sessions', label: 'Sessions this period', section: 'header', type: 'number' },
    ],
  },
  {
    id: 'personal-trainer', label: 'Personal Trainer', category: 'academic',
    template: 'academic', referenceLabel: 'Package', showShipTo: false, color: '#047857',
    blurb: 'Training packages with session counters and expiration dates.',
    customFields: [
      { id: 'package', label: 'Package name', section: 'header', type: 'text' },
      { id: 'sessionsTotal', label: 'Sessions in package', section: 'header', type: 'number' },
      { id: 'sessionsUsed', label: 'Sessions used', section: 'header', type: 'number' },
      { id: 'expires', label: 'Package expires', section: 'header', type: 'date' },
    ],
  },
  {
    id: 'business-coach', label: 'Business Coach', category: 'academic',
    template: 'academic', referenceLabel: 'Program', showShipTo: false, color: '#0284c7',
    blurb: 'Executive coaching programs with session counts and tiers.',
    customFields: [
      { id: 'program', label: 'Program tier', section: 'header', type: 'text' },
      { id: 'sessions', label: 'Sessions completed', section: 'header', type: 'number' },
      { id: 'period', label: 'Billing period', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'music-instructor', label: 'Music Instructor', category: 'academic',
    template: 'academic', referenceLabel: 'Lesson slot', showShipTo: false, color: '#86198f',
    blurb: 'Weekly lesson slots, monthly tuition, and sheet music.',
    customFields: [
      { id: 'instrument', label: 'Instrument', section: 'header', type: 'text' },
      { id: 'student', label: 'Student', section: 'header', type: 'text' },
      { id: 'slot', label: 'Weekly time slot', section: 'header', type: 'text' },
    ],
  },

  // ===== Hospitality & events =====
  {
    id: 'caterer', label: 'Catering Service', category: 'hospitality',
    template: 'hospitality', referenceLabel: 'Event', showShipTo: true, labels: { subtotal: 'Food & Beverage Gross' }, color: '#7c2d12',
    blurb: 'Per-head menus, deposits, and event details.',
    customFields: [
      { id: 'event', label: 'Event name', section: 'header', type: 'text' },
      { id: 'eventDate', label: 'Event date', section: 'header', type: 'date' },
      { id: 'venue', label: 'Venue', section: 'header', type: 'text' },
      { id: 'guests', label: 'Guest count', section: 'header', type: 'number' },
      { id: 'permit', label: 'Food permit #', section: 'header', type: 'text' },
      { id: 'deposit', label: 'Deposit paid', section: 'footer', type: 'number' },
    ],
  },
  {
    id: 'event-planner', label: 'Event Planner', category: 'hospitality',
    template: 'hospitality', referenceLabel: 'Event', showShipTo: false, color: '#b91c1c',
    blurb: 'Coordination hours, vendor markups, and event details.',
    customFields: [
      { id: 'event', label: 'Event name', section: 'header', type: 'text' },
      { id: 'eventDate', label: 'Event date', section: 'header', type: 'date' },
      { id: 'coordHours', label: 'Coordination hours', section: 'header', type: 'number' },
      { id: 'vendorMarkup', label: 'Vendor markup %', section: 'footer', type: 'number' },
    ],
  },

  // ===== Virtual agency & recurring =====
  {
    id: 'marketing-consultant', label: 'Marketing Consultant', category: 'agency',
    template: 'agency', referenceLabel: 'Account', showShipTo: false, color: '#0f766e',
    blurb: 'Monthly retainers, ad spend management, and overage hours.',
    customFields: [
      { id: 'account', label: 'Account', section: 'header', type: 'text' },
      { id: 'period', label: 'Billing period', section: 'header', type: 'text' },
      { id: 'retainerHours', label: 'Retainer hours', section: 'header', type: 'number' },
      { id: 'overageHours', label: 'Overage hours', section: 'header', type: 'number' },
    ],
  },
  {
    id: 'cleaning-service', label: 'Cleaning Service', category: 'agency',
    template: 'agency', referenceLabel: 'Site', showShipTo: true, color: '#0369a1',
    blurb: 'Recurring commercial cleaning with facility and frequency tracking.',
    customFields: [
      { id: 'site', label: 'Facility / site', section: 'header', type: 'text' },
      { id: 'frequency', label: 'Service frequency', section: 'header', type: 'text' },
      { id: 'period', label: 'Billing period', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'landscaper', label: 'Landscaper', category: 'agency',
    template: 'agency', referenceLabel: 'Property', showShipTo: true, color: '#15803d',
    blurb: 'Recurring lawn care with property tracking and seasonal add-ons.',
    customFields: [
      { id: 'property', label: 'Property address', section: 'header', type: 'text' },
      { id: 'period', label: 'Billing period', section: 'header', type: 'text' },
      { id: 'seasonal', label: 'Seasonal add-ons', section: 'header', type: 'text' },
    ],
  },
  {
    id: 'it-msp', label: 'IT / MSP', category: 'agency',
    template: 'agency', referenceLabel: 'Account', showShipTo: false, color: '#3730a3',
    blurb: 'Managed services with SLA tiers, seats, and device counts.',
    customFields: [
      { id: 'account', label: 'Account', section: 'header', type: 'text' },
      { id: 'period', label: 'Billing period', section: 'header', type: 'text' },
      { id: 'sla', label: 'SLA tier', section: 'header', type: 'text' },
      { id: 'seats', label: 'Managed seats', section: 'header', type: 'number' },
      { id: 'devices', label: 'Managed devices', section: 'header', type: 'number' },
    ],
  },
  {
    id: 'virtual-assistant', label: 'Virtual Assistant', category: 'agency',
    template: 'agency', referenceLabel: 'Period', showShipTo: false, color: '#be185d',
    blurb: 'Timesheet billing with task category breakdowns.',
    customFields: [
      { id: 'period', label: 'Timesheet period', section: 'header', type: 'text' },
      { id: 'totalHours', label: 'Total hours', section: 'header', type: 'number' },
      { id: 'tasks', label: 'Task categories', section: 'footer', type: 'text' },
    ],
  },
  {
    id: 'seo-specialist', label: 'SEO Specialist', category: 'agency',
    template: 'agency', referenceLabel: 'Domain', showShipTo: false, color: '#c2410c',
    blurb: 'Monthly SEO with target domain, keywords, and reporting URLs.',
    customFields: [
      { id: 'domain', label: 'Target domain', section: 'header', type: 'text' },
      { id: 'campaign', label: 'Campaign / keywords', section: 'header', type: 'text' },
      { id: 'period', label: 'Billing period', section: 'header', type: 'text' },
      { id: 'reportUrl', label: 'Report URL', section: 'footer', type: 'text' },
    ],
  },
];

export const INDUSTRY_IDS = INDUSTRIES.map((i) => i.id);

export function getIndustry(id) {
  return INDUSTRIES.find((i) => i.id === id) || null;
}

export function isValidIndustry(id) {
  return INDUSTRY_IDS.includes(id);
}
