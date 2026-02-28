import { notFound } from "next/navigation";
import { isValidLocale, getDictionary } from "@/lib/i18n";
import { DictionaryProvider } from "@/components/dictionary-provider";
import { PrototypeBanner } from "@/components/prototype-banner";
import { TopNav } from "@/components/top-nav";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isValidLocale(locale)) notFound();

  const dictionary = await getDictionary(locale);

  return (
    <DictionaryProvider dictionary={dictionary}>
      <PrototypeBanner />
      <TopNav locale={locale} />
      <main className="max-w-7xl mx-auto px-4 py-3 lg:px-6 lg:py-4">{children}</main>
    </DictionaryProvider>
  );
}
