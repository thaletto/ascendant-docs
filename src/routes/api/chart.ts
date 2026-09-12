import { createFileRoute } from "@tanstack/react-router";
import type { Effect } from "effect";
import { ALL_DIVISIONS, type ChartResult } from "@/lib/chart";

const RASHIS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

function normalizeLongitude(longitude: number): number {
  return ((longitude % 360) + 360) % 360;
}

function signFromLongitude(longitude: number): string {
  return RASHIS[Math.floor(normalizeLongitude(longitude) / 30) % 12];
}

function degreeInSign(longitude: number): string {
  return (normalizeLongitude(longitude) % 30).toFixed(1);
}

function formatDegree(value: unknown, fallbackLongitude?: number): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value <= 30 ? value.toFixed(1) : degreeInSign(value);
  }
  if (typeof fallbackLongitude === "number" && Number.isFinite(fallbackLongitude)) {
    return degreeInSign(fallbackLongitude);
  }
  return "";
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function dignityLabel(dignities: unknown): string {
  if (!Array.isArray(dignities)) {
    return "";
  }
  const meaningful = dignities.find(
    (entry) =>
      entry === "EXALTED" ||
      entry === "MOOLA_TRIKONA" ||
      entry === "OWN" ||
      entry === "DEBILITATED",
  );
  return typeof meaningful === "string" ? titleCase(meaningful) : "";
}

function readRecord(value: unknown): Record<string, unknown> {
  if (
    (typeof value === "object" && value !== null) ||
    typeof value === "function"
  ) {
    return value as Record<string, unknown>;
  }
  return {};
}

function readList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function toDisplayString(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (typeof value === "object" && value !== null && "name" in value) {
    const name = (value as Record<string, unknown>).name;
    if (typeof name === "string") {
      return name;
    }
  }
  return "";
}

function toIsoDate(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;
    if (typeof record.epochMillis === "number") {
      return new Date(record.epochMillis).toISOString();
    }
    const nested = record.date ?? record.start ?? record.epoch;
    if (typeof nested === "string") {
      return nested;
    }
    if (nested instanceof Date) {
      return nested.toISOString();
    }
    if (typeof record.toISOString === "function") {
      try {
        return (record.toISOString as () => string).call(value);
      } catch {
        return "";
      }
    }
    if (typeof record.toJSON === "function") {
      try {
        const json = (record.toJSON as () => unknown).call(value);
        if (typeof json === "string") {
          return json;
        }
      } catch {
        return "";
      }
    }
  }
  return "";
}

interface EnginePlanet {
  name: string;
  sign: string;
  degree: string;
  longitude: number;
  retrograde: boolean;
  dignity: string;
  nakshatra: string;
  pada: number | null;
}

function readEnginePlacements(calculation: unknown): {
  lagnaSign: string;
  lagnaDegree: string;
  planets: EnginePlanet[];
} {
  const placements = readRecord(readRecord(calculation).placements);
  const lagna = readRecord(placements.lagna);
  const lagnaLongitude =
    typeof lagna.longitude === "number" ? lagna.longitude : 0;
  const planets = readList(placements.planets).map((entry) => {
    const planet = readRecord(entry);
    const nakshatra = readRecord(planet.nakshatra);
    const longitude =
      typeof planet.longitude === "number" ? planet.longitude : 0;
    const pada =
      typeof nakshatra.pada === "number" ? nakshatra.pada : null;
    return {
      name: toDisplayString(planet.name),
      sign: signFromLongitude(longitude),
      degree: degreeInSign(longitude),
      longitude,
      retrograde: planet.is_retrograde === true,
      dignity: "",
      nakshatra: toDisplayString(nakshatra.name),
      pada,
    };
  });
  return {
    lagnaSign: signFromLongitude(lagnaLongitude),
    lagnaDegree: degreeInSign(lagnaLongitude),
    planets,
  };
}

