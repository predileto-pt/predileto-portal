"use client";

import { useSearchParams } from "next/navigation";
import { getNewsEntries } from "@/lib/news";

const updates = getNewsEntries();

export function UpdatesSidebar() {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  if (selectedId) return null;

  return (
    <div className="lg:sticky lg:top-4 border border-gray-200 p-3 max-w-[200px] lg:ml-auto">
      <h2 className="text-[9px] text-gray-400 uppercase mb-2">Novidades</h2>
      <ul className="space-y-2">
        {updates.map((update) => (
          <li key={update.date}>
            <p className="text-[10px] text-gray-600">{update.description}</p>
            <time className="text-[9px] text-gray-400">{update.date}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
