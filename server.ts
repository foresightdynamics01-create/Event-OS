/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '1mb' }));

// Shared Google GenAI client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-3.8-flash';

/**
 * Defensive parser that extracts JSON safely even if wrapped in markdown blocks
 */
function extractAndParseJSON<T>(text: string, fallback: T): T {
  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('JSON parsing failed, returning fallback structure', err);
    return fallback;
  }
}

async function callGeminiSafe(prompt: string, systemInstruction: string) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  try {
    const response = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });
    return response.text || '{}';
  } catch (primaryErr) {
    console.warn(`Primary model ${PRIMARY_MODEL} call failed, attempting fallback:`, primaryErr);
    const response = await ai.models.generateContent({
      model: FALLBACK_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });
    return response.text || '{}';
  }
}

// -------------------------------------------------------------
// API Route 1: Synthesize Event Blueprint
// -------------------------------------------------------------
app.post('/api/blueprint/synthesize', async (req: Request, res: Response) => {
  try {
    const { title, type, date, guestCount, targetBudget, venueName, location, productionNotes } = req.body;

    if (!title || !type) {
      return res.status(400).json({ error: 'Title and event type are required.' });
    }

    const systemPrompt = `You are a world-class luxury event producer and logistical director who operates with Don Norman's real-world design discipline, high craftsmanship, and zero generic marketing fluff.
You are designing an operational event blueprint for a high-stakes occasion.
Always respond strictly in valid JSON matching this schema:
{
  "executiveSummary": "Concise 2-3 sentence operational scope describing run-of-show logistics, architectural conditions, guest density, and critical constraints.",
  "keyDirectives": ["4-5 concrete, actionable production rules addressing acoustics, catering load-in, municipal permits, power, or guest egress."],
  "contingencyBufferPct": 8,
  "recommendedMilestones": [
    {
      "phase": "week_of",
      "title": "Title of task",
      "assignee": "Role title",
      "timeOrDate": "e.g. T-3 Days or 09:00 AM",
      "description": "Specific logistical detail",
      "isCriticalPath": true
    }
  ]
}`;

    const userPrompt = `Synthesize an operational event blueprint for:
- Event: ${title} (${type})
- Date: ${date || 'Upcoming'}
- Location: ${venueName || 'Designated Venue'}, ${location || 'San Francisco'}
- Guest Count: ${guestCount || 140} attendees
- Target Budget: $${targetBudget || 68000}
- Production Notes: ${productionNotes || 'None provided'}`;

    const text = await callGeminiSafe(userPrompt, systemPrompt);
    const data = extractAndParseJSON(text, {
      executiveSummary: `${title} is planned for ${guestCount} attendees with a target cap of $${targetBudget}. Special focus on vendor coordination and timely run-of-show execution.`,
      keyDirectives: [
        'Enforce strict vendor dock load-in intervals to prevent bottlenecking.',
        'Verify emergency egress and acoustic limits with municipal authorities.',
        'Maintain a 8-10% dedicated contingency cash reserve.',
        'Execute final electrical load test 4 hours prior to guest arrival.',
      ],
      contingencyBufferPct: 8,
      recommendedMilestones: [],
    });

    return res.json(data);
  } catch (error: any) {
    console.error('Error in /api/blueprint/synthesize:', error);
    return res.status(500).json({
      error: error.message || 'Failed to synthesize event blueprint.',
    });
  }
});

