import { describe, expect, test } from "bun:test";
import {
  buildChartMarkdown,
  buildChatPromptUrl,
  toPlacementRows,
  toUtcIso,
  validateChartInput,
  type ChartResult,
} from "./chart";

describe("validateChartInput", () => {
  test("accepts a complete birth input", () => {
    const result = validateChartInput({
      date: "2000-01-01",
      time: "12:00",
      utcOffsetMinutes: 330,
      place: "Bengaluru, India",
      latitude: 12.9716,
      longitude: 77.5946,
    });
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test("rejects missing date and time", () => {
    const result = validateChartInput({
      date: "",
      time: "",
      utcOffsetMinutes: 0,
      place: "",
      latitude: 12.9716,
      longitude: 77.5946,
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Birth date is required.");
    expect(result.errors).toContain("Birth time is required.");
    expect(result.errors).toContain("Birth place is required.");
  });

  test("rejects out-of-range coordinates", () => {
    const result = validateChartInput({
      date: "2000-01-01",
      time: "12:00",
      utcOffsetMinutes: 0,
      place: "Nowhere",
      latitude: 91,
      longitude: -181,
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Latitude must be between -90 and 90.");
    expect(result.errors).toContain("Longitude must be between -180 and 180.");
  });

  test("rejects non-finite coordinates", () => {
    const result = validateChartInput({
      date: "2000-01-01",
      time: "12:00",
      utcOffsetMinutes: 0,
      place: "Nowhere",
      latitude: Number.NaN,
      longitude: Number.POSITIVE_INFINITY,
    });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain("Latitude must be between -90 and 90.");
    expect(result.errors).toContain("Longitude must be between -180 and 180.");
  });
});

describe("toUtcIso", () => {
  test("converts IST birth time to UTC", () => {
    expect(
      toUtcIso({ date: "2000-01-01", time: "12:00", utcOffsetMinutes: 330 }),
    ).toBe("2000-01-01T06:30:00.000Z");
  });

  test("keeps UTC input unchanged", () => {
    expect(
      toUtcIso({ date: "2000-01-01", time: "12:00", utcOffsetMinutes: 0 }),
    ).toBe("2000-01-01T12:00:00.000Z");
  });
});

const sampleResult: ChartResult = {
  birth: {
    utcIso: "2000-01-01T06:30:00.000Z",
    place: "Bengaluru, India",
    latitude: 12.9716,
    longitude: 77.5946,
  },
  astroParams: { ayanamsa: "Lahiri", houseSystem: "WholeSign" },
  lagna: { sign: "Aries", degree: "12.5", house: 1 },
  divisions: [
    {
      division: 1,
      placements: [
        {
          body: "Sun",
          sign: "Sagittarius",
          degree: "16.2",
          house: 9,
          nakshatra: "Mula",
          pada: 2,
          state: "Own",
        },
        {
          body: "Moon",
          sign: "Virgo",
          degree: "3.1",
          house: 6,
          nakshatra: "Uttara Phalguni",
          pada: 3,
          state: "Retrograde",
        },
      ],
      houses: [
        {
          number: 1,
          sign: "Aries",
          cusp: "12.5",
          lord: "Mars",
          occupants: [],
          significators: ["Sun"],
        },
      ],
    },
    {
      division: 9,
      placements: [
        {
          body: "Sun",
          sign: "Aries",
          degree: "16.2",
          house: 1,
          nakshatra: "",
          pada: null,
          state: "Own",
        },
      ],
      houses: [],
    },
  ],
  dasha: {
    vimshottari: [
      {
        mahadasha: "Jupiter",
        start: "2019-01-01",
        end: "2035-01-01",
        antardashas: [
          { antardasha: "Saturn", start: "2019-01-01", end: "2021-01-01" },
        ],
      },
    ],
    chara: [
      {
        mahadasha: "Scorpio",
        start: "2020-01-01",
        end: "2030-01-01",
        antardashas: [],
      },
    ],
    sthira: [
      {
        mahadasha: "Taurus",
        start: "2021-01-01",
        end: "2031-01-01",
        antardashas: [],
      },
    ],
  },
  jaimini: {
    karakas: [{ role: "Atmakaraka", planet: "Sun" }],
    karakamsha: "Sagittarius",
    upapada: "Pisces",
    arudha: [{ house: 1, pada: "Aries" }],
    drishti: ["Leo"],
    argala: { supporting: ["Gemini"], obstructing: ["Virgo"] },
  },
  sav: {
    total: 337,
    scores: [{ sign: "Aries", score: 28 }],
  },
};

describe("toPlacementRows", () => {
  test("returns Co-Star rows for a division", () => {
    const rows = toPlacementRows(sampleResult, 1);
    expect(rows).toEqual([
      {
        body: "Lagna",
        sign: "Aries",
        degree: "12.5",
        house: 1,
        nakshatra: "",
        pada: null,
        state: "",
      },
      {
        body: "Sun",
        sign: "Sagittarius",
        degree: "16.2",
        house: 9,
        nakshatra: "Mula",
        pada: 2,
        state: "Own",
      },
      {
        body: "Moon",
        sign: "Virgo",
        degree: "3.1",
        house: 6,
        nakshatra: "Uttara Phalguni",
        pada: 3,
        state: "Retrograde",
      },
    ]);
  });

  test("returns an empty list for an unknown division", () => {
    expect(toPlacementRows(sampleResult, 5)).toEqual([]);
  });
});

describe("buildChartMarkdown", () => {
  test("includes birth data, placements, and disclaimer", () => {
    const markdown = buildChartMarkdown(sampleResult);
    expect(markdown).toContain("# Birth Chart");
    expect(markdown).toContain("Bengaluru, India");
    expect(markdown).toContain("2000-01-01T06:30:00.000Z");
    expect(markdown).toContain("Lahiri");
    expect(markdown).toContain("WholeSign");
    expect(markdown).toContain("Sun");
    expect(markdown).toContain("Sagittarius");
    expect(markdown).toContain("Vimshottari");
    expect(markdown).toContain("Saturn");
    expect(markdown).toContain("Chara Dasha");
    expect(markdown).toContain("Sthira Dasha");
    expect(markdown).toContain("D9 placements");
    expect(markdown).toContain("Atmakaraka");
    expect(markdown).toContain("Arudha Pada 1");
    expect(markdown).toContain("Rashi Drishti");
    expect(markdown).toContain("Aries: 28");
    expect(markdown).toContain("interpretive guidance");
  });
});

describe("buildChatPromptUrl", () => {
  test("builds a ChatGPT link carrying the chart summary", () => {
    const url = buildChatPromptUrl(sampleResult);
    expect(url.startsWith("https://chatgpt.com/?q=")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Bengaluru, India");
    expect(decodeURIComponent(url)).toContain("Sun in Sagittarius");
  });
});
