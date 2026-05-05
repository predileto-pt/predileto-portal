import { fetchPublicProperties, type ListedProperty } from "@/lib/estate-os";
import { formatPrice, formatArea } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const result = await fetchPublicProperties({ limit: 20, offset: 0 });

  return (
    <div className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4 space-y-4">
      <header className="flex items-end justify-between">
        <h1 className="text-lg font-bold">Listings</h1>
        <span className="text-xs text-gray-400">
          {result.items.length} of {result.total}
        </span>
      </header>

      {result.items.length === 0 ? (
        <p className="text-sm text-gray-500">No listings available.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.items.map((property) => (
            <ListingCard
              key={property.id}
              property={property}
              locale={locale}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function ListingCard({
  property,
  locale,
}: {
  property: ListedProperty;
  locale: string;
}) {
  const cover = property.images[0];
  const price = property.prices[0];
  const priceAmount = price ? Number(price.amount) : 0;
  const bedrooms = property.characteristics?.num_of_bedrooms ?? null;
  const area = property.characteristics?.area_in_m2 ?? null;

  return (
    <li className="border border-gray-200 bg-white overflow-hidden">
      <div className="w-full aspect-[4/3] bg-gray-100">
        {cover?.download_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.download_url}
            alt={cover.filename}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>
      <div className="p-3 space-y-1">
        <div className="text-sm font-semibold text-blue-600 truncate font-heading">
          {property.address}
        </div>
        <div className="text-lg font-extrabold">
          {priceAmount > 0 ? formatPrice(priceAmount, locale) : "-"}
        </div>
        <div className="flex gap-3 text-xs text-gray-500">
          <span className="capitalize">{property.typology}</span>
          {bedrooms !== null && bedrooms > 0 && <span>T{bedrooms}</span>}
          {area !== null && area > 0 && <span>{formatArea(area)}</span>}
        </div>
      </div>
    </li>
  );
}