// -------------------------------------------------------------
// API Route 2: Simulate Stress Test ("What-If" Contingency Engine)
// -------------------------------------------------------------
app.post('/api/stress-test/simulate', async (req: Request, res: Response) => {
  try {
    const { scenarioTitle, scenarioDescription, guestCount, currentBudget, categories } = req.body;

    if (!scenarioTitle) {
      return res.status(400).json({ error: 'Scenario title is required.' });
    }

    const systemPrompt = `You are an event crisis management and operational continuity director.
Analyze the stress test scenario mathematically and operationally.
Compute real-world financial cost delta, timeline slip in minutes, severity tier ('low', 'moderate', 'high', 'critical'), and step-by-step mitigation protocols.
Always respond strictly in valid JSON matching this schema:
{
  "financialImpact": 3500,
  "timelineDelayMinutes": 45,
  "severity": "high",
  "category": "Logistical Disruption",
  "mitigationSteps": [
    "5 concrete, step-by-step protocol instructions"
  ],
  "budgetAdjustments": [
    {
      "categoryId": "operations_contingency",
      "deltaAmount": 2000,
      "reason": "Emergency equipment mobilization"
    }
  ],
  "timelineInsertions": [
    {
      "phase": "day_of_run_of_show",
      "title": "Task title",
      "assignee": "Role title",
      "timeOrDate": "Time or phase",
      "isCriticalPath": true
    }
  ]
}`;

    const userPrompt = `Simulate this event contingency scenario:
Scenario: ${scenarioTitle}
Details: ${scenarioDescription || 'None provided'}
Current Event Scale: ${guestCount || 140} guests, Total Budget: $${currentBudget || 68000}
Categories: ${JSON.stringify(categories || [])}`;

    const text = await callGeminiSafe(userPrompt, systemPrompt);
    const data = extractAndParseJSON(text, {
      financialImpact: 2500,
      timelineDelayMinutes: 30,
      severity: 'moderate',
      category: 'General Contingency',
      mitigationSteps: [
        'Notify executive producer and lead coordinators immediately.',
        'Review contract clause terms for supplier remedy.',
        'Draw from operations contingency reserve fund.',
        'Adjust call sheets and brief on-site crew leads.',
      ],
      budgetAdjustments: [],
      timelineInsertions: [],
    });

    return res.json(data);
  } catch (error: any) {
    console.error('Error in /api/stress-test/simulate:', error);
    return res.status(500).json({
      error: error.message || 'Failed to simulate scenario.',
    });
  }
});

