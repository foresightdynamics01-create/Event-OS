/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Shield,
  Sliders,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  AlertOctagon,
  Search,
  Filter,
  Info,
} from 'lucide-react';
import { BudgetCategory, BudgetItem, CategoryId, ExpenseStatus } from '../types/event';
import {
  formatCurrency,
  computeExpenseTrueCost,
  rebalanceBudgetAllocations,
  getCategoryTotals,
} from '../utils/budget';

interface BudgetWorkflowProps {
  categories: BudgetCategory[];
  expenses: BudgetItem[];
  targetBudget: number;
  onUpdateCategories: (categories: BudgetCategory[]) => void;
  onUpdateExpenses: (expenses: BudgetItem[]) => void;
  onOpenConfirmDialog: (config: {
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }) => void;
}

export const BudgetWorkflow: React.FC<BudgetWorkflowProps> = ({
  categories,
  expenses,
  targetBudget,
  onUpdateCategories,
  onUpdateExpenses,
  onOpenConfirmDialog,
}) => {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [selectedFilterStatus, setSelectedFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rebalanceLogs, setRebalanceLogs] = useState<string[] | null>(null);

  // New Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemVendor, setNewItemVendor] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CategoryId>('venue_fb');
  const [newItemAllocated, setNewItemAllocated] = useState('1000');
  const [newItemActual, setNewItemActual] = useState('1000');
  const [newItemTax, setNewItemTax] = useState('8.5');
  const [newItemTip, setNewItemTip] = useState('0');
  const [newItemNotes, setNewItemNotes] = useState('');

  // Memoized Calculations
  const totalAllocated = useMemo(
    () => categories.reduce((sum, c) => sum + c.allocatedAmount, 0),
    [categories]
  );
  const totalActualTrueCost = useMemo(
    () => expenses.reduce((sum, e) => sum + computeExpenseTrueCost(e), 0),
    [expenses]
  );
  const contingencyPool = targetBudget - totalAllocated;
  const committedPct = Math.round((totalActualTrueCost / targetBudget) * 100);

  // Category change handler
  const handleCategoryAllocChange = (categoryId: CategoryId, newAmount: number) => {
    const updated = categories.map((c) =>
      c.id === categoryId
        ? {
            ...c,
            allocatedAmount: Math.max(0, newAmount),
            targetSharePct: Math.round((newAmount / targetBudget) * 100),
          }
        : c
    );
    onUpdateCategories(updated);
  };

  // Rebalance Trigger
  const handleRebalance = () => {
    const result = rebalanceBudgetAllocations(categories, targetBudget, expenses);
    onUpdateCategories(result.rebalanced);
    setRebalanceLogs(result.rebalanceLog);
  };

  // Status toggle
  const handleToggleStatus = (expenseId: string) => {
    const order: ExpenseStatus[] = ['verified', 'pending', 'disputed'];
    const updated = expenses.map((e) => {
      if (e.id === expenseId) {
        const nextIdx = (order.indexOf(e.status) + 1) % order.length;
        return { ...e, status: order[nextIdx] };
      }
      return e;
    });
    onUpdateExpenses(updated);
  };

  // Delete expense
  const handleDeleteExpense = (id: string, name: string) => {
    onOpenConfirmDialog({
      title: 'Delete Expense Item',
      description: `Are you sure you want to remove "${name}" from itemized records? This action cannot be undone.`,
      isDestructive: true,
      onConfirm: () => {
        onUpdateExpenses(expenses.filter((e) => e.id !== id));
      },
    });
  };

  // Add expense
  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newExpense: BudgetItem = {
      id: `exp-${Date.now()}`,
      name: newItemName.trim(),
      vendor: newItemVendor.trim() || 'Vendor To Be Assigned',
      categoryId: newItemCategory,
      allocatedAmount: parseFloat(newItemAllocated) || 0,
      actualAmount: parseFloat(newItemActual) || 0,
      taxRatePct: parseFloat(newItemTax) || 0,
      gratuityRatePct: parseFloat(newItemTip) || 0,
      status: 'pending',
      notes: newItemNotes.trim(),
    };

    onUpdateExpenses([...expenses, newExpense]);
    setIsAddExpenseOpen(false);
    // Reset form
    setNewItemName('');
    setNewItemVendor('');
    setNewItemNotes('');
  };

  // Memoized filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesCat = selectedFilterCategory === 'all' || e.categoryId === selectedFilterCategory;
      const matchesStatus = selectedFilterStatus === 'all' || e.status === selectedFilterStatus;
      const matchesSearch =
        searchQuery === '' ||
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vendor.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesStatus && matchesSearch;
    });
  }, [expenses, selectedFilterCategory, selectedFilterStatus, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Top 4-Column KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Target Budget Cap</span>
          <div className="text-xl font-semibold text-zinc-100 font-mono tabular-nums">
            {formatCurrency(targetBudget)}
          </div>
          <div className="text-xs text-zinc-400">Hard financial ceiling</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Planned Allocation</span>
          <div className="text-xl font-semibold text-zinc-100 font-mono tabular-nums">
            {formatCurrency(totalAllocated)}
          </div>
          <div className="text-xs text-zinc-400">
            {totalAllocated === targetBudget ? (
              <span className="text-emerald-400">100% Fully Distributed</span>
            ) : totalAllocated < targetBudget ? (
              <span className="text-indigo-400">
                {formatCurrency(targetBudget - totalAllocated)} unallocated reserve
              </span>
            ) : (
              <span className="text-amber-400">
                +{formatCurrency(totalAllocated - targetBudget)} over target
              </span>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Committed True Cost</span>
          <div className="text-xl font-semibold text-zinc-100 font-mono tabular-nums">
            {formatCurrency(totalActualTrueCost)}
          </div>
          <div className="text-xs text-zinc-400">
            Includes tax & auto-gratuity ({committedPct}% of cap)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Available Headroom</span>
          <div
            className={`text-xl font-semibold font-mono tabular-nums ${
              targetBudget - totalActualTrueCost >= 0
                ? 'text-emerald-400'
                : 'text-red-400'
            }`}
          >
            {formatCurrency(targetBudget - totalActualTrueCost)}
          </div>
          <div className="text-xs text-zinc-400">Effective safety margin</div>
        </div>
      </div>

      {/* Priority Allocation Cards with Rebalancer */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Priority-Weighted Allocation Engine
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Categories ranked Tier 1 (Non-negotiable) to Tier 5 (Discretionary). Automated trade-off protects critical tiers.
            </p>
          </div>
          <button
            onClick={handleRebalance}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            Rebalance by Priority (Zero-Sum)
          </button>
        </div>

        {/* Rebalance Log drawer if generated */}
        {rebalanceLogs && (
          <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 space-y-1">
            <div className="flex items-center justify-between text-indigo-400 font-medium pb-1 border-b border-zinc-800">
              <span>Automated Rebalance Manifest</span>
              <button
                onClick={() => setRebalanceLogs(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                Dismiss
              </button>
            </div>
            {rebalanceLogs.map((log, idx) => (
              <p key={idx} className="font-mono text-zinc-300">
                · {log}
              </p>
            ))}
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const { allocated, actualTrueCost } = getCategoryTotals(cat.id, expenses);
            const usagePct =
              cat.allocatedAmount > 0
                ? Math.min(100, Math.round((actualTrueCost / cat.allocatedAmount) * 100))
                : 0;

            const priorityLabels: Record<number, { label: string; color: string }> = {
              1: { label: 'Tier 1 · Anchor Essential', color: 'text-indigo-400 border-indigo-900/60 bg-indigo-950/40' },
              2: { label: 'Tier 2 · Production Safety', color: 'text-sky-400 border-sky-900/60 bg-sky-950/40' },
              3: { label: 'Tier 3 · Archival Quality', color: 'text-zinc-300 border-zinc-800 bg-zinc-900' },
              4: { label: 'Tier 4 · Aesthetic Decor', color: 'text-amber-400 border-amber-900/60 bg-amber-950/40' },
              5: { label: 'Tier 5 · Discretionary Flex', color: 'text-purple-400 border-purple-900/60 bg-purple-950/40' },
            };

            const pInfo = priorityLabels[cat.priority];

            return (
              <div
                key={cat.id}
                className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 space-y-3 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded border ${pInfo.color} font-mono`}
                    >
                      {pInfo.label}
                    </span>
                    <h3 className="text-xs font-semibold text-zinc-200 leading-snug pt-1">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Allocated Cap:</span>
                    <span className="text-zinc-100 font-medium tabular-nums">
                      {formatCurrency(cat.allocatedAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-400">Actual Committed:</span>
                    <span
                      className={`tabular-nums ${
                        actualTrueCost > cat.allocatedAmount
                          ? 'text-red-400 font-semibold'
                          : 'text-zinc-300'
                      }`}
                    >
                      {formatCurrency(actualTrueCost)}
                    </span>
                  </div>
                </div>

                {/* Semantic Progress Meter (Norman Principle #2: Signifier) */}
                <div className="space-y-1">
                  <div
                    role="progressbar"
                    aria-valuenow={usagePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${cat.name} budget consumption`}
                    className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        actualTrueCost > cat.allocatedAmount
                          ? 'bg-red-500'
                          : usagePct > 90
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, (actualTrueCost / (cat.allocatedAmount || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-400 font-mono">
                    <span>{usagePct}% consumed</span>
                    <span>
                      {cat.allocatedAmount >= actualTrueCost
                        ? `${formatCurrency(cat.allocatedAmount - actualTrueCost)} free`
                        : `${formatCurrency(actualTrueCost - cat.allocatedAmount)} deficit`}
                    </span>
                  </div>
                </div>

                {/* Slider (Norman Principle #1 & #3: Affordance & Natural Mapping) */}
                <div className="pt-1">
                  <input
                    type="range"
                    min="0"
                    max={targetBudget}
                    step="200"
                    value={cat.allocatedAmount}
                    onChange={(e) =>
                      handleCategoryAllocChange(cat.id, parseInt(e.target.value, 10))
                    }
                    className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded cursor-pointer"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Itemized Expense Manager */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">
              Itemized Expense Ledger & Verification
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Individual vendor billings with computed tax, gratuity, and validation audit toggles.
            </p>
          </div>
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense Line
          </button>
        </div>

        {/* Filter Controls (Segmented, no pill clutter) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setSelectedFilterStatus('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedFilterStatus === 'all'
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setSelectedFilterStatus('verified')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedFilterStatus === 'verified'
                    ? 'bg-zinc-800 text-emerald-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Verified
              </button>
              <button
                onClick={() => setSelectedFilterStatus('pending')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedFilterStatus === 'pending'
                    ? 'bg-zinc-800 text-amber-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setSelectedFilterStatus('disputed')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedFilterStatus === 'disputed'
                    ? 'bg-zinc-800 text-red-400'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Disputed
              </button>
            </div>

            <select
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search expenses or vendors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64 bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-mono">
              <tr>
                <th className="py-2.5 px-3">Expense & Vendor</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Allocated</th>
                <th className="py-2.5 px-3 text-right">Actual Base</th>
                <th className="py-2.5 px-3 text-right">Tax / Tip</th>
                <th className="py-2.5 px-3 text-right">True Total</th>
                <th className="py-2.5 px-3 text-center">Status (Toggle)</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 bg-zinc-900/60 font-sans">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-zinc-400">
                    No expense line items match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const trueCost = computeExpenseTrueCost(exp);
                  const catName = categories.find((c) => c.id === exp.categoryId)?.name || exp.categoryId;

                  return (
                    <tr key={exp.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-medium text-zinc-200">{exp.name}</div>
                        <div className="text-zinc-400 font-mono text-xs mt-0.5">
                          {exp.vendor}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-zinc-400 truncate max-w-[140px]">
                        {catName}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-400">
                        {formatCurrency(exp.allocatedAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-200">
                        {formatCurrency(exp.actualAmount)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums text-zinc-400">
                        {exp.taxRatePct > 0 ? `${exp.taxRatePct}% tax` : '0%'}
                        {exp.gratuityRatePct > 0 ? ` · ${exp.gratuityRatePct}% tip` : ''}
                      </td>

                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-zinc-100">
                        {formatCurrency(trueCost)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleStatus(exp.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                            exp.status === 'verified'
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/50'
                              : exp.status === 'pending'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-900/50'
                              : 'bg-red-950/60 text-red-300 border border-red-900/50'
                          }`}
                          title="Click to toggle status (Verified ➔ Pending ➔ Disputed)"
                        >
                          {exp.status === 'verified' && <CheckCircle className="w-3 h-3" />}
                          {exp.status === 'pending' && <Clock className="w-3 h-3" />}
                          {exp.status === 'disputed' && <AlertOctagon className="w-3 h-3" />}
                          <span className="capitalize">{exp.status}</span>
                        </button>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteExpense(exp.id, exp.name)}
                          className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsAddExpenseOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl text-zinc-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-zinc-100 pb-2 border-b border-zinc-800">
              Add Itemized Expense
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stage Light Truss Rigging"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Vendor / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g. Aura Sound Labs"
                    value={newItemVendor}
                    onChange={(e) => setNewItemVendor(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as CategoryId)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Allocated Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newItemAllocated}
                    onChange={(e) => setNewItemAllocated(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono tabular-nums focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Actual Base Invoice ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newItemActual}
                    onChange={(e) => setNewItemActual(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono tabular-nums focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Sales Tax (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItemTax}
                    onChange={(e) => setNewItemTax(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono tabular-nums focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Auto-Gratuity (%)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newItemTip}
                    onChange={(e) => setNewItemTip(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono tabular-nums focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Production Notes</label>
                <input
                  type="text"
                  placeholder="Payment milestones, contract schedule, etc."
                  value={newItemNotes}
                  onChange={(e) => setNewItemNotes(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
