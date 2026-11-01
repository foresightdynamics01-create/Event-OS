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
        <div className="relative h-64 sm:h-72 w-full bg-zinc-900">
          <img
            src={venueImage || '/images/glasshouse_conservatory_venue.jpg'}
            alt="Venue Architecture"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-85 contrast-105"
            onError={(e) => {
              if (e.currentTarget.src !== window.location.origin + '/images/glasshouse_conservatory_venue.jpg') {
                e.currentTarget.src = '/images/glasshouse_conservatory_venue.jpg';
              }
            }}
          />
          {/* Measured Dark Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
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

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onResetToSample}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-700/80 rounded-lg transition-colors backdrop-blur-md"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Reset Sample
            </button>
            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors shadow-lg shadow-indigo-950/50"
            >
              {isSynthesizing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synthesizing Blueprint...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Synthesize Event Blueprint
                </>
              )}
            </button>
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
          <div className="border-b border-zinc-800 pb-3">
            <h2 className="text-sm font-semibold text-zinc-100">
              Event Specification & Bounds
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Foundational parameters governing budget formulas and run-of-show.
            </p>
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
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">
                  Operational Blueprint Scope
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Executive production overview formulated for on-site leads.
                </p>
              </div>
              {blueprint.synthesizedAt && (
                <span className="text-xs font-mono text-zinc-400">
                  Last calibrated {new Date(blueprint.synthesizedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-normal">
              {blueprint.executiveSummary ||
                'No operational summary synthesized yet. Click "Synthesize Event Blueprint" to generate production guidelines using Gemini Flash.'}
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
