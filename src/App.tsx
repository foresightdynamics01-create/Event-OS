/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveWorkflow,
  EventBlueprint,
  BudgetCategory,
  BudgetItem,
  TimelineTask,
  VendorRecord,
  StressScenario,
} from './types/event';
import {
  INITIAL_BLUEPRINT,
  INITIAL_CATEGORIES,
  INITIAL_EXPENSES,
  INITIAL_TASKS,
  INITIAL_VENDORS,
  INITIAL_STRESS_SCENARIOS,
} from './data/initialEventData';
import { Header } from './components/Header';
import { BlueprintWorkflow } from './components/BlueprintWorkflow';
import { BudgetWorkflow } from './components/BudgetWorkflow';
import { TimelineWorkflow } from './components/TimelineWorkflow';
import { StressTestWorkflow } from './components/StressTestWorkflow';
import { VendorsWorkflow } from './components/VendorsWorkflow';
import { ConciergeChat } from './components/ConciergeChat';
import { NormanPrinciplesModal } from './components/NormanPrinciplesModal';
import { ExportModal } from './components/ExportModal';
import { AlertDialog } from './components/AlertDialog';
import { Layers, ShieldCheck, Compass } from 'lucide-react';
import producerAvatar from './assets/images/producer_avatar_1793552717561.jpg';

