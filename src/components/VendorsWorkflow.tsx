/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSearch,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { VendorRecord, ContractAuditResult } from '../types/event';
import { formatCurrency } from '../utils/budget';

interface VendorsWorkflowProps {
  vendors: VendorRecord[];
  onUpdateVendors: (vendors: VendorRecord[]) => void;
  onOpenConfirmDialog: (config: {
    title: string;
    description: string;
    onConfirm: () => void;
    isDestructive?: boolean;
  }) => void;
}

export const VendorsWorkflow: React.FC<VendorsWorkflowProps> = ({
  vendors,
  onUpdateVendors,
  onOpenConfirmDialog,
}) => {
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');
  const [rawQuoteInput, setRawQuoteInput] = useState<string>(vendors[0]?.rawQuoteText || '');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Add Vendor Modal
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newContractTotal, setNewContractTotal] = useState('');
  const [newDeposit, setNewDeposit] = useState('');

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  const handleSelectVendor = (v: VendorRecord) => {
    setSelectedVendorId(v.id);
    setRawQuoteInput(v.rawQuoteText || '');
    setAuditError(null);
  };

  const handleRunAudit = async () => {
    if (!rawQuoteInput.trim()) {
      setAuditError('Please paste or enter raw vendor quote terms to audit.');
      return;
    }

    setIsAuditing(true);
    setAuditError(null);

    try {
      const res = await fetch('/api/contract/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorName: selectedVendor?.companyName || 'Event Vendor',
          serviceCategory: selectedVendor?.serviceCategory || 'Hospitality & Production',
          rawQuoteText: rawQuoteInput,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Contract forensic audit failed.');
      }

      const auditData: ContractAuditResult = await res.json();

      const updated = vendors.map((v) =>
        v.id === selectedVendor.id
          ? {
              ...v,
              rawQuoteText: rawQuoteInput,
              auditResult: auditData,
            }
          : v
      );

      onUpdateVendors(updated);
    } catch (err: any) {
      setAuditError(err.message || 'Error executing contract audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const handleDeleteVendor = (id: string, name: string) => {
    onOpenConfirmDialog({
      title: 'Remove Vendor Record',
      description: `Are you sure you want to delete "${name}" from vendor registry?`,
      isDestructive: true,
      onConfirm: () => {
        const remaining = vendors.filter((v) => v.id !== id);
        onUpdateVendors(remaining);
        if (selectedVendorId === id && remaining.length > 0) {
          setSelectedVendorId(remaining[0].id);
          setRawQuoteInput(remaining[0].rawQuoteText || '');
        }
      },
    });
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;

    const total = parseFloat(newContractTotal) || 0;
    const dep = parseFloat(newDeposit) || 0;

    const newRec: VendorRecord = {
      id: `vnd-${Date.now()}`,
      companyName: newCompany.trim(),
      serviceCategory: newCategory.trim() || 'General Production',
      contactName: newContact.trim() || 'Account Representative',
      email: newEmail.trim() || 'contact@vendor.com',
      phone: newPhone.trim() || '',
      contractTotal: total,
      depositPaid: dep,
      balanceRemaining: Math.max(0, total - dep),
      status: 'in_review',
      notes: '',
    };

    onUpdateVendors([...vendors, newRec]);
    setSelectedVendorId(newRec.id);
    setRawQuoteInput('');
    setIsAddVendorOpen(false);
    // Reset form
    setNewCompany('');
    setNewCategory('');
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
    setNewContractTotal('');
    setNewDeposit('');
  };

  // Calculations
  const totalContracted = vendors.reduce((s, v) => s + v.contractTotal, 0);
  const totalDeposits = vendors.reduce((s, v) => s + v.depositPaid, 0);
  const totalBalances = vendors.reduce((s, v) => s + v.balanceRemaining, 0);

  return (
    <div className="space-y-8">
      {/* 3-Column Vendor Ledger Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Total Contract Commitments</span>
          <div className="text-xl font-semibold text-zinc-100 font-mono tabular-nums">
            {formatCurrency(totalContracted)}
          </div>
          <div className="text-xs text-zinc-400">{vendors.length} contracted suppliers</div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Deposits Disbursed</span>
          <div className="text-xl font-semibold text-emerald-400 font-mono tabular-nums">
            {formatCurrency(totalDeposits)}
          </div>
          <div className="text-xs text-zinc-400">
            {Math.round((totalDeposits / (totalContracted || 1)) * 100)}% of commitments funded
          </div>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1">
          <span className="text-xs text-zinc-400 font-medium">Outstanding Balances</span>
          <div className="text-xl font-semibold text-amber-400 font-mono tabular-nums">
            {formatCurrency(totalBalances)}
          </div>
          <div className="text-xs text-zinc-400">Due on delivery / NET 30</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Vendor Registry (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-xs font-semibold text-zinc-200">Vendor Registry</span>
              <button
                onClick={() => setIsAddVendorOpen(true)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Vendor
              </button>
            </div>

            <div className="space-y-2">
              {vendors.map((v) => {
                const isSelected = v.id === selectedVendor?.id;
                const statusBadge =
                  v.status === 'signed'
                    ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/40'
                    : v.status === 'in_review'
                    ? 'text-amber-400 border-amber-900/50 bg-amber-950/40'
                    : 'text-zinc-400 border-zinc-800 bg-zinc-900';

                return (
                  <div
                    key={v.id}
                    onClick={() => handleSelectVendor(v)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-zinc-800/90 border-indigo-500/80 shadow-sm'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded border font-mono ${statusBadge}`}>
                        {v.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono tabular-nums text-zinc-300">
                        {formatCurrency(v.contractTotal)}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-zinc-100">{v.companyName}</h4>
                    <p className="text-xs text-zinc-400 truncate">{v.serviceCategory}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-xs text-zinc-400">
                      <span>{v.contactName}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteVendor(v.id, v.companyName);
                        }}
                        className="p-1 hover:text-red-400 transition-colors"
                        title="Delete vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Contract Auditor & Negotiation (8 cols) */}
        {selectedVendor && (
          <div className="lg:col-span-8 space-y-6">
            {/* Vendor Profile Header */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    {selectedVendor.companyName}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedVendor.serviceCategory} · Lead Contact: {selectedVendor.contactName}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                  {selectedVendor.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-zinc-400" />
                      {selectedVendor.email}
                    </span>
                  )}
                  {selectedVendor.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {selectedVendor.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="grid grid-cols-3 gap-3 pt-1 text-xs font-mono">
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-400 block">Total Contract:</span>
                  <span className="text-zinc-200 font-semibold tabular-nums text-sm">
                    {formatCurrency(selectedVendor.contractTotal)}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-400 block">Deposit Paid:</span>
                  <span className="text-emerald-400 font-semibold tabular-nums text-sm">
                    {formatCurrency(selectedVendor.depositPaid)}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800">
                  <span className="text-zinc-400 block">Balance Remaining:</span>
                  <span className="text-amber-400 font-semibold tabular-nums text-sm">
                    {formatCurrency(selectedVendor.balanceRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contract Auditor Input & Trigger */}
            <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <FileSearch className="w-4 h-4 text-indigo-400" />
                    Forensic Contract & Hidden Fee Auditor
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Paste raw quote terms, fine print, or estimate schedules to extract undisclosed fees and restrictive liabilities.
                  </p>
                </div>

                <button
                  onClick={handleRunAudit}
                  disabled={isAuditing}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
                >
                  {isAuditing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Auditing Terms...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Audit Contract Terms
                    </>
                  )}
                </button>
              </div>

              {auditError && (
                <p className="text-xs text-red-300 bg-red-950/60 p-2.5 rounded border border-red-900/50">
                  {auditError}
                </p>
              )}

              <div>
                <textarea
                  rows={6}
                  placeholder="Paste vendor estimate schedules, fee structures, overtime tiers, and cancellation terms..."
                  value={rawQuoteInput}
                  onChange={(e) => setRawQuoteInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Audit Results Panel */}
              {selectedVendor.auditResult && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-400 font-medium">Auditor Assessment:</span>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded border font-mono font-semibold ${
                            selectedVendor.auditResult.auditorRating === 'Pass'
                              ? 'text-emerald-400 border-emerald-900/50 bg-emerald-950/40'
                              : selectedVendor.auditResult.auditorRating === 'Caution'
                              ? 'text-amber-400 border-amber-900/50 bg-amber-950/40'
                              : 'text-red-400 border-red-900/50 bg-red-950/40'
                          }`}
                        >
                          {selectedVendor.auditResult.auditorRating}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-400 font-mono">
                        Audited {new Date(selectedVendor.auditResult.auditedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {selectedVendor.auditResult.summary}
                    </p>
                  </div>

                  {/* Stealth Fees List */}
                  {selectedVendor.auditResult.stealthFees.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-400">
                        Stealth Surcharges & Hidden Markups Detected:
                      </span>
                      <div className="space-y-2">
                        {selectedVendor.auditResult.stealthFees.map((fee, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-start justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-zinc-200">{fee.title}</span>
                                <span
                                  className={`text-xs px-1.5 py-0.2 rounded border font-mono ${
                                    fee.risk === 'high'
                                      ? 'text-red-400 border-red-900/50'
                                      : 'text-amber-400 border-amber-900/50'
                                  }`}
                                >
                                  {fee.risk} risk
                                </span>
                              </div>
                              <p className="text-zinc-400">{fee.description}</p>
                            </div>
                            <span className="font-mono text-red-400 font-semibold tabular-nums shrink-0">
                              +{formatCurrency(fee.cost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Restrictive Clauses */}
                  {selectedVendor.auditResult.restrictiveClauses.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-400">
                        Restrictive Liabilities & Legal Traps:
                      </span>
                      <div className="space-y-2">
                        {selectedVendor.auditResult.restrictiveClauses.map((clause, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1 text-xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-zinc-200">{clause.title}</span>
                              <span className="font-mono text-xs text-amber-400">
                                {clause.riskLevel}
                              </span>
                            </div>
                            <p className="text-zinc-400 leading-relaxed">{clause.explanation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Counter-Offer Negotiation Draft */}
                  {selectedVendor.auditResult.counterOfferDraft && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-zinc-400">
                          Polite & Firm Counter-Offer Email Draft:
                        </span>
                        <button
                          onClick={() =>
                            handleCopyDraft(selectedVendor.auditResult!.counterOfferDraft)
                          }
                          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
                        >
                          {copiedDraft ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Copied Letter
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Counter-Offer
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed select-all">
                        {selectedVendor.auditResult.counterOfferDraft}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {isAddVendorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsAddVendorOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-2xl text-zinc-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-zinc-100 pb-2 border-b border-zinc-800">
              Register New Vendor Partner
            </h3>

            <form onSubmit={handleCreateVendor} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Company / Studio Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Lighting & Laser Systems"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Service Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architectural AV, Floral Rigging"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Lead Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="events@company.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="+1 (415) 555-0199"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Total Contract Value ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={newContractTotal}
                    onChange={(e) => setNewContractTotal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Deposit Paid ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="2500"
                    value={newDeposit}
                    onChange={(e) => setNewDeposit(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddVendorOpen(false)}
                  className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 font-medium"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
