/**
 * Returns property context for the chatbot assistant.
 * TODO: Replace this mock with real property data from the database.
 */
export async function getPropertyContext(propertyId: string): Promise<string> {
  return `Property ID: ${propertyId}
Address: Rua Augusta 123, Lisboa, Portugal
Price: €350,000
Type: Apartment (T3)
Bedrooms: 3
Bathrooms: 2
Area: 120 m²
Floor: 4th of 6
Year Built: 2018
Energy Rating: B
Parking: 1 space
Amenities: Elevator, Balcony, Central Heating, Double Glazing
Description: Modern 3-bedroom apartment in the heart of Lisbon with excellent natural light and city views.`;
}
