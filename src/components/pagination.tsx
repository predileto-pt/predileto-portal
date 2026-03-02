import Link from "next/link";
import { cn } from "@/lib/utils";
import { getDictionary, type Locale } from "@/lib/i18n";

interface PaginationProps {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  basePath: string;
  locale: string;
}

function buildHref(
  basePath: string,
  searchParams: Record<string, string | undefined>,
  page: number,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value && key !== "page") {
      params.set(key, value);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export async function Pagination({
  page,
  totalPages,
  searchParams,
  basePath,
  locale,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const dict = await getDictionary(locale as Locale);

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center gap-1 mt-4 text-sm">
      {page > 1 && (
        <Link
          href={buildHref(basePath, searchParams, page - 1)}
          className="px-2 py-1 border border-gray-200 hover:bg-gray-50"
        >
          {dict.common.previous}
        </Link>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(basePath, searchParams, p)}
          className={cn(
            "px-2 py-1 border border-gray-200",
            p === page ? "font-bold bg-gray-50" : "hover:bg-gray-50",
          )}
        >
          {p}
        </Link>
      ))}
      {page < totalPages && (
        <Link
          href={buildHref(basePath, searchParams, page + 1)}
          className="px-2 py-1 border border-gray-200 hover:bg-gray-50"
        >
          {dict.common.next}
        </Link>
      )}
    </nav>
  );
}
