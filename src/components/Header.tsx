/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, BookOpen, Check } from 'lucide-react';
import { ActiveWorkflow } from '../types/event';

interface HeaderProps {
  activeWorkflow: ActiveWorkflow;
  onSelectWorkflow: (wf: ActiveWorkflow) => void;
  onOpenExport: () => void;
  onOpenPrinciples: () => void;
  isSaving: boolean;
  lastSavedAt: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeWorkflow,
  onSelectWorkflow,
  onOpenExport,
  onOpenPrinciples,
  isSaving,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element wordmark, no compound badges) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectWorkflow('blueprint');
            }}
            className="text-base font-semibold tracking-tight text-zinc-100 hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block" />
            Celebration Studio
            <span className="text-xs font-mono text-zinc-400 font-normal">EventOS</span>
          </a>
        </div>

        {/* Zone 2: 5 Concise Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            onClick={() => onSelectWorkflow('blueprint')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-100 ${
              activeWorkflow === 'blueprint'
                ? 'text-zinc-100 font-semibold'
                : 'text-zinc-400'
            }`}
          >
            Blueprint
          </button>
          <button
            onClick={() => onSelectWorkflow('budget')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-100 ${
              activeWorkflow === 'budget'
                ? 'text-zinc-100 font-semibold'
                : 'text-zinc-400'
            }`}
          >
            Budget Engine
          </button>
          <button
            onClick={() => onSelectWorkflow('timeline')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-100 ${
              activeWorkflow === 'timeline'
                ? 'text-zinc-100 font-semibold'
                : 'text-zinc-400'
            }`}
          >
            Timeline & Graph
          </button>
          <button
            onClick={() => onSelectWorkflow('stress_tester')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-100 ${
              activeWorkflow === 'stress_tester'
                ? 'text-zinc-100 font-semibold'
                : 'text-zinc-400'
            }`}
          >
            Stress-Tester
          </button>
          <button
            onClick={() => onSelectWorkflow('vendors')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-100 ${
              activeWorkflow === 'vendors'
                ? 'text-zinc-100 font-semibold'
                : 'text-zinc-400'
            }`}
          >
            Vendor Auditor
          </button>
          <button
            onClick={() => onSelectWorkflow('concierge')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-zinc-100 flex items-center gap-1.5 ${
              activeWorkflow === 'concierge'
                ? 'text-indigo-400 font-semibold'
                : 'text-zinc-400'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Concierge Desk
          </button>
        </nav>

        {/* Zone 3: Primary Action + Design Principles */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-400">
            {isSaving ? (
              <span className="text-zinc-400">Saving...</span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-400">
                <Check className="w-3 h-3 text-emerald-500" /> Synced locally
              </span>
            )}
          </div>

          <button
            onClick={onOpenPrinciples}
            aria-label="Norman Design Principles"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Design Principles</span>
          </button>

          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Dossier
          </button>
        </div>
      </div>
    </header>
  );
};
