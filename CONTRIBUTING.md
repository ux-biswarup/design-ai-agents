# Contributing to Design AI Agents

Thank you for considering contributing. This document explains how to add new agents and submit changes.

## Who can contribute

Everyone is welcome. Please be respectful and constructive. If we add a Code of Conduct, we will link it here and expect all contributors to follow it.

## Adding a new agent

1. **Create the agent folder and files**
   - Add a new directory under `agents/` with a **slug** (lowercase, hyphens only), e.g. `agents/my-agent/`.
   - Include:
     - **`rule.mdc`** (required) — Cursor rule with YAML frontmatter and body.
     - **`agent.md`** (optional) — Subagent prompt with YAML frontmatter and body.

2. **Rule format (`.mdc`)**
   - Frontmatter: `description`, `globs` (file pattern when the rule applies) or `alwaysApply: true`.
   - Body: Short, actionable content (under ~50 lines when possible), one main concern, with concrete examples.
   - See existing `agents/design-system/rule.mdc` and `agents/ux-research/rule.mdc` for reference.

3. **Subagent format (`.md`)**
   - Frontmatter: `name` (slug-friendly), `description` (when to delegate to this specialist — be specific).
   - Body: System prompt for the specialist (what they do when invoked).
   - See existing `agents/design-system/agent.md` and `agents/ux-research/agent.md` for reference.

4. **Register the agent**
   - Add an entry to `agents/manifest.json`:
     ```json
     {
       "slug": "my-agent",
       "name": "My Agent",
       "description": "Short description of what this agent helps with."
     }
     ```

5. **Update the README**
   - Add the new agent to the “Agents” table in [README.md](README.md) (slug, name, when to use).

The installer uses the manifest to list and install agents; it copies `rule.mdc` and `agent.md` (if present) by slug. Do not change installer logic when adding a new agent — only add the folder and manifest entry.

## Quality bar

- **Rules**: One main concern per rule; concise; include concrete examples where helpful.
- **Subagents**: Description should be specific enough for the AI to know when to delegate (e.g. “Use when …”).
- **No overwrite by default**: The installer must not overwrite existing user files without an explicit opt-in (e.g. `--overwrite`).

## Pull request process

1. Branch from `main` (e.g. `feature/accessibility-agent` or `fix/design-system-globs`).
2. One agent or one focused change per PR when possible.
3. Ensure the installer and README stay in sync: new agents must be in `agents/manifest.json` and in the README “Agents” table.
4. Open a PR with a clear title and description. A maintainer will review and may suggest changes.

## Questions

Open an issue for questions or ideas. For bugs or feature requests, please describe the problem or use case and, if applicable, your environment (Cursor version, OS).
