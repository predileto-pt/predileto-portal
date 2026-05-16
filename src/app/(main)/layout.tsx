import { PrototypeBanner } from "@/components/prototype-banner";
import { TopNav } from "@/components/top-nav";
import { getServerLocale } from "@/lib/server-locale";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getServerLocale();

  return (
    <>
      <PrototypeBanner />
      <TopNav locale={locale} />
      <main>{children}</main>
    </>
  );
}
