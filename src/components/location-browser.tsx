import { getRegions, type LocationNode } from "@/lib/locations";
import { cn } from "@/lib/utils";

interface LocationBrowserProps {
  locale: string;
  listingSlug: string;
}

export function LocationBrowser({ locale, listingSlug }: LocationBrowserProps) {
  const regions = getRegions();
  const base = `/${locale}/${listingSlug}`;

  return (
    <div className="py-4 text-[12px]">
      {regions.map((region) => (
        <div key={region.slug} className="mb-3">
          <a href={`${base}/${region.slug}`} className="font-bold hover:underline">
            {region.name}
          </a>
          {region.children.map((district, idx) => {
            const isLast = idx === region.children.length - 1;
            return (
            <div
              key={district.slug}
              className={cn(
                "relative pl-4 mt-1",
                "before:absolute before:left-0 before:top-0 before:h-[0.6em] before:w-3 before:border-l before:border-b before:border-gray-300 before:content-['']",
                !isLast && "after:absolute after:left-0 after:top-[0.6em] after:bottom-0 after:border-l after:border-gray-300 after:content-['']"
              )}
            >
              <a
                href={`${base}/${region.slug}/${district.slug}`}
                className="font-semibold hover:underline"
              >
                {district.name}
              </a>
              {district.children.length > 0 && (
                <span className="ml-1 text-gray-500">
                  {district.children.map((mun, i) => (
                    <span key={mun.slug}>
                      {i > 0 && ", "}
                      <a
                        href={`${base}/${region.slug}/${district.slug}/${mun.slug}`}
                        className="hover:underline"
                      >
                        {mun.name}
                      </a>
                    </span>
                  ))}
                </span>
              )}
            </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
