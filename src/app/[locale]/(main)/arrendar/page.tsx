import { AIPropertiesSearcher } from "@/components/ai-properties-searcher";

export const dynamic = "force-dynamic";

export default async function ArrendarPage() {
  return <AIPropertiesSearcher listingType="rent" />;
}
