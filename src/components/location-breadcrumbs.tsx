import Link from "next/link";
import type { BreadcrumbItem } from "@/lib/locations";

interface LocationBreadcrumbsProps {
  items: BreadcrumbItem[];
  homeLabel: string;
  homeHref: string;
  listingLabel: string;
  listingHref: string;
}

export function LocationBreadcrumbs({
  items,
  homeLabel,
  homeHref,
  listingLabel,
  listingHref,
}: LocationBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-3">
      <ol className="flex items-center gap-1">
        <li>
          <Link href={homeHref} className="hover:text-gray-600">
            {homeLabel}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li>
          <Link href={listingHref} className="hover:text-gray-600">
            {listingLabel}
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1">
              <span aria-hidden="true">/</span>
              {isLast ? (
                <span className="text-gray-600">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-gray-600">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
