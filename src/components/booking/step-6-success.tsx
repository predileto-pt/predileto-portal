"use client";

import Link from "next/link";
import { useDictionary } from "@/components/dictionary-provider";

interface Step6Props {
  locale: string;
}

export function Step6Success({ locale }: Step6Props) {
  const dict = useDictionary();
  const d = dict.booking as Record<string, string>;

  return (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-8 text-green-600">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
        </svg>
      </div>

      <h1 className="text-xl font-bold">{d.successTitle}</h1>
      <p className="text-sm text-gray-600">{d.successMessage}</p>

      <Link
        href={`/${locale}`}
        className="inline-block py-2.5 px-6 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        {d.backToHome}
      </Link>
    </div>
  );
}
