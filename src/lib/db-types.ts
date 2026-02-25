export interface PropertyRow {
  id: string;
  title: string;
  listing_type: string | null;
  property_type: string | null;
  price: number | null;
  bedrooms: string | null;
  bathrooms: number | null;
  area_m2: number | null;
  description: string | null;
  address_full_address: string | null;
  address_city: string | null;
  address_district: string | null;
  address_postal_code: string | null;
  address_region?: string | null;
  address_municipality?: string | null;
  address_parish?: string | null;
  images: string[] | null;
  features: string[] | null;
  sources: { name: string; url: string }[] | null;
  source: string | null;
  url: string | null;
  scraped_at: string | null;
  updated_at: string | null;
}

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: PropertyRow;
      };
    };
  };
}