// -------------------------------------------------------------
// API Route 3: Vendor Contract & Hidden Fee Auditor
// -------------------------------------------------------------
app.post('/api/contract/audit', async (req: Request, res: Response) => {
  try {
    const { rawQuoteText, vendorName, serviceCategory } = req.body;

    if (!rawQuoteText || rawQuoteText.trim().length < 10) {
      return res.status(400).json({ error: 'Valid contract or quote text is required for auditing.' });
    }

    const systemPrompt = `You are a seasoned event contract negotiator and forensic procurement auditor.
Audit the provided vendor quote/contract text with razor-sharp scrutiny.
Look for:
1. Stealth / hidden fees (undisclosed service surcharges, administration markups, mandatory 22%+ auto-gratuities, fuel surcharges, breakdown disposal fines, overtime rate multipliers).
2. Restrictive clauses (onerous cancellation policies, non-refundable retainers, one-sided force majeure terms).
3. Provide an Auditor Rating ('Pass', 'Caution', 'High Risk') and concise executive summary.
4. Draft a respectful, polished, but firm counter-offer letter ready to send to the vendor.

Always respond strictly in valid JSON matching this schema:
{
  "auditorRating": "Caution",
  "summary": "2-3 sentence executive audit findings",
  "stealthFees": [
    {
      "title": "Fee Name",
      "cost": 1200,
      "description": "Why this fee is considered stealth or inflated",
      "risk": "high"
    }
  ],
  "restrictiveClauses": [
    {
      "title": "Clause Title",
      "explanation": "Specific legal or operational risk to the event",
      "riskLevel": "Critical"
    }
  ],
  "counterOfferDraft": "Full polite, professional counter-offer email text"
}`;

    const userPrompt = `Audit this vendor proposal:
Vendor: ${vendorName || 'Vendor'} (${serviceCategory || 'Event Supplier'})
Contract Text:
"""
${rawQuoteText.slice(0, 4000)}
"""`;

    const text = await callGeminiSafe(userPrompt, systemPrompt);
    const data = extractAndParseJSON(text, {
      auditorRating: 'Caution',
      summary: 'Audited contract schedule. Review administrative surcharges and overtime labor rates prior to signing.',
      stealthFees: [],
      restrictiveClauses: [],
      counterOfferDraft: `Dear ${vendorName || 'Vendor'},\n\nThank you for submitting your proposal. Upon review with our event production directorate, we would like to clarify and align on a few schedule terms before finalizing our agreement...\n\nSincerely,\nEvent Operations Directorate`,
    });

    return res.json({
      ...data,
      auditedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/contract/audit:', error);
    return res.status(500).json({
      error: error.message || 'Failed to audit vendor contract.',
    });
  }
});

// -------------------------------------------------------------
// API Route 4: Concierge Multi-Turn Chat (Sarah Jenkins)
// -------------------------------------------------------------
const SARAH_SYSTEM_INSTRUCTION = `You are Sarah Jenkins, Lead Celebration Concierge and trusted event planner at Celebration Studio.
Your style is direct, warm, highly organized, and mathematically accurate.

CORE RULES (ACCURACY & ZERO REPETITION):
1. STRICT ANTI-REPETITION & PROGRESSIVE MEMORY:
   - Always review prior messages in the conversation history.
   - NEVER repeat greetings, introductions ("I'm Sarah..."), or advice you already gave in earlier turns.
   - If the user asks a follow-up or specific question, answer that question IMMEDIATELY. Do not re-summarize their entire event or repeat their budget totals unless directly requested.
   - Do NOT output repetitive "Next Steps" or checklists if you already provided them previously.

2. FACTUAL ACCURACY & EXACT ARITHMETIC:
   - Ground all numbers, category allocations, guest counts, and dates strictly in the provided Event Context.
   - Calculate exact math: Per-Guest Cost = Category Budget / Guest Count; Remaining Buffer = Ceiling - Total Allocated.
   - Never invent nonexistent vendor policies, contracts, or fictional constraints. If a detail is unknown (e.g., local sound curfews), specify what needs to be verified with the venue manager.

3. ADAPTIVE FORMATTING:
   - Use clean Markdown tables ONLY when presenting numeric data, category comparisons, or quote forensics.
   - For quick questions, advice, or logistical doubts, respond conversationally with crisp paragraphs and bullet points.
   - Avoid robotic AI cliches ("As an AI language model", "Certainly!", "EventOS AI is here to assist").`;

app.post('/api/concierge/chat', async (req: Request, res: Response) => {
  try {
    const { messages, eventContext, speedMode } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const selectedModel = speedMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    // Format context into system instruction
    let contextPrompt = SARAH_SYSTEM_INSTRUCTION;
    if (eventContext) {
      contextPrompt += `\n\nCURRENT EVENT CONTEXT IN CELEBRATION STUDIO:
- Event: "${eventContext.title || 'The Glasshouse Conservatory Gala'}" (${eventContext.type || 'Gala & Reception'})
- Date: ${eventContext.date || '2026-10-24'}
- Venue: ${eventContext.venueName || 'The Palm & Steel Conservatory Pavilion'}, ${eventContext.location || 'San Francisco, CA'}
- Guest Count: ${eventContext.guestCount || 140} attendees
- Target Budget Cap: $${eventContext.targetBudget || 68000}
- Operations Contingency Buffer: ${eventContext.contingencyBufferPct || 8}%
- Category Allocations:
${(eventContext.categories || [])
  .map((c: any) => `  * ${c.name} (Tier ${c.priority}): $${c.allocatedAmount} (${c.targetSharePct}%)`)
  .join('\n')}
- Total Actual Committed True Cost: $${eventContext.totalActualCost || 0}
- Active Critical Path Tasks: ${eventContext.criticalTaskCount || 0} tasks
- Primary Production Notes: ${eventContext.productionNotes || 'None'}`;
    }

    // Convert messages to GenAI contents structure
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: contextPrompt,
      },
    });

    const reply = response.text || '';
    return res.json({ reply, modelUsed: selectedModel });
  } catch (error: any) {
    console.error('Error in /api/concierge/chat:', error);
    return res.status(500).json({
      error: error.message || 'Concierge consultation service unavailable.',
    });
  }
});


// -------------------------------------------------------------
// Vite Dev Server / Static File Serving
// -------------------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[EventOS] Production server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[EventOS] Server failed to start:', err);
  process.exit(1);
});
