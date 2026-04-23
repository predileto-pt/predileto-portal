"use client";

import { useEffect, useRef, useState } from "react";
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
  initialQuery?: string;
}

const MOCK_LATENCY_MS = 2000;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function getMockResults(listingType: AiSearchListingType): SearchResultItem[] {
  const now = Date.now();
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
        aiAttributes: [
          { key: "cost", icon: "euro", label: "Custo de vida", value: "~1.450€/mês" },
          { key: "gas", icon: "fuel", label: "Gasolina", value: "~60€/mês" },
          { key: "commute", icon: "commute", label: "Até o centro", value: "8 min a pé" },
        ],
        comments: [
          {
            id: "c1",
            content: "Zona espetacular, muito bem servida de transportes.",
            at: now - 2 * DAY,
          },
          {
            id: "c2",
            content: "Preço justo para o Chiado. A varanda faz a diferença.",
            at: now - 6 * HOUR,
          },
        ],
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
        aiAttributes: [
          { key: "cost", icon: "euro", label: "Custo de vida", value: "~1.200€/mês" },
          { key: "gas", icon: "fuel", label: "Gasolina", value: "~110€/mês" },
          { key: "amenity", icon: "amenity", label: "Escolas a 1 km", value: "4" },
        ],
        comments: [
          {
            id: "c1",
            content: "Condomínio bem cuidado, a piscina é um luxo no verão.",
            at: now - 5 * DAY,
          },
        ],
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
        aiAttributes: [
          { key: "cost", icon: "euro", label: "Custo de vida", value: "~950€/mês" },
          { key: "commute", icon: "commute", label: "Universidade", value: "6 min a pé" },
          { key: "noise", icon: "noise", label: "Ruído", value: "Moderado" },
        ],
        comments: [],
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
      aiAttributes: [
        { key: "cost", icon: "euro", label: "Custo de vida", value: "~1.500€/mês" },
        { key: "commute", icon: "commute", label: "Metro", value: "3 min a pé" },
        { key: "noise", icon: "noise", label: "Ruído", value: "Alto" },
      ],
      comments: [
        {
          id: "c1",
          content: "Bem no centro, adorei. Só o ruído à noite que chateia.",
          at: now - 3 * HOUR,
        },
        {
          id: "c2",
          content: "O senhorio respondeu no mesmo dia.",
          at: now - 9 * DAY,
        },
      ],
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
      aiAttributes: [
        { key: "cost", icon: "euro", label: "Custo de vida", value: "~1.250€/mês" },
        { key: "gas", icon: "fuel", label: "Gasolina", value: "~55€/mês" },
        { key: "amenity", icon: "amenity", label: "Cafés a 500 m", value: "12" },
      ],
      comments: [
        {
          id: "c1",
          content: "Zona ótima para viver, muitos cafés e lojas perto.",
          at: now - 12 * HOUR,
        },
        {
          id: "c2",
          content: "Pavimento em madeira é lindo, mas range um pouco.",
          at: now - 2 * DAY,
        },
        {
          id: "c3",
          content: "Visitei ontem, gostei muito. Vou fazer proposta.",
          at: now - 45 * MINUTE,
        },
      ],
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
      aiAttributes: [
        { key: "cost", icon: "euro", label: "Custo de vida", value: "~900€/mês" },
        { key: "commute", icon: "commute", label: "Universidade", value: "9 min de bike" },
        { key: "noise", icon: "noise", label: "Ruído", value: "Baixo" },
      ],
      comments: [
        {
          id: "c1",
          content: "Perfeito para estudantes. Calmo e perto de tudo.",
          at: now - 4 * DAY,
        },
      ],
    },
  ];
}

export function AISearchPage({
  listingType,
  locale,
  initialQuery,
}: AISearchPageProps) {
  const [messages, setMessages] = useState<SearchMessage[]>([]);
  const [results, setResults] = useState<SearchResultItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const bootstrappedRef = useRef(false);

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

  useEffect(() => {
    if (bootstrappedRef.current) return;
    const seed = initialQuery?.trim();
    if (!seed) return;
    bootstrappedRef.current = true;
    void handleSearch({
      query: seed,
      adults: 1,
      children: 0,
      typologies: [],
      listingType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, listingType]);

  if (!hasSearched) {
    return (
      <AIPropertiesSearcher
        listingType={listingType}
        onSearch={handleSearch}
        initialQuery={initialQuery}
      />
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
