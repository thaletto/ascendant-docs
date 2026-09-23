---
title: Skills and Plugins
description: Install the Ascendant skill or plugins into Claude.ai, Claude Code, Codex, or any skill-compatible agent.
---

## Overview

The **ascendant** skill turns a saved person record and fixed astrological
methods into a deterministic procedure the agent follows. The person record
(`persons/<name>/`) is the source of truth for birth data and chart evidence:
the skill reads it, never re-derives or guesses it. Methods come from the
bundled KP and Parashari guidebooks (KP predominantly, for timing and yes/no
questions; Parashari for promise, quality, yogas, and vargas), with one school
per answer and a provenance check (`school`, `ayanamsa`, `houseSystem`,
`dashaSystem`) before any placement is used.

This targets three common failures in AI astrology:

- **Data mismatch**: every claim cites a chart file (`path:field`), so
  judgments trace to stored evidence rather than recalled positions.
- **Method mix-up**: KP placements are never read with Parashari rules in
  one judgment; each answer names its school once at the top.
- **Data unavailability**: when evidence is missing or conflicts block
  judgment, the skill outputs `Insufficient evidence: run init or attach X`
  instead of hedging.

## Installation

### Claude.ai marketplace

Add the Ascendant marketplace once, then install the skill from it.

1. Open [claude.ai/customize/plugins](https://claude.ai/customize/plugins).
2. Choose **Add marketplace**.
3. Select **Repository**.
4. Enter `thaletto/ascendant-agents` and add it.
5. From that marketplace, add the **ascendant** skill.

After the skill is installed, start a chat with `/ascendant`.

## skills.sh

From the working directory where you want to use Ascendant, run:

```bash
npx skills add thaletto/ascendant-agents
```

Choose the agent or agents that should receive the skill when prompted.

### Claude Code plugin

Run these commands inside Claude Code:

```text
/plugin marketplace add thaletto/ascendant-agents
/plugin install ascendant@ascendant
/reload-plugins
```

### Codex plugin

Run:

```bash
codex plugin marketplace add thaletto/ascendant-agents --ref main
codex plugin add ascendant@ascendant
```

Start a new Codex task after installation so the skill is loaded.

### Other harnesses

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