function readDivisionCharts(
  calculation: unknown,
  source: { lagnaSign: string; lagnaDegree: string; planets: EnginePlanet[] },
): ChartResult["divisions"] {
  const charts = readList(readRecord(calculation).charts);
  return charts.map((entry) => {
    const chart = readRecord(entry);
    const division =
      typeof chart.division === "number" ? chart.division : 1;
    const houses = readRecord(chart.houses);
    const planetHouse = new Map<string, number>();
    const houseRows: ChartResult["divisions"][number]["houses"] = [];
    for (let houseNumber = 1; houseNumber <= 12; houseNumber += 1) {
      const house = readRecord(houses[String(houseNumber)]);
      const occupants = readList(house.planets).map((planetEntry) => {
        const planet = readRecord(planetEntry);
        const name = toDisplayString(planet.name);
        planetHouse.set(name, houseNumber);
        return name;
      });
      const cusp =
        typeof house.cusp === "number" ? house.cusp.toFixed(1) : "";
      const significations = readList(house.significations)
        .map(toDisplayString)
        .filter((entry) => entry !== "");
      houseRows.push({
        number: houseNumber,
        sign: toDisplayString(house.sign),
        cusp,
        lord: toDisplayString(house.signLord),
        occupants,
        significators: significations,
      });
    }
    const placements = readList(
      Object.values(houses).flatMap((house) =>
        readList(readRecord(house).planets),
      ),
    ).map((planetEntry) => {
      const planet = readRecord(planetEntry);
      const name = toDisplayString(planet.name);
      const sign = readRecord(planet.sign);
      const longitude =
        typeof planet.longitude === "number" ? planet.longitude : 0;
      const retrograde = planet.is_retrograde === true;
      const dignity = dignityLabel(planet.in_sign);
      const sourcePlanet = source.planets.find((item) => item.name === name);
      // Nakshatra and pada are source (D1) evidence; divisional charts reuse
      // projected signs and houses, so only D1 rows carry them.
      const isSourceDivision = division === 1;
      return {
        body: name,
        sign: toDisplayString(sign.name) || signFromLongitude(longitude),
        degree: formatDegree(planet.degree, longitude),
        house: planetHouse.get(name) ?? 0,
        nakshatra: isSourceDivision ? (sourcePlanet?.nakshatra ?? "") : "",
        pada: isSourceDivision ? (sourcePlanet?.pada ?? null) : null,
        state: retrograde ? "Retrograde" : dignity,
      };
    });
    return { division, placements, houses: houseRows };
  });
}

function readDashaPeriods(value: unknown): ChartResult["dasha"]["vimshottari"] {
  return readList(value).flatMap((entry) => {
    const period = readRecord(entry);
    const mahadasha =
      toDisplayString(period.mahadasha) ||
      toDisplayString(period.sign) ||
      toDisplayString(period.rashi);
    if (mahadasha === "") {
      return [];
    }
    const antardashas = readList(period.antardashas).flatMap((inner) => {
      const antar = readRecord(inner);
      const child =
        toDisplayString(antar.antardasha) || toDisplayString(antar.sign);
      if (child === "") {
        return [];
      }
      return [
        {
          antardasha: child,
          start: toIsoDate(antar.start),
          end: toIsoDate(antar.end),
        },
      ];
    });
    return [
      {
        mahadasha,
        start: toIsoDate(period.start),
        end: toIsoDate(period.end),
        antardashas,
      },
    ];
  });
}

function readKarakas(value: unknown): { role: string; planet: string }[] {
  const assignments = readRecord(readRecord(value).assignments);
  const fromAssignments = Object.entries(assignments).flatMap(([role, holders]) =>
    readList(holders).flatMap((holder) => {
      const planet =
        toDisplayString(readRecord(holder).planet) || toDisplayString(holder);
      if (planet === "") {
        return [];
      }
      return [{ role, planet }];
    }),
  );
  if (fromAssignments.length > 0) {
    return fromAssignments;
  }
  return readList(value).flatMap((entry) => {
    const item = readRecord(entry);
    const role = toDisplayString(item.role) || toDisplayString(item.karaka);
    const planet =
      toDisplayString(item.planet) || toDisplayString(item.name);
    if (role === "" || planet === "") {
      return [];
    }
    return [{ role, planet }];
  });
}

function readArgalaSigns(value: unknown): string[] {
  return readList(value).flatMap((entry) => {
    const item = readRecord(entry);
    const sign = toDisplayString(item.sign);
    if (sign !== "") {
      return [sign];
    }
    const single = toDisplayString(entry);
    return single === "" ? [] : [single];
  });
}

function readSignList(value: unknown): string[] {
  const list = readList(value).map(toDisplayString).filter((entry) => entry !== "");
  if (list.length > 0) {
    return list;
  }
  const single = toDisplayString(value);
  return single === "" ? [] : [single];
}

function readSavScores(value: unknown): {
  total: number;
  scores: { sign: string; score: number }[];
} {
  const root = readRecord(value);
  const candidates = [
    root.sarva,
    root.sarvashtakavarga,
    root.sav,
    root.total,
    root.scores,
    value,
  ];
  for (const candidate of candidates) {
    const record = readRecord(candidate);
    const entries = Object.entries(record).filter(
      (entry): entry is [string, number] =>
        RASHIS.includes(entry[0] as (typeof RASHIS)[number]) &&
        typeof entry[1] === "number",
    );
    if (entries.length === 12) {
      const scores = entries.map(([sign, score]) => ({ sign, score }));
      return {
        total: scores.reduce((sum, item) => sum + item.score, 0),
        scores,
      };
    }
  }
  return { total: 0, scores: [] };
}

