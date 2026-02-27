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
    <nav className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4 lg:gap-6">
        <Link href={`/${locale}`} className="text-sm font-bold">
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
                  "text-[13px]",
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
      <LanguageSwitcher locale={locale} />
      </div>
    </nav>
  );
}
