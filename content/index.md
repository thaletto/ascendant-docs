---
title: Ascendant documentation
description: Astrology calculations for charts, dashas, Jaimini, and Ashtakavarga.
---


Ascendant is an Effect-first TypeScript library for sidereal Vedic astrology
calculations. It calculates shared planetary **Placements** for a
**Located Moment**, then derives cusp-aware charts, dashas, Ashtakavarga, and
Jaimini results from that same calculation.

## API reference

- [Astro parameters](./api-reference/astro-params)
- [Charts and placements](./api-reference/chart)
- [Dasha](./api-reference/dasha)
- [Ephemeris](./api-reference/ephemeris)
- [Jaimini](./api-reference/jaimini)
- [Ashtakavarga](./api-reference/sav)
- [Swiss Ephemeris adapter](./api-reference/swisseph)

The package exports these namespaces from `astro-ascendant`:

```ts
import {
  Argala,
  ArudhaPada,
  AstroParams,
  Chart,
  CharaKarakas,
  Dasha,
  Ephemeris,
  Karakamsha,
  Provenance,
  RashiDrishti,
  SAV,
  Upapada,
} from "astro-ascendant";
```

## Calculation model

1. Create a `Chart.ChartParams` value with a UTC `Moment` and geographic
   coordinates.
2. Provide an `AstroParams` layer and an `Ephemeris` layer.
3. Run `Chart.generate`. D1 is always returned; requested divisions are added
   in ascending order.
4. Reuse `calculation.placements` with Dasha, SAV, and Jaimini calculators.

Calculators return `Effect.Effect` values. Use `Effect.runPromise` for a
promise-based application or compose the effects into a larger Effect
program.

## Installation

```bash
npm install astro-ascendant effect@rc
```

The package is ESM-only and includes TypeScript declarations. The Swiss
Ephemeris adapter is available from the `astro-ascendant/swisseph` subpath.
