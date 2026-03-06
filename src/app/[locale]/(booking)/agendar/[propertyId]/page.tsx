import { BookingClientPage } from "@/components/booking/booking-client-page";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string; propertyId: string }>;
}) {
  const { locale, propertyId } = await params;

  return <BookingClientPage locale={locale} propertyId={propertyId} />;
}
