import { getNewsEntries } from "@/lib/news";
import { Text } from "@/components/ui/text";
import { Small } from "@/components/ui/small";

interface NewsFeedProps {
  heading: string;
}

export function NewsFeed({ heading }: NewsFeedProps) {
  const entries = getNewsEntries();

  return (
    <div className="border border-gray-200 bg-white p-4">
      <h2 className="text-xs text-gray-400 uppercase mb-3">{heading}</h2>
      <ul className="divide-y divide-gray-100">
        {entries.map((entry) => (
          <li key={entry.date} className="py-3 first:pt-0 last:pb-0">
            <Text>{entry.description}</Text>
            <Small as="time">{entry.date}</Small>
          </li>
        ))}
      </ul>
    </div>
  );
}
