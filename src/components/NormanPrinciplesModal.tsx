/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, CheckCircle2, ShieldCheck, Compass, GitMerge, Sliders, RefreshCw, AlertTriangle } from 'lucide-react';

interface NormanPrinciplesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRINCIPLES = [
  {
    num: '01',
    name: 'Affordances',
    icon: Sliders,
    summary: 'Interactive cues for rebalancing and editing without guessing.',
    implementation:
      'Grips on budget sliders, explicit status toggles, clear priority tags, and dedicated rebalance buttons communicate interaction capabilities directly.',
  },
  {
    num: '02',
    name: 'Signifiers',
    icon: CheckCircle2,
    summary: 'Clear status meters and dependency indicators.',
    implementation:
      'Accessible semantic progress bars (role="progressbar"), critical-path milestone badges, and live financial variance chips make state immediately perceptible.',
  },
  {
    num: '03',
    name: 'Natural Mapping',
    icon: Compass,
    summary: 'Spatial and conceptual alignment of controls with real-world results.',
    implementation:
      'Adjusting a budget allocation slider visually reflects in real-time category health and adjusts the remaining operations contingency pool proportionately.',
  },
  {
    num: '04',
    name: 'Immediate Feedback',
    icon: RefreshCw,
    summary: 'Instant micro-state reactions to user input.',
    implementation:
      'Debounced local persistence indicator, instant recalculation of tax/gratuity, and real-time graph cycle verification upon each dependency selection.',
  },
  {
    num: '05',
    name: 'Conceptual Model',
    icon: GitMerge,
    summary: 'Transparent mental model connecting budget, timeline, and vendors.',
    implementation:
      'Every itemized expense maps to a vendor and category; every timeline milestone links to run-of-show phases and critical paths, preventing fractured planning.',
  },
  {
    num: '06',
    name: 'Smart Constraints',
    icon: ShieldCheck,
    summary: 'System boundaries preventing impossible states.',
    implementation:
      'DFS cycle-detection algorithm prevents impossible circular task ordering (e.g. A depends on B depends on A). Budget sliders enforce $0 to total cap boundaries.',
  },
  {
    num: '07',
    name: 'Error Prevention & Recovery',
    icon: AlertTriangle,
    summary: 'No destructive surprises; reversible actions.',
    implementation:
      'Custom accessible confirmation dialogs (role="alertdialog") protect against accidental resets; soft warning thresholds trigger before budget overruns occur.',
  },
];

export const NormanPrinciplesModal: React.FC<NormanPrinciplesModalProps> = ({
  isOpen,
  onClose,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="norman-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[88vh] overflow-y-auto p-6 shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 id="norman-title" className="text-xl font-semibold tracking-tight">
              Don Norman's 7 Principles of Real-World Design
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              How cognitive design psychology governs EventOS AI's orchestration architecture.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {PRINCIPLES.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.num}
                className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-zinc-800 text-indigo-400 shrink-0 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-zinc-400">
                        {p.num}
                      </span>
                      <h3 className="text-sm font-semibold text-zinc-200">
                        {p.name}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 font-medium">
                      {p.summary}
                    </p>
                    <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                      <strong className="text-zinc-300 font-medium">EventOS Application: </strong>
                      {p.implementation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
          >
            Close Reference
          </button>
        </div>
      </div>
    </div>
  );
};
