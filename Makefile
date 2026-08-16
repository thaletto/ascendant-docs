.DEFAULT_GOAL := help

.PHONY: help sync-skills

help: ## Show available development commands.
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "%-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

sync-skills: ## Replace content/skills with the skills tree fetched from GitHub.
	bun run sync:skills
