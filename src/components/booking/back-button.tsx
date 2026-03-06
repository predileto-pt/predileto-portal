"use client";

import Link from "next/link";

export function BackButton({ locale }: { locale: string }) {
  return (
    <Link
      href={`/${locale}`}
      className="fixed top-4 left-4 z-50 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="size-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
      </svg>
      <span>{locale === "pt" ? "Voltar" : "Back"}</span>
    </Link>
  );
}
