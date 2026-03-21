"use client";

import { useState, useMemo } from "react";
import { tracking } from "@/lib/tracking";
import { formatPrice } from "@/lib/utils";

interface FinancingSimulationCTAProps {
  propertyId: string;
  propertyPrice: number;
  locale: string;
  dict: Record<string, string>;
}

export function FinancingSimulationCTA({
  propertyId,
  propertyPrice,
  locale,
  dict,
}: FinancingSimulationCTAProps) {
  const [open, setOpen] = useState(false);
  const defaultLoan = Math.round(propertyPrice * 0.8);
  const [loanAmount, setLoanAmount] = useState(defaultLoan);
  const [termYears, setTermYears] = useState(30);
  const [rate, setRate] = useState(3.5);

  const monthlyPayment = useMemo(() => {
    const monthlyRate = rate / 100 / 12;
    const n = termYears * 12;
    if (monthlyRate === 0) return loanAmount / n;
    return (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  }, [loanAmount, termYears, rate]);

  const totalCost = monthlyPayment * termYears * 12;
  const totalInterest = totalCost - loanAmount;
  const downPayment = propertyPrice - loanAmount;

  function handleSimulate() {
    tracking.trackFinancingSimulation(propertyId, { loanAmount, termYears, rate });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 border border-gray-200 hover:border-gray-300 p-4 transition-colors group cursor-pointer"
      >
        <div className="flex size-10 items-center justify-center bg-amber-50 text-amber-600 shrink-0">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-sm font-medium group-hover:text-amber-600 transition-colors">
            {dict.financingSimulation}
          </p>
          <p className="text-xs text-gray-400">{dict.financingSimulationDesc}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="border border-amber-200 bg-amber-50/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{dict.financingSimulation}</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          &#x2715;
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <label htmlFor="fs-loan">{dict.loanAmount}</label>
            <span>{formatPrice(loanAmount, locale)}</span>
          </div>
          <input
            id="fs-loan"
            type="range"
            min={propertyPrice * 0.1}
            max={propertyPrice * 0.9}
            step={5000}
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            onMouseUp={handleSimulate}
            onTouchEnd={handleSimulate}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <label htmlFor="fs-term">{dict.term}</label>
            <span>{termYears} {dict.years}</span>
          </div>
          <input
            id="fs-term"
            type="range"
            min={5}
            max={40}
            step={1}
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
            onMouseUp={handleSimulate}
            onTouchEnd={handleSimulate}
            className="w-full accent-amber-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <label htmlFor="fs-rate">{dict.interestRate}</label>
            <span>{rate.toFixed(1)}%</span>
          </div>
          <input
            id="fs-rate"
            type="range"
            min={1}
            max={8}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            onMouseUp={handleSimulate}
            onTouchEnd={handleSimulate}
            className="w-full accent-amber-500"
          />
        </div>
      </div>

      <div className="border-t border-amber-200 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{dict.monthlyPayment}</span>
          <span className="font-bold text-amber-700">{formatPrice(Math.round(monthlyPayment), locale)}{dict.perMonth}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{dict.downPayment}</span>
          <span>{formatPrice(downPayment, locale)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{dict.totalInterest}</span>
          <span>{formatPrice(Math.round(totalInterest), locale)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{dict.totalCost}</span>
          <span>{formatPrice(Math.round(totalCost), locale)}</span>
        </div>
      </div>
    </div>
  );
}
