/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  RotateCcw,
  User,
  Zap,
  Info,
  ChevronDown,
  Table,
} from 'lucide-react';
import {
  EventBlueprint,
  BudgetCategory,
  BudgetItem,
  TimelineTask,
  VendorRecord,
} from '../types/event';
import { computeExpenseTrueCost, formatCurrency } from '../utils/budget';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ConciergeChatProps {
  blueprint: EventBlueprint;
  categories: BudgetCategory[];
  expenses: BudgetItem[];
  tasks: TimelineTask[];
  vendors: VendorRecord[];
}

const STORAGE_CHAT_KEY = 'eventos_sarah_chat_history_v1';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    role: 'assistant',
    content:
      "Ready to assist with your production schedules, itemized budget allocations, or vendor negotiations. What logistical question or calculation would you like to run?",
    timestamp: 'Just now',
  },
];

export const ConciergeChat: React.FC<ConciergeChatProps> = ({
  blueprint,
  categories,
  expenses,
  tasks,
  vendors,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CHAT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_MESSAGES;
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speedMode, setSpeedMode] = useState<'general' | 'fast'>('general');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const totalActualCost = expenses.reduce((s, e) => s + computeExpenseTrueCost(e), 0);
  const criticalTasks = tasks.filter((t) => t.isCriticalPath);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input.trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newThread = [...messages, userMsg];
    setMessages(newThread);
    if (!customPrompt) setInput('');
    setIsLoading(true);

    try {
      // Build event context
      const eventContext = {
        title: blueprint.title,
        type: blueprint.type,
        date: blueprint.date,
        guestCount: blueprint.guestCount,
        targetBudget: blueprint.targetBudget,
        contingencyBufferPct: blueprint.contingencyBufferPct,
        venueName: blueprint.venueName,
        location: blueprint.location,
        productionNotes: blueprint.productionNotes,
        categories: categories.map((c) => ({
          name: c.name,
          priority: c.priority,
          allocatedAmount: c.allocatedAmount,
          targetSharePct: c.targetSharePct,
        })),
        totalActualCost,
        criticalTaskCount: criticalTasks.length,
      };

      const res = await fetch('/api/concierge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newThread.map((m) => ({ role: m.role, content: m.content })),
          eventContext,
          speedMode,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Concierge assistant unreachable.');
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Calculation complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetThread = () => {
    setMessages(INITIAL_MESSAGES);
    localStorage.removeItem(STORAGE_CHAT_KEY);
  };

  // Helper to render markdown-like tables, bold text, and paragraphs cleanly
  const renderMessageContent = (content: string) => {
    // Check if message has a markdown table
    if (content.includes('|') && content.includes('\n|')) {
      const lines = content.split('\n');
      const tableLines: string[] = [];
      const nonTableLines: string[] = [];
      let inTable = false;

      for (const line of lines) {
        if (line.trim().startsWith('|')) {
          inTable = true;
          tableLines.push(line);
        } else {
          if (inTable && line.trim() === '') {
            inTable = false;
          }
          if (!inTable) {
            nonTableLines.push(line);
          }
        }
      }

      return (
        <div className="space-y-3">
          {nonTableLines.length > 0 && (
            <div className="whitespace-pre-wrap leading-relaxed text-xs">
              {nonTableLines.join('\n').trim()}
            </div>
          )}
          {tableLines.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-zinc-800 my-2">
              <table className="w-full text-left text-xs">
                <tbody>
                  {tableLines.map((row, rIdx) => {
                    const cells = row
                      .split('|')
                      .map((c) => c.trim())
                      .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
                    if (row.includes('---')) return null; // separator row

                    const isHeader = rIdx === 0;
                    return (
                      <tr
                        key={rIdx}
                        className={
                          isHeader
                            ? 'bg-zinc-950 font-mono text-zinc-400 border-b border-zinc-800 font-medium'
                            : 'hover:bg-zinc-800/40 border-b border-zinc-800/50'
                        }
                      >
                        {cells.map((cell, cIdx) => (
                          <td
                            key={cIdx}
                            className={`py-2 px-3 ${
                              !isNaN(Number(cell.replace(/[\$,%]/g, '')))
                                ? 'text-right font-mono tabular-nums'
                                : ''
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-xs">
        {content}
      </div>
    );
  };

  const PROMPT_SUGGESTIONS = [
    'Calculate per-guest cost breakdown across all 6 budget categories',
    'Audit our contingency buffer vs. potential catering cost overruns',
    'What are the critical-path bottleneck tasks for day-of load-in?',
    'Review the Artisan Hearth estimate for overtime rate risks',
  ];

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl flex flex-col h-[750px] shadow-2xl overflow-hidden">
      {/* Concierge Desk Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-950/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src="/src/assets/images/producer_avatar_1793552717561.jpg"
              alt="Sarah Jenkins"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-950 absolute bottom-0 right-0" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                Sarah Jenkins
              </h2>
              <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50">
                Lead Concierge
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Celebration Studio · Direct, organized, mathematically grounded event counsel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setSpeedMode('general')}
              className={`px-2.5 py-1 rounded transition-colors ${
                speedMode === 'general'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Gemini 3.8 Flash (balanced reasoning)"
            >
              Standard
            </button>
            <button
              onClick={() => setSpeedMode('fast')}
              className={`px-2.5 py-1 rounded transition-colors ${
                speedMode === 'fast'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Gemini 3.1 Flash Lite (ultra-fast responses)"
            >
              Fast
            </button>
          </div>

          <button
            onClick={handleResetThread}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            title="Reset conversation thread"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grounded Event Ribbon */}
      <div className="px-5 py-2 bg-zinc-950/40 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div className="truncate max-w-lg">
          <span className="text-zinc-300 font-medium">{blueprint.title}</span>
          <span className="mx-2">·</span>
          <span>{blueprint.guestCount} Pax</span>
          <span className="mx-2">·</span>
          <span>{formatCurrency(blueprint.targetBudget)} Cap</span>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>Actual Spent: {formatCurrency(totalActualCost)}</span>
          <span>Buffer: {blueprint.contingencyBufferPct}%</span>
        </div>
      </div>

      {/* Scrollable Conversation Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {isUser ? (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              ) : (
                <img
                  src="/src/assets/images/producer_avatar_1793552717561.jpg"
                  alt="Sarah"
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 text-xs space-y-1.5 leading-relaxed shadow-sm ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-xs opacity-60 font-mono">
                  <span>{isUser ? 'You' : 'Sarah Jenkins'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                {renderMessageContent(msg.content)}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <img
              src="/src/assets/images/producer_avatar_1793552717561.jpg"
              alt="Sarah"
              referrerPolicy="no-referrer"
              className="w-7 h-7 rounded-full object-cover border border-zinc-700 shrink-0 mt-0.5"
            />
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl rounded-tl-none p-3.5 text-xs text-zinc-400 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span>Sarah is calculating logistical formulas...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-900/50 text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-zinc-800/80 bg-zinc-950/40 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-zinc-400 shrink-0 font-mono text-xs">Inquire:</span>
          {PROMPT_SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded bg-zinc-800/70 hover:bg-zinc-800 text-zinc-300 whitespace-nowrap transition-colors border border-zinc-700/60 shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Composer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask Sarah about per-guest math, timeline bottlenecks, or contract audit..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Consult</span>
          </button>
        </form>
      </div>
    </div>
  );
};
