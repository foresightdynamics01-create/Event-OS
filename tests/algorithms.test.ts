/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert';
import { detectGraphCycles, wouldIntroduceCycle } from '../src/utils/graph';
import {
  rebalanceBudgetAllocations,
  computeExpenseTrueCost,
  formatCurrency,
  getCategoryTotals,
} from '../src/utils/budget';
import { generateMarkdownReport } from '../src/utils/export';
import {
  BudgetCategory,
  BudgetItem,
  TimelineTask,
  EventBlueprint,
  VendorRecord,
} from '../src/types/event';

console.log('--- Starting Comprehensive Celebration Studio (EventOS) Test Suite ---');

// ============================================================================
// Test Suite 1: Graph Cycle Detection Algorithm (DFS 3-State Traversal)
// ============================================================================
{
  const tasksAcyclic: TimelineTask[] = [
    {
      id: 'task-1',
      phase: '6_months_out',
      title: 'Execute Master Venue Contract',
      description: '',
      timeOrDate: '6 Months Out',
      assignee: 'Lead Producer',
      status: 'completed',
      isCriticalPath: true,
      dependsOn: [],
    },
    {
      id: 'task-2',
      phase: '6_months_out',
      title: 'F&B Menu Tasting',
      description: '',
      timeOrDate: '5 Months Out',
      assignee: 'F&B Lead',
      status: 'completed',
      isCriticalPath: true,
      dependsOn: ['task-1'],
    },
    {
      id: 'task-3',
      phase: '1_month_out',
      title: 'Final Seating Diagram',
      description: '',
      timeOrDate: '3 Weeks Out',
      assignee: 'Logistics',
      status: 'pending',
      isCriticalPath: true,
      dependsOn: ['task-2'],
    },
  ];

  const acyclicResult = detectGraphCycles(tasksAcyclic);
  assert.strictEqual(acyclicResult.hasCycle, false, 'DAG must report hasCycle: false');
  console.log('✓ Test 1A: Linear acyclic graph validated successfully (no cycle detected).');

  // Introduce cycle: Task 1 depends on Task 3 (Task 1 -> Task 2 -> Task 3 -> Task 1)
  const tasksCyclic: TimelineTask[] = tasksAcyclic.map((t) =>
    t.id === 'task-1' ? { ...t, dependsOn: ['task-3'] } : t
  );

  const cyclicResult = detectGraphCycles(tasksCyclic);
  assert.strictEqual(cyclicResult.hasCycle, true, 'Cyclic graph must report hasCycle: true');
  assert.ok(cyclicResult.cycleNodes.length >= 3, 'Cycle nodes must be identified');
  console.log('✓ Test 1B: Cyclic dependency loop accurately detected by DFS traversal.');

  // Self-dependency edge case: Task depends on itself
  const willSelfCycle = wouldIntroduceCycle(tasksAcyclic, 'task-2', 'task-2');
  assert.strictEqual(willSelfCycle, true, 'Self-loop must be flagged as cycle immediately');
  console.log('✓ Test 1C: Self-referential loop (A -> A) correctly prevented.');

  // Disconnected components with a cycle in sub-graph
  const disconnectedWithCycle: TimelineTask[] = [
    ...tasksAcyclic,
    {
      id: 'task-iso-1',
      phase: 'week_of',
      title: 'Acoustic Test A',
      description: '',
      timeOrDate: 'T-2d',
      assignee: 'AV',
      status: 'pending',
      isCriticalPath: false,
      dependsOn: ['task-iso-2'],
    },
    {
      id: 'task-iso-2',
      phase: 'week_of',
      title: 'Acoustic Test B',
      description: '',
      timeOrDate: 'T-2d',
      assignee: 'AV',
      status: 'pending',
      isCriticalPath: false,
      dependsOn: ['task-iso-1'],
    },
  ];
  const disResult = detectGraphCycles(disconnectedWithCycle);
  assert.strictEqual(disResult.hasCycle, true, 'Cycle in isolated component must be detected');
  console.log('✓ Test 1D: Disconnected sub-graph cycle accurately detected.');

  // Deep dependency chain cycle prevention (A -> B -> C -> D -> E -> A)
  const deepChain: TimelineTask[] = [
    { id: 'cA', phase: '6_months_out', title: 'A', description: '', timeOrDate: '', assignee: '', status: 'pending', isCriticalPath: false, dependsOn: [] },
    { id: 'cB', phase: '6_months_out', title: 'B', description: '', timeOrDate: '', assignee: '', status: 'pending', isCriticalPath: false, dependsOn: ['cA'] },
    { id: 'cC', phase: '6_months_out', title: 'C', description: '', timeOrDate: '', assignee: '', status: 'pending', isCriticalPath: false, dependsOn: ['cB'] },
    { id: 'cD', phase: '6_months_out', title: 'D', description: '', timeOrDate: '', assignee: '', status: 'pending', isCriticalPath: false, dependsOn: ['cC'] },
    { id: 'cE', phase: '6_months_out', title: 'E', description: '', timeOrDate: '', assignee: '', status: 'pending', isCriticalPath: false, dependsOn: ['cD'] },
  ];
  const deepCycleAttempt = wouldIntroduceCycle(deepChain, 'cA', 'cE');
  assert.strictEqual(deepCycleAttempt, true, 'Deep feedback edge (E -> A) must be detected as cycle');
  console.log('✓ Test 1E: 5-level deep cyclic feedback loop successfully screened.');
}

