"use client";

import { useSearchParams } from "next/navigation";
import { getNewsEntries } from "@/lib/news";
import { Small } from "@/components/ui/small";

const updates = getNewsEntries();

export function UpdatesSidebar() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  if (selectedId) return null;

  return (
    <div className="lg:sticky lg:top-4 border border-gray-200 bg-white p-3 max-w-[200px] lg:ml-auto">
      <h2 className="text-xs text-gray-400 uppercase mb-2">Novidades</h2>
      <ul className="space-y-2">
        {updates.map((update) => (
          <li key={update.date}>
            <p className="text-xs text-gray-600">{update.description}</p>
            <Small as="time">{update.date}</Small>
          </li>
        ))}
      </ul>
    </div>
  );
}
