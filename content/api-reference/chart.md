---
title: Chart
description: Chart generation and placement models for D1 and divisional charts.
---


The `Chart` namespace is the main entry point. It calculates shared sidereal
placements once and projects them into D1 and requested divisional charts.
`Chart.generate` also calculates house cusps and angles through the supplied
ephemeris service.

## Quick start

```ts
import { AstroParams, Chart, Swisseph } from "astro-ascendant";
import { DateTime, Effect, Layer } from "effect";

const input = Chart.ChartParams.make({
  moment: Chart.Moment.make({
    date: DateTime.makeUnsafe("2000-01-01T12:00:00.000Z"),
  }),
  latitude: 12.9716,
  longitude: 77.5946,
  sex: "Male",
});

const program = Chart.generate(input, [9]).pipe(
  Effect.provide(runtimeLayer)
);

```

## Functions

### `generate(input, divisions)`

`divisions` may contain `1, 2, 3, 4, 7, 9, 10, 12, 16, 20, 24, 27, 30, 40,
45, 60`. D1 (`division: 1`) is always first. Duplicate requests are removed
and the remaining divisions are sorted numerically.

Coordinates must be finite latitude values from `-90` through `90` and
longitude values from `-180` through `180`. The optional `sex` value is
`"Male"` or `"Female"` and is copied to each projected chart; it has no
inferred default.

### `project(placements, divisions, sex?)`

Projects already calculated `Placements` without invoking an ephemeris
service. It returns a non-empty tuple of `Chart` values beginning with D1.
Use this when several chart views should share the same placement evidence.

## Core models

| Model | Important fields |
| --- | --- |
| `Moment` | UTC `date` |
| `LocatedMoment` | `moment`, finite `latitude`, finite `longitude` |
| `ChartParams` | `LocatedMoment` fields plus optional `sex` |
| `Placements` | source `lagna` and source planet positions |
| `ChartCalculation` | `placements`, `charts`, and `astroParams` |
| `Chart` | `division`, cusp-aware `houses`, optional angles and significations |
| `House` | sign, cusp, lords, planets, and optional Lagna |
| `Planet` | longitude, degree, retrograde state, dignity, and sign |
| `Nakshatra` | name, lord, and pada |
| `Sign` | sign name and classical lord |

`Chart` uses one-directional relationships: a house lists its planets, while a
planet does not carry a back-reference to its house. To find a planet's house,
scan the chart's houses.

## Supported divisions

`Division` is the union `1 | 2 | 3 | 4 | 7 | 9 | 10 | 12 | 16 | 20 | 24 | 27 |
30 | 40 | 45 | 60`. D1 is the Rashi chart; all other values identify supported
divisional charts derived from the same `Placements`.
