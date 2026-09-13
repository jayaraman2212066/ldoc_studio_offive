// Agents Office v2 — roster + design tokens (ported from v1 command-centre.html)

// Nominal.so tokens (locked design language, 30 Jul 2026)
export const TOKENS = {
  cream: '#FDFFF8',
  ink: '#151414',
  grey: '#5A5A5A',
  hairline: 'rgba(21,20,20,0.12)',
};

// Dept mapping: Support→mint, Sales→butter, Marketing→coral, Finance→periwinkle,
// Operations→violet, Brain→sage.
// NOTE (17 Aug 2026): the old 'ops' pod split in two. The accounting half kept the pod,
// the periwinkle palette and the key 'fin' (now FINANCE); Proposals + Intel moved out into
// a new 'ops' pod (OPERATIONS) alongside Legal Review, Compliance and Internal Reporting.
// V3.1 (5 Sep 2026, AJ): SUPPORT → EMAILS (same mint slot), new DELIVERY pod (sky) on the top axis.
export const DEPT_KEYS = ['emails', 'sales', 'marketing', 'ops', 'fin', 'delivery'];
export const DEPTS = {
  emails:    { name: 'EMAILS',           short: 'EMAILS',  chip: '#5ADEB7', ink: '#1E9070', floor: '#E9F6EF' },
  delivery:  { name: 'DELIVERY',         short: 'DELIVERY', chip: '#8FD3F4', ink: '#2E86AB', floor: '#E6F4FB' },
  sales:     { name: 'SALES',            short: 'SALES',   chip: '#EADC8F', ink: '#A08A1E', floor: '#F6F1DA' },
  marketing: { name: 'MARKETING',        short: 'MARKETING', chip: '#E69393', ink: '#C46060', floor: '#FAE9E7' },
  fin:       { name: 'FINANCE',          short: 'FINANCE', chip: '#98A5EF', ink: '#5B66CE', floor: '#EAEDFA' },
  ops:       { name: 'OPERATIONS',       short: 'OPERATIONS', chip: '#BFA2E3', ink: '#7449A9', floor: '#F2ECFA' },
  brain:     { name: 'THE BRAIN',        short: 'THE BRAIN', chip: '#D1DECD', ink: '#4C7A57', floor: '#E9EFE4' },
};

