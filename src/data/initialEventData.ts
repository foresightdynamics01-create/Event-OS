/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EventBlueprint,
  BudgetCategory,
  BudgetItem,
  TimelineTask,
  VendorRecord,
  StressScenario,
} from '../types/event';

export const INITIAL_BLUEPRINT: EventBlueprint = {
  id: 'evt-glasshouse-2026',
  title: 'The Glasshouse Conservatory Gala & Reception',
  type: 'Gala & Reception',
  date: '2026-10-24',
  guestCount: 140,
  targetBudget: 68000,
  venueName: 'The Palm & Steel Conservatory Pavilion',
  location: 'San Francisco, CA',
  contingencyBufferPct: 8,
  productionNotes:
    'High-touch evening gala celebrating architectural preservation. Load-in strictly begins at 08:00 AM due to public park permits. High-spec wireless acoustic requirements to mitigate glass reverberation. Zero open flames allowed; LED luminary centerpieces required.',
  executiveSummary:
    'The Palm & Steel Conservatory Gala is configured as a seated 140-guest autumn formal reception. Acoustic management and moisture control for historic glass structures are critical design constraints. Timeline incorporates strict permit curfews (23:00 hard stop).',
  keyDirectives: [
    'Acoustic containment: Calibrated line-array audio to control glass reflections.',
    'Permit compliance: San Francisco Park & Rec hard decibel limit of 85 dBA after 21:00.',
    'Vendor load-in gate window: 08:00 - 11:30 strictly via North Service Drive.',
    'Back-of-house power: 200A 3-phase generator isolated 150ft downwind.',
  ],
  synthesizedAt: '2026-09-15T14:30:00Z',
};

export const INITIAL_CATEGORIES: BudgetCategory[] = [
  {
    id: 'venue_fb',
    name: 'Venue & F&B (Culinary & Cellar)',
    priority: 1, // Non-negotiable anchor
    targetSharePct: 50,
    allocatedAmount: 34000,
    description: 'Conservatory rental, 3-course seasonal plated dinner, organic wine pairing, and bar service.',
  },
  {
    id: 'av_lighting',
    name: 'Audio/Visual & Architectural Lighting',
    priority: 2, // High priority production safety
    targetSharePct: 15,
    allocatedAmount: 10200,
    description: 'Acoustic glass-tuned line arrays, warm 2700K pin-spotting, uplighting, power distribution.',
  },
  {
    id: 'decor_floral',
    name: 'Decor, Floral & Tabletop Design',
    priority: 4, // Flexible discretionary
    targetSharePct: 12,
    allocatedAmount: 8160,
    description: 'Suspended botanicals, architectural stoneware, linen rentals, bespoke printed collateral.',
  },
  {
    id: 'photo_film',
    name: 'Photography & Archival Cinematography',
    priority: 3, // Medium priority
    targetSharePct: 10,
    allocatedAmount: 6800,
    description: 'Lead photographer + assistant (8h coverage), 4K documentary edit, digital contact sheets.',
  },
  {
    id: 'entertainment',
    name: 'Live Music & Curated Entertainment',
    priority: 5, // Flexible tier
    targetSharePct: 7,
    allocatedAmount: 4760,
    description: 'Acoustic jazz quartet during cocktail hour + vinyl selector for evening reception.',
  },
  {
    id: 'operations_contingency',
    name: 'Operations, Permitting & Contingency',
    priority: 1, // Critical safety net
    targetSharePct: 6,
    allocatedAmount: 4080,
    description: 'Municipal permits, security detail, restroom trailers, emergency weather contingency fund.',
  },
];

