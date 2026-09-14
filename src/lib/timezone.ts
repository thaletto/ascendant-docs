export async function fetchTimeZone(latitude: number, longitude: number): Promise<string | null> {
  try {
    const response = await fetch("/api/timezone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude, longitude }),
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { timeZone?: unknown };
    return typeof data.timeZone === "string" ? data.timeZone : null;
  } catch {
    return null;
  }
}

function zoneOffsetMinutesAt(instantMs: number, timeZone: string): number {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(new Date(instantMs)).map((part) => [part.type, part.value]),
  );
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return Math.round((asUtc - instantMs) / 60000);
}

export function todayDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function resolveOffsetMinutes(date: string, time: string, timeZone: string): number | null {
  try {
    const [year, month, day] = date.split("-").map(Number);
    const [hour = 0, minute = 0] = time.split(":").map(Number);
    if (![year, month, day, hour, minute].every((part) => Number.isFinite(part))) {
      return null;
    }
    const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
    // Two passes so dates near a DST transition converge on the right offset.
    const first = zoneOffsetMinutesAt(wallAsUtc, timeZone);
    return zoneOffsetMinutesAt(wallAsUtc - first * 60000, timeZone);
  } catch {
    return null;
  }
}