// 35 agents (V3.4, 7 Sep 2026: every department has a lead). grid = [col,row] desk slot on the department plinth.
export const AGENTS = [
  // EMAILS (5) — replaced Customer Support, 5 Sep 2026
  { id: 'elead', name: 'EMAILS LEAD',         dept: 'emails',    lead: true,  grid: [0.5, 0], hair: '#2b2b2b', skin: '#E8B98E' },
  { id: 'cmail', name: 'CLIENT EMAILS',       dept: 'emails',    grid: [0, 1], hair: '#3b2b1d', skin: '#F0C9A0' },
  { id: 'imail', name: 'INTERNAL EMAILS',     dept: 'emails',    grid: [1, 1], hair: '#111111', skin: '#C68B59' },
  { id: 'vmail', name: 'VENDOR EMAILS',       dept: 'emails',    grid: [0, 2], hair: '#7a3b12', skin: '#F5D5B0' },
  { id: 'kmail', name: 'CONTRACTOR EMAILS',   dept: 'emails',    grid: [1, 2], hair: '#4a2a10', skin: '#D89F70' },
  // SALES (6) — Sales Lead at the head; Proposals moved in from Operations, Outreach retired
  { id: 'lexi',  name: 'SALES LEAD',          dept: 'sales',     lead: true,  grid: [0.5, 0], hair: '#5a2d0c', skin: '#F0C9A0' },
  { id: 'enzo',  name: 'LEAD ENRICHER',       dept: 'sales',     grid: [0, 1], hair: '#1c1c2e', skin: '#E0A878' },
  { id: 'ilm',   name: 'INBOUND LEADS MANAGER', dept: 'sales',   grid: [1, 1], hair: '#26140a', skin: '#F5D5B0' },
  { id: 'pros',  name: 'PROSPECTOR',          dept: 'sales',     grid: [0, 2], hair: '#2a1a0e', skin: '#E8B98E' },
  { id: 'piper', name: 'PROPOSALS',           dept: 'sales',     grid: [1, 2], hair: '#2d1a0a', skin: '#F0C9A0' },
  { id: 'folo',  name: 'FOLLOW UPS',          dept: 'sales',     grid: [0.5, 3], hair: '#171717', skin: '#F5D5B0' },
  // MARKETING (7) — Marketing Lead at the head since 7 Sep 2026
  { id: 'mlead', name: 'MARKETING LEAD',      dept: 'marketing', lead: true,  grid: [0.5, 0], hair: '#2a1a0e', skin: '#E0A878' },
  { id: 'riley', name: 'RESEARCH',            dept: 'marketing', grid: [0, 1], hair: '#8a4a1f', skin: '#F5D5B0' },
  { id: 'newt',  name: 'NEWSLETTER',          dept: 'marketing', grid: [1, 1], hair: '#26140a', skin: '#D89F70' },
  { id: 'gfx',   name: 'GRAPHICS DESIGNER',   dept: 'marketing', grid: [0, 2], hair: '#141414', skin: '#F0C9A0' },
  { id: 'ada',   name: 'META ADS',            dept: 'marketing', grid: [1, 2], hair: '#3d2814', skin: '#C68B59' },
  { id: 'iggy',  name: 'INSTAGRAM ORGANIC',   dept: 'marketing', grid: [0, 3], hair: '#552200', skin: '#E8B98E' },
  { id: 'vid',   name: 'VIDEO EDITOR',        dept: 'marketing', grid: [1, 3], hair: '#1b1b24', skin: '#D9A97E' },
  // OPERATIONS (6) — Operations Lead at the head since 7 Sep 2026; Internal Dashboards joins; Proposals moved to Sales
  { id: 'olead', name: 'OPERATIONS LEAD',     dept: 'ops',       lead: true,  grid: [0.5, 0], hair: '#111111', skin: '#F0C9A0' },
  { id: 'scout', name: 'INTEL',               dept: 'ops',       grid: [0, 1], hair: '#101820', skin: '#B07850' },
  { id: 'legal', name: 'LEGAL REVIEW',        dept: 'ops',       grid: [1, 1], hair: '#20242e', skin: '#F0C9A0' },
  { id: 'comply', name: 'COMPLIANCE CHECKER', dept: 'ops',       grid: [0, 2], hair: '#5a3a1a', skin: '#C68B59' },
  { id: 'report', name: 'INTERNAL REPORTING', dept: 'ops',       grid: [1, 2], hair: '#2e2118', skin: '#E8B98E' },
  { id: 'dash',  name: 'INTERNAL DASHBOARDS', dept: 'ops',       grid: [0.5, 3], hair: '#0d0d0d', skin: '#9C6B43' },
  // FINANCE (4) — the accounting team; Accounting Lead at the head
  { id: 'alead', name: 'ACCOUNTING LEAD',     dept: 'fin',       lead: true,  grid: [0.5, 0], hair: '#1f1f1f', skin: '#E0A878' },
  { id: 'invo',  name: 'INVOICING',           dept: 'fin',       grid: [0, 1], hair: '#4a2a10', skin: '#F5D5B0' },
  { id: 'apay',  name: 'ACCOUNTS PAYABLE',    dept: 'fin',       grid: [1, 1], hair: '#0a0a0a', skin: '#8A5A32' },
  { id: 'recon', name: 'RECONCILIATION',      dept: 'fin',       grid: [0.5, 2], hair: '#33221a', skin: '#E8B98E' },
  // DELIVERY (7) — new pod, 5 Sep 2026; Onboarder moved in from Sales
  { id: 'dlead', name: 'DELIVERY LEAD',       dept: 'delivery',  lead: true,  grid: [0.5, 0], hair: '#1f1f1f', skin: '#F0C9A0' },
  { id: 'pco',   name: 'PROJECT CO-ORDINATOR', dept: 'delivery', grid: [0, 1], hair: '#3d2814', skin: '#E8B98E' },
  { id: 'qa',    name: 'QUALITY ASSURANCE CHECKER', dept: 'delivery', grid: [1, 1], hair: '#101820', skin: '#C68B59' },
  { id: 'crep',  name: 'CLIENT REPORTS',      dept: 'delivery',  grid: [0, 2], hair: '#6b3410', skin: '#F5D5B0' },
  { id: 'cass',  name: 'CLIENT ASSETS',       dept: 'delivery',  grid: [1, 2], hair: '#141414', skin: '#D9A97E' },
  { id: 'dasst', name: 'DESIGNER ASSISTANT',  dept: 'delivery',  grid: [0, 3], hair: '#552200', skin: '#F0C9A0' },
  { id: 'ona',   name: 'ONBOARDER',           dept: 'delivery',  grid: [1, 3], hair: '#0d0d0d', skin: '#9C6B43' },
];

// Plinth placement in world XZ. Brain central; departments well separated (AJ: not too close at zoom-out).
export const LAYOUT = {
  brain:     { pos: [0, 0],     w: 16, d: 16 },
  emails:    { pos: [-30, -23], w: 20, d: 26 },
  delivery:  { pos: [0, -48],   w: 20, d: 30 },   // 6th pod mirrors ops on the top axis
  sales:     { pos: [30, -23],  w: 20, d: 30 },
  marketing: { pos: [-30, 23],  w: 20, d: 30 },
  fin:       { pos: [30, 23],   w: 20, d: 26 },
  ops:       { pos: [0, 48],    w: 20, d: 30 },   // the 5th pod fills the empty bottom-left gap
};

