/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BudgetCategory, BudgetItem, CategoryId } from '../types/event';

/**
 * Calculates the true total cost of an item including tax and gratuity.
 */
export function computeExpenseTrueCost(item: BudgetItem): number {
  const base = item.actualAmount > 0 ? item.actualAmount : item.allocatedAmount;
  const tax = base * (item.taxRatePct / 100);
  const gratuity = base * (item.gratuityRatePct / 100);
  return Math.round((base + tax + gratuity) * 100) / 100;
}

/**
 * Calculates total allocated and total actual spent for a specific category.
 */
export function getCategoryTotals(
  categoryId: CategoryId,
  expenses: BudgetItem[]
) {
  const categoryExpenses = expenses.filter((e) => e.categoryId === categoryId);
  const allocated = categoryExpenses.reduce((sum, e) => sum + e.allocatedAmount, 0);
  const actualTrueCost = categoryExpenses.reduce(
    (sum, e) => sum + computeExpenseTrueCost(e),
    0
  );

  return {
    allocated,
    actualTrueCost,
    count: categoryExpenses.length,
    verifiedCount: categoryExpenses.filter((e) => e.status === 'verified').length,
    pendingCount: categoryExpenses.filter((e) => e.status === 'pending').length,
    disputedCount: categoryExpenses.filter((e) => e.status === 'disputed').length,
  };
}

/**
 * Priority-Weighted Budget Rebalancing Algorithm.
 * If total allocations deviate from targetBudget, this rebalances by taking from
 * lower-priority categories (Priority 5 -> Priority 4 -> Priority 3 -> Priority 2)
 * while strictly safeguarding Priority 1 essentials and verified incurred costs.
 */
export function rebalanceBudgetAllocations(
  categories: BudgetCategory[],
  totalBudget: number,
  expenses: BudgetItem[]
): {
  rebalanced: BudgetCategory[];
  rebalanceLog: string[];
} {
  const currentTotal = categories.reduce((sum, c) => sum + c.allocatedAmount, 0);
  const delta = totalBudget - currentTotal;

  if (Math.abs(delta) < 1) {
    return { rebalanced: categories, rebalanceLog: ['Budget is already precisely balanced.'] };
  }

  // Create working copy
  const updated = categories.map((c) => ({ ...c }));
  const logs: string[] = [];

  if (delta > 0) {
    // Surplus budget available: Allocate to Contingency / Operations (Priority 1) first
    const contingency = updated.find((c) => c.id === 'operations_contingency') || updated[0];
    contingency.allocatedAmount += delta;
    contingency.targetSharePct = Math.round((contingency.allocatedAmount / totalBudget) * 100);
    logs.push(`Added surplus of $${delta.toLocaleString()} into ${contingency.name} contingency pool.`);
  } else {
    // Deficit: We need to shave Math.abs(delta) from lower-priority categories
    let remainingToCut = Math.abs(delta);

    // Sort categories descending by priority number (5 = flexible, 1 = protected anchor)
    // Priority 5 is cut first, then 4, 3, 2. Priority 1 is protected.
    const eligibleCategories = updated
      .filter((c) => c.priority > 1)
      .sort((a, b) => b.priority - a.priority);

    for (const cat of eligibleCategories) {
      if (remainingToCut <= 0) break;

      // Calculate hard minimum floor: committed verified expenses for this category
      const committedCost = expenses
        .filter((e) => e.categoryId === cat.id && e.status === 'verified')
        .reduce((sum, e) => sum + computeExpenseTrueCost(e), 0);

      const minimumFloor = Math.max(committedCost, cat.allocatedAmount * 0.25);
      const cuttableAmount = Math.max(0, cat.allocatedAmount - minimumFloor);

      if (cuttableAmount > 0) {
        const cut = Math.min(cuttableAmount, remainingToCut);
        cat.allocatedAmount -= cut;
        remainingToCut -= cut;
        logs.push(
          `Priority ${cat.priority} trade-off: Absorbed $${Math.round(cut).toLocaleString()} from ${cat.name} (protected floor: $${Math.round(minimumFloor).toLocaleString()}).`
        );
      }
    }

    if (remainingToCut > 0) {
      // If lower tiers exhausted, distribute remainder across Priority 2 and 1 proportionately
      const topTiers = updated.filter((c) => c.priority <= 2);
      const tierTotal = topTiers.reduce((sum, c) => sum + c.allocatedAmount, 0);
      if (tierTotal > 0) {
        for (const cat of topTiers) {
          const cut = Math.min(cat.allocatedAmount * 0.5, (cat.allocatedAmount / tierTotal) * remainingToCut);
          cat.allocatedAmount -= cut;
          logs.push(`Protected tier adjustment: Adjusted $${Math.round(cut).toLocaleString()} in ${cat.name}.`);
        }
      }
    }
  }

  // Recalculate target shares
  updated.forEach((c) => {
    c.allocatedAmount = Math.round(c.allocatedAmount);
    c.targetSharePct = Math.round((c.allocatedAmount / totalBudget) * 100);
  });

  return { rebalanced: updated, rebalanceLog: logs };
}

/**
 * Format currency with tabular clarity
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
