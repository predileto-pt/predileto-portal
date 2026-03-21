import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";
import { PropertyDetailClient } from "./property-detail-client";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale as Locale);

  return <PropertyDetailClient locale={locale} propertyId={id} dict={dict} />;
}
