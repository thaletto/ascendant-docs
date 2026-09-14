---
title: Skills and Plugins
description: Install the Ascendant skill or plugins into Claude Code, Codex, or any skill-compatible agent.
---

The Ascendant skill lives in [`thaletto/ascendant-agents`](https://github.com/thaletto/ascendant-agents).
It turns a saved birth record into evidence-backed Vedic astrology readings.

## What

The skill has three arguments:

- `init` creates or refreshes a reusable `persons/<name>/` record (chart, dasha, Ashtakavarga, Jaimini artifacts) from exact birth data;
- `setup` installs calculation dependencies, smfs, and the `persons/` mount once per working directory;
- `analysis` answers a reading or timing question from the saved record, grounding claims in stored charts and method references (KP for timing/yes-no, Parashari for promise/quality/synthesis).

With no argument it infers one: birth data means `init`, a missing `persons/` means `setup`, a life question means `analysis`.

## Why

Readings stay consistent because three things are separated: deterministic calculations (same Located Moment always yields the same Placements and charts), durable person memory (`persons/<name>/MEMORY.md` accumulates only confirmed events), and guidebook method (local KP/Parashari references searched per query). Interpretations never substitute for stored evidence.

The skill ships to many harnesses from a single source of truth: `skills/ascendant/SKILL.src.md` plus the skill subtrees. Setup is documented next to the skill in [`skills/ascendant/instructions/setup.md`](https://github.com/thaletto/ascendant-agents/blob/main/skills/ascendant/instructions/setup.md). It accepts Bun or Node with npm, installs calculation dependencies in the agent's current working directory without saving them to an existing package manifest or writing a lockfile, and never changes person records.

## Installation

Pick one installation method. They all install the same skill.

## Standalone skill

From the working directory where you want to use Ascendant, run:

```bash
npx skills add thaletto/ascendant-agents
```

Choose the agent or agents that should receive the skill when prompted.

## Claude Code plugin

Run these commands inside Claude Code:

```text
/plugin marketplace add thaletto/ascendant-agents
/plugin install ascendant@ascendant
/reload-plugins
```

## Codex plugin

Run:

```bash
codex plugin marketplace add thaletto/ascendant-agents --ref main
codex plugin add ascendant@ascendant
```

Start a new Codex task after installation so the skill is loaded.

## Other harnesses

Every directory below in [`thaletto/ascendant-agents`](https://github.com/thaletto/ascendant-agents) contains a ready-to-use `skills/ascendant/` copy. Copy it into the matching directory of your project root:

| Harness                 | Copy from                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| Cursor                  | `.cursor/skills/ascendant/`                                                                               |
| Gemini CLI              | `.gemini/skills/ascendant/`                                                                               |
| DeepSeek Harness        | `.dsh/skills/ascendant/`                                                                                  |
| Codex CLI (repo skills) | `.agents/skills/ascendant/`                                                                               |
| GitHub Copilot          | `.github/skills/ascendant/`                                                                               |
| Kiro                    | `.kiro/skills/ascendant/`                                                                                 |
| OpenCode                | `.opencode/skills/ascendant/` (plus `.opencode/commands/ascendant.md` for the `/ascendant` slash command) |
| Pi                      | `.pi/skills/ascendant/`                                                                                   |
| Qoder                   | `.qoder/skills/ascendant/`                                                                                |
| Trae                    | `.trae/skills/ascendant/`                                                                                 |
| Trae China              | `.trae-cn/skills/ascendant/`                                                                              |
| Rovo Dev                | `.rovodev/skills/ascendant/`                                                                              |
| Mistral Vibe            | `.vibe/skills/ascendant/`                                                                                 |
| Veto                    | `.veto/skills/ascendant/`                                                                                 |
| Grok Build              | `.grok/skills/ascendant/`                                                                                 |
| Antigravity             | `.agent/skills/ascendant/`                                                                                |
| Hermes Agent            | `.hermes/skills/ascendant/`                                                                               |

## After install

The skill works from a saved person record in the agent's current working
directory. On first use the agent runs the skill's one-time setup there, then
asks for the birth data it needs: name, exact ISO 8601 birth moment (with `Z`
or offset), latitude, and longitude.

## Verify a local checkout

To verify the skill source itself, clone
[`thaletto/ascendant-agents`](https://github.com/thaletto/ascendant-agents)
and run:

```bash
bun install --frozen-lockfile
bun run typecheck
```

Or, with Node 22.6+:

```bash
npm install
npm run typecheck
```

Regenerate skill copies after editing the source with `make build-skill` (or `npm run build:skill`).
