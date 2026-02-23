# Agents

This folder contains the **source** for each installable Cursor agent pack in this repository.

Each agent pack typically includes:

- **`rule.mdc`**: the entry rule that activates for relevant file globs (components, styles, stories, tokens, etc.)
- **`rules/*.mdc`** (optional): specialized sub-rules referenced by the entry rule
- **`agent.md`** (optional): an invokable Cursor agent that provides structured workflows (audit, scaffold, review, document, etc.)

When installed into a target project, files are copied to:

- `agents/<slug>/rule.mdc` → `.cursor/rules/<slug>.mdc`
- `agents/<slug>/rules/*.mdc` → `.cursor/rules/<slug>/*.mdc`
- `agents/<slug>/agent.md` → `.cursor/agents/<slug>.md`

## Included agents (today)

- **`design-system/`**: standards + workflows for maintaining a component library (tokens, a11y, Storybook, structure).

## Template variables

Some agent files include template variables that are substituted at install time:

- **`[project_folder]`**: derived from your target project’s `package.json` name (npm scope), or the target directory name
- **`[project_name]`**: title-cased version of `[project_folder]`
- **`[style_package]`**: style/tokens package name (default: `<project_folder>-style`)

You can override them via install flags:

- `--project-name <name>`
- `--style-package <name>`

## Adding a new agent pack

Create `agents/<slug>/` with:

- `rule.mdc` (required)
- `agent.md` (optional)
- `rules/` (optional sub-rules)

Then add the slug to `agents/manifest.json` so the installer can list and install it.

