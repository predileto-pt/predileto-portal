import type { Property } from "@/lib/types";
import { PropertyFeedCard } from "./property-feed-card";
import { getDictionary, type Locale } from "@/lib/i18n";
import { Text } from "@/components/ui/text";

interface PropertyListProps {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  locale: string;
}

export async function PropertyList({
  properties,
  total,
  page,
  pageSize,
  locale,
}: PropertyListProps) {
  const dict = await getDictionary(locale as Locale);

  if (properties.length === 0) {
    return (
      <Text variant="muted" className="py-8">{dict.properties.noResults}</Text>
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div>
      <div className="text-xs text-gray-400 mb-3">
        {dict.properties.showing
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{total}", String(total))}
      </div>
      <div className="space-y-5">
        {properties.map((property) => (
          <PropertyFeedCard
            key={property.id}
            property={property}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
