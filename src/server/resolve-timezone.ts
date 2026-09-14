import { find } from "geo-tz";

export function findTimeZone(latitude: number, longitude: number): string | null {
  try {
    const zones = find(latitude, longitude);
    return zones.length > 0 ? zones[0] : null;
  } catch {
    return null;
  }
}
