---
title: Transit
description: Mechanics-only search for the next or previous transit events of one graha.
---

The `Transit` namespace searches for the next or previous transit events of
one graha from a `LocatedMoment`. It is mechanics-only: each event reports
the exact moment, longitude, kind, and retrograde state. There is no
interpretation here.

```ts
import { Effect } from "effect";

import { AstroParams, Transit, Swisseph } from "astro-ascendant";

const ingresses = await Effect.runPromise(
  Transit.findTransits({
    planet: "Jupiter",
    from: locatedMoment,
    count: 3,
    direction: "forward",
    kinds: ["sign-ingress"],
    maxYears: 12,
  }).pipe(
    Effect.provide(AstroParams.layer({ ayanamsa: "Lahiri", houseSystem: "WholeSign" })),
    Effect.provide(Swisseph.SwissephLayer),
  ),
);
```

## Public exports

```ts
export * from "./error.js";
export * from "./model.js";
export { findTransits } from "./find.js";
```

`findTransits(request)` is the single entry point. It requires the
`AstroParams` and `Ephemeris` Effect layers. The low-level sampling helpers
(`searchRawHits`, `sampleAt`, `normalize360`, and related types) are also
re-exported for custom search tooling.

## Event kinds

| Kind            | Meaning                                                         | Requires          |
| --------------- | --------------------------------------------------------------- | ----------------- |
| `sign-ingress`  | Sidereal D1 Rashi boundary crossing                             | —                 |
| `longitude-hit` | Exact crossing of `targetLongitude`                             | `targetLongitude` |
| `cusp-crossing` | Crossing of the natal house cusp for `house` computed at `from` | `house`           |
| `station`       | Retrograde station, detected via a `longitudeSpeed` sign change | —                 |

Cusp targets are the natal house cusps at `from` under the shared
`AstroParams`. Charts attach afterwards only when `includeCharts` asks.

## Request fields

| Field              | Type                        | Description                                                    |
| ------------------ | --------------------------- | -------------------------------------------------------------- |
| `planet`           | `Planets`                   | The single graha to track                                      |
| `from`             | `LocatedMoment`             | Starting moment, latitude, and longitude                       |
| `count`            | integer `1`–`100`           | Number of events to return                                     |
| `direction`        | `"forward"` \| `"backward"` | Search direction in time                                       |
| `kinds`            | non-empty `TransitKind[]`   | Which event kinds to match                                     |
| `targetLongitude`  | `Longitude`                 | Required for `longitude-hit`                                   |
| `house`            | `Houses`                    | Required for `cusp-crossing`                                   |
| `maxYears`         | `0` (exclusive)–`200`       | Search window; defaults to `30`                                |
| `precisionMinutes` | `0` (exclusive)–`1440`      | Refinement precision; defaults to `1`                          |
| `includeCharts`    | `Division[]`                | Attaches one full `ChartCalculation` per found moment when set |

## Result and guarantees

Each `TransitEvent` contains `planet`, `moment`, `longitude`, `kind`,
`is_retrograde`, `direction`, `provenance`, an optional D1 `sign`, and an
optional `calculation` when `includeCharts` requested divisions.

- Every zero-crossing counts in strict time order, so retrograde triples
  yield three events.
- Refinement bisects to `precisionMinutes` (default `1`).
- An exhausted `maxYears` window fails with typed `TransitSearchExhausted`
  (carrying the partial `found` events and `searchedUntil`) instead of a
  short list.
- Invalid requests fail with typed `TransitValidationError`.