export const Route = createFileRoute("/api/chart")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Request body must be JSON." }, { status: 400 });
        }
        const input = readRecord(body);
        const utcIso = typeof input.utcIso === "string" ? input.utcIso : "";
        const latitude = input.latitude;
        const longitude = input.longitude;
        const place = typeof input.place === "string" ? input.place : "";
        const sex = input.sex === "Male" || input.sex === "Female" ? input.sex : undefined;
        if (utcIso === "" || Number.isNaN(Date.parse(utcIso))) {
          return Response.json({ error: "utcIso must be an ISO date string." }, { status: 400 });
        }
        if (
          typeof latitude !== "number" ||
          !Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90
        ) {
          return Response.json(
            { error: "latitude must be between -90 and 90." },
            { status: 400 },
          );
        }
        if (
          typeof longitude !== "number" ||
          !Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180
        ) {
          return Response.json(
            { error: "longitude must be between -180 and 180." },
            { status: 400 },
          );
        }

        try {
          // Calculation engine: astro-ascendant (Effect-first TypeScript,
          // Swiss Ephemeris via SwissephLayer). Dynamic imports keep this
          // dependency server-only; the client only sees the JSON contract
          // in src/lib/chart.ts.
          const engine = (await import("astro-ascendant")) as Record<string, unknown>;
          const { DateTime, Effect, Layer } = (await import("effect")) as typeof import("effect");
          const Chart = readRecord(engine.Chart);
          const AstroParams = readRecord(engine.AstroParams);
          const Swisseph = readRecord(engine.Swisseph);
          const Dasha = readRecord(engine.Dasha);
          const SAV = readRecord(engine.SAV);
          const CharaKarakas = readRecord(engine.CharaKarakas);
          const Karakamsha = readRecord(engine.Karakamsha);
          const ArudhaPada = readRecord(engine.ArudhaPada);
          const Upapada = readRecord(engine.Upapada);
          const RashiDrishti = readRecord(engine.RashiDrishti);
          const Argala = readRecord(engine.Argala);

          const defaultParams = readRecord(AstroParams.DefaultAstroParams);
          if (Object.keys(defaultParams).length === 0) {
            throw new Error("AstroParams.DefaultAstroParams is unavailable.");
          }
          const layerValue = readRecord(Swisseph.SwissephLayer);
          if (Object.keys(layerValue).length === 0) {
            throw new Error("Swisseph.SwissephLayer is unavailable.");
          }
          // V1 pins the documented sidereal defaults: Lahiri ayanamsa with
          // Whole Sign houses. The installed engine's own defaults differ,
          // so build the layer explicitly instead of relying on them.
          const layerFn = AstroParams.layer as unknown;
          const astroLayer =
            typeof layerFn === "function"
              ? (layerFn as (options: unknown) => unknown)({
                  ayanamsa: "Lahiri",
                  houseSystem: "WholeSign",
                })
              : defaultParams;
          const generate = Chart.generate as unknown;
          const momentCtor = readRecord(Chart.Moment);
          const paramsCtor = readRecord(Chart.ChartParams);
          if (
            typeof generate !== "function" ||
            typeof momentCtor.make !== "function" ||
            typeof paramsCtor.make !== "function"
          ) {
            throw new Error("Chart engine entry points are unavailable.");
          }

          const runtimeLayer = Layer.mergeAll(
            astroLayer as never,
            layerValue as never,
          );
          const run = <A>(effect: Effect.Effect<A, unknown, never>) =>
            Effect.runPromise(effect.pipe(Effect.provide(runtimeLayer as never)) as Effect.Effect<A, unknown, never>);

          const moment = (momentCtor.make as (args: unknown) => unknown)({
            date: DateTime.makeUnsafe(utcIso),
          });
          const chartInput = (paramsCtor.make as (args: unknown) => unknown)({
            moment,
            latitude,
            longitude,
            ...(sex ? { sex } : {}),
          });
          const calculation = await run(
            (generate as (input: unknown, divisions: readonly number[]) => Effect.Effect<unknown, unknown, never>)(
              chartInput,
              [...ALL_DIVISIONS],
            ),
          );

          const source = readEnginePlacements(calculation);
          const divisions = readDivisionCharts(calculation, source);
          const d1 =
            divisions.find((entry) => entry.division === 1) ?? divisions[0];
          const lagnaHouse =
            d1?.houses.find((house) => house.occupants.includes("Lagna")) ??
            d1?.houses[0];
          // Report the method the engine actually used; fall back to the
          // documented defaults when the engine omits provenance.
          const engineParams = readRecord(readRecord(calculation).astroParams);
          const ayanamsa = toDisplayString(engineParams.ayanamsa) || "Lahiri";
          const houseSystem =
            toDisplayString(engineParams.houseSystem) || "WholeSign";

          const attempt = async (effect: unknown): Promise<unknown> => {
            try {
              if (
                typeof effect !== "object" ||
                effect === null ||
                !Effect.isEffect(effect)
              ) {
                return null;
              }
              return await run(effect as Effect.Effect<unknown, unknown, never>);
            } catch {
              return null;
            }
          };
          const call = (namespace: Record<string, unknown>, name: string, ...args: unknown[]) => {
            const fn = namespace[name];
            if (typeof fn !== "function") {
              return null;
            }
            try {
              return (fn as (...callArgs: unknown[]) => unknown)(...args);
            } catch {
              return null;
            }
          };

          const placementsValue = readRecord(calculation).placements;
          const vimshottari = await attempt(
            call(Dasha, "calculate", moment, placementsValue),
          );
          const chara = await attempt(
            call(Dasha, "calculateChara", moment, placementsValue),
          );
          const sthira = await attempt(
            call(Dasha, "calculateSthira", moment, placementsValue),
          );
          const savRaw = await attempt(
            call(SAV, "calculate", placementsValue),
          );
          const karakasRaw = await attempt(
            call(CharaKarakas, "calculate", placementsValue),
          );
          const karakamshaRaw = await attempt(
            call(Karakamsha, "calculate", placementsValue),
          );
          const upapadaRaw = await attempt(
            call(Upapada, "calculate", placementsValue),
          );
          const arudha: { house: number; pada: string }[] = [];
          for (let house = 1; house <= 12; house += 1) {
            const pada = await attempt(
              call(ArudhaPada, "calculate", placementsValue, house),
            );
            const label = toDisplayString(
              readRecord(pada).sign ?? readRecord(pada).pada ?? pada,
            );
            arudha.push({ house, pada: label });
          }
          const drishtiRaw = await attempt(
            call(RashiDrishti, "calculate", source.lagnaSign),
          );
          const argalaRaw = await attempt(
            call(Argala, "calculate", placementsValue, source.lagnaSign),
          );
          const argalaRecord = readRecord(argalaRaw);

          const sav = readSavScores(
            readRecord(savRaw).result ?? savRaw,
          );
          const karakamshaPlacements = readList(
            readRecord(karakamshaRaw).placements,
          );
          const karakamshaList = readSignList(
            karakamshaPlacements.length > 0
              ? karakamshaPlacements.map((entry) => readRecord(entry).sign)
              : (readRecord(karakamshaRaw).sign ??
                readRecord(karakamshaRaw).karakamsha ??
                karakamshaRaw),
          );

          const result: ChartResult = {
            birth: {
              utcIso,
              place,
              latitude,
              longitude,
            },
            astroParams: {
              ayanamsa,
              houseSystem,
            },
            lagna: {
              sign: lagnaHouse?.sign ?? source.lagnaSign,
              degree: source.lagnaDegree,
              house: 1,
            },
            divisions,
            dasha: {
              vimshottari: readDashaPeriods(
                readRecord(vimshottari).timeline ??
                  readRecord(vimshottari).mahadashas ??
                  vimshottari,
              ),
              chara: readDashaPeriods(
                readRecord(chara).timeline ??
                  readRecord(chara).mahadashas ??
                  chara,
              ),
              sthira: readDashaPeriods(
                readRecord(sthira).timeline ??
                  readRecord(sthira).mahadashas ??
                  sthira,
              ),
            },
            jaimini: {
              karakas: readKarakas(karakasRaw),
              karakamsha: karakamshaList[0] ?? "",
            upapada:
              toDisplayString(
                readRecord(upapadaRaw).sign ??
                  readRecord(upapadaRaw).pada ??
                  upapadaRaw,
              ) || "",
              arudha,
              drishti: readSignList(
                readRecord(drishtiRaw).targets ??
                  readRecord(drishtiRaw).aspects ??
                  readRecord(drishtiRaw).signs ??
                  drishtiRaw,
              ),
              argala: {
                supporting: readArgalaSigns(
                  argalaRecord.supporting ?? argalaRecord.benefics,
                ),
                obstructing: readArgalaSigns(
                  argalaRecord.obstructing ?? argalaRecord.malefics,
                ),
              },
            },
            sav,
          };
          return Response.json(result);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Calculation failed.";
          return Response.json({ error: message }, { status: 422 });
        }
      },
    },
  },
});
