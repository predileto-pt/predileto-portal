import { PrototypeBanner } from "@/components/prototype-banner";
import { TopNav } from "@/components/top-nav";
import type { Locale } from "@/lib/i18n";

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <>
      <PrototypeBanner />
      <TopNav locale={locale as Locale} />
      <main>{children}</main>
    </>
  );
}
