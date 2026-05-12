"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  typologyLabels,
  type Typology,
} from "@/lib/search-rules";

/**
 * Per-typology dot color. Picked from the brand palette + neutrals so the
 * stacked indicator reads at a glance without leaning on hue alone.
 */
const TYPOLOGY_COLOR: Record<Typology, string> = {
  house: "hsl(172 66% 42%)", // primary teal
  apartment: "hsl(38 92% 50%)", // accent amber
  land: "hsl(142 71% 45%)", // emerald
  ruin: "hsl(25 5% 45%)", // warm gray
};

interface TypologyMultiSelectProps {
  options: Typology[];
  value: Typology[];
  onChange: (next: Typology[]) => void;
  label?: string;
}

export function TypologyMultiSelect({
  options,
  value,
  onChange,
  label = "Tipologia",
}: TypologyMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(t: Typology) {
    onChange(value.includes(t) ? value.filter((x) => x !== t) : [...value, t]);
  }

  const ariaLabel = `${label}. ${value.length} de ${options.length} selecionadas`;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3 text-sm font-heading",
          "bg-paper border border-rule cursor-pointer",
          "hover:border-ink-muted/60 transition-colors",
          open && "border-ink-muted/60",
        )}
      >
        {/* Stacked colored dots — one per option, dimmed when not selected */}
        <span
          aria-hidden
          className="inline-flex items-center"
          style={{ paddingRight: options.length > 1 ? 4 : 0 }}
        >
          {options.map((t, i) => {
            const selected = value.includes(t);
            return (
              <span
                key={t}
                className="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-paper transition-opacity"
                style={{
                  backgroundColor: TYPOLOGY_COLOR[t],
                  marginLeft: i === 0 ? 0 : -4,
                  opacity: selected ? 1 : 0.25,
                }}
              />
            );
          })}
        </span>

        <span className="text-ink">{label}</span>

        <span
          aria-label={ariaLabel}
          className="inline-flex items-center justify-center min-w-7 h-5 px-1.5 bg-paper-muted text-ink-secondary text-[11px] font-medium tabular-nums rounded"
        >
          {value.length}/{options.length}
        </span>

        <svg
          className={cn(
            "w-4 h-4 text-ink-muted transition-transform shrink-0",
            open && "rotate-180",
          )}
          viewBox="0 0 16 16"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.0607 5.49999L13.5303 6.03032L8.7071 10.8535C8.31658 11.2441 7.68341 11.2441 7.29289 10.8535L2.46966 6.03032L1.93933 5.49999L2.99999 4.43933L3.53032 4.96966L7.99999 9.43933L12.4697 4.96966L13 4.43933L14.0607 5.49999Z"
            fill="currentColor"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          className="absolute z-50 mt-1 min-w-[220px] left-0 bg-paper border border-rule shadow-lg p-1"
        >
          {options.map((t) => {
            const selected = value.includes(t);
            return (
              <button
                key={t}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggle(t)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-1.5 text-sm cursor-pointer",
                  "text-ink hover:bg-paper-muted transition-colors",
                )}
              >
                <span
                  className="shrink-0 w-4 h-4 inline-flex items-center justify-center border rounded-[3px]"
                  style={{
                    backgroundColor: selected
                      ? TYPOLOGY_COLOR[t]
                      : "transparent",
                    borderColor: selected
                      ? TYPOLOGY_COLOR[t]
                      : "var(--color-rule)",
                  }}
                  aria-hidden
                >
                  {selected && (
                    <svg
                      className="w-3 h-3 text-paper"
                      viewBox="0 0 12 12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="2 6 5 9 10 3" />
                    </svg>
                  )}
                </span>
                <span className="flex-1 text-left">{typologyLabels[t]}</span>
                <span
                  className="shrink-0 w-2 h-2 rounded-full"
                  style={{ backgroundColor: TYPOLOGY_COLOR[t] }}
                  aria-hidden
                />
              </button>
            );
          })}

          {value.length > 0 && (
            <>
              <div className="h-px bg-rule my-1" />
              <button
                type="button"
                onClick={() => onChange([])}
                className="w-full text-left px-2 py-1.5 text-xs text-ink-muted hover:text-ink hover:bg-paper-muted cursor-pointer transition-colors"
              >
                Limpar seleção
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
