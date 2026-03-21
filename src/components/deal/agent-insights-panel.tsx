"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import type { PropertyIntelligence, BuyerScore, PropertyAlert, SuggestedAction } from "@/lib/mock-deal-data";
import type { IntentLevel } from "@/lib/tracking";

interface AgentInsightsPanelProps {
  intelligence: PropertyIntelligence;
  locale: string;
}

const INTENT_STYLES: Record<IntentLevel, { bg: string; text: string; label: string }> = {
  hot: { bg: "bg-red-50", text: "text-red-700", label: "Hot" },
  warm: { bg: "bg-amber-50", text: "text-amber-700", label: "Warm" },
  cold: { bg: "bg-blue-50", text: "text-blue-700", label: "Cold" },
};

const ALERT_STYLES: Record<string, { border: string; bg: string; icon: string }> = {
  warning: { border: "border-amber-200", bg: "bg-amber-50", icon: "text-amber-500" },
  info: { border: "border-blue-200", bg: "bg-blue-50", icon: "text-blue-500" },
  success: { border: "border-green-200", bg: "bg-green-50", icon: "text-green-500" },
};

const PRIORITY_STYLES: Record<string, { dot: string }> = {
  high: { dot: "bg-red-500" },
  medium: { dot: "bg-amber-500" },
  low: { dot: "bg-gray-400" },
};

function BuyerRow({ buyer, locale }: { buyer: BuyerScore; locale: string }) {
  const intent = INTENT_STYLES[buyer.intentLevel];
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="flex size-8 items-center justify-center bg-gray-100 text-xs font-bold text-gray-600 shrink-0">
        {buyer.score}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{buyer.name}</p>
          <span className={`text-[10px] px-1.5 py-0.5 font-medium ${intent.bg} ${intent.text}`}>
            {intent.label}
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Budget: {formatPrice(buyer.budget.min, locale)} – {formatPrice(buyer.budget.max, locale)}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {buyer.matchReasons.map((r) => (
            <span key={r} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5">
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: PropertyAlert }) {
  const style = ALERT_STYLES[alert.type] || ALERT_STYLES.info;
  return (
    <div className={`border ${style.border} ${style.bg} p-3`}>
      <p className="text-xs font-medium">{alert.title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
    </div>
  );
}

function ActionCard({ action }: { action: SuggestedAction }) {
  const style = PRIORITY_STYLES[action.priority] || PRIORITY_STYLES.low;
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className={`size-2 rounded-full mt-1.5 shrink-0 ${style.dot}`} />
      <div>
        <p className="text-xs font-medium">{action.action}</p>
        <p className="text-xs text-gray-400">{action.reason}</p>
      </div>
    </div>
  );
}

export function AgentInsightsPanel({ intelligence, locale }: AgentInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-indigo-200 bg-indigo-50/20">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-indigo-50/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <svg className="size-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <span className="text-xs font-medium text-indigo-700 uppercase tracking-wide">
            Agent Insights
          </span>
        </div>
        <svg
          className={`size-4 text-indigo-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-4">
          {/* Deal Probability */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-indigo-700">{intelligence.dealProbability}%</p>
              <p className="text-[10px] text-gray-400 uppercase">Deal Probability</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{intelligence.estimatedDaysToClose}</p>
              <p className="text-[10px] text-gray-400 uppercase">Est. Days to Close</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-700">{intelligence.topBuyers.length}</p>
              <p className="text-[10px] text-gray-400 uppercase">Matched Buyers</p>
            </div>
          </div>

          {/* Price Analysis */}
          <div>
            <h4 className="text-xs text-gray-400 uppercase mb-2">Price Analysis</h4>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Market Average</span>
                <span>{formatPrice(intelligence.priceAnalysis.marketAverage, locale)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Suggested Range</span>
                <span>
                  {formatPrice(intelligence.priceAnalysis.suggestedRange.min, locale)} –{" "}
                  {formatPrice(intelligence.priceAnalysis.suggestedRange.max, locale)}
                </span>
              </div>
            </div>
          </div>

          {/* Top Buyers */}
          <div>
            <h4 className="text-xs text-gray-400 uppercase mb-2">
              Top Matching Buyers
            </h4>
            <div>
              {intelligence.topBuyers.map((b) => (
                <BuyerRow key={b.id} buyer={b} locale={locale} />
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div>
            <h4 className="text-xs text-gray-400 uppercase mb-2">Alerts</h4>
            <div className="space-y-2">
              {intelligence.alerts.map((a, i) => (
                <AlertCard key={i} alert={a} />
              ))}
            </div>
          </div>

          {/* Suggested Actions */}
          <div>
            <h4 className="text-xs text-gray-400 uppercase mb-2">Suggested Actions</h4>
            <div>
              {intelligence.suggestedActions.map((a, i) => (
                <ActionCard key={i} action={a} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
