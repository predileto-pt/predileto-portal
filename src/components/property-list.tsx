import type { Property } from "@/lib/types";
import { PropertyCard } from "./property-card";
import { getDictionary, type Locale } from "@/lib/i18n";

interface PropertyListProps {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  locale: string;
  selectedId?: string;
}

export async function PropertyList({
  properties,
  total,
  page,
  pageSize,
  locale,
  selectedId,
}: PropertyListProps) {
  const dict = await getDictionary(locale as Locale);

  if (properties.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-8">{dict.properties.noResults}</div>
    );
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div>
      <div className="text-xs text-gray-400 mb-2">
        {dict.properties.showing
          .replace("{from}", String(from))
          .replace("{to}", String(to))
          .replace("{total}", String(total))}
      </div>
      <div className="space-y-2">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            selected={property.id === selectedId}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
