/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Zap,
  Clock,
  DollarSign,
  AlertTriangle,
  ShieldCheck,
  CheckSquare,
  Square,
  Plus,
  Play,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  StressScenario,
  BudgetCategory,
  TimelineTask,
  EventBlueprint,
} from '../types/event';
import { formatCurrency } from '../utils/budget';

interface StressTestWorkflowProps {
  scenarios: StressScenario[];
  blueprint: EventBlueprint;
  categories: BudgetCategory[];
  tasks: TimelineTask[];
  onApplyScenarioAdjustments: (scenario: StressScenario) => void;
  onAddCustomScenario: (scenario: StressScenario) => void;
}

export const StressTestWorkflow: React.FC<StressTestWorkflowProps> = ({
  scenarios,
  blueprint,
  categories,
  tasks,
  onApplyScenarioAdjustments,
  onAddCustomScenario,
}) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0]?.id || '');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [appliedScenarios, setAppliedScenarios] = useState<Record<string, boolean>>({});

  // Custom Simulator State
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulateError, setSimulateError] = useState<string | null>(null);

  const activeScenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];

  const handleToggleStep = (stepIdx: number) => {
    const key = `${activeScenario.id}-step-${stepIdx}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleApply = (scenario: StressScenario) => {
    onApplyScenarioAdjustments(scenario);
    setAppliedScenarios((prev) => ({ ...prev, [scenario.id]: true }));
  };

  const handleSimulateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    setIsSimulating(true);
    setSimulateError(null);

    try {
      const res = await fetch('/api/stress-test/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: customTitle.trim(),
          scenarioDescription: customDescription.trim(),
          guestCount: blueprint.guestCount,
          currentBudget: blueprint.targetBudget,
          categories: categories.map((c) => ({ id: c.id, name: c.name, alloc: c.allocatedAmount })),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to simulate scenario.');
      }

      const data = await res.json();
      const newScenario: StressScenario = {
        id: `scen-custom-${Date.now()}`,
        title: customTitle.trim(),
        category: data.category || 'Custom Incident',
        severity: data.severity || 'moderate',
        description:
          customDescription.trim() ||
          `Operational stress simulation for ${customTitle.trim()}.`,
        financialImpact: data.financialImpact || 3000,
        timelineDelayMinutes: data.timelineDelayMinutes || 30,
        mitigationSteps: data.mitigationSteps || [
          'Brief primary coordinators.',
          'Execute emergency vendor protocol.',
          'Reallocate contingency reserves.',
        ],
        budgetAdjustments: data.budgetAdjustments || [],
        timelineInsertions: data.timelineInsertions || [],
      };

      onAddCustomScenario(newScenario);
      setActiveScenarioId(newScenario.id);
      setCustomTitle('');
      setCustomDescription('');
    } catch (err: any) {
      setSimulateError(err.message || 'Simulation engine error.');
    } finally {
      setIsSimulating(false);
    }
  };

  const severityColors: Record<string, string> = {
    low: 'text-emerald-400 border-emerald-900/60 bg-emerald-950/40',
    moderate: 'text-amber-400 border-amber-900/60 bg-amber-950/40',
    high: 'text-orange-400 border-orange-900/60 bg-orange-950/40',
    critical: 'text-red-400 border-red-900/60 bg-red-950/40',
  };

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-2">
        <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          Real-World Scenario Stress-Tester ("What-If" Simulator)
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
          Event orchestration fails in the real world when unexpected disruptions collide with rigid plans.
          Stress-test the event against extreme weather, guest surges, and vendor cancellations with mathematical cost deltas, run-of-show delay analysis, and 1-click live operational adjustments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Scenarios List (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-200">
                Contingency Scenarios
              </span>
              <span className="text-xs font-mono text-zinc-400">
                {scenarios.length} available
              </span>
            </div>

            <div className="space-y-2">
              {scenarios.map((scen) => {
                const isActive = scen.id === activeScenario?.id;
                const isApplied = appliedScenarios[scen.id];

                return (
                  <button
                    key={scen.id}
                    onClick={() => setActiveScenarioId(scen.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all space-y-1.5 ${
                      isActive
                        ? 'bg-zinc-800/90 border-indigo-500/80 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-mono uppercase ${
                          severityColors[scen.severity] || severityColors.moderate
                        }`}
                      >
                        {scen.severity}
                      </span>
                      {isApplied && (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-semibold text-zinc-100 leading-snug">
                      {scen.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <span>+{formatCurrency(scen.financialImpact)}</span>
                      <span>·</span>
                      <span>+{scen.timelineDelayMinutes}m slip</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Scenario Generator */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="border-b border-zinc-800 pb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200">
                Simulate Custom Contingency
              </span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            </div>

            {simulateError && (
              <p className="text-xs text-red-400 bg-red-950/60 p-2 rounded border border-red-900/50">
                {simulateError}
              </p>
            )}

            <form onSubmit={handleSimulateCustom} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Disruption Event</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Speaker Flight Cancelled 4h Prior"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Disruption Specifics</label>
                <textarea
                  rows={2}
                  placeholder="Additional context on equipment, venue or transport..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {isSimulating ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run Gemini Stress-Test
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scenario Detail & Delta Matrix (8 cols) */}
        {activeScenario && (
          <div className="lg:col-span-8 space-y-6">
            {/* Scenario Header */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded border font-mono uppercase ${
                        severityColors[activeScenario.severity] || severityColors.moderate
                      }`}
                    >
                      {activeScenario.severity} Risk
                    </span>
                    <span className="text-xs text-zinc-400">·</span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {activeScenario.category}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-100">
                    {activeScenario.title}
                  </h3>
                </div>

                <button
                  onClick={() => handleApply(activeScenario)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm ${
                    appliedScenarios[activeScenario.id]
                      ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  {appliedScenarios[activeScenario.id]
                    ? 'Applied to Live Event'
                    : 'Apply Adjustments to Live Event'}
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {activeScenario.description}
              </p>

              {/* Delta Matrix Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Financial Impact Delta
                  </span>
                  <div className="text-lg font-semibold text-amber-400 font-mono tabular-nums">
                    +{formatCurrency(activeScenario.financialImpact)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    Drawn from operations contingency
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-400" /> Schedule Delay Factor
                  </span>
                  <div className="text-lg font-semibold text-sky-400 font-mono tabular-nums">
                    +{activeScenario.timelineDelayMinutes} Minutes
                  </div>
                  <div className="text-xs text-zinc-400">
                    Run-of-show cue drift
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1">
                  <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Operational Action Items
                  </span>
                  <div className="text-lg font-semibold text-emerald-400 font-mono tabular-nums">
                    {activeScenario.mitigationSteps.length} Protocols
                  </div>
                  <div className="text-xs text-zinc-400">
                    Step-by-step checklist
                  </div>
                </div>
              </div>
            </div>

            {/* Step-by-Step Mitigation Checklist */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">
                    Mitigation Protocols & Immediate Actions
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Click each item to check off operational milestones as they are executed.
                  </p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {
                    activeScenario.mitigationSteps.filter(
                      (_, i) => completedSteps[`${activeScenario.id}-step-${i}`]
                    ).length
                  }{' '}
                  / {activeScenario.mitigationSteps.length} executed
                </span>
              </div>

              <div className="space-y-2.5">
                {activeScenario.mitigationSteps.map((step, idx) => {
                  const isChecked = !!completedSteps[`${activeScenario.id}-step-${idx}`];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleStep(idx)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label="Toggle step"
                        className="mt-0.5 text-zinc-400 hover:text-indigo-400 shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <span
                        className={`text-xs leading-relaxed ${
                          isChecked ? 'line-through text-zinc-400' : 'text-zinc-200'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Proposed Live System Adjustments */}
            {((activeScenario.budgetAdjustments && activeScenario.budgetAdjustments.length > 0) ||
              (activeScenario.timelineInsertions && activeScenario.timelineInsertions.length > 0)) && (
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-zinc-100 border-b border-zinc-800 pb-3">
                  Live System Rebalance Schedule
                </h4>

                {activeScenario.budgetAdjustments && activeScenario.budgetAdjustments.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-mono text-zinc-400">
                      Proposed Category Allocations:
                    </span>
                    <div className="space-y-1.5">
                      {activeScenario.budgetAdjustments.map((adj, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs"
                        >
                          <span className="text-zinc-300">{adj.reason}</span>
                          <span className="font-mono text-amber-400 font-semibold">
                            +{formatCurrency(adj.deltaAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeScenario.timelineInsertions && activeScenario.timelineInsertions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono text-zinc-400">
                      Emergency Run-of-Show Milestones:
                    </span>
                    <div className="space-y-1.5">
                      {activeScenario.timelineInsertions.map((ins, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded bg-zinc-950 border border-zinc-800 text-xs"
                        >
                          <span className="text-zinc-300">{ins.title}</span>
                          <span className="font-mono text-indigo-400">
                            [{ins.timeOrDate}] · {ins.assignee}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
