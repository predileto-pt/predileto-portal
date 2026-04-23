"use client";

import { useState } from "react";
import {
  AIPropertiesSearcher,
  type AiSearchListingType,
  type AiSearchPayload,
} from "@/components/ai-properties-searcher";
import {
  SearchThread,
  type SearchMessage,
} from "@/components/search-thread";
import {
  SearchResults,
  type SearchResultItem,
} from "@/components/search-results";

interface AISearchPageProps {
  listingType: AiSearchListingType;
  locale: string;
}

function getMockResults(listingType: AiSearchListingType): SearchResultItem[] {
  if (listingType === "buy") {
    return [
      {
        id: "mock-1",
        title: "Rua Garrett 42, Lisboa",
        price: 285000,
        areaSqm: 78,
        bedrooms: 2,
        listingType: "buy",
      },
      {
        id: "mock-2",
        title: "Avenida da Boavista 1200, Porto",
        price: 340000,
        areaSqm: 95,
        bedrooms: 3,
        listingType: "buy",
      },
      {
        id: "mock-3",
        title: "Rua do Almada 18, Coimbra",
        price: 220000,
        areaSqm: 84,
        bedrooms: 2,
        listingType: "buy",
      },
    ];
  }

  return [
    {
      id: "mock-1",
      title: "Rua da Prata 55, Lisboa",
      price: 1350,
      areaSqm: 68,
      bedrooms: 2,
      listingType: "rent",
    },
    {
      id: "mock-2",
      title: "Rua de Cedofeita 240, Porto",
      price: 1100,
      areaSqm: 74,
      bedrooms: 2,
      listingType: "rent",
    },
    {
      id: "mock-3",
      title: "Rua do Brasil 88, Coimbra",
      price: 850,
      areaSqm: 60,
      bedrooms: 1,
      listingType: "rent",
    },
  ];
}

export function AISearchPage({ listingType, locale }: AISearchPageProps) {
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  const hasSearched = messages.length > 0;

  async function handleSearch(payload: AiSearchPayload) {
    const message: SearchMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      query: payload.query,
      adults: payload.adults,
      children: payload.children,
      at: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
    setLoading(true);

    // TODO: replace with real estate-os API call
    await new Promise((resolve) => setTimeout(resolve, 400));
    setResults(getMockResults(payload.listingType));
    setLoading(false);
  }

  if (!hasSearched) {
    return (
      <AIPropertiesSearcher
        listingType={listingType}
        onSearch={handleSearch}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 py-4">
      <aside className="space-y-6">
        <AIPropertiesSearcher
          listingType={listingType}
          onSearch={handleSearch}
          compact
        />
        <SearchThread messages={messages} />
      </aside>

      <section>
        <SearchResults items={results} loading={loading} locale={locale} />
      </section>
    </div>
  );
}