// Department billboard metrics (v1 rule #5: live metrics float above each dept,
// values tick green on change, "Waiting Approval" pulses amber when > 0).
export const BILLBOARDS = {
  emails:    [{ id: 'emails',    label: 'EMAILS SENT',      val: 128 }],
  delivery:  [{ id: 'reports',   label: 'REPORTS SENT',     val: 9 }],
  sales:     [{ id: 'leads',     label: 'LEADS ENRICHED',   val: 47 },
              { id: 'callhrs',   label: 'CALL HRS ROUTED',  val: 9.5, fmt: v => v.toFixed(1) + 'h', step: 0.4 }],
  marketing: [{ id: 'adspend',   label: 'AD SPEND TODAY',   val: 684, fmt: v => '$' + Math.round(v).toLocaleString('en-NZ'), step: 12 }],
  ops:       [{ id: 'proposals', label: 'PROPOSALS SENT',   val: 6 }],
  fin:       [{ id: 'invoices',  label: 'INVOICES ISSUED', val: 23 }],
  brain:     [{ id: 'notes',     label: 'NOTES INDEXED',    val: 1204, fmt: v => Math.round(v).toLocaleString('en-NZ') }],
};

// Approval asks (agent requests → AJ decides; v1 flavour).
// Per-agent first so the ask matches who's asking; dept pool is the fallback.
export const APPROVAL_ASKS = {
  emails:    ['Send the price-increase notice to 120 clients — draft attached', 'Reply to the contractor dispute thread — draft attached'],
  delivery:  ['Ship the September report pack to 14 clients', 'Release the brand assets to the client portal'],
  sales:     ['Send re-engagement SMS to 214 cold leads', 'Move 8 enterprise leads to SPENCER’s queue'],
  marketing: ['Launch 4 Meta ad variants — $120/day budget', 'Publish reel “cold call maths” to Instagram'],
  ops:       ['Send proposal PDF to Ridgeline Property Group', 'Sign off the amended MSA for Kea Logistics — 2 clauses flagged'],
  fin:       ['Invoice #218 doesn’t match the contract — hold for review?', 'Write off $180 of unmatched card fees'],
};
export const APPROVAL_BY_AGENT = {
  cmail: 'Send the price-increase notice to 120 clients — draft attached',
  vmail: 'Accept the vendor’s revised SLA — 2 changes flagged',
  crep:  'Send the September report pack to 14 clients — 2 flagged for a call',
  qa:    'Sign off the website handover — 2 minor issues noted',
  dlead: 'Extend the Ridgeline project by a week — the client asked',
  apay:  'Contractor invoice #218 is $350 over the contract rate — hold payment and query?',
  piper: 'Send the Ridgeline Property Group proposal — 12 seats, Growth plan',
  iggy:  'Publish reel “the 10am rule” to Instagram — script attached',
  vid:   'Ship the 45-sec demo cut — captions burned in, v2 attached',
  ada:   'Scale “cold call anxiety” creative to $180/day — CPA $29',
  mlead: 'Approve the October content plan — 12 reels, 2 newsletters, 1 ad refresh',
  olead: 'Sign off the Q4 operations checklist — 3 vendor renewals inside',
  newt:  'Send the August newsletter to 3,400 subscribers — draft v3 attached',
  scout: 'Green-light the CallForge comparison play — memo attached',
  enzo:  'Buy 500 FullEnrich credits — current batch runs out tomorrow',
};

// Authentic terminal lines for the desk screens (per-dept flavour) for LDoc Studio (.ldocx)
export const WORKLINES = {
  emails: [
    '▸ monitoring /api/webhook/feedback',
    '▸ listening for ldoc-studios.vercel.app',
    '▸ zero unread user tickets · SLA < 15m',
    '▸ customer onboarding playbook ready',
  ],
  delivery: [
    '▸ validating .ldocx zip container spec',
    '▸ WebGL 3D canvas viewport renderer',
    '▸ local CRDT document sync engine',
    '▸ zero-telemetry air-gap test passed',
  ],
  sales: [
    '▸ monitoring /api/webhook/leads',
    '▸ enterprise air-gap tier: $499/seat',
    '▸ aerospace & defense proposal deck staged',
    '▸ zero active churn · outbound pipeline ready',
  ],
  marketing: [
    '▸ Show HN: The Living 3D Alternative to PDF',
    '▸ Algolia HackerNews radar active',
    '▸ Death of the PDF viral campaign queued',
    '▸ reactive living document positioning',
  ],
  ops: [
    '▸ Vercel edge runtime: healthy 200 OK',
    '▸ Gemini Pro / Flash router online',
    '▸ HIVE 3-hop circuit breaker active',
    '▸ corporate brain: 37 notes mapped',
  ],
  fin: [
    '▸ ledger balanced: $0 burn · serverless',
    '▸ Stripe / Fleet billing listener active',
    '▸ zero unpaid liabilities · pre-revenue',
    '▸ unit economics: $19 Pro / $499 Fleet',
  ],
  brain: [
    '▸ corporate vault: 37 notes & 58 links',
    '▸ HIVE stigmergy blackboard: board.md',
    '▸ real-time Algolia tech intelligence',
  ],
};