export const INITIAL_EXPENSES: BudgetItem[] = [
  {
    id: 'exp-1',
    name: 'Conservatory Evening Facility Lease',
    categoryId: 'venue_fb',
    vendor: 'SF Heritage Trust',
    allocatedAmount: 12000,
    actualAmount: 12000,
    taxRatePct: 0,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Contract signed. 50% deposit paid.',
    dueDate: '2026-06-01',
  },
  {
    id: 'exp-2',
    name: 'Plated Seasonal Dinner & Service Staff (140 pax)',
    categoryId: 'venue_fb',
    vendor: 'Artisan Hearth Catering',
    allocatedAmount: 17500,
    actualAmount: 18200,
    taxRatePct: 8.625,
    gratuityRatePct: 20,
    status: 'verified',
    notes: 'Final tasting completed; elevated fish course added +$700.',
    dueDate: '2026-09-15',
  },
  {
    id: 'exp-3',
    name: 'Sommelier Curated Wine & Aperitif Bar',
    categoryId: 'venue_fb',
    vendor: 'Healdsburg Cellars',
    allocatedAmount: 4500,
    actualAmount: 4350,
    taxRatePct: 9,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Direct winery consignment with return policy for unopened cases.',
    dueDate: '2026-10-01',
  },
  {
    id: 'exp-4',
    name: 'Acoustic Sound Reinforcement & Wireless Mic Rig',
    categoryId: 'av_lighting',
    vendor: 'Aura Sound Labs',
    allocatedAmount: 5200,
    actualAmount: 5200,
    taxRatePct: 0,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Configured for high ceiling glass acoustics with zero slap-back.',
    dueDate: '2026-08-20',
  },
  {
    id: 'exp-5',
    name: 'Architectural Pin-Spotting & Perimeter Uplighting',
    categoryId: 'av_lighting',
    vendor: 'Lumen Arts Production',
    allocatedAmount: 5000,
    actualAmount: 5400,
    taxRatePct: 8.5,
    gratuityRatePct: 0,
    status: 'pending',
    notes: 'Awaiting revised dimmer distribution manifest.',
    dueDate: '2026-10-10',
  },
  {
    id: 'exp-6',
    name: 'Suspended Botanical Canopy & Table Florals',
    categoryId: 'decor_floral',
    vendor: 'Vanguard Floral Co.',
    allocatedAmount: 5800,
    actualAmount: 5800,
    taxRatePct: 8.5,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Preserved autumn olive branches and white garden roses.',
    dueDate: '2026-09-30',
  },
  {
    id: 'exp-7',
    name: 'Belgian Linen & Ceramic Charger Place Settings',
    categoryId: 'decor_floral',
    vendor: 'Curated Table SF',
    allocatedAmount: 2360,
    actualAmount: 2480,
    taxRatePct: 8.5,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Includes wash/strike courier return fee.',
    dueDate: '2026-10-12',
  },
  {
    id: 'exp-8',
    name: 'Lead Photographer & Archival Lighting Rig',
    categoryId: 'photo_film',
    vendor: 'Julian Thorne Photography',
    allocatedAmount: 4800,
    actualAmount: 4800,
    taxRatePct: 0,
    gratuityRatePct: 0,
    status: 'verified',
    notes: '8-hour editorial documentarian style, full usage rights included.',
    dueDate: '2026-09-01',
  },
  {
    id: 'exp-9',
    name: 'Docu-Style 4K Short Film & Drone Exterior',
    categoryId: 'photo_film',
    vendor: 'Kinetic Motion Cinema',
    allocatedAmount: 2000,
    actualAmount: 2200,
    taxRatePct: 0,
    gratuityRatePct: 0,
    status: 'pending',
    notes: 'FAA waiver review pending for park airspace authorization.',
    dueDate: '2026-10-05',
  },
  {
    id: 'exp-10',
    name: 'Modern Jazz Quartet (Cocktail & Seated)',
    categoryId: 'entertainment',
    vendor: 'Embarcadero Jazz Collective',
    allocatedAmount: 3200,
    actualAmount: 3200,
    taxRatePct: 0,
    gratuityRatePct: 15,
    status: 'verified',
    notes: '3x 45-minute sets with curated intermissions.',
    dueDate: '2026-10-01',
  },
  {
    id: 'exp-11',
    name: 'Vinyl Selector & Late Night Ambient Curator',
    categoryId: 'entertainment',
    vendor: 'Soundwave Curations',
    allocatedAmount: 1560,
    actualAmount: 1560,
    taxRatePct: 0,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Analog vinyl turntable setup; rare soul and ambient jazz.',
    dueDate: '2026-10-15',
  },
  {
    id: 'exp-12',
    name: 'Municipal Special Event Permits & Fire Marshall Walk',
    categoryId: 'operations_contingency',
    vendor: 'City & County of San Francisco',
    allocatedAmount: 1680,
    actualAmount: 1680,
    taxRatePct: 0,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Permit #SF-2026-EVT-904 approved and posted.',
    dueDate: '2026-07-20',
  },
  {
    id: 'exp-13',
    name: 'Luxury Executive Mobile Restroom Suites',
    categoryId: 'operations_contingency',
    vendor: 'Royal Flush Mobile Suites',
    allocatedAmount: 2400,
    actualAmount: 2400,
    taxRatePct: 8.5,
    gratuityRatePct: 0,
    status: 'verified',
    notes: 'Four-station climate controlled trailer with attendant.',
    dueDate: '2026-09-10',
  },
];

