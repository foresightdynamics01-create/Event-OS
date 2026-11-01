/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventType =
  | 'Gala & Reception'
  | 'Executive Summit'
  | 'Luxury Wedding'
  | 'Milestone Celebration'
  | 'Private Conclave';

export interface EventBlueprint {
  id: string;
  title: string;
  type: EventType;
  date: string;
  guestCount: number;
  targetBudget: number;
  productionNotes: string;
  venueName: string;
  location: string;
  contingencyBufferPct: number;
  executiveSummary?: string;
  keyDirectives?: string[];
  synthesizedAt?: string;
  isSynthesizing?: boolean;
}

export type CategoryId =
  | 'venue_fb'
  | 'av_lighting'
  | 'photo_film'
  | 'decor_floral'
  | 'entertainment'
  | 'operations_contingency';

export interface BudgetCategory {
  id: CategoryId;
  name: string;
  priority: 1 | 2 | 3 | 4 | 5; // 1 = Critical anchor, 5 = Discretionary flex
  targetSharePct: number;
  allocatedAmount: number;
  description: string;
}

export type ExpenseStatus = 'verified' | 'pending' | 'disputed';

export interface BudgetItem {
  id: string;
  name: string;
  categoryId: CategoryId;
  vendor: string;
  allocatedAmount: number;
  actualAmount: number;
  taxRatePct: number;
  gratuityRatePct: number;
  status: ExpenseStatus;
  notes?: string;
  dueDate?: string;
}

export type TimelinePhase =
  | '6_months_out'
  | '1_month_out'
  | 'week_of'
  | 'day_of_run_of_show';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export interface TimelineTask {
  id: string;
  phase: TimelinePhase;
  title: string;
  description: string;
  timeOrDate: string;
  durationMinutes?: number;
  assignee: string;
  status: TaskStatus;
  isCriticalPath: boolean;
  dependsOn: string[]; // IDs of tasks this task depends on
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycleNodes: string[]; // task IDs in the cycle
  cyclePath: string; // readable e.g. "Catering Load-in -> Power Distribution Check -> Catering Load-in"
}

export interface StealthFee {
  title: string;
  cost: number;
  description: string;
  risk: 'low' | 'medium' | 'high';
}

export interface RestrictiveClause {
  title: string;
  explanation: string;
  riskLevel: 'Caution' | 'Critical' | 'Informational';
}

export interface ContractAuditResult {
  auditorRating: 'Pass' | 'Caution' | 'High Risk';
  summary: string;
  stealthFees: StealthFee[];
  restrictiveClauses: RestrictiveClause[];
  counterOfferDraft: string;
  auditedAt: string;
}

export interface VendorRecord {
  id: string;
  companyName: string;
  serviceCategory: string;
  contactName: string;
  email: string;
  phone: string;
  contractTotal: number;
  depositPaid: number;
  balanceRemaining: number;
  status: 'in_review' | 'signed' | 'revising';
  notes: string;
  rawQuoteText?: string;
  auditResult?: ContractAuditResult;
}

export interface StressScenario {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  category: string;
  financialImpact: number;
  timelineDelayMinutes: number;
  mitigationSteps: string[];
  budgetAdjustments?: {
    categoryId: CategoryId;
    deltaAmount: number;
    reason: string;
  }[];
  timelineInsertions?: {
    phase: TimelinePhase;
    title: string;
    assignee: string;
    timeOrDate: string;
    isCriticalPath: boolean;
  }[];
}

export type ActiveWorkflow =
  | 'blueprint'
  | 'budget'
  | 'timeline'
  | 'stress_tester'
  | 'vendors'
  | 'concierge';
