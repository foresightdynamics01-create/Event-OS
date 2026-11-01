/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  Plus,
  Trash2,
  GitBranch,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { TimelineTask, TimelinePhase, TaskStatus } from '../types/event';
import { detectGraphCycles, wouldIntroduceCycle } from '../utils/graph';

interface TimelineWorkflowProps {
  tasks: TimelineTask[];
  onUpdateTasks: (tasks: TimelineTask[]) => void;
  onOpenConfirmDialog: (config: {
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }) => void;
}

const PHASES: { id: TimelinePhase; title: string; subtitle: string }[] = [
  { id: '6_months_out', title: 'Phase I: 6 Months Out', subtitle: 'Master contracts, venue locks, municipal permits' },
  { id: '1_month_out', title: 'Phase II: 1 Month Out', subtitle: 'Acoustics calibration, RSVP counts, structural sign-offs' },
  { id: 'week_of', title: 'Phase III: Week Of', subtitle: 'Staggered dock logistics, weather monitoring, cellar delivery' },
  { id: 'day_of_run_of_show', title: 'Phase IV: Day-Of Run-of-Show', subtitle: 'Hourly timed cues, doors open, speeches, strike curfew' },
];

export const TimelineWorkflow: React.FC<TimelineWorkflowProps> = ({
  tasks,
  onUpdateTasks,
  onOpenConfirmDialog,
}) => {
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState<string>('all');
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newPhase, setNewPhase] = useState<TimelinePhase>('day_of_run_of_show');
  const [newTime, setNewTime] = useState('');
  const [newAssignee, setNewAssignee] = useState('Executive Producer');
  const [newDesc, setNewDesc] = useState('');
  const [newIsCritical, setNewIsCritical] = useState(false);
  const [newDependsOn, setNewDependsOn] = useState<string[]>([]);
  const [formCycleWarning, setFormCycleWarning] = useState<string | null>(null);

  // Memoized DFS Graph Cycle Detection algorithm
  const cycleResult = useMemo(() => detectGraphCycles(tasks), [tasks]);

  // Status toggle handler
  const handleToggleStatus = (taskId: string) => {
    const sequence: TaskStatus[] = ['pending', 'in_progress', 'completed', 'blocked'];
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextIdx = (sequence.indexOf(t.status) + 1) % sequence.length;
        return { ...t, status: sequence[nextIdx] };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Critical path toggle handler
  const handleToggleCritical = (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, isCriticalPath: !t.isCriticalPath } : t
    );
    onUpdateTasks(updated);
  };

  // Remove task
  const handleDeleteTask = (taskId: string, title: string) => {
    onOpenConfirmDialog({
      title: 'Remove Timeline Task',
      description: `Are you sure you want to remove "${title}"? Any downstream tasks depending on it will be updated.`,
      isDestructive: true,
      onConfirm: () => {
        // Remove task and clean up any dependencies pointing to it
        const updated = tasks
          .filter((t) => t.id !== taskId)
          .map((t) => ({
            ...t,
            dependsOn: t.dependsOn.filter((depId) => depId !== taskId),
          }));
        onUpdateTasks(updated);
      },
    });
  };

  // Resolve detected cycle by severing the last cyclic edge
  const handleBreakCycle = () => {
    if (!cycleResult.hasCycle || cycleResult.cycleNodes.length < 2) return;
    const nodeToSever = cycleResult.cycleNodes[cycleResult.cycleNodes.length - 1];
    const previousNode = cycleResult.cycleNodes[cycleResult.cycleNodes.length - 2];

    const updated = tasks.map((t) => {
      if (t.id === nodeToSever) {
        return {
          ...t,
          dependsOn: t.dependsOn.filter((dep) => dep !== previousNode),
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Dependency toggle in Add Task form with cycle detection constraint
  const handleToggleFormDependency = (depTaskId: string) => {
    setFormCycleWarning(null);
    if (newDependsOn.includes(depTaskId)) {
      setNewDependsOn(newDependsOn.filter((id) => id !== depTaskId));
    } else {
      // Simulate adding to check if it would create an impossible cycle
      const tempId = 'temp-task-id';
      const simulatedTasks: TimelineTask[] = [
        ...tasks,
        {
          id: tempId,
          phase: newPhase,
          title: newTitle || 'Temp Task',
          description: '',
          timeOrDate: newTime,
          assignee: newAssignee,
          status: 'pending',
          isCriticalPath: newIsCritical,
          dependsOn: [...newDependsOn, depTaskId],
        },
      ];
      const check = detectGraphCycles(simulatedTasks);
      if (check.hasCycle) {
        setFormCycleWarning(
          `Cannot depend on "${tasks.find((t) => t.id === depTaskId)?.title}". This creates a circular dependency.`
        );
        return;
      }
      setNewDependsOn([...newDependsOn, depTaskId]);
    }
  };

  // Create task submit
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TimelineTask = {
      id: `task-${Date.now()}`,
      phase: newPhase,
      title: newTitle.trim(),
      description: newDesc.trim() || 'No additional notes provided.',
      timeOrDate: newTime.trim() || 'TBD',
      assignee: newAssignee,
      status: 'pending',
      isCriticalPath: newIsCritical,
      dependsOn: newDependsOn,
    };

    onUpdateTasks([...tasks, newTask]);
    setIsAddTaskOpen(false);
    // Reset form
    setNewTitle('');
    setNewDesc('');
    setNewTime('');
    setNewDependsOn([]);
    setFormCycleWarning(null);
  };

  // Memoized task filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) =>
      selectedPhaseFilter === 'all' ? true : t.phase === selectedPhaseFilter
    );
  }, [tasks, selectedPhaseFilter]);

  return (
    <div className="space-y-8">
      {/* Top Header & Overview */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              Critical-Path Timeline & Run-of-Show
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/50">
                DFS Graph Validated
              </span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Production phases, dependency constraints, and bottleneck analysis preventing impossible scheduling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone Task
            </button>
          </div>
        </div>

        {/* Circular Dependency Warning Banner (Norman Principle #6: Smart Constraints) */}
        {cycleResult.hasCycle ? (
          <div className="p-4 rounded-lg bg-red-950/60 border border-red-900/80 text-xs text-red-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-red-300">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                Circular Dependency Detected in Run-of-Show Graph!
              </div>
              <button
                onClick={handleBreakCycle}
                className="px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
              >
                Auto-Break Dependency Cycle
              </button>
            </div>
            <p className="text-zinc-300">
              The following tasks depend on each other in an infinite loop, making run-of-show execution mathematically impossible:
            </p>
            <div className="p-2.5 rounded bg-zinc-950 border border-red-900/50 font-mono text-red-300 break-all">
              {cycleResult.cyclePath}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>DAG Integrity Verified: All {tasks.length} tasks follow a valid non-cyclical execution graph.</span>
            </div>
            <span className="font-mono text-zinc-400">
              {tasks.filter((t) => t.isCriticalPath).length} critical-path bottlenecks
            </span>
          </div>
        )}

        {/* Phase Filter Controls */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setSelectedPhaseFilter('all')}
            className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
              selectedPhaseFilter === 'all'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Phases ({tasks.length})
          </button>
          {PHASES.map((p) => {
            const count = tasks.filter((t) => t.phase === p.id).length;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPhaseFilter(p.id)}
                className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors ${
                  selectedPhaseFilter === p.id
                    ? 'bg-zinc-800 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p.title.split(':')[1]?.trim() || p.title} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured Milestone Phases */}
      <div className="space-y-6">
        {PHASES.map((phase) => {
          const phaseTasks = filteredTasks.filter((t) => t.phase === phase.id);
          if (phaseTasks.length === 0 && selectedPhaseFilter !== 'all') return null;

          return (
            <div
              key={phase.id}
              className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-baseline justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{phase.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{phase.subtitle}</p>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {phaseTasks.length} milestones
                </span>
              </div>

              {phaseTasks.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  No tasks recorded in this phase.
                </div>
              ) : (
                <div className="space-y-3">
                  {phaseTasks.map((task) => {
                    const isCycleNode = cycleResult.cycleNodes.includes(task.id);
                    const dependsOnTitles = task.dependsOn
                      .map((depId) => tasks.find((t) => t.id === depId)?.title)
                      .filter(Boolean);

                    return (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-lg border transition-colors space-y-2.5 ${
                          isCycleNode
                            ? 'bg-red-950/30 border-red-800'
                            : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Time badge */}
                              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 border border-indigo-900/60 px-2 py-0.5 rounded">
                                {task.timeOrDate}
                              </span>

                              {/* Critical path marker */}
                              <button
                                onClick={() => handleToggleCritical(task.id)}
                                className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors ${
                                  task.isCriticalPath
                                    ? 'bg-amber-950/50 text-amber-300 border-amber-900/60 font-semibold'
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-300'
                                }`}
                                title="Click to toggle Critical Path status"
                              >
                                {task.isCriticalPath ? '★ Critical Path' : 'Standard Priority'}
                              </button>

                              <span className="text-xs text-zinc-400">·</span>
                              <span className="text-xs text-zinc-400">{task.assignee}</span>
                            </div>

                            <h4 className="text-xs sm:text-sm font-semibold text-zinc-100">
                              {task.title}
                            </h4>
                          </div>

                          {/* Status toggle & delete */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleToggleStatus(task.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                                task.status === 'completed'
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900/50'
                                  : task.status === 'in_progress'
                                  ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-900/50'
                                  : task.status === 'blocked'
                                  ? 'bg-red-950/60 text-red-300 border border-red-900/50'
                                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                              }`}
                              title="Click to toggle status (Pending ➔ In Progress ➔ Completed ➔ Blocked)"
                            >
                              {task.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                              {task.status === 'in_progress' && <PlayCircle className="w-3 h-3" />}
                              {task.status === 'blocked' && <AlertTriangle className="w-3 h-3" />}
                              {task.status === 'pending' && <Clock className="w-3 h-3" />}
                              <span className="capitalize">{task.status.replace('_', ' ')}</span>
                            </button>

                            <button
                              onClick={() => handleDeleteTask(task.id, task.title)}
                              className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Dependencies row */}
                        {dependsOnTitles.length > 0 && (
                          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
                            <span className="text-zinc-400 flex items-center gap-1 font-mono">
                              <GitBranch className="w-3 h-3" /> Depends on:
                            </span>
                            {dependsOnTitles.map((depTitle, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs"
                              >
                                {depTitle}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsAddTaskOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-zinc-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-zinc-100 pb-2 border-b border-zinc-800">
              Add Run-of-Show Milestone
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 02:00 PM — Sound Check & Acoustic Delay Tuning"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Execution Phase</label>
                  <select
                    value={newPhase}
                    onChange={(e) => setNewPhase(e.target.value as TimelinePhase)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  >
                    {PHASES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Time or Milestone Date</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 02:00 PM or T-48 Hours"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Lead Assignee / Role</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stage Manager, AV Lead"
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="criticalPathCheck"
                    checked={newIsCritical}
                    onChange={(e) => setNewIsCritical(e.target.checked)}
                    className="accent-indigo-600 rounded"
                  />
                  <label htmlFor="criticalPathCheck" className="text-zinc-300 cursor-pointer">
                    Mark as Critical Path task
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Operational Description</label>
                <textarea
                  rows={3}
                  placeholder="Specific actions, safety requirements, and equipment needed..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Dependency selector with DFS cycle constraint */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400">
                  Preceding Dependencies (Cannot execute until these complete):
                </label>
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-zinc-950 border border-zinc-800">
                  {tasks.length === 0 ? (
                    <span className="text-zinc-400">No other tasks to link.</span>
                  ) : (
                    tasks.map((t) => (
                      <label
                        key={t.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-zinc-800/60 cursor-pointer text-zinc-300"
                      >
                        <input
                          type="checkbox"
                          checked={newDependsOn.includes(t.id)}
                          onChange={() => handleToggleFormDependency(t.id)}
                          className="accent-indigo-600 rounded"
                        />
                        <span className="truncate">
                          <strong className="text-indigo-400 font-mono mr-1">
                            [{t.timeOrDate}]
                          </strong>
                          {t.title}
                        </span>
                      </label>
                    ))
                  )}
                </div>
                {formCycleWarning && (
                  <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {formCycleWarning}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium"
                >
                  Create Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
