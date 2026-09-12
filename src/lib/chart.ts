export interface ChartBirthInput {
  date: string;
  time: string;
  utcOffsetMinutes: number;
  place: string;
  latitude: number;
  longitude: number;
  sex?: "Male" | "Female";
}

export interface ChartInputValidation {
  ok: boolean;
  errors: string[];
}

function isFiniteLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

function isFiniteLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function validateChartInput(input: ChartBirthInput): ChartInputValidation {
  const errors: string[] = [];
  if (input.date.trim() === "") {
    errors.push("Birth date is required.");
  }
  if (input.time.trim() === "") {
    errors.push("Birth time is required.");
  }
  if (input.place.trim() === "") {
    errors.push("Birth place is required.");
  }
  if (!isFiniteLatitude(input.latitude)) {
    errors.push("Latitude must be between -90 and 90.");
  }
  if (!isFiniteLongitude(input.longitude)) {
    errors.push("Longitude must be between -180 and 180.");
  }
  return { ok: errors.length === 0, errors };
}

export function toUtcIso(input: {
  date: string;
  time: string;
  utcOffsetMinutes: number;
}): string {
  const local = new Date(
    Date.UTC(
      Number(input.date.slice(0, 4)),
      Number(input.date.slice(5, 7)) - 1,
      Number(input.date.slice(8, 10)),
      Number(input.time.slice(0, 2)),
      Number(input.time.slice(3, 5)),
    ),
  );
  return new Date(
    local.getTime() - input.utcOffsetMinutes * 60_000,
  ).toISOString();
}

export const ALL_DIVISIONS = [
  1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40, 45, 60,
] as const;

export interface ChartPlacement {
  body: string;
  sign: string;
  degree: string;
  house: number;
  nakshatra: string;
  pada: number | null;
  state: string;
}

export interface ChartHouse {
  number: number;
  sign: string;
  cusp: string;
  lord: string;
  occupants: string[];
  significators: string[];
}

export interface ChartDivision {
  division: number;
  placements: ChartPlacement[];
  houses: ChartHouse[];
}

export interface ChartDashaPeriod {
  mahadasha: string;
  start: string;
  end: string;
  antardashas: { antardasha: string; start: string; end: string }[];
}

export interface ChartResult {
  birth: {
    utcIso: string;
    place: string;
    latitude: number;
    longitude: number;
  };
  astroParams: {
    ayanamsa: string;
    houseSystem: string;
  };
  lagna: {
    sign: string;
    degree: string;
    house: number;
  };
  divisions: ChartDivision[];
  dasha: {
    vimshottari: ChartDashaPeriod[];
    chara: ChartDashaPeriod[];
    sthira: ChartDashaPeriod[];
  };
  jaimini: {
    karakas: { role: string; planet: string }[];
    karakamsha: string;
    upapada: string;
    arudha: { house: number; pada: string }[];
    drishti: string[];
    argala: {
      supporting: string[];
      obstructing: string[];
    };
  };
  sav: {
    total: number;
    scores: { sign: string; score: number }[];
  };
}

export function toPlacementRows(
  result: ChartResult,
  division: number,
): ChartPlacement[] {
  const match = result.divisions.find((entry) => entry.division === division);
  if (!match) {
    return [];
  }
  return [
    {
      body: "Lagna",
      sign: result.lagna.sign,
      degree: result.lagna.degree,
      house: result.lagna.house,
      nakshatra: "",
      pada: null,
      state: "",
    },
    ...match.placements,
  ];
}

export function buildChartMarkdown(result: ChartResult): string {
  const lines: string[] = [
    "# Birth Chart",
    "",
    `- Place: ${result.birth.place}`,
    `- UTC: ${result.birth.utcIso}`,
    `- Coordinates: ${result.birth.latitude}, ${result.birth.longitude}`,
    `- Ayanamsa: ${result.astroParams.ayanamsa}`,
    `- House system: ${result.astroParams.houseSystem}`,
    `- Lagna: ${result.lagna.sign} ${result.lagna.degree}`,
    "",
    "## Placements",
    "",
    "| Body | Sign | Degree | House | Nakshatra | State |",
    "| --- | --- | --- | --- | --- | --- |",
  ];
  for (const row of toPlacementRows(result, 1)) {
    lines.push(
      `| ${row.body} | ${row.sign} | ${row.degree} | ${row.house} | ${row.nakshatra}${row.pada === null ? "" : ` ${row.pada}`} | ${row.state} |`,
    );
  }
  lines.push("", "## Vimshottari Dasha", "");
  for (const period of result.dasha.vimshottari) {
    lines.push(`- ${period.mahadasha}: ${period.start} to ${period.end}`);
    for (const antar of period.antardashas) {
      lines.push(`  - ${antar.antardasha}: ${antar.start} to ${antar.end}`);
    }
  }
  lines.push("", "## Chara Dasha", "");
  for (const period of result.dasha.chara) {
    lines.push(`- ${period.mahadasha}: ${period.start} to ${period.end}`);
  }
  lines.push("", "## Sthira Dasha", "");
  for (const period of result.dasha.sthira) {
    lines.push(`- ${period.mahadasha}: ${period.start} to ${period.end}`);
  }
  for (const division of result.divisions) {
    if (division.division === 1) {
      continue;
    }
    lines.push("", `## D${division.division} placements`, "");
    lines.push("| Body | Sign | Degree | House | State |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const row of toPlacementRows(result, division.division)) {
      if (row.body === "Lagna") {
        continue;
      }
      lines.push(
        `| ${row.body} | ${row.sign} | ${row.degree} | ${row.house} | ${row.state} |`,
      );
    }
    lines.push("", `## D${division.division} houses`, "");
    for (const house of division.houses) {
      lines.push(
        `- House ${house.number}: ${house.sign}, cusp ${house.cusp || "unknown"}, lord ${house.lord || "unknown"}, occupants ${house.occupants.join(", ") || "none"}`,
      );
    }
  }
  lines.push("", "## Jaimini", "");
  for (const karaka of result.jaimini.karakas) {
    lines.push(`- ${karaka.role}: ${karaka.planet}`);
  }
  lines.push(`- Karakamsha: ${result.jaimini.karakamsha}`);
  lines.push(`- Upapada: ${result.jaimini.upapada}`);
  for (const entry of result.jaimini.arudha) {
    lines.push(`- Arudha Pada ${entry.house}: ${entry.pada}`);
  }
  lines.push(`- Rashi Drishti on Lagna: ${result.jaimini.drishti.join(", ")}`);
  lines.push(
    `- Supporting Argala: ${result.jaimini.argala.supporting.join(", ")}`,
  );
  lines.push(
    `- Obstructing Argala: ${result.jaimini.argala.obstructing.join(", ")}`,
  );
  lines.push("", "## Ashtakavarga", "");
  lines.push(`- SAV total: ${result.sav.total}`);
  for (const entry of result.sav.scores) {
    lines.push(`- ${entry.sign}: ${entry.score}`);
  }
  lines.push(
    "",
    "This chart is interpretive guidance, not certainty or a substitute for medical, legal, or financial advice.",
  );
  return lines.join("\n");
}

export function buildChatPromptUrl(result: ChartResult): string {
  const placements = toPlacementRows(result, 1)
    .map((row) => `${row.body} in ${row.sign}`)
    .join(", ");
  const prompt = `Interpret this sidereal birth chart (${result.astroParams.ayanamsa}, ${result.astroParams.houseSystem} houses). Born ${result.birth.utcIso} in ${result.birth.place}. Placements: ${placements}. This is interpretive guidance, not professional advice.`;
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
