"use client";

import { useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { useDictionary } from "@/components/dictionary-provider";
import {
  clear,
  listEntries,
  type ListingType,
  type SearchHistoryEntry,
} from "@/lib/search-history";
import { cn } from "@/lib/utils";

const LIST_TYPES: ListingType[] = ["buy", "rent"];
const STORAGE_KEY_PREFIX = "predileto:search-history";

interface SearchHistorySidebarProps {
  /** When true, render inside a <details> wrapper for mobile. */
  collapsible?: boolean;
}

const EMPTY_SNAPSHOT = JSON.stringify({ buy: [], rent: [] });

function getSnapshot(): string {
  try {
    if (typeof window === "undefined") return EMPTY_SNAPSHOT;
    return JSON.stringify({
      buy: listEntries("buy"),
      rent: listEntries("rent"),
    });
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function getServerSnapshot(): string {
  return EMPTY_SNAPSHOT;
}

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: StorageEvent) => {
    if (!e.key || e.key.startsWith(STORAGE_KEY_PREFIX)) onChange();
  };
  const customHandler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener("predileto:search-history-change", customHandler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("predileto:search-history-change", customHandler);
  };
}

export function SearchHistorySidebar({
  collapsible = false,
}: SearchHistorySidebarProps) {
  const dict = useDictionary();
  const sh = (dict as unknown as Record<string, Record<string, string>>)
    .searchHistory;

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const entries = JSON.parse(snapshot) as Record<ListingType, SearchHistoryEntry[]>;

  const onClear = useCallback((type: ListingType) => {
    clear(type);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("predileto:search-history-change"));
    }
  }, []);

  const total = entries.buy.length + entries.rent.length;

  const body = (
    <div className="space-y-5">
      {LIST_TYPES.map((type) => (
        <HistoryList
          key={type}
          type={type}
          entries={entries[type]}
          dict={sh}
          onClear={() => onClear(type)}
        />
      ))}
      {total === 0 && (
        <p className="text-xs text-ink-muted leading-relaxed">
          {sh?.empty ?? "Ainda não tens pesquisas guardadas."}
        </p>
      )}
    </div>
  );

  if (collapsible) {
    return (
      <details className="border border-rule bg-paper">
        <summary className="text-sm font-medium cursor-pointer px-3 py-2 select-none">
          {sh?.title ?? "Histórico"}
          {total > 0 && (
            <span className="ml-2 text-xs text-ink-muted">({total})</span>
          )}
        </summary>
        <div className="px-3 pb-3 pt-1">{body}</div>
      </details>
    );
  }

  return (
    <aside className="border border-rule bg-paper p-4">
      <h2 className="font-heading text-sm font-bold mb-4">
        {sh?.title ?? "Histórico"}
      </h2>
      {body}
    </aside>
  );
}

function HistoryList({
  type,
  entries,
  dict,
  onClear,
}: {
  type: ListingType;
  entries: SearchHistoryEntry[];
  dict: Record<string, string> | undefined;
  onClear: () => void;
}) {
  const heading =
    type === "buy"
      ? dict?.headingBuy ?? "Comprar"
      : dict?.headingRent ?? "Arrendar";

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-xs uppercase tracking-[0.14em] font-semibold text-ink-secondary">
          {heading}
        </h3>
        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline cursor-pointer"
          >
            {dict?.clear ?? "Limpar"}
          </button>
        )}
      </div>
      {entries.length === 0 ? (
        <p className="text-xs text-ink-muted leading-relaxed">
          {dict?.emptyList ?? "Sem pesquisas."}
        </p>
      ) : (
        <ul className="space-y-1">
          {entries.map((entry) => (
            <li key={`${entry.url}-${entry.timestamp}`}>
              <Link
                href={entry.url}
                className={cn(
                  "block py-1.5 px-2 -mx-2 rounded-sm text-sm",
                  "hover:bg-paper-muted transition-colors",
                )}
              >
                <span className="block truncate font-medium">
                  {entry.label}
                </span>
                <span className="block text-[11px] text-ink-muted mt-0.5">
                  {formatCount(entry.count, dict)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function formatCount(
  count: number,
  dict: Record<string, string> | undefined,
): string {
  if (count === 1) return dict?.countOne ?? "1 resultado";
  const tpl = dict?.countMany ?? "{count} resultados";
  return tpl.replace("{count}", String(count));
}
