import type { Property } from "./types";
import type { IntentLevel } from "./tracking";
import type { DetailMediaItem } from "@/components/deal/image-carousel";

// --- Mock Property for the detail page ---

export const MOCK_PROPERTY: Property = {
  id: "mock-prop-001",
  title: "Apartamento T3 com Terraço em Cascais",
  slug: "apartamento-t3-terraco-cascais",
  shortDescription: "Luminoso apartamento T3 com terraço panorâmico e vista mar.",
  fullDescription:
    "Excelente apartamento T3 com 145m², localizado numa das zonas mais prestigiadas de Cascais. " +
    "Conta com um amplo terraço com vista mar, cozinha equipada, suite com closet, e dois quartos adicionais. " +
    "O condomínio dispõe de piscina, ginásio e segurança 24h. Garagem para 2 viaturas. " +
    "Próximo de escolas internacionais, supermercados e transportes públicos. " +
    "Ideal para famílias que procuram qualidade de vida junto ao mar.",
  propertyType: "apartment",
  listingType: "buy",
  price: 485000,
  featured: true,
  address: {
    fullAddress: "Rua das Flores 42, 2750-123 Cascais",
    region: "Lisboa",
    district: "Lisboa",
    municipality: "Cascais",
    parish: "Cascais e Estoril",
    postalCode: "2750-123",
    country: "Portugal",
    coordinates: { lat: 38.6979, lng: -9.4215 },
  },
  features: {
    bedrooms: 3,
    bathrooms: 2,
    areaSqm: 145,
    floor: 4,
    totalFloors: 6,
    parkingSpaces: 2,
    yearBuilt: 2019,
    energyRating: "B",
  },
  amenities: [
    "Pool",
    "Gym",
    "24h Security",
    "Garage",
    "Terrace",
    "Elevator",
    "Air Conditioning",
  ],
  images: [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop", alt: "Exterior view" },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop", alt: "Living room" },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop", alt: "Kitchen" },
    { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop", alt: "Terrace view" },
    { url: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop", alt: "Bedroom" },
  ],
  agent: {
    name: "Maria Santos",
    email: "maria.santos@predileto.pt",
    phone: "+351 912 345 678",
    photo: null,
  },
  available: true,
  availableFrom: null,
  sources: [{ name: "casa-sapo", url: "https://casa.sapo.pt/example" }],
  keywords: ["sea view", "terrace", "pool", "cascais"],
  createdAt: "2025-12-15T10:00:00Z",
  updatedAt: "2026-03-18T14:30:00Z",
};

// --- Mock media (images + videos, including AI-generated) for detail carousel ---

export const MOCK_PROPERTY_MEDIA: DetailMediaItem[] = [
  { type: "image", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop", alt: "Exterior view" },
  {
    type: "video",
    url: "https://example.com/mock-tour.mp4",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop",
    alt: "Property walkthrough",
  },
  { type: "image", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=500&fit=crop", alt: "Living room" },
  { type: "image", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=500&fit=crop", alt: "Kitchen" },
  { type: "image", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=500&fit=crop", alt: "Terrace view" },
  {
    type: "video",
    url: "https://example.com/mock-ai-staging.mp4",
    thumbnail: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop",
    alt: "AI virtual staging",
    aiGenerated: true,
  },
  { type: "image", url: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&h=500&fit=crop", alt: "Bedroom" },
];

// --- Mock coordinates for the map ---

export const MOCK_COORDINATES = {
  lat: 38.6979,
  lng: -9.4215,
};

// --- Mock Buyer Intelligence ---

export interface BuyerScore {
  id: string;
  name: string;
  intentLevel: IntentLevel;
  score: number; // 0-100
  lastActivity: string;
  interactions: number;
  budget: { min: number; max: number };
  matchReasons: string[];
}

export interface PropertyIntelligence {
  dealProbability: number; // 0-100
  estimatedDaysToClose: number;
  priceAnalysis: {
    marketAverage: number;
    suggestedRange: { min: number; max: number };
    pricePosition: "below" | "at" | "above";
  };
  topBuyers: BuyerScore[];
  alerts: PropertyAlert[];
  suggestedActions: SuggestedAction[];
}

export interface PropertyAlert {
  type: "warning" | "info" | "success";
  title: string;
  description: string;
}

export interface SuggestedAction {
  priority: "high" | "medium" | "low";
  action: string;
  reason: string;
}

export const MOCK_INTELLIGENCE: PropertyIntelligence = {
  dealProbability: 72,
  estimatedDaysToClose: 45,
  priceAnalysis: {
    marketAverage: 465000,
    suggestedRange: { min: 460000, max: 510000 },
    pricePosition: "at",
  },
  topBuyers: [
    {
      id: "buyer-001",
      name: "João Ferreira",
      intentLevel: "hot",
      score: 92,
      lastActivity: "2026-03-19T16:30:00Z",
      interactions: 8,
      budget: { min: 400000, max: 550000 },
      matchReasons: ["Budget match", "Location preference", "Visited 3x"],
    },
    {
      id: "buyer-002",
      name: "Sarah Mitchell",
      intentLevel: "hot",
      score: 85,
      lastActivity: "2026-03-18T11:00:00Z",
      interactions: 5,
      budget: { min: 450000, max: 600000 },
      matchReasons: ["Budget match", "Expat relocation", "Financing approved"],
    },
    {
      id: "buyer-003",
      name: "Carlos Mendes",
      intentLevel: "warm",
      score: 68,
      lastActivity: "2026-03-15T09:20:00Z",
      interactions: 3,
      budget: { min: 350000, max: 500000 },
      matchReasons: ["Budget match", "Property type match"],
    },
    {
      id: "buyer-004",
      name: "Ana Rodrigues",
      intentLevel: "cold",
      score: 42,
      lastActivity: "2026-03-10T14:45:00Z",
      interactions: 1,
      budget: { min: 300000, max: 480000 },
      matchReasons: ["Location preference"],
    },
  ],
  alerts: [
    {
      type: "success",
      title: "High demand property",
      description: "This property has 3x more views than average for Cascais T3 apartments.",
    },
    {
      type: "info",
      title: "Price aligned with market",
      description: "Listing price is within 4% of comparable properties in the area.",
    },
    {
      type: "warning",
      title: "No visits scheduled this week",
      description: "Consider reaching out to hot leads to maintain momentum.",
    },
  ],
  suggestedActions: [
    {
      priority: "high",
      action: "Call João Ferreira",
      reason: "Visited 3 times, last activity yesterday. High probability of offer.",
    },
    {
      priority: "high",
      action: "Send financing details to Sarah Mitchell",
      reason: "Expat buyer with approved financing. Needs documentation guidance.",
    },
    {
      priority: "medium",
      action: "Schedule open house",
      reason: "3 warm leads haven't visited yet. Group showing could accelerate pipeline.",
    },
  ],
};
