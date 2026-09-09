---
title: Jaimini
description: Jaimini calculations for Chara Karakas, Rashi Drishti, Karakamsha, Arudha Pada, Upapada, and Argala.
---


Ascendant exposes each Jaimini calculation as an independent root subpath.
They consume `Chart.Placements` unless noted otherwise and return typed Effect
results.

| Subpath | Namespace | Entry point | Purpose |
| --- | --- | --- | --- |
| `astro-ascendant/chara-karakas` | `CharaKarakas` | `calculate(placements)` | Assigns the seven Chara Karaka roles |
| `astro-ascendant/rashi-drishti` | `RashiDrishti` | `calculate(reference)` | Returns sign-aspect relationships for a reference sign |
| `astro-ascendant/karakamsha` | `Karakamsha` | `calculate(placements)` | Finds the D9 sign for each Atmakaraka holder |
| `astro-ascendant/arudha-pada` | `ArudhaPada` | `calculate(placements, house)` | Calculates one house's Arudha Pada |
| `astro-ascendant/upapada` | `Upapada` | `calculate(placements)` | Calculates the twelfth-house Arudha Pada |
| `astro-ascendant/argala` | `Argala` | `calculate(placements, reference)` | Calculates supporting and obstructing Argala |

The same namespaces are available from the package root:

```ts
import {
  Argala,
  ArudhaPada,
  CharaKarakas,
  Karakamsha,
  RashiDrishti,
  Upapada,
} from "astro-ascendant";
```

## Input conventions

`RashiDrishti.calculate` accepts one of the twelve sign names directly.
`ArudhaPada.calculate` accepts a house number from `1` through `12`.
`Argala.calculate` accepts either a sign reference or a Ketu reference. Ketu
uses the method's reverse directional counting; do not substitute a generic
planet reference.

## Result conventions

- **Chara Karakas** returns role assignments and preserves ties: planets with
  the same exact degree within their sign jointly hold the relevant role.
- **Karakamsha** returns one result for every planet holding Atmakaraka and
  the corresponding D9 sign.
- **Arudha Pada** returns the projection for the requested house. It does not
  apply exceptional source-sign or seventh-sign adjustments.
- **Upapada** is the Arudha Pada of the twelfth D1 house.
- **Rashi Drishti** returns sign relationships, not degree-based planetary
  aspects.
- **Argala** returns supporting and obstructing relationships around one
  explicit reference.

Each submodule exports its result schema and domain errors alongside
`calculate`.