export const INITIAL_TASKS: TimelineTask[] = [
  // 6 Months Out
  {
    id: 'task-1',
    phase: '6_months_out',
    title: 'Execute Master Venue Contract & Pay Primary Deposit',
    description: 'Finalize date lock, security deposit, and load-in covenants with SF Heritage Trust.',
    timeOrDate: '6 Months Out',
    assignee: 'Executive Producer',
    status: 'completed',
    isCriticalPath: true,
    dependsOn: [],
  },
  {
    id: 'task-2',
    phase: '6_months_out',
    title: 'Lock Catering & Beverage Service Exclusivity',
    description: 'Contract Artisan Hearth for bespoke 3-course menu and staffing requirements.',
    timeOrDate: '5.5 Months Out',
    assignee: 'F&B Lead',
    status: 'completed',
    isCriticalPath: true,
    dependsOn: ['task-1'],
  },
  {
    id: 'task-3',
    phase: '6_months_out',
    title: 'Submit Municipal Sound & Generator Permits',
    description: 'Submit decibel variance and 3-phase generator safety permits with SF Fire & Parks.',
    timeOrDate: '5 Months Out',
    assignee: 'Operations Manager',
    status: 'completed',
    isCriticalPath: false,
    dependsOn: ['task-1'],
  },

  // 1 Month Out
  {
    id: 'task-4',
    phase: '1_month_out',
    title: 'Acoustic Site Walk & Speaker Aiming Calibration',
    description: 'On-site audio frequency sweep inside glass conservatory to calibrate DSP delays.',
    timeOrDate: '4 Weeks Out',
    assignee: 'AV Technical Director',
    status: 'completed',
    isCriticalPath: true,
    dependsOn: ['task-3'],
  },
  {
    id: 'task-5',
    phase: '1_month_out',
    title: 'Finalize Dietary Matrix & Seating Chart Table Count',
    description: 'Receive RSVP closes; aggregate 140 guest dietary restrictions (vegan, celiac, allergies).',
    timeOrDate: '3 Weeks Out',
    assignee: 'Guest Logistics Lead',
    status: 'completed',
    isCriticalPath: true,
    dependsOn: ['task-2'],
  },
  {
    id: 'task-6',
    phase: '1_month_out',
    title: 'Structural Rigging Plan Approval for Overhead Florals',
    description: 'Obtain conservatory engineering sign-off on 400lb distributed truss load.',
    timeOrDate: '2 Weeks Out',
    assignee: 'Creative Director',
    status: 'completed',
    isCriticalPath: false,
    dependsOn: ['task-1'],
  },

  // Week Of
  {
    id: 'task-7',
    phase: 'week_of',
    title: 'Comprehensive Vendor Call Sheet & Dock Stagger Schedule',
    description: 'Issue 15-minute staggered dock arrival windows to prevent North Drive gridlock.',
    timeOrDate: 'T-4 Days',
    assignee: 'Stage Manager',
    status: 'in_progress',
    isCriticalPath: true,
    dependsOn: ['task-5', 'task-4'],
  },
  {
    id: 'task-8',
    phase: 'week_of',
    title: 'Deliver Consignment Wine & Dry Goods to Secure Storage',
    description: 'Verify 36 cases delivered, temperature monitored at 58°F.',
    timeOrDate: 'T-2 Days',
    assignee: 'F&B Lead',
    status: 'pending',
    isCriticalPath: false,
    dependsOn: ['task-2'],
  },
  {
    id: 'task-9',
    phase: 'week_of',
    title: '48-Hour Microclimate Meteorological Forecast Review',
    description: 'Check wind velocity and dew point for evening glass condensation management.',
    timeOrDate: 'T-48 Hours',
    assignee: 'Executive Producer',
    status: 'pending',
    isCriticalPath: true,
    dependsOn: ['task-7'],
  },

  // Day-Of Run-of-Show
  {
    id: 'task-10',
    phase: 'day_of_run_of_show',
    title: '08:00 AM — North Dock Load-in & Generator Power Tie-in',
    description: 'Security opens gate; electrician powers 200A spider boxes.',
    timeOrDate: '08:00 AM',
    durationMinutes: 120,
    assignee: 'Operations Manager',
    status: 'pending',
    isCriticalPath: true,
    dependsOn: ['task-7'],
  },
  {
    id: 'task-11',
    phase: 'day_of_run_of_show',
    title: '10:30 AM — Floral Rigging & Tableware Place Settings',
    description: 'Overhead greenery hoisted; linen, crystal, and charger plates laid.',
    timeOrDate: '10:30 AM',
    durationMinutes: 180,
    assignee: 'Creative Director',
    status: 'pending',
    isCriticalPath: false,
    dependsOn: ['task-10', 'task-6'],
  },
  {
    id: 'task-12',
    phase: 'day_of_run_of_show',
    title: '02:00 PM — Sound Check & Muted Lighting Cue Rehearsal',
    description: 'Band line check with sound engineer; verify zero feedback against glass walls.',
    timeOrDate: '02:00 PM',
    durationMinutes: 90,
    assignee: 'AV Technical Director',
    status: 'pending',
    isCriticalPath: true,
    dependsOn: ['task-10'],
  },
  {
    id: 'task-13',
    phase: 'day_of_run_of_show',
    title: '04:30 PM — Service Staff Briefing & Final Kitchen Line Inspection',
    description: 'Chef and head captain walk service route; allergen protocol verification.',
    timeOrDate: '04:30 PM',
    durationMinutes: 45,
    assignee: 'F&B Lead',
    status: 'pending',
    isCriticalPath: true,
    dependsOn: ['task-11'],
  },
  {
    id: 'task-14',
    phase: 'day_of_run_of_show',
    title: '05:30 PM — Doors Open: Terrace Cocktail Reception & Jazz Trio',
    description: 'Welcome sparkling wine passed; guest registration verified at glass entry foyer.',
    timeOrDate: '05:30 PM',
    durationMinutes: 90,
    assignee: 'Executive Producer',
    status: 'pending',
    isCriticalPath: true,
    dependsOn: ['task-12', 'task-13'],
  },
  {
    id: 'task-15',
    phase: 'day_of_run_of_show',
    title: '07:00 PM — Chime Call to Dinner & Welcome Address',
    description: 'Guests seated in main glasshouse pavilion; keynote address from Trust President.',
    timeOrDate: '07:00 PM',
    durationMinutes: 120,
    assignee: 'Stage Manager',
    status: 'pending',
    isCriticalPath: true,
    dependsOn: ['task-14'],
  },
  {
    id: 'task-16',
    phase: 'day_of_run_of_show',
    title: '11:00 PM — Event Curfew & Soft Strike Commences',
    description: 'Guests depart; trash pack-out; rental strikes until 01:00 AM curfew.',
    timeOrDate: '11:00 PM',
    durationMinutes: 120,
    assignee: 'Operations Manager',
    status: 'pending',
    isCriticalPath: true,
    dependsOn: ['task-15'],
  },
];

