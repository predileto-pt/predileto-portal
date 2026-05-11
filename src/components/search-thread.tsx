"use client";

import { Small } from "@/components/ui/small";

export interface SearchMessage {
  id: string;
  query: string;
  adults: number;
  children: number;
  at: number;
}

interface SearchThreadProps {
  messages: SearchMessage[];
}

export function SearchThread({ messages }: SearchThreadProps) {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-2">
      <ul className="space-y-2">
        {messages.map((m) => (
          <li
            key={m.id}
            className="border border-rule bg-paper px-3 py-2 text-sm leading-body"
          >
            <p className="text-ink whitespace-pre-wrap break-words">
              {m.query}
            </p>
            <Small variant="meta" className="mt-1 flex gap-2">
              <span>
                {m.adults} {m.adults === 1 ? "adulto" : "adultos"}
              </span>
              {m.children > 0 && (
                <span>
                  {m.children} {m.children === 1 ? "criança" : "crianças"}
                </span>
              )}
            </Small>
          </li>
        ))}
      </ul>
    </div>
  );
}