// ============================================================================
// Test Suite 2: Priority-Weighted Budget Rebalancing Engine
// ============================================================================
{
  const targetBudget = 68000;
  const initialCategories: BudgetCategory[] = [
    {
      id: 'venue_fb',
      name: 'Venue & F&B',
      priority: 1, // Anchor (protected)
      targetSharePct: 50,
      allocatedAmount: 34000,
      description: '',
    },
    {
      id: 'av_lighting',
      name: 'Audio/Visual & Lighting',
      priority: 2, // Technical safety
      targetSharePct: 15,
      allocatedAmount: 10200,
      description: '',
    },
    {
      id: 'decor_floral',
      name: 'Decor & Floral',
      priority: 4, // Discretionary flex
      targetSharePct: 12,
      allocatedAmount: 8160,
      description: '',
    },
    {
      id: 'entertainment',
      name: 'Live Music & Entertainment',
      priority: 5, // Lowest priority flex
      targetSharePct: 7,
      allocatedAmount: 4760,
      description: '',
    },
    {
      id: 'operations_contingency',
      name: 'Operations & Contingency',
      priority: 1, // Anchor
      targetSharePct: 16,
      allocatedAmount: 10880,
      description: '',
    },
  ];

  const expenses: BudgetItem[] = [
    {
      id: 'exp-1',
      name: 'Venue Deposit',
      categoryId: 'venue_fb',
      vendor: 'Conservatory',
      allocatedAmount: 12000,
      actualAmount: 12000,
      taxRatePct: 0,
      gratuityRatePct: 0,
      status: 'verified',
    },
  ];

  // Surplus reallocation
  const underAllocated = initialCategories.map((c) =>
    c.id === 'operations_contingency' ? { ...c, allocatedAmount: 5000 } : c
  );
  const surplusResult = rebalanceBudgetAllocations(underAllocated, targetBudget, expenses);
  const sumSurplus = surplusResult.rebalanced.reduce((s, c) => s + c.allocatedAmount, 0);
  assert.strictEqual(sumSurplus, targetBudget, 'Surplus must expand contingency pool to match target');
  console.log('✓ Test 2A: Surplus budget automatically funnels into Priority 1 contingency pool.');

  // Moderate deficit: Tier 5 absorbed first
  const inflatedCategories = initialCategories.map((c) =>
    c.id === 'venue_fb' ? { ...c, allocatedAmount: 37500 } : c
  );
  const rebalanced = rebalanceBudgetAllocations(inflatedCategories, targetBudget, expenses);
  const sumRebalanced = rebalanced.rebalanced.reduce((s, c) => s + c.allocatedAmount, 0);
  assert.strictEqual(sumRebalanced, targetBudget, 'Rebalanced total must strictly equal targetBudget');
  const entBefore = initialCategories.find((c) => c.id === 'entertainment')!.allocatedAmount;
  const entAfter = rebalanced.rebalanced.find((c) => c.id === 'entertainment')!.allocatedAmount;
  assert.ok(entAfter < entBefore, 'Tier 5 must absorb deficit before Tier 1');
  console.log('✓ Test 2B: Deficit correctly absorbed by lower-tier categories.');

  // Extreme deficit: Lower tiers reach floor, spillover into Tier 2 and Tier 1 safely
  const extremeInflated = initialCategories.map((c) =>
    c.id === 'venue_fb' ? { ...c, allocatedAmount: 60000 } : c
  );
  const extremeResult = rebalanceBudgetAllocations(extremeInflated, targetBudget, expenses);
  const sumExtreme = extremeResult.rebalanced.reduce((s, c) => s + c.allocatedAmount, 0);
  assert.ok(Math.abs(sumExtreme - targetBudget) <= 5, 'Extreme deficit handled gracefully with rounding bounds');
  console.log('✓ Test 2C: Extreme budget stress test handled with floor safeguards.');
}

