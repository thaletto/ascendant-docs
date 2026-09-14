---
title: Ephemeris
description: Ephemeris service contract and runtime-neutral position models.
---

`Ephemeris` is the runtime-neutral service contract used by chart generation.
It keeps astronomical calculations separate from chart projection and allows
applications to provide a different ephemeris implementation.

## Service contract

```ts
interface Ephemeris {
  dateToJulianDay(date: DateTime): Effect.Effect<JulianDay, EphemerisError>;

  calculatePosition(
    julianDay: JulianDay,
    body: CelestialBody,
    ayanamsa: Ayanamsa,
  ): Effect.Effect<PlanetaryPosition, EphemerisError>;

  calculateHouses(
    julianDay: JulianDay,
    latitude: number,
    longitude: number,
    houseSystem: HouseSystem,
    ayanamsa: Ayanamsa,
  ): Effect.Effect<HouseData, EphemerisError>;
}
```

The service is available as the `Ephemeris` Effect context tag. Implementations
should return `EphemerisError` rather than silently substituting astronomical
values.

## Models

`CelestialBody` supports `Sun`, `Moon`, `Mars`, `Mercury`, `Venus`, `Jupiter`,
`Saturn`, and `TrueNode`. Ketu is derived by Ascendant from Rahu's exact
opposition.

`PlanetaryPosition` contains longitude, latitude, distance, the three
corresponding speeds, and ephemeris flags. `HouseData` contains the twelve
cusps, ascendant, MC, ARMC, vertex, equatorial ascendant, two co-ascendants,
polar ascendant, and the selected house system.

`JulianDay` is a branded finite number. Use the service's date conversion
method instead of constructing one from an unverified timestamp.
