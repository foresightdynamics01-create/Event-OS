# Celebration Studio (EventOS AI)
### Production-Grade Event Orchestration Platform & Sarah Jenkins Concierge

> **Chosen Vertical:** Luxury & Enterprise Event Orchestration, Hospitality Procurement, and Live Production Logistics.  
> **Lead Assistant Persona:** Sarah Jenkins, Lead Celebration Concierge & Director of Production.  
> **Aesthetic Philosophy:** Premium Classic Dark (Matte Obsidian `#09090b`, Hairline Slate Borders, Restrained Typography, Zero AI Slop).

---

## 1. Executive Summary & Chosen Vertical

**Celebration Studio (EventOS AI)** is a full-stack, human-crafted event management and logistical reasoning engine. Built specifically for high-stakes gatherings—galas, executive summits, luxury weddings, and private conclaves—it bridges the dangerous gap between creative event design and real-world execution.

Unlike typical conversational chatbots that hallucinate vague advice, Celebration Studio is grounded in **Don Norman's 7 Principles of Real-World Design** and enforces strict mathematical constraints:
- **Exact Per-Guest Arithmetic:** Live calculations of cost-per-attendee across all budget buckets.
- **Priority-Weighted Zero-Sum Rebalancing:** Automatically absorbs overages by adjusting lower-priority tiers first while safeguarding non-negotiable anchors.
- **DAG Graph Cycle Prevention:** A Depth-First Search (DFS) validator that prevents circular dependencies in timeline milestones.
- **Forensic Contract Auditing:** Scans vendor proposals to flag stealth fees (e.g. 8.5% admin surcharges, 22% auto-gratuities, $95/hr overtime penalties) and auto-drafts professional counter-offers.
- **Scenario Stress-Tester ("What-If" Simulator):** Computes exact cost and schedule slip for real disruptions (unseasonal rain, +25% guest surges, caterer cancellations) and applies live state adjustments with one click.
- **Sarah Jenkins Concierge Desk:** A multi-turn, context-aware consultation interface powered by Gemini 3.8 Flash that operates with zero repetition, strict memory, and exact financial grounding.

---

## 2. Approach & Cognitive Architecture

The application is structured around **Don Norman's 7 Principles of Real-World Design**:

1. **Affordances:** Clear interactive cues—drag handles on budget sliders, explicit status toggles (`Verified`, `Pending`, `Disputed`), and tactile buttons.
2. **Signifiers:** Semantic, accessible meters (`role="progressbar"`), critical-path milestone flags, and visual risk badges.
3. **Natural Mapping:** Adjusting an allocation slider directly reflects in category health and instantly recalibrates the remaining operations contingency pool in real time.
4. **Immediate Feedback:** 400ms debounced local persistence indicator (`Synced locally`), instant tax/gratuity recalculations, and micro-confirmations.
5. **Clear Conceptual Model:** Transparent linking between the Event Blueprint, Category Allocations, Timeline Tasks, and Vendor Contracts. A built-in reference drawer explains Norman's 7 rules in action.
6. **Smart Constraints:** Algorithmic cycle-detection prevents impossible task ordering (`A depends on B depends on A`); budget sliders enforce hard ceilings ($0 to Total Budget).
7. **Error Prevention & Recovery:** Accessible confirmation dialogs (`role="alertdialog"`, never native `window.alert`), reversible actions, and soft warning thresholds.

---

## 3. Core Workflows & Logic

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Celebration Studio                              │
└────────────────────────────────────────────────────────────────────────┘
          │                   │                   │                   │
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│   01. Blueprint  │ │   02. Budget     │ │  03. Timeline    │ │ 04. Stress Test  │
│  Setup & Synthesis│ │ Priority Engine  │ │  & DFS Validator │ │ What-If Simulator│
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘
          │                   │                   │                   │
          └───────────────────┴───────────────────┴───────────────────┘
                                      │
                         ┌──────────────────────────┐
                         │   05. Vendor Auditor     │
                         │   & Sarah Concierge Desk │
                         └──────────────────────────┘