export const INITIAL_VENDORS: VendorRecord[] = [
  {
    id: 'vnd-1',
    companyName: 'Artisan Hearth Catering & Events',
    serviceCategory: 'Catering & Hospitality Staff',
    contactName: 'Chef Matthew Vance',
    email: 'events@artisanhearth.com',
    phone: '+1 (415) 890-4411',
    contractTotal: 18200,
    depositPaid: 9100,
    balanceRemaining: 9100,
    status: 'signed',
    notes: 'Final guest count confirmed at 140 pax with 14 captain/servers + 4 line chefs.',
    rawQuoteText: `ESTIMATE #AH-89201
Client: Celebration Studio
Event: Glasshouse Conservatory Gala (140 pax)

1. Food & Beverage Execution:
- 3-Course Plated Autumn Dinner: $115.00/head x 140 = $16,100.00
- Passed Hors D'oeuvres (4 selections): Included
- Kitchen line prep & equipment rental: $1,400.00
- Subtotal: $17,500.00

2. Mandatory Service Adjustments:
- Production Administrative Coordination Fee (Non-taxable): 8.5% = $1,487.50
- Mandatory Auto-Gratuity on Food & Service: 22% = $3,850.00
- Overtime labor tier: Any shift exceeding 8 continuous hours charged at $95/hour per staff member (18 crew = $1,710/hr).
- Force Majeure & Weather: Client bears 100% loss of product in event of cancellation inside 14 days. Rebooking subject to 30% retention.
- Trash Pack-out Disposal Surcharge: $450.00 fee if venue compost dumpster is unavailable.`,
    auditResult: {
      auditorRating: 'Caution',
      summary:
        'Caterer invoice contains $1,937.50 in stealth surcharges (8.5% Admin Fee + $450 Trash pack-out) on top of a 22% auto-gratuity. Overtime rate of $95/hr per crew member is significantly higher than regional market standard ($65/hr).',
      stealthFees: [
        {
          title: 'Administrative Coordination Surcharge (8.5%)',
          cost: 1487.5,
          description: 'Non-service overhead markup added above standard culinary charges.',
          risk: 'high',
        },
        {
          title: 'Mandatory Auto-Gratuity (22%)',
          cost: 3850,
          description: 'Calculated before beverage discounts, standard high-end rate is 18-20%.',
          risk: 'medium',
        },
        {
          title: 'Trash Pack-out Penalty Fee',
          cost: 450,
          description: 'Contingent surcharge that should be included in kitchen load-in scope.',
          risk: 'medium',
        },
      ],
      restrictiveClauses: [
        {
          title: 'Asymmetrical 14-Day Force Majeure Retention',
          explanation:
            'Client forfeits 100% of product cost even in the event of park authority weather closures with no credit rebooking grace.',
          riskLevel: 'Critical',
        },
        {
          title: 'Aggressive Crew Overtime Tier ($95/hr/staff)',
          explanation:
            'If run-of-show slips by 45 minutes during breakdown, overtime fee incurs $1,710 immediately.',
          riskLevel: 'Caution',
        },
      ],
      counterOfferDraft:
        'Dear Chef Matthew,\n\nThank you for the detailed estimate AH-89201 for our upcoming Conservatory Gala. We are excited to collaborate with Artisan Hearth.\n\nUpon reviewing the contract schedule, we request the following three adjustments to finalize our agreement:\n1. Waive the 8.5% Administrative Coordination Surcharge ($1,487.50), as our EventOS production team manages load-in docking, staging timelines, and day-of guest coordination directly.\n2. Adjust the service auto-gratuity to our standard corporate event policy of 18%, while confirming that 100% of this amount is disbursed directly to floor service and kitchen staff.\n3. Cap the overtime labor rate at standard prevailing event rates ($65/hour) with a 30-minute grace window before overtime accrual begins.\n\nWe look forward to signing the revised schedule promptly.\n\nWarm regards,\nEvent Operations Directorate',
      auditedAt: '2026-09-20T10:15:00Z',
    },
  },
  {
    id: 'vnd-2',
    companyName: 'Aura Sound Labs & Acoustics',
    serviceCategory: 'AV, Sound & Acoustic Tuning',
    contactName: 'Elena Rostova',
    email: 'elena@aurasoundlabs.com',
    phone: '+1 (415) 772-9104',
    contractTotal: 5200,
    depositPaid: 2600,
    balanceRemaining: 2600,
    status: 'signed',
    notes: 'Specialists in glass architectural audio tuning. Calibrated DSP arrays.',
    rawQuoteText: `QUOTE #ASL-1104
Service: Glass Conservatory Audio Distribution
Line Array Rigging + Delay Fill Speakers: $3,800.00
On-site A1 Audio Engineer (10 hrs): $1,400.00
Total: $5,200.00
Terms: Clean terms, Net 30 on final balance, cancellation allowable up to 7 days prior with full refund less $300 prep fee.`,
  },
  {
    id: 'vnd-3',
    companyName: 'Vanguard Floral Co.',
    serviceCategory: 'Floral & Botanical Rigging',
    contactName: 'Chloe Dupont',
    email: 'chloe@vanguardfloral.com',
    phone: '+1 (415) 321-8890',
    contractTotal: 5800,
    depositPaid: 2900,
    balanceRemaining: 2900,
    status: 'signed',
    notes: 'Approved for truss hoist rigging by historic conservatory architect.',
    rawQuoteText: `ESTIMATE: Vanguard Floral Co.
Suspended botanical garland installation (80 ft): $3,400.00
14x Stoneware low bowl centerpieces: $1,800.00
Breakdown and botanical preservation: $600.00
Delivery & fuel surcharge: $250.00
Terms: 50% non-refundable retainer upon booking.`,
  },
  {
    id: 'vnd-4',
    companyName: 'Julian Thorne Photography',
    serviceCategory: 'Documentary Photography',
    contactName: 'Julian Thorne',
    email: 'julian@thornephoto.com',
    phone: '+1 (415) 551-0982',
    contractTotal: 4800,
    depositPaid: 2400,
    balanceRemaining: 2400,
    status: 'signed',
    notes: 'High dynamic range low-light specialist.',
  },
];

