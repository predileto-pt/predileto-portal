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

const MOCK_LATENCY_MS = 2000;

function getMockResults(listingType: AiSearchListingType): SearchResultItem[] {
  if (listingType === "buy") {
    return [
      {
        id: "mock-1",
        title: "Rua Garrett 42, Lisboa",
        description:
          "Apartamento remodelado no Chiado com varanda, pé-direito alto e cozinha equipada.",
        price: 285000,
        areaSqm: 78,
        bedrooms: 2,
        listingType: "buy",
      },
      {
        id: "mock-2",
        title: "Avenida da Boavista 1200, Porto",
        description:
          "T3 moderno em condomínio fechado com piscina, garagem para dois carros e arrecadação.",
        price: 340000,
        areaSqm: 95,
        bedrooms: 3,
        listingType: "buy",
      },
      {
        id: "mock-3",
        title: "Rua do Almada 18, Coimbra",
        description:
          "Apartamento no centro histórico, totalmente mobilado, próximo da universidade e do rio.",
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
      description:
        "T2 luminoso na Baixa, janelas amplas, perto de transportes públicos e restaurantes.",
      price: 1350,
      areaSqm: 68,
      bedrooms: 2,
      listingType: "rent",
    },
    {
      id: "mock-2",
      title: "Rua de Cedofeita 240, Porto",
      description:
        "Apartamento recuperado com cozinha aberta, pavimento em madeira e acesso a terraço comum.",
      price: 1100,
      areaSqm: 74,
      bedrooms: 2,
      listingType: "rent",
    },
    {
      id: "mock-3",
      title: "Rua do Brasil 88, Coimbra",
      description:
        "Estúdio T1 mobilado com ar condicionado, ideal para estudantes ou jovens profissionais.",
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
    setResults(null);

    // TODO: replace with real estate-os API call
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
    setResults(getMockResults(payload.listingType));
    setLoading(false);
  }

  if (!hasSearched) {
    return (
      <AIPropertiesSearcher listingType={listingType} onSearch={handleSearch} />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] py-4 items-start">
      <aside className="space-y-6 lg:pr-6 lg:border-r lg:border-rule">
        <AIPropertiesSearcher
          listingType={listingType}
          onSearch={handleSearch}
          compact
        />
        <SearchThread messages={messages} />
      </aside>

      <section className="lg:pl-6 pt-6 lg:pt-0">
        <SearchResults items={results} loading={loading} locale={locale} />
      </section>
    </div>
  );
}
