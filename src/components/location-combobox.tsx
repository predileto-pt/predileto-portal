"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type {
  DistrictNode,
  LocationSelection,
  LocationTree,
} from "@/lib/estate-os";

type Status = "loading" | "ready" | "empty" | "error";

interface LocationComboboxProps {
  value: LocationSelection | null;
  onChange: (value: LocationSelection | null) => void;
  /** Render hint — defaults to "trigger" (button that opens the panel). */
  variant?: "trigger" | "inline";
  className?: string;
  placeholder?: string;
}

/**
 * Hierarchical location picker fed by `/api/listings/locations`.
 * Each row (district / municipality / parish) is selectable; the chosen
 * selection bubbles up as `{ level, name }`.
 */
export function LocationCombobox({
  value,
  onChange,
  variant = "trigger",
  className,
  placeholder = "Selecione uma localização",
}: LocationComboboxProps) {
  const [tree, setTree] = useState<LocationTree | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [reloadKey, setReloadKey] = useState(0);

  function retry() {
    setStatus("loading");
    setTree(null);
    setReloadKey((k) => k + 1);
  }
  const [open, setOpen] = useState(false);
  const [expandedDistricts, setExpandedDistricts] = useState<Set<string>>(
    new Set(),
  );
  const [expandedMunis, setExpandedMunis] = useState<Set<string>>(new Set());
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/listings/locations")
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        return res.json() as Promise<LocationTree>;
      })
      .then((data) => {
        if (cancelled) return;
        const districtsPresent = (data.countries ?? []).some(
          (c) => c.districts.length > 0,
        );
        if (!districtsPresent) {
          setTree({ countries: [] });
          setStatus("empty");
          return;
        }
        setTree(data);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // v1 ships only Portugal populated; we flatten all countries' districts into
  // a single sorted list and render parish > municipality > district as before.
  // When multi-country lands, wrap this in a country grouping layer.
  const sortedDistricts = useMemo<DistrictNode[]>(() => {
    if (!tree) return [];
    const all = tree.countries.flatMap((c) => c.districts);
    return all
      .sort((a, b) => a.name.localeCompare(b.name, "pt"))
      .map((d) => ({
        ...d,
        municipalities: [...d.municipalities]
          .sort((a, b) => a.name.localeCompare(b.name, "pt"))
          .map((m) => ({
            ...m,
            parishes: [...m.parishes].sort((a, b) =>
              a.localeCompare(b, "pt"),
            ),
          })),
      }));
  }, [tree]);

  function pick(selection: LocationSelection) {
    onChange(selection);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function toggleDistrict(name: string) {
    setExpandedDistricts((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function toggleMuni(key: string) {
    setExpandedMunis((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const t = e.target as Node;
      if (
        panelRef.current?.contains(t) ||
        triggerRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const labelText = value ? value.name : placeholder;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 text-sm cursor-pointer transition-colors",
          variant === "trigger"
            ? "h-9 px-3 border border-rule bg-paper hover:border-ink-subtle"
            : "h-9 px-3 border border-rule bg-paper hover:border-ink-subtle",
          value ? "text-ink" : "text-ink-muted",
        )}
      >
        <PinIcon />
        <span className="truncate max-w-[12rem]">{labelText}</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="listbox"
          aria-label="Localização"
          className="absolute z-50 left-0 mt-1 w-[20rem] max-h-[24rem] overflow-y-auto border border-rule bg-paper shadow-lg p-1"
        >
          {status === "loading" && (
            <div className="px-3 py-6 text-center text-xs text-ink-muted">
              A carregar localizações…
            </div>
          )}
          {status === "error" && (
            <div className="px-3 py-6 text-center text-xs text-ink-secondary space-y-2">
              <p>Não foi possível carregar localizações.</p>
              <button
                type="button"
                onClick={retry}
                className="text-primary underline underline-offset-2 cursor-pointer"
              >
                Tentar novamente
              </button>
            </div>
          )}
          {status === "empty" && (
            <div className="px-3 py-6 text-center text-xs text-ink-muted">
              Sem localizações disponíveis.
            </div>
          )}
          {status === "ready" && (
            <ul className="space-y-0.5">
              {sortedDistricts.map((district) => {
                const districtKey = `d:${district.name}`;
                const districtOpen = expandedDistricts.has(district.name);
                const isSelectedDistrict =
                  value?.level === "district" && value.name === district.name;
                return (
                  <li key={districtKey}>
                    <div className="flex items-center">
                      <button
                        type="button"
                        aria-label={
                          districtOpen
                            ? `Recolher ${district.name}`
                            : `Expandir ${district.name}`
                        }
                        onClick={() => toggleDistrict(district.name)}
                        className="w-6 h-7 flex items-center justify-center rounded hover:bg-paper-muted cursor-pointer text-ink-muted"
                      >
                        <DisclosureIcon open={districtOpen} />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          pick({ level: "district", name: district.name })
                        }
                        role="option"
                        aria-selected={isSelectedDistrict}
                        className={cn(
                          "flex-1 text-left text-sm px-2 py-1.5 hover:bg-paper-muted cursor-pointer",
                          isSelectedDistrict && "bg-primary/10 text-primary",
                        )}
                      >
                        {district.name}
                      </button>
                    </div>
                    {districtOpen && (
                      <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-rule pl-1.5">
                        {district.municipalities.map((muni) => {
                          const muniKey = `m:${district.name}/${muni.name}`;
                          const muniOpen = expandedMunis.has(muniKey);
                          const isSelectedMuni =
                            value?.level === "municipality" &&
                            value.name === muni.name;
                          return (
                            <li key={muniKey}>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  aria-label={
                                    muniOpen
                                      ? `Recolher ${muni.name}`
                                      : `Expandir ${muni.name}`
                                  }
                                  onClick={() => toggleMuni(muniKey)}
                                  disabled={muni.parishes.length === 0}
                                  className="w-6 h-7 flex items-center justify-center rounded hover:bg-paper-muted cursor-pointer text-ink-muted disabled:opacity-30 disabled:cursor-default disabled:hover:bg-transparent"
                                >
                                  <DisclosureIcon open={muniOpen} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    pick({
                                      level: "municipality",
                                      name: muni.name,
                                    })
                                  }
                                  role="option"
                                  aria-selected={isSelectedMuni}
                                  className={cn(
                                    "flex-1 text-left text-sm px-2 py-1.5 hover:bg-paper-muted cursor-pointer",
                                    isSelectedMuni &&
                                      "bg-primary/10 text-primary",
                                  )}
                                >
                                  {muni.name}
                                </button>
                              </div>
                              {muniOpen && (
                                <ul className="ml-6 mt-0.5 space-y-0.5 border-l border-rule pl-1.5">
                                  {muni.parishes.map((parish) => {
                                    const isSelectedParish =
                                      value?.level === "parish" &&
                                      value.name === parish;
                                    return (
                                      <li key={`p:${muniKey}/${parish}`}>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            pick({
                                              level: "parish",
                                              name: parish,
                                            })
                                          }
                                          role="option"
                                          aria-selected={isSelectedParish}
                                          className={cn(
                                            "block w-full text-left text-sm px-2 py-1.5 hover:bg-paper-muted cursor-pointer",
                                            isSelectedParish &&
                                              "bg-primary/10 text-primary",
                                          )}
                                        >
                                          {parish}
                                        </button>
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {value && status === "ready" && (
            <div className="border-t border-rule mt-1 pt-1">
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="w-full text-left text-xs px-2 py-1 hover:bg-paper-muted text-ink-secondary cursor-pointer"
              >
                Limpar seleção
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5 shrink-0"
      aria-hidden
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "w-3 h-3 shrink-0 transition-transform",
        open && "rotate-180",
      )}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function DisclosureIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("w-3 h-3 transition-transform", open && "rotate-90")}
      aria-hidden
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
