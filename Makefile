.DEFAULT_GOAL := help

.PHONY: help install dev build preview typecheck fmt fmt-check lint lint-fix check sync-skills

help: ## Show available development commands.
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ {printf "%-16s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies with Bun.
	bun install

dev: ## Run the local docs site.
	bun run dev

build: ## Build the production site.
	bun run build

preview: ## Serve the production build.
	bun run preview

typecheck: ## Generate MDX types and run tsc.
	bun run types:check

fmt: ## Format the repo with oxfmt.
	bun run fmt

fmt-check: ## Check formatting without writing.
	bun run fmt:check

lint: ## Lint with oxlint.
	bun run lint

lint-fix: ## Lint and apply fixes.
	bun run lint:fix

check: fmt-check lint typecheck ## Run format, lint, and type checks.

sync-skills: ## Replace content/skills with the skills tree fetched from GitHub.
	bun run sync:skills
