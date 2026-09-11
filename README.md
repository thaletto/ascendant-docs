# Ascendant Docs

<p align="center">
  <img src="assets/logo.png" alt="Ascendant" width="360" />
</p>

Ascendant Docs is the human-readable documentation site for Ascendant, a
sidereal astrology calculation engine and its agent workflows.

The engine ships as `astro-ascendant` on npm (Effect-first TypeScript) and
PyPI (Python), so this site covers both libraries — not Python alone.

It explains how Ascendant calculates and presents sidereal astrology data,
including sidereal charts, divisional charts, Vimshottari Dasha periods, yogas,
Ashtakavarga, and a focused Jaimini analysis.

## What you can learn

- How Ascendant's calculation model works
- The difference between signs, houses, charts, and timing
- How Parashari, Jaimini, and KP approaches differ
- How to understand saved person records and agent workflows
- How to use the TypeScript and Python libraries and choose calculation settings
- The evidence and safety boundaries for astrology guidance

## Calculation model

Ascendant's documented workflow uses the sidereal zodiac, Lahiri ayanamsa,
and Whole Sign houses by default. Its interpretation workflow compares selected
Parashari and Jaimini evidence before considering divisional charts, Vimshottari
periods, transits, and Ashtakavarga.

The project names its methods explicitly so results can be checked and
reproduced. A reading is interpretive guidance, not certainty or a substitute
for medical, legal, or financial advice.

## Find your way around

- Start with [Getting Started](content/index.md)
- Browse the [API reference](content/api-reference/chart.md): [Chart](content/api-reference/chart.md),
  [Dasha](content/api-reference/dasha.md), [Ashtakavarga](content/api-reference/sav.md),
  [Jaimini](content/api-reference/jaimini.md)
- Read the project glossary in `CONTEXT.md`

## Contributing

Keep explanations plain, name the calculation method being discussed, and
preserve the distinction between birth data, calculated records, charts,
timing, and interpretation. When documenting a new behavior, include the
evidence or source that supports it.
