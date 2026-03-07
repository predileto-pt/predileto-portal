"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDictionary } from "@/components/dictionary-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale } from "@/lib/i18n";

const navItems = [
  { key: "buy" as const, href: "comprar" },
  { key: "rent" as const, href: "arrendar" },
  { key: "blog" as const, href: "blog" },
];

export function TopNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const dict = useDictionary();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:gap-6">
        <Link href={`/${locale}`} className="text-sm font-bold font-heading">
          {dict.nav.title}
        </Link>
        <div className="flex gap-4">
          {navItems.map((item) => {
            const href = `/${locale}/${item.href}`;
            const active = pathname.startsWith(href);
            return (
              <Link
                key={item.key}
                href={href}
                className={cn(
                  "text-sm font-heading",
                  active
                    ? "font-bold underline underline-offset-4"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                {dict.nav[item.key]}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/imobiliarias`}
          className={cn(
            "text-sm font-heading flex items-center gap-1",
            pathname.startsWith(`/${locale}/imobiliarias`)
              ? "font-bold text-black underline underline-offset-4"
              : "text-black",
          )}
        >
          {dict.nav.agencies}
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </Link>
        <LanguageSwitcher locale={locale} />
      </div>
      </div>
    </nav>
  );
}
