"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useDictionary } from "@/components/dictionary-provider";

export function ListingToggle({ locale }: { locale: string }) {
  const pathname = usePathname();
  const dict = useDictionary();
  const isRent = pathname.includes("/arrendar");

  return (
    <div className="flex gap-3 text-[13px]">
      <Link
        href={`/${locale}/comprar`}
        className={
          !isRent
            ? "font-bold underline underline-offset-4"
            : "text-gray-400 hover:text-gray-600"
        }
      >
        {dict.nav.buy}
      </Link>
      <Link
        href={`/${locale}/arrendar`}
        className={
          isRent
            ? "font-bold underline underline-offset-4"
            : "text-gray-400 hover:text-gray-600"
        }
      >
        {dict.nav.rent}
      </Link>
    </div>
  );
}
