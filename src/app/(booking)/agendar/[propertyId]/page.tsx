import { BookingClientPage } from "@/components/booking/booking-client-page";
import { getServerLocale } from "@/lib/server-locale";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const locale = await getServerLocale();
  const { propertyId } = await params;

  return <BookingClientPage locale={locale} propertyId={propertyId} />;
}