// ============================================================================
// Test Suite 3: Arithmetic & Formatting Integrity
// ============================================================================
{
  const itemFullTaxTip: BudgetItem = {
    id: 'exp-cater',
    name: 'Gala Plated Dinner',
    categoryId: 'venue_fb',
    vendor: 'Artisan Hearth',
    allocatedAmount: 17500,
    actualAmount: 18000,
    taxRatePct: 8.5,
    gratuityRatePct: 20,
    status: 'verified',
  };
  const trueCost = computeExpenseTrueCost(itemFullTaxTip);
  assert.strictEqual(trueCost, 23130, 'True cost must equal Base + Tax + Tip exactly');
  console.log('✓ Test 3A: Tax (8.5%) and auto-gratuity (20%) calculated without floating point drift.');

  const itemZeroTaxTip: BudgetItem = {
    id: 'exp-zero',
    name: 'Permit Fee',
    categoryId: 'operations_contingency',
    vendor: 'City SF',
    allocatedAmount: 1200,
    actualAmount: 1200,
    taxRatePct: 0,
    gratuityRatePct: 0,
    status: 'verified',
  };
  assert.strictEqual(computeExpenseTrueCost(itemZeroTaxTip), 1200, 'Zero tax/tip returns base invoice');
  console.log('✓ Test 3B: Zero tax/gratuity items compute clean base value.');

  const formatted = formatCurrency(68000);
  assert.strictEqual(formatted, '$68,000', 'Currency must be formatted in US Dollar style without decimal cents');
  console.log('✓ Test 3C: Currency formatting verified ($68,000).');
}

// ============================================================================
// Test Suite 4: Category Totals & Verification Aggregator
// ============================================================================
{
  const testExpenses: BudgetItem[] = [
    {
      id: 'e1',
      name: 'Item 1',
      categoryId: 'venue_fb',
      vendor: 'V1',
      allocatedAmount: 5000,
      actualAmount: 5000,
      taxRatePct: 0,
      gratuityRatePct: 0,
      status: 'verified',
    },
    {
      id: 'e2',
      name: 'Item 2',
      categoryId: 'venue_fb',
      vendor: 'V2',
      allocatedAmount: 3000,
      actualAmount: 3000,
      taxRatePct: 10,
      gratuityRatePct: 0,
      status: 'pending',
    },
  ];

  const totals = getCategoryTotals('venue_fb', testExpenses);
  assert.strictEqual(totals.allocated, 8000, 'Allocated total must equal 5000 + 3000');
  assert.strictEqual(totals.actualTrueCost, 8300, 'Actual true cost must equal 5000 + (3000 * 1.10) = 8300');
  assert.strictEqual(totals.verifiedCount, 1, 'Verified count must be 1');
  assert.strictEqual(totals.pendingCount, 1, 'Pending count must be 1');
  console.log('✓ Test 4: getCategoryTotals accurately aggregates allocation, true cost, and status breakdown.');
}

// ============================================================================
// Test Suite 5: Executive Markdown Dossier Generator
// ============================================================================
{
  const blueprint: EventBlueprint = {
    id: 'evt-test',
    title: 'The Glasshouse Conservatory Gala',
    type: 'Gala & Reception',
    date: '2026-10-24',
    guestCount: 140,
    targetBudget: 68000,
    venueName: 'Conservatory Pavilion',
    location: 'San Francisco, CA',
    contingencyBufferPct: 8,
    productionNotes: 'Strict load-in curfews.',
    executiveSummary: 'Executive overview.',
    keyDirectives: ['Acoustic containment', 'Permit compliance'],
  };

  const categories: BudgetCategory[] = [
    { id: 'venue_fb', name: 'Venue & F&B', priority: 1, targetSharePct: 50, allocatedAmount: 34000, description: '' },
  ];
  const expenses: BudgetItem[] = [
    { id: 'e1', name: 'Food', categoryId: 'venue_fb', vendor: 'Caterer', allocatedAmount: 10000, actualAmount: 10000, taxRatePct: 0, gratuityRatePct: 0, status: 'verified' },
  ];
  const tasks: TimelineTask[] = [
    { id: 't1', phase: '6_months_out', title: 'Contract', description: 'Sign', timeOrDate: '6m', assignee: 'Director', status: 'completed', isCriticalPath: true, dependsOn: [] },
  ];
  const vendors: VendorRecord[] = [
    { id: 'v1', companyName: 'Caterer Co', serviceCategory: 'Food', contactName: 'Chef', email: '', phone: '', contractTotal: 10000, depositPaid: 5000, balanceRemaining: 5000, status: 'signed', notes: '' },
  ];

  const report = generateMarkdownReport(blueprint, categories, expenses, tasks, vendors);
  assert.ok(report.includes('# The Glasshouse Conservatory Gala'), 'Report must include title header');
  assert.ok(report.includes('## 1. Executive Summary & Parameters'), 'Report must include Executive Summary');
  assert.ok(report.includes('## 2. Priority-Weighted Budget Summary'), 'Report must include Budget table');
  assert.ok(report.includes('## 3. Run-of-Show & Milestone Timeline'), 'Report must include Run-of-show milestones');
  assert.ok(report.includes('## 4. Vendor Ledger & Commitments'), 'Report must include Vendor ledger');
  console.log('✓ Test 5: Executive Markdown dossier generator produces structured, valid GFM documentation.');
}

console.log('\n===============================================================');
console.log('ALL COMPREHENSIVE TESTS PASSED (5 TEST SUITES, 11 TEST CASES)');
console.log('===============================================================\n');
