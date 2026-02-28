import { getNewsEntries } from "@/lib/news";

interface NewsFeedProps {
  heading: string;
}

export function NewsFeed({ heading }: NewsFeedProps) {
  const entries = getNewsEntries();

  return (
    <div className="border border-gray-200 p-4">
      <h2 className="text-[11px] text-gray-400 uppercase mb-3">{heading}</h2>
      <ul className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <li key={entry.date} className="py-3 first:pt-0 last:pb-0">
            <p className="text-[12px] text-gray-600">{entry.description}</p>
            <time className="text-[10px] text-gray-400">{entry.date}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
