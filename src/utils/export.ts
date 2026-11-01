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
} from '../types/event';
import { computeExpenseTrueCost, formatCurrency } from './budget';

/**
 * Generates an executive, beautifully formatted Markdown report of the entire event.
 */
export function generateMarkdownReport(
  blueprint: EventBlueprint,
  categories: BudgetCategory[],
  expenses: BudgetItem[],
  tasks: TimelineTask[],
  vendors: VendorRecord[]
): string {
  const totalAllocated = categories.reduce((s, c) => s + c.allocatedAmount, 0);
  const totalActual = expenses.reduce((s, e) => s + computeExpenseTrueCost(e), 0);

  const phaseNames: Record<string, string> = {
    '6_months_out': 'Phase I: 6 Months Out',
    '1_month_out': 'Phase II: 1 Month Out',
    week_of: 'Phase III: Week Of',
    day_of_run_of_show: 'Phase IV: Day-Of Run-of-Show',
  };

  const md: string[] = [];

  md.push(`# ${blueprint.title}`);
  md.push(`**Event OS AI Production Dossier** · *Generated on ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}*`);
  md.push('');
  md.push('---');
  md.push('');
  md.push('## 1. Executive Summary & Parameters');
  md.push(`- **Type:** ${blueprint.type}`);
  md.push(`- **Date:** ${blueprint.date}`);
  md.push(`- **Location:** ${blueprint.venueName}, ${blueprint.location}`);
  md.push(`- **Guest Count:** ${blueprint.guestCount} Attendees`);
  md.push(`- **Target Budget Cap:** ${formatCurrency(blueprint.targetBudget)}`);
  md.push(`- **Committed Expenditure:** ${formatCurrency(totalActual)} (${Math.round((totalActual / blueprint.targetBudget) * 100)}% of target)`);
  md.push(`- **Contingency Buffer:** ${blueprint.contingencyBufferPct}% reserved`);
  md.push('');
  if (blueprint.executiveSummary) {
    md.push('### Operational Scope');
    md.push(blueprint.executiveSummary);
    md.push('');
  }
  if (blueprint.keyDirectives && blueprint.keyDirectives.length > 0) {
    md.push('### Key Directives');
    blueprint.keyDirectives.forEach((d) => md.push(`- ${d}`));
    md.push('');
  }

  md.push('## 2. Priority-Weighted Budget Summary');
  md.push('| Category | Priority | Allocation | Actual Committed | Variance |');
  md.push('| :--- | :---: | :---: | :---: | :---: |');
  categories.forEach((c) => {
    const catExpenses = expenses.filter((e) => e.categoryId === c.id);
    const catActual = catExpenses.reduce((s, e) => s + computeExpenseTrueCost(e), 0);
    const diff = c.allocatedAmount - catActual;
    const diffText = diff >= 0 ? `+${formatCurrency(diff)}` : `-${formatCurrency(Math.abs(diff))}`;
    md.push(`| ${c.name} | Tier ${c.priority} | ${formatCurrency(c.allocatedAmount)} | ${formatCurrency(catActual)} | ${diffText} |`);
  });
  md.push('');

  md.push('## 3. Run-of-Show & Milestone Timeline');
  const phases = ['6_months_out', '1_month_out', 'week_of', 'day_of_run_of_show'] as const;
  phases.forEach((p) => {
    const phaseTasks = tasks.filter((t) => t.phase === p);
    if (phaseTasks.length === 0) return;
    md.push(`### ${phaseNames[p]}`);
    phaseTasks.forEach((t) => {
      const crit = t.isCriticalPath ? ' *(Critical Path)*' : '';
      const statusIcon = t.status === 'completed' ? '✓' : t.status === 'in_progress' ? '►' : '○';
      md.push(`- [${statusIcon}] **${t.timeOrDate}** — ${t.title}${crit}`);
      md.push(`  *Assignee:* ${t.assignee} | *Details:* ${t.description}`);
    });
    md.push('');
  });

  md.push('## 4. Vendor Ledger & Commitments');
  md.push('| Company | Service Scope | Total Contract | Deposit Paid | Balance Remaining | Status |');
  md.push('| :--- | :--- | :---: | :---: | :---: | :---: |');
  vendors.forEach((v) => {
    md.push(`| ${v.companyName} | ${v.serviceCategory} | ${formatCurrency(v.contractTotal)} | ${formatCurrency(v.depositPaid)} | ${formatCurrency(v.balanceRemaining)} | ${v.status} |`);
  });

  return md.join('\n');
}

/**
 * Downloads arbitrary text as a file in the browser.
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
