export interface PlaceOption {
  displayName: string;
  latitude: number;
  longitude: number;
}

interface NominatimEntry {
  display_name: string;
  lat: string;
  lon: string;
}

export async function searchPlaces(query: string): Promise<PlaceOption[]> {
  // V1 place search uses OpenStreetMap Nominatim (no API key); users can
  // always override with manual coordinates below.
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) {
    throw new Error("Place search failed.");
  }
  const data = (await response.json()) as NominatimEntry[];
  return data
    .map((entry) => ({
      displayName: entry.display_name,
      latitude: Number(entry.lat),
      longitude: Number(entry.lon),
    }))
    .filter(
      (entry) =>
        Number.isFinite(entry.latitude) && Number.isFinite(entry.longitude),
    );
}
