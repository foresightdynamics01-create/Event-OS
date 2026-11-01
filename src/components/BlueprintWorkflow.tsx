/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Building,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCcw,
} from 'lucide-react';
import { EventBlueprint, EventType } from '../types/event';
import { formatCurrency } from '../utils/budget';
import venueImage from '../assets/images/glasshouse_conservatory_venue_1793552717771.jpg';

interface BlueprintWorkflowProps {
  blueprint: EventBlueprint;
  onUpdateBlueprint: (blueprint: EventBlueprint) => void;
  onResetToSample: () => void;
}

const EVENT_TYPES: EventType[] = [
  'Gala & Reception',
  'Executive Summit',
  'Luxury Wedding',
  'Milestone Celebration',
  'Private Conclave',
];

export const BlueprintWorkflow: React.FC<BlueprintWorkflowProps> = ({
  blueprint,
  onUpdateBlueprint,
  onResetToSample,
}) => {
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthError, setSynthError] = useState<string | null>(null);
  const [synthSuccess, setSynthSuccess] = useState(false);
  const [newDirective, setNewDirective] = useState('');

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setSynthError(null);
    setSynthSuccess(false);

    try {
      const res = await fetch('/api/blueprint/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: blueprint.title,
          type: blueprint.type,
          date: blueprint.date,
          guestCount: blueprint.guestCount,
          targetBudget: blueprint.targetBudget,
          venueName: blueprint.venueName,
          location: blueprint.location,
          productionNotes: blueprint.productionNotes,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize blueprint.');
      }

      const data = await res.json();
      onUpdateBlueprint({
        ...blueprint,
        executiveSummary: data.executiveSummary || blueprint.executiveSummary,
        keyDirectives: data.keyDirectives || blueprint.keyDirectives,
        contingencyBufferPct: data.contingencyBufferPct || blueprint.contingencyBufferPct,
        synthesizedAt: new Date().toISOString(),
      });
      setSynthSuccess(true);
      setTimeout(() => setSynthSuccess(false), 3000);
    } catch (err: any) {
      setSynthError(err.message || 'Error communicating with synthesis engine.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirective.trim()) return;
    const existing = blueprint.keyDirectives || [];
    onUpdateBlueprint({
      ...blueprint,
      keyDirectives: [...existing, newDirective.trim()],
    });
    setNewDirective('');
  };

  const handleRemoveDirective = (index: number) => {
    const existing = blueprint.keyDirectives || [];
    onUpdateBlueprint({
      ...blueprint,
      keyDirectives: existing.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Venue Showcase Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="relative h-64 sm:h-72 w-full bg-zinc-900 overflow-hidden">
          {/* Architectural Glasshouse Conservatory SVG Canvas (Always renders, ensures zero empty blank void) */}
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1200 400"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="archGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                </linearGradient>
                <pattern id="glassGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3f3f46" strokeWidth="0.5" strokeOpacity="0.3" />
                </pattern>
              </defs>
              <rect width="1200" height="400" fill="#09090b" />
              <rect width="1200" height="400" fill="url(#glassGrid)" />
              <rect width="1200" height="400" fill="url(#archGlow)" />
              {/* Grand Arched Conservatory Vaults & Trusses */}
              <path d="M 100 400 C 100 120, 1100 120, 1100 400" fill="none" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.4" />
              <path d="M 200 400 C 200 160, 1000 160, 1000 400" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M 300 400 C 300 200, 900 200, 900 400" fill="none" stroke="#a5b4fc" strokeWidth="1" strokeOpacity="0.3" />
              <path d="M 600 120 L 600 400" fill="none" stroke="#818cf8" strokeWidth="1" strokeOpacity="0.3" />
              <path d="M 450 150 L 450 400" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.2" />
              <path d="M 750 150 L 750 400" fill="none" stroke="#6366f1" strokeWidth="0.8" strokeOpacity="0.2" />
              <circle cx="600" cy="120" r="8" fill="#4f46e5" fillOpacity="0.6" />
              <circle cx="600" cy="240" r="140" fill="none" stroke="#c084fc" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.2" />
            </svg>
          </div>

          <img
            src={venueImage || './images/glasshouse_conservatory_venue.jpg'}
            alt="Venue Architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-85 contrast-105 relative z-10 transition-opacity duration-300"
            onError={(e) => {
              const currentSrc = e.currentTarget.src;
              if (!currentSrc.includes('/images/glasshouse_conservatory_venue.jpg')) {
                e.currentTarget.src = '/images/glasshouse_conservatory_venue.jpg';
              } else if (!currentSrc.includes('./images/glasshouse_conservatory_venue.jpg')) {
                e.currentTarget.src = './images/glasshouse_conservatory_venue.jpg';
              }
            }}
          />
          {/* Measured Dark Scrim */}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent pointer-events-none" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-30 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono tracking-wide">
              <span>{blueprint.type}</span>
              <span aria-hidden="true">·</span>
              <span>{blueprint.venueName}</span>
              <span aria-hidden="true">·</span>
              <span>{blueprint.location}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {blueprint.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Synthesis Feedback Alert */}
      {synthSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-900/50 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          Event blueprint directives successfully synthesized and calibrated with production logistics.
        </div>
      )}
      {synthError && (
        <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-900/50 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          {synthError}
        </div>
      )}

      {/* Grid: Event Setup & Synthesis Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Core Parameters (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Event Specification & Bounds
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Foundational parameters governing budget formulas and run-of-show.
              </p>
            </div>
            <button
              type="button"
              onClick={onResetToSample}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded transition-colors"
              title="Reset parameters to sample fixtures"
            >
              <RefreshCcw className="w-3 h-3" />
              Reset Fixtures
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 mb-1 font-medium">Event Title</label>
              <input
                type="text"
                value={blueprint.title}
                onChange={(e) => onUpdateBlueprint({ ...blueprint, title: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Occasion Type</label>
                <select
                  value={blueprint.type}
                  onChange={(e) =>
                    onUpdateBlueprint({ ...blueprint, type: e.target.value as EventType })
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Event Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={blueprint.date}
                    onChange={(e) => onUpdateBlueprint({ ...blueprint, date: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">
                  Guest Count (Pax)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={blueprint.guestCount}
                    onChange={(e) =>
                      onUpdateBlueprint({
                        ...blueprint,
                        guestCount: Math.max(1, parseInt(e.target.value, 10) || 1),
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-zinc-100 font-mono tabular-nums focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <Users className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">
                  Target Budget Cap
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={blueprint.targetBudget}
                    onChange={(e) =>
                      onUpdateBlueprint({
                        ...blueprint,
                        targetBudget: Math.max(1000, parseInt(e.target.value, 10) || 1000),
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-zinc-100 font-mono tabular-nums focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <DollarSign className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Venue Name</label>
                <input
                  type="text"
                  value={blueprint.venueName}
                  onChange={(e) => onUpdateBlueprint({ ...blueprint, venueName: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Location</label>
                <input
                  type="text"
                  value={blueprint.location}
                  onChange={(e) => onUpdateBlueprint({ ...blueprint, location: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1 font-medium">
                Production Notes & Hard Constraints
              </label>
              <textarea
                rows={4}
                value={blueprint.productionNotes}
                onChange={(e) =>
                  onUpdateBlueprint({ ...blueprint, productionNotes: e.target.value })
                }
                placeholder="Specific acoustic, permitting, catering, or load-in directives..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-100 text-xs focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-zinc-400 font-medium">
                  Operations Contingency Buffer
                </label>
                <span className="font-mono text-zinc-200 tabular-nums">
                  {blueprint.contingencyBufferPct}% ({formatCurrency(
                    (blueprint.targetBudget * blueprint.contingencyBufferPct) / 100
                  )})
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="20"
                value={blueprint.contingencyBufferPct}
                onChange={(e) =>
                  onUpdateBlueprint({
                    ...blueprint,
                    contingencyBufferPct: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Operational Blueprint & Directives (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Executive Summary Panel */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                  Operational Blueprint Scope
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Executive production overview formulated for on-site leads.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                {blueprint.synthesizedAt && (
                  <span className="text-xs font-mono text-zinc-400">
                    Calibrated {new Date(blueprint.synthesizedAt).toLocaleDateString()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSynthesize}
                  disabled={isSynthesizing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  {isSynthesizing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Calibrating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Calibrate Scope</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              {blueprint.executiveSummary ||
                'No operational summary synthesized yet. Click "Calibrate Scope" to generate production guidelines using Gemini Flash.'}
            </p>
          </div>

          {/* Key Production Directives */}
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Key Production Directives
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Non-negotiable operational covenants and engineering constraints.
                </p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {blueprint.keyDirectives?.length || 0} active
              </span>
            </div>

            <div className="space-y-2.5">
              {(blueprint.keyDirectives || []).map((directive, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-200 group"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-indigo-400 text-xs shrink-0 mt-0.5">
                      0{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{directive}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDirective(idx)}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 transition-opacity p-1"
                    title="Remove directive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Directive Form */}
            <form onSubmit={handleAddDirective} className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder="Add custom operational directive or curfew rule..."
                value={newDirective}
                onChange={(e) => setNewDirective(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Directive
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
