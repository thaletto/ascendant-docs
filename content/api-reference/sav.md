---
title: SAV
description: Ashtakavarga and Shodhya Pinda calculations for shared chart placements.
---


The `SAV` namespace calculates Parashari Ashtakavarga from shared
`Chart.Placements`.

```ts
const result = yield* SAV.calculate(calculation.placements);
```

## `calculate(placements)`

Returns an Effect containing:

- **Bhinnashtakavarga (BAV)**: a twelve-sign score table for each of the seven
  classical planets and Lagna.
- **Sarvashtakavarga (SAV)**: the sum of the seven planetary BAV tables.
  Lagna's BAV is excluded; the twelve SAV scores total 337 under the
  classical table.
- **Reduced BAV**: planetary BAV after Trikona and Ekadhipatya reductions.
- **Shodhya Pinda**: per-planet weighted totals built from Rashi Pinda and
  Graha Pinda.
- **Totals and validation data**: the expected BAV/SAV totals used to verify
  the calculation.

## Models

| Model | Shape |
| --- | --- |
| `AshtakavargaPlanets` | Seven classical planets |
| `AshtakavargaEntities` | Those planets plus `Lagna` |
| `SignScores` | Record of the twelve signs to integer scores |
| `BhinnaAshtakavarga` | Entity-to-sign score tables |
| `ReducedAshtakavarga` | Planet-to-sign reduced score tables |
| `ShodhyaPinda` | Planet-to-`Pinda` records |
| `AshtakavargaResult` | Complete calculation result |

Ashtakavarga scores are bindu counts, not probabilities or predictions. The
module exports `SAVCalculationError` for invalid or inconsistent placement
evidence.
