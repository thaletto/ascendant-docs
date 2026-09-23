---
title: Getting started
description: Install Ascendant and run your first Effect-based chart calculation.
---

Ascendant is an Effect-first TypeScript library for sidereal astrology.
Start by calculating D1 and D9 for a UTC moment and location. The result
contains shared **Placements** and cusp-aware **Charts** that you can reuse
with the other calculation modules.

## Install

```bash
bun add astro-ascendant effect@rc
```

## 1. Import the packages

This example uses Bun, KrishnamurtiVP291 ayanamsa, and Placidus houses
(`AstroParams.DefaultAstroParams`).

```ts
import { BunRuntime, BunServices } from "@effect/platform-bun";
import { AstroParams, Chart, Swisseph } from "astro-ascendant";
import { Console, DateTime, Effect, Layer } from "effect";
```

## 2. Create the runtime layer

```ts
const runtimeLayer = Layer.mergeAll(
  BunServices.layer,
  Swisseph.SwissephLayer,
  AstroParams.DefaultAstroParams,
);
```

`runtimeLayer` provides the Bun services, Swiss Ephemeris implementation, and
default astrological parameters at the root of the program.

## 3. Create the chart input

```ts
const input = Chart.ChartParams.make({
  moment: Chart.Moment.make({
    date: DateTime.makeUnsafe("2000-01-01T12:00:00.000Z"),
  }),
  latitude: 12.9716,
  longitude: 77.5946,
  sex: "Male",
});
```

`ChartParams` combines a UTC `Moment` with latitude, longitude, and optional
birth sex.

## 4. Generate D1 and D9

`Chart.generate` always returns D1 first. Passing `[9]` adds the D9 divisional
chart.

```ts
const examples = Chart.generate(input, [9]).pipe(Effect.provide(runtimeLayer));
```

## 5. Print the results

Use `Console.table` to inspect the shared placements and generated charts:

```ts
const examplesWithOutput = examples.pipe(
  Effect.tap((calculation) =>
    Effect.gen(function* () {
      yield* Console.log("Placements");
      yield* Console.table([
        {
          Point: calculation.placements.lagna.name,
          Longitude: calculation.placements.lagna.longitude,
          Retrograde: "—",
        },
        ...calculation.placements.planets.map((planet) => ({
          Point: planet.name,
          Longitude: planet.longitude,
          Retrograde: planet.is_retrograde,
        })),
      ]);
      yield* Console.log("Charts");
      yield* Console.table(
        calculation.charts.map((chart) => ({
          Division: `D${chart.division}`,
          HouseSystem: calculation.astroParams.houseSystem,
          Ayanamsa: calculation.astroParams.ayanamsa,
        })),
      );
    }),
  ),
);
```

## 6. Run the program

```ts
BunRuntime.runMain(examplesWithOutput);
```

`calculation.placements` contains the shared sidereal positions. Reuse it with
the [Dasha](./api-reference/dasha), [Ashtakavarga](./api-reference/sav), and
[Jaimini](./api-reference/jaimini) calculators.
