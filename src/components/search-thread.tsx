"use client";

import type { LocationSelection } from "@/lib/estate-os";

export interface SearchMessage {
  id: string;
  query: string;
  location: LocationSelection | null;
  at: number;
}

interface SearchThreadProps {
  messages: SearchMessage[];
}

export function SearchThread({ messages }: SearchThreadProps) {
  if (messages.length === 0) return null;

  return (
    <ul className="space-y-3">
      {messages.map((m) => (
        <li key={m.id} className="leading-snug">
          <p className="text-sm text-ink break-words">
            <span
              className="bg-[linear-gradient(180deg,transparent_55%,hsl(172_85%_55%/0.55)_55%,hsl(172_85%_55%/0.55)_92%,transparent_92%)] [box-decoration-break:clone] [-webkit-box-decoration-break:clone] px-0.5 -mx-0.5"
            >
              {m.query || m.location?.name || "Pesquisa"}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-muted">{formatRelative(m.at)}</p>
        </li>
      ))}
    </ul>
  );
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatRelative(at: number, now = Date.now()): string {
  const diff = Math.max(0, now - at);
  if (diff < MINUTE) return "agora mesmo";
  if (diff < HOUR) {
    const m = Math.floor(diff / MINUTE);
    return `há ${m} min`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    return `há ${h} h`;
  }
  const d = Math.floor(diff / DAY);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}
