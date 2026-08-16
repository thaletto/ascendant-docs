# Ascendant Docs

This repository contains the documentation website for
[Ascendant](https://github.com/thaletto/ascendant), a Python library for
sidereal Jyotisha calculations.

The site documents the Python API, calculation conventions, and the agent
workflows distributed from
[`ascendant-agents`](https://github.com/thaletto/ascendant-agents).
Skill pages under `content/skills/` are maintained manually for the website;
the executable skill specifications remain in the agents repository.

## Development

Install dependencies with Bun:

```bash
bun install
```

Run the development server:

```bash
bun run dev
```

Before committing, run:

```bash
bun run lint
bun run types:check
bun run build
```

## Related repositories

- [`ascendant`](https://github.com/thaletto/ascendant) — Python library
- [`ascendant-agents`](https://github.com/thaletto/ascendant-agents) — Codex
  plugin, portable skills, and hosted MCP service

## License

AGPL-3.0. See [`LICENSE`](LICENSE).
