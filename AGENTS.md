# Agent guidance

This repository contains only the Ascendant documentation website.

- Keep documentation source under `content/` and website code under `src/`.
- Maintain `content/skills/` manually. Do not add a build-time dependency on
  the agents repository.
- Link Python implementation details to
  `https://github.com/thaletto/ascendant`.
- Link executable skill specifications to
  `https://github.com/thaletto/ascendant-agents`.
- Run `bun run lint`, `bun run types:check`, and `bun run build` before
  committing.
