---
title: Dasha
description: Vimshottari, Chara, and Sthira dasha calculations and queries.
---


The `Dasha` namespace calculates planetary Vimshottari periods and sign-based
Jaimini Chara and Sthira periods. All dasha calculators consume a `Moment` and
shared `Placements`.

```ts
const vimshottari = yield* Dasha.calculate(moment, placements);
const current = Dasha.at(vimshottari, moment.date);
```

## Functions

| Function | Description |
| --- | --- |
| `calculate(moment, placements)` | Builds a Vimshottari timeline |
| `at(timeline, date)` | Finds the active Vimshottari Maha Dasha and Antar Dasha |
| `calculateChara(moment, placements)` | Builds the Chara sign timeline |
| `calculateSthira(moment, placements)` | Builds the Sthira sign timeline, including Brahma selection |
| `atRashi(timeline, date)` | Finds the active Chara or Sthira Maha Dasha and Antar Dasha |

The focused submodules expose the same operations:

```ts
import * as Chara from "astro-ascendant/dasha/chara";
import * as Sthira from "astro-ascendant/dasha/sthira";
import * as Vimshottari from "astro-ascendant/dasha/vimshottari";
```

Each calculator returns an Effect. Query functions are pure and return the
matching current period (or the module's typed query error when the date is
outside the timeline).

## Vimshottari models

- `VimshottariDasha` is an array of `MahaDasha` values.
- `MahaDasha` contains `mahadasha`, `start`, `end`, and `antardashas`.
- `AntarDasha` contains the parent and child planets plus `start` and `end`.
- `CurrentDasha` contains the active `mahadasha` and `antardasha`.

## Rashi dasha models

- `CharaDasha` and `SthiraDasha` identify the system, provenance, and
  `RashiMahaDasha` timeline.
- `RashiMahaDasha` and `RashiAntarDasha` use signs instead of planets.
- `CurrentRashiDasha` is the result of `atRashi`.
- `SthiraDasha` additionally includes `Brahma` and its `BrahmaSelection`.
  Selection evidence includes Rashi Bala and candidate scores.

Dates are UTC `DateTime` values. Dasha provenance is recorded on Chara and
Sthira results so consumers can identify the versioned calculation method.
