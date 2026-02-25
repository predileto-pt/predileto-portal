export interface PropertyImage {
  url: string;
  alt: string;
}

export interface PropertyVideo {
  url: string;
  thumbnail: string;
}

export interface Address {
  fullAddress: string;
  region?: string;
  district?: string;
  municipality?: string;
  parish?: string;
  postalCode: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

export interface Agent {
  name: string;
  email: string;
  phone: string;
  photo: string | null;
}

export interface PropertyFeatures {
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  floor?: number;
  totalFloors?: number;
  parkingSpaces?: number;
  yearBuilt?: number;
  energyRating?: string;
}

export type PropertyType =
  | "apartment"
  | "house"
  | "villa"
  | "studio"
  | "penthouse"
  | "townhouse";

export type ListingType = "rent" | "buy";

export interface Property {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  featured: boolean;
  address: Address;
  features: PropertyFeatures;
  amenities: string[];
  images: PropertyImage[];
  video?: PropertyVideo;
  agent: Agent;
  available: boolean;
  availableFrom: string | null;
  sources: { name: string; url: string }[];
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertySearchParams {
  q?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  featured?: string;
  sort?: string;
  page?: string;
  region?: string;
  district?: string;
  municipality?: string;
  parish?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
