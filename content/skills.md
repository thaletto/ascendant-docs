---
title: Skills and Plugins
description: Install the Ascendant skill or plugins into Claude Code, Codex, or any skill-compatible agent.
---

The Ascendant skill lives in [`thaletto/ascendant-agents`](https://github.com/thaletto/ascendant-agents).
It gives your agent two operations backed by `astro-ascendant` and Effect:

- `init-person` creates a reusable `persons/<name>/` calculation record.
- `check-transit` returns a compact D1 transit chart as TOON.

Pick one installation method. All three install the same skill.

## Standalone skill

From the working directory where you want to use Ascendant, run:

```bash
npx skills add thaletto/ascendant-agents --skill ascendant
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

## After install

The skill works from a saved person record in the agent's current working
directory. On first use the agent runs the skill's one-time setup there, then
asks for the birth data it needs: name, exact ISO 8601 birth moment (with `Z`
or offset), latitude, and longitude.

Setup accepts Bun or Node with npm. It installs calculation dependencies in the
working directory without saving them to an existing package manifest or
writing a lockfile, and it never changes person records.

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