export const INITIAL_STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'scen-rain',
    title: 'Unseasonal Pacific Rainstorm (Outdoor to Indoor Pivot)',
    category: 'Weather & Climate Pivot',
    severity: 'high',
    description:
      'Sudden atmospheric river forecast 48 hours prior. Terrace cocktail hour (140 pax) must immediately transition into the covered West Gallery. Requires emergency marquee walkways, supplemental perimeter matting, and quick-turn coat check.',
    financialImpact: 3450,
    timelineDelayMinutes: 45,
    mitigationSteps: [
      'Activate West Gallery rain contingency permit with Conservatory Operations.',
      'Deploy covered marquee breezeway connecting arrival drop-off to West Portal ($1,850 rental).',
      'Order commercial water-absorbent slate matting for historic conservatory entry tiles ($450).',
      'Shift cocktail acoustic trio indoors into acoustic Zone B with calibrated gain limits.',
      'Reroute catering passed service line from exterior garden path to internal service corridor.',
    ],
    budgetAdjustments: [
      {
        categoryId: 'operations_contingency',
        deltaAmount: 2300,
        reason: 'Emergency covered breezeway & slip-resistant matting rental',
      },
      {
        categoryId: 'venue_fb',
        deltaAmount: 1150,
        reason: 'Indoor coat check attendant & wet glassware busing stations',
      },
    ],
    timelineInsertions: [
      {
        phase: 'day_of_run_of_show',
        title: '07:30 AM — Emergency West Gallery Enclosure & Matting Deployment',
        assignee: 'Operations Manager',
        timeOrDate: '07:30 AM',
        isCriticalPath: true,
      },
      {
        phase: 'day_of_run_of_show',
        title: '04:00 PM — Verify Slip-Proof Thresholds & Coat Check Attendants',
        assignee: 'Guest Logistics Lead',
        timeOrDate: '04:00 PM',
        isCriticalPath: false,
      },
    ],
  },
  {
    id: 'scen-surge',
    title: 'Guest Count Surge (+25% Attendees / 175 Pax Total)',
    category: 'Guest Demographics & Capacity',
    severity: 'moderate',
    description:
      'Late executive donor confirmations push guest tally from 140 to 175 (+35 attendees). Triggers maximum room capacity constraints, table additions (3 extra 10-top rounds), extra culinary courses, and security permit revisions.',
    financialImpact: 4950,
    timelineDelayMinutes: 20,
    mitigationSteps: [
      'Recalibrate table layout from 14 tables to 17 tables to preserve 48-inch ADA service egress.',
      'Order 35 additional bespoke place settings (linens, stoneware, crystal) on expedited courier.',
      'Increase beverage allocation: +8 cases vintage wine and +3 servers for 30:1 service ratio.',
      'Verify SF Fire Marshall max occupancy certificate (conservatory max rating is 190 pax; 175 is compliant).',
    ],
    budgetAdjustments: [
      {
        categoryId: 'venue_fb',
        deltaAmount: 4100,
        reason: '35 extra plated meals + wine allocations + additional service labor',
      },
      {
        categoryId: 'decor_floral',
        deltaAmount: 850,
        reason: '3 additional table centerpieces & linen rentals',
      },
    ],
    timelineInsertions: [
      {
        phase: 'week_of',
        title: 'T-3 Days — Expedited Tableware Courier Dispatch & Final Table Numbers',
        assignee: 'Guest Logistics Lead',
        timeOrDate: 'T-3 Days',
        isCriticalPath: true,
      },
    ],
  },
  {
    id: 'scen-caterer-cancel',
    title: 'Primary Caterer Cancellation (72 Hours Before Event)',
    category: 'Critical Vendor Default',
    severity: 'critical',
    description:
      'Commercial kitchen facility suffers catastrophic power transformer explosion 3 days before gala. Primary caterer cannot execute. Emergency mobilization of standby Michelin-caliber event partner required with premium rush procurement fees.',
    financialImpact: 6800,
    timelineDelayMinutes: 60,
    mitigationSteps: [
      'Immediately invoke Section 12 (Emergency Default) to reclaim 100% of $9,100 deposit paid.',
      'Dispatch RFP to pre-vetted standby partners (Mission Culinary Co. & Fog City Gastronomy).',
      'Contract backup caterer with simplified high-execution menu to eliminate prep lead time.',
      'Rent mobile convection trailer if backup caterer lacks off-site induction equipment ($2,200).',
      'Brief sommelier to adjust wine pairings to match backup menu specifications within 12 hours.',
    ],
    budgetAdjustments: [
      {
        categoryId: 'venue_fb',
        deltaAmount: 4800,
        reason: 'Standby caterer rush mobilization surcharge & specialized kitchen equipment',
      },
      {
        categoryId: 'operations_contingency',
        deltaAmount: 2000,
        reason: 'Emergency courier logistics & supplemental kitchen electrical drops',
      },
    ],
    timelineInsertions: [
      {
        phase: 'week_of',
        title: 'T-48h — Standby Caterer Kitchen Walkthrough & Induction Appliance Test',
        assignee: 'F&B Lead',
        timeOrDate: 'T-48h',
        isCriticalPath: true,
      },
    ],
  },
];
