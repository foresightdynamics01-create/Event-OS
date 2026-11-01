/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Download, Upload, Check, FileText, Database } from 'lucide-react';
import {
  EventBlueprint,
  BudgetCategory,
  BudgetItem,
  TimelineTask,
  VendorRecord,
} from '../types/event';
import { generateMarkdownReport, downloadFile } from '../utils/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  blueprint: EventBlueprint;
  categories: BudgetCategory[];
  expenses: BudgetItem[];
  tasks: TimelineTask[];
  vendors: VendorRecord[];
  onImportBackup: (data: {
    blueprint: EventBlueprint;
    categories: BudgetCategory[];
    expenses: BudgetItem[];
    tasks: TimelineTask[];
    vendors: VendorRecord[];
  }) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  blueprint,
  categories,
  expenses,
  tasks,
  vendors,
  onImportBackup,
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'backup'>('markdown');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const markdownContent = generateMarkdownReport(
    blueprint,
    categories,
    expenses,
    tasks,
    vendors
  );

  const backupData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    blueprint,
    categories,
    expenses,
    tasks,
    vendors,
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const filename = `${blueprint.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_dossier.md`;
    downloadFile(markdownContent, filename, 'text/markdown;charset=utf-8');
  };

  const handleDownloadBackup = () => {
    const filename = `${blueprint.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_eventos_backup.json`;
    downloadFile(
      JSON.stringify(backupData, null, 2),
      filename,
      'application/json;charset=utf-8'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.blueprint || !parsed.categories || !parsed.expenses) {
          throw new Error('Invalid EventOS backup schema. Missing critical records.');
        }
        onImportBackup(parsed);
        onClose();
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div>
            <h2 id="export-title" className="text-lg font-semibold text-zinc-100">
              Export Dossier & System Backup
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Portable, human-readable markdown documentation or full JSON backup state.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-4 pb-2 border-b border-zinc-800 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('markdown')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'markdown'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Executive Dossier (Markdown)
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'backup'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-4 h-4" />
            JSON Backup & Restore
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'markdown' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">
                  Format: GitHub-Flavored Markdown (GFM)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Markdown
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleDownloadMarkdown}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download .md
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800/80 font-mono text-xs text-zinc-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                {markdownContent}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                <h4 className="text-sm font-medium text-zinc-200">
                  Export Complete State
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Download an uncorrupted JSON snapshot containing your event blueprint, all itemized expenses, priority categories, run-of-show tasks, and audited vendor contracts.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleDownloadBackup}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    Download JSON Backup
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
                <h4 className="text-sm font-medium text-zinc-200">
                  Restore from JSON Backup
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Upload a previously exported JSON backup file to restore event configurations and items.
                </p>
                {importError && (
                  <div className="p-2.5 rounded bg-red-950/60 border border-red-900/50 text-xs text-red-300">
                    {importError}
                  </div>
                )}
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Select Backup File
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