const STORAGE_KEY = 'eventos_orchestration_state_v1';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Celebration Studio] UI Error Boundary caught an exception:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-semibold text-zinc-100">Operational Continuity Guard</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              An unexpected render anomaly was safely contained. You can restore clean production fixtures or refresh the workspace.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Restore Safe Production Fixtures
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function EventOSApp() {
  const [activeWorkflow, setActiveWorkflow] = useState<ActiveWorkflow>('blueprint');

  // Core Orchestration State
  const [blueprint, setBlueprint] = useState<EventBlueprint>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.blueprint) return parsed.blueprint;
      }
    } catch (e) {
      console.warn('Failed to load saved state from localStorage:', e);
    }
    return INITIAL_BLUEPRINT;
  });

  const [categories, setCategories] = useState<BudgetCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.categories) return parsed.categories;
      }
    } catch (e) {}
    return INITIAL_CATEGORIES;
  });

  const [expenses, setExpenses] = useState<BudgetItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.expenses) return parsed.expenses;
      }
    } catch (e) {}
    return INITIAL_EXPENSES;
  });

  const [tasks, setTasks] = useState<TimelineTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tasks) return parsed.tasks;
      }
    } catch (e) {}
    return INITIAL_TASKS;
  });

  const [vendors, setVendors] = useState<VendorRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.vendors) return parsed.vendors;
      }
    } catch (e) {}
    return INITIAL_VENDORS;
  });

  const [scenarios, setScenarios] = useState<StressScenario[]>(INITIAL_STRESS_SCENARIOS);

  // Modals & Drawers
  const [isPrinciplesOpen, setIsPrinciplesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Persistence status
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string>('Just now');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Confirmation Alert Dialog (Norman Principle #7: Error Prevention)
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Debounced 400ms localStorage synchronization to prevent slider lag & CPU thrashing
  useEffect(() => {
    setIsSaving(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        const payload = {
          blueprint,
          categories,
          expenses,
          tasks,
          vendors,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setIsSaving(false);
        setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.error('Error persisting to localStorage:', err);
        setIsSaving(false);
      }
    }, 400);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [blueprint, categories, expenses, tasks, vendors]);

  // Reset to Sample Fixtures
  const handleResetToSample = () => {
    setAlertDialog({
      isOpen: true,
      title: 'Reset to Sample Production Fixtures?',
      description:
        'This will restore "The Glasshouse Conservatory Gala" dataset ($68,000 budget, 140 guests), overwriting any custom modifications. This action is irreversible.',
      confirmLabel: 'Reset Data',
      isDestructive: true,
      onConfirm: () => {
        setBlueprint(INITIAL_BLUEPRINT);
        setCategories(INITIAL_CATEGORIES);
        setExpenses(INITIAL_EXPENSES);
        setTasks(INITIAL_TASKS);
        setVendors(INITIAL_VENDORS);
        setScenarios(INITIAL_STRESS_SCENARIOS);
        localStorage.removeItem(STORAGE_KEY);
        setAlertDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Apply Stress Test Adjustments to Active Event
  const handleApplyScenarioAdjustments = (scenario: StressScenario) => {
    // 1. Apply budget adjustments
    if (scenario.budgetAdjustments && scenario.budgetAdjustments.length > 0) {
      setCategories((prevCategories) => {
        return prevCategories.map((cat) => {
          const adj = scenario.budgetAdjustments?.find((a) => a.categoryId === cat.id);
          if (adj) {
            return {
              ...cat,
              allocatedAmount: cat.allocatedAmount + adj.deltaAmount,
            };
          }
          return cat;
        });
      });
    }

    // 2. Insert emergency timeline tasks
    if (scenario.timelineInsertions && scenario.timelineInsertions.length > 0) {
      const newTasks: TimelineTask[] = scenario.timelineInsertions.map((ins, i) => ({
        id: `task-contingency-${scenario.id}-${i}-${Date.now()}`,
        phase: ins.phase,
        title: `[CONTINGENCY] ${ins.title}`,
        description: `Emergency action protocol triggered by "${scenario.title}".`,
        timeOrDate: ins.timeOrDate,
        assignee: ins.assignee,
        status: 'pending',
        isCriticalPath: ins.isCriticalPath,
        dependsOn: [],
      }));

      setTasks((prev) => [...prev, ...newTasks]);
    }
  };

  // Add Custom Scenario
  const handleAddCustomScenario = (newScenario: StressScenario) => {
    setScenarios((prev) => [newScenario, ...prev]);
  };

  // Restore State from JSON Backup
  const handleImportBackup = (data: {
    blueprint: EventBlueprint;
    categories: BudgetCategory[];
    expenses: BudgetItem[];
    tasks: TimelineTask[];
    vendors: VendorRecord[];
  }) => {
    if (data.blueprint) setBlueprint(data.blueprint);
    if (data.categories) setCategories(data.categories);
    if (data.expenses) setExpenses(data.expenses);
    if (data.tasks) setTasks(data.tasks);
    if (data.vendors) setVendors(data.vendors);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar Contract Navigation */}
      <Header
        activeWorkflow={activeWorkflow}
        onSelectWorkflow={setActiveWorkflow}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPrinciples={() => setIsPrinciplesOpen(true)}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Workflow Segmented Bar (Mobile & Quick-switch navigation) */}
        <div className="flex md:hidden items-center justify-between gap-1 overflow-x-auto pb-2 border-b border-zinc-800">
          <button
            onClick={() => setActiveWorkflow('blueprint')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeWorkflow === 'blueprint'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400'
            }`}
          >
            Blueprint
          </button>
          <button
            onClick={() => setActiveWorkflow('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeWorkflow === 'budget'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400'
            }`}
          >
            Budget
          </button>
          <button
            onClick={() => setActiveWorkflow('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeWorkflow === 'timeline'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveWorkflow('stress_tester')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeWorkflow === 'stress_tester'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400'
            }`}
          >
            Stress-Test
          </button>
          <button
            onClick={() => setActiveWorkflow('vendors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeWorkflow === 'vendors'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400'
            }`}
          >
            Vendors
          </button>
          <button
            onClick={() => setActiveWorkflow('concierge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeWorkflow === 'concierge'
                ? 'bg-zinc-800 text-indigo-400 font-semibold'
                : 'text-zinc-400'
            }`}
          >
            Concierge
          </button>
        </div>

        {/* Active Workflow Views */}
        {activeWorkflow === 'blueprint' && (
          <BlueprintWorkflow
            blueprint={blueprint}
            onUpdateBlueprint={setBlueprint}
            onResetToSample={handleResetToSample}
          />
        )}

        {activeWorkflow === 'budget' && (
          <BudgetWorkflow
            categories={categories}
            expenses={expenses}
            targetBudget={blueprint.targetBudget}
            onUpdateCategories={setCategories}
            onUpdateExpenses={setExpenses}
            onOpenConfirmDialog={(cfg) =>
              setAlertDialog({
                isOpen: true,
                title: cfg.title,
                description: cfg.description,
                isDestructive: cfg.isDestructive,
                confirmLabel: 'Delete Expense',
                onConfirm: () => {
                  cfg.onConfirm();
                  setAlertDialog((prev) => ({ ...prev, isOpen: false }));
                },
              })
            }
          />
        )}

        {activeWorkflow === 'timeline' && (
          <TimelineWorkflow
            tasks={tasks}
            onUpdateTasks={setTasks}
            onOpenConfirmDialog={(cfg) =>
              setAlertDialog({
                isOpen: true,
                title: cfg.title,
                description: cfg.description,
                isDestructive: cfg.isDestructive,
                confirmLabel: 'Remove Task',
                onConfirm: () => {
                  cfg.onConfirm();
                  setAlertDialog((prev) => ({ ...prev, isOpen: false }));
                },
              })
            }
          />
        )}

        {activeWorkflow === 'stress_tester' && (
          <StressTestWorkflow
            scenarios={scenarios}
            blueprint={blueprint}
            categories={categories}
            tasks={tasks}
            onApplyScenarioAdjustments={handleApplyScenarioAdjustments}
            onAddCustomScenario={handleAddCustomScenario}
          />
        )}

        {activeWorkflow === 'vendors' && (
          <VendorsWorkflow
            vendors={vendors}
            onUpdateVendors={setVendors}
            onOpenConfirmDialog={(cfg) =>
              setAlertDialog({
                isOpen: true,
                title: cfg.title,
                description: cfg.description,
                isDestructive: cfg.isDestructive,
                confirmLabel: 'Remove Vendor',
                onConfirm: () => {
                  cfg.onConfirm();
                  setAlertDialog((prev) => ({ ...prev, isOpen: false }));
                },
              })
            }
          />
        )}

        {activeWorkflow === 'concierge' && (
          <ConciergeChat
            blueprint={blueprint}
            categories={categories}
            expenses={expenses}
            tasks={tasks}
            vendors={vendors}
          />
        )}
      </main>

      {/* Floating Concierge Quick-Launch Trigger when on other workflows */}
      {activeWorkflow !== 'concierge' && (
        <button
          onClick={() => setActiveWorkflow('concierge')}
          aria-label="Consult Sarah Jenkins"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900/95 hover:bg-zinc-850 text-zinc-100 border border-zinc-700/80 rounded-full shadow-2xl backdrop-blur-md transition-all hover:scale-102 group"
        >
          <div className="relative">
            <img
              src={producerAvatar || '/images/producer_avatar.jpg'}
              alt="Sarah Jenkins"
              referrerPolicy="no-referrer"
              className="w-6 h-6 rounded-full object-cover border border-zinc-600"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + '/images/producer_avatar.jpg') {
                  e.currentTarget.src = '/images/producer_avatar.jpg';
                }
              }}
            />
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 border border-zinc-950" />
          </div>
          <span className="text-xs font-medium">Consult Sarah</span>
          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900/40">
            Live
          </span>
        </button>
      )}

      {/* Crafted Production Footer */}
      <footer className="w-full bg-zinc-950 border-t border-zinc-800/80 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <img
              src={producerAvatar || '/images/producer_avatar.jpg'}
              alt="Lead Event Producer"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + '/images/producer_avatar.jpg') {
                  e.currentTarget.src = '/images/producer_avatar.jpg';
                }
              }}
            />
            <div>
              <span className="font-semibold text-zinc-200 block">
                Celebration Studio Directorate
              </span>
              <span>San Francisco Event Operations & Logistics Desk</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setIsPrinciplesOpen(true)}
              className="hover:text-zinc-200 transition-colors"
            >
              Norman Principles Reference
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsExportOpen(true)}
              className="hover:text-zinc-200 transition-colors"
            >
              Export JSON / Markdown
            </button>
            <span aria-hidden="true">·</span>
            <span>Production Grade v1.0</span>
          </div>
        </div>
      </footer>

      {/* Don Norman Design Principles Drawer Modal */}
      <NormanPrinciplesModal
        isOpen={isPrinciplesOpen}
        onClose={() => setIsPrinciplesOpen(false)}
      />

      {/* Export & Backup Dossier Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        blueprint={blueprint}
        categories={categories}
        expenses={expenses}
        tasks={tasks}
        vendors={vendors}
        onImportBackup={handleImportBackup}
      />

      {/* Custom Accessible Confirmation Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        title={alertDialog.title}
        description={alertDialog.description}
        confirmLabel={alertDialog.confirmLabel}
        isDestructive={alertDialog.isDestructive}
        onConfirm={alertDialog.onConfirm}
        onCancel={() => setAlertDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <EventOSApp />
    </ErrorBoundary>
  );
}
