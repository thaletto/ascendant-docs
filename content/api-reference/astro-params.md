---
title: AstroParams
description: Astro parameter configuration for ayanamsa and house-system selection.
---

The `AstroParams` namespace defines the astronomical configuration used by
chart generation. Configuration is separate from the `Moment` and location:
the moment says **when** and the coordinates say **where**, while these
parameters say which sidereal reference frame and house system to use.

```ts
import { AstroParams, Chart, Swisseph } from "astro-ascendant";
import { BunServices } from "@effect/platform-bun";
import { Effect, Layer } from "effect";

const runtimeLayer = Layer.mergeAll(
  BunServices.layer,
  Swisseph.SwissephLayer,
  AstroParams.layer({
    ayanamsa: "Lahiri",
    houseSystem: "WholeSign",
  }),
);

const runnable = program.pipe(Effect.provide(runtimeLayer));

BunRuntime.runMain(runnable);
```

## Exports

| Export               | Description                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `Ayanamsa`           | Schema and type for the supported sidereal ayanamsas                                            |
| `HouseSystem`        | Schema and type for supported house systems                                                     |
| `Options`            | `{ ayanamsa, houseSystem }` configuration object                                                |
| `AstroParams`        | Effect service consumed by chart generation                                                     |
| `layer(options)`     | Builds a layer providing the supplied configuration                                             |
| `DefaultAstroParams` | Krishnamurti ayanamsa with Placidus houses (engine default; pass explicit options to change it) |

Supported house systems:

- `Placidus`
- `Koch`
- `Porphyrius`
- `Regiomontanus`
- `Campanus`
- `Equal`
- `VehlowEqual`
- `WholeSign`
- `Meridian`
- `Azimuthal`
- `PolichPage`
- `Alcabitus`
- `Morinus`

Supported ayanamsas:

- `FaganBradley`
- `Lahiri`
- `DeLuce`
- `Raman`
- `Ushashashi`
- `Krishnamurti`
- `DjwhalKhul`
- `Yukteshwar`
- `JNBhasin`
- `BabylKugler1`
- `BabylKugler2`
- `BabylKugler3`
- `BabylHuber`
- `BabylEtPSC`
- `Aldebaran15Tau`
- `Hipparchos`
- `Sassanian`
- `GalacticCenter0Sag`
- `J2000`
- `J1900`
- `B1950`
- `SuryaSiddhanta`
- `SuryaSiddhantaMeanSun`
- `Aryabhata`
- `AryabhataMeanSun`
- `SSRevati`
- `SSCitra`
- `TrueCitra`
- `TrueRevati`
- `TruePushya`
- `GalacticCenterGilBrand`
- `GalacticEquatorIAU1958`
- `GalacticEquator`
- `GalacticEquatorMidMula`
- `Skydram`
- `TrueMula`
- `DhruvaGalCenterMulaWilhelm`
- `Aryabhata522`
- `BabylBritton`

Use the schema as the authoritative list when presenting a selection to users.
