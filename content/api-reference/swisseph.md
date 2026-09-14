---
title: Swisseph
description: Swiss Ephemeris integration layer for the TypeScript astrology library.
---

The root package exports the `Swisseph` namespace, which provides the
Node.js/Bun adapter backed by `@swisseph/node`.

```ts
import { AstroParams, Chart, Swisseph } from "astro-ascendant";
import { BunServices } from "@effect/platform-bun";
import { Effect, Layer } from "effect";

const runtimeLayer = Layer.mergeAll(
  BunServices.layer,
  Swisseph.SwissephLayer,
  AstroParams.DefaultAstroParams,
);

const examples = Chart.generate(input, [9]).pipe(Effect.provide(runtimeLayer));

BunRuntime.runMain(examples);
```

## Exports

| Export          | Description                                       |
| --------------- | ------------------------------------------------- |
| `SwissephLayer` | Effect layer implementing the `Ephemeris` service |

The adapter implements date-to-Julian-day conversion, sidereal planetary
positions, and house cusps/angles. It maps Ascendant's `Ayanamsa`,
`HouseSystem`, and `CelestialBody` values to Swiss Ephemeris constants.

Use `SwissephLayer` together with `AstroParams.DefaultAstroParams` or a
custom `AstroParams.layer(...)`:

```ts
const layers = Layer.merge(
  AstroParams.layer({
    ayanamsa: "Lahiri",
    houseSystem: "WholeSign",
  }),
  Swisseph.SwissephLayer,
);
const result = await Effect.runPromise(Chart.generate(input, [9]).pipe(Effect.provide(layers)));
```

The package's public adapter surface intentionally exports the layer rather
than exposing native Swiss Ephemeris state. For a custom runtime, implement
the runtime-neutral `Ephemeris` service instead.
