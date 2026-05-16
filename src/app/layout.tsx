import type { Metadata } from "next";
import { PostHogProvider } from "@/components/posthog-provider";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { LocaleProvider } from "@/lib/locale-context";
import { UserSessionProvider } from "@/components/session/user-session-provider";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/server-locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "properties searcher",
  description: "Search properties for sale and rent in Portugal",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale + dictionary used to be resolved in the [locale]/layout.tsx
  // wrapper. URLs no longer carry the prefix, so this work moves up to
  // the root — `getServerLocale()` reads the cookie set by middleware.
  const locale = await getServerLocale();
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <PostHogProvider>
          <LocaleProvider locale={locale}>
            <DictionaryProvider dictionary={dictionary}>
              <UserSessionProvider>{children}</UserSessionProvider>
            </DictionaryProvider>
          </LocaleProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