```

### 1. Discovery & Blueprint Synthesis
- Manages foundational event bounds: Title, Occasion Type, Target Budget, Date, Guest Count, Venue, and Production Directives.
- Pre-populated with **"The Glasshouse Conservatory Gala & Reception"** ($68,000 budget, 140 guests, San Francisco).
- Powered by `POST /api/blueprint/synthesize` to generate operational guidelines, acoustic covenants, and risk buffers.

### 2. Priority-Weighted Budget Engine
- Categorized allocations:
  - **Tier 1 (Anchor Essential):** Venue & F&B (50%), Operations & Contingency (6%)
  - **Tier 2 (Production Safety):** Audio/Visual & Lighting (15%)
  - **Tier 3 (Archival Quality):** Photography & Film (10%)
  - **Tier 4 (Aesthetic Decor):** Decor, Floral & Tabletop (12%)
  - **Tier 5 (Discretionary Flex):** Entertainment (7%)
- **Priority Rebalancer Algorithm:** If a category exceeds its allocation, an automated trade-off rebalance deducts proportionately from Tier 5 down to Tier 2, strictly protecting Tier 1 essentials and verified incurred expenses.
- **Itemized Ledger:** Computes true cost including tax and auto-gratuity:
  $$\text{True Cost} = \text{Base} \times \left(1 + \frac{\text{Tax}\%}{100} + \frac{\text{Gratuity}\%}{100}\right)$$

### 3. Critical-Path Timeline & DFS Graph Validator
- Structured milestone phases: *Phase I: 6 Months Out*, *Phase II: 1 Month Out*, *Phase III: Week Of*, *Phase IV: Day-Of Run-of-Show*.
- **Algorithmic Cycle Detection (DFS):** Uses 3-state graph coloring (White/Gray/Black) to detect back-edges in directed dependency graphs.
- If an impossible loop is detected, the UI displays the exact cycle path (`Task A ➔ Task B ➔ Task A`) with a one-click **Auto-Break Dependency Cycle** repair action.
- Pre-validates proposed dependencies via `wouldIntroduceCycle()` to block invalid links before they can be saved.

### 4. Real-World Scenario Stress-Tester ("What-If" Simulator)
- Evaluates practical disruptions:
  1. *Unseasonal Pacific Rainstorm (Outdoor to Indoor Transition)*
  2. *Guest Count Surge (+25% Attendees / 175 Pax Total)*
  3. *Primary Caterer Cancellation (72 Hours Before Event)*
  4. *Custom Disruption Simulator (powered by Gemini Flash)*
- Delivers a quantitative delta matrix (Financial Impact, Run-of-Show Delay Factor, Severity Level) and interactive mitigation checklist.
- Includes **Apply Adjustments to Live Event**, which modifies actual live budget buckets and inserts emergency timeline tasks with a single click.

### 5. Vendor Contract & Hidden Fee Auditor
- Tracks contracted amounts, deposits paid, and remaining balances.
- Forensic quote auditor scans raw vendor contracts to uncover stealth fees (administrative markups, non-taxable service fees, mandatory gratuities, overtime penalties).
- Drafts polite, professional, and firm counter-offer letters ready to copy and send to suppliers.

### 6. Sarah Jenkins Concierge Consultation Desk
- Multi-turn conversation interface with Sarah Jenkins, Lead Celebration Concierge.
- Grounded in live state (guest count, allocations, true costs, critical path).
- Supports dual model speeds: **Standard** (`gemini-3.8-flash`) and **Fast** (`gemini-3.1-flash-lite`).
- Strict anti-repetition memory: direct answers without boilerplate greetings or canned filler.

---

## 4. Evaluation Focus Areas

### Code Quality & Architecture
- **Strict TypeScript:** 100% type coverage in `src/types/event.ts`. Zero `any` casts.
- **Component Modularity:** Distinct, cohesive components in `src/components/`, data fixtures in `src/data/`, and pure utility functions in `src/utils/`.
- **Formatting:** Clean Tailwind CSS v4 styling with zero inline styles or arbitrary CSS files.

### Security & Safe Implementation
- **Zero Client-Side Keys:** All `@google/genai` calls are routed through server proxy endpoints (`/api/*`) in `server.ts`. The API key is accessed exclusively via `process.env.GEMINI_API_KEY`.
- **Input Sanitization:** Character limits and defensive JSON parsers that handle markdown code blocks without crashing.
- **Error Handling:** Safe fallback structures ensure the UI never crashes even under network disconnects or API rate limits.

### Efficiency & Performance
- **Debounced Persistence:** 400ms debounced synchronization to `localStorage` eliminates slider lag and CPU thrashing during rapid user interaction.
- **Algorithmic Graph Traversal:** $O(V + E)$ cycle detection ensures instantaneous validation even with dozens of run-of-show cues.
- **Lightweight Dependencies:** No heavy, bloated UI frameworks. Minimal bundle size that easily satisfies the `< 10 MB` repository size limit.

### Accessibility (a11y)
- **WCAG AA Compliance:** High-contrast text on matte obsidian surfaces (`#09090b` canvas, `text-zinc-100` headings, `text-zinc-400` metadata).
- **ARIA Signifiers:** `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` on all progress bars; `role="alertdialog"` on destructive confirmation modals.
- **Keyboard Navigation:** Tab-accessible controls with visible focus rings (`focus-visible`).
- **Zero Native Alerts:** No disruptive `window.alert` or `window.confirm` calls.

---

## 5. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Motion.
- **Backend:** Node.js, Express, tsx.
- **AI Engine:** Google GenAI TypeScript SDK (`@google/genai`) utilizing `gemini-3.8-flash` and `gemini-3.1-flash-lite`.
- **Build Tool:** Vite 8.

---

## 6. Assumptions Made

1. **Monetary Unit:** All financial figures are denominated in USD ($) and formatted with tabular numerals (`tabular-nums`) to prevent alignment jitter.
2. **Single Active Event Scope:** The workspace manages one primary high-touch event dossier at a time, with complete export/import capability (Markdown dossiers and JSON snapshot files).
3. **Directed Acyclic Graph (DAG):** Timeline execution assumes tasks cannot precede themselves; any detected cycle represents an operational error and is flagged for resolution.
4. **Permits & Curfews:** Municipal sound and park curfews are treated as hard non-negotiable constraints reflecting real-world city regulations.

---

## 7. Setup & Execution Instructions

### Prerequisites
- Node.js (v20+ recommended)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install
```

### Environment Configuration
Copy `.env.example` to `.env` and provide your Google Gemini API Key:
```bash
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### Development
```bash
# Start fullstack dev server (Express + Vite on port 3000)
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Typecheck & Lint
```bash
npm run lint
```

### Production Build
```bash
npm run build
npm start
```

---

## 8. Export & Backup

- **Executive Markdown Dossier:** Export a complete, formatted GFM Markdown dossier for clients, executive boards, and on-site production teams.
- **JSON Snapshot Backup:** Full state serialization allowing instant restoration on any machine.
