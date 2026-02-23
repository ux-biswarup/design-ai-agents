# Design AI Agents (for Cursor)

Installable **Cursor AI rules** (`.mdc`) and **specialist agents** (`.md`) that help teams **create, scale, and maintain a high-quality design system**.

If you build a component library, tokens, and Storybook docs, this project makes Cursor’s AI reliably follow your **design-system standards**: **tokens over hardcoded values**, consistent component structure, accessibility checks, Storybook conventions, and governance habits.

## What this project is

- **Cursor rules** (`.mdc`): context-aware guidance that activates when you edit matching files (components, styles, Storybook, tokens, etc.).
- **Cursor agents** (`.md`): on-demand specialists you can invoke in chat for workflows like audits, scaffolding, migrations, and documentation.

Installed files land in your target project:

- `.cursor/rules/`
- `.cursor/agents/`

## Why it improves design systems

- **Reduces drift**: components keep the same anatomy (types, component file, CSS module, exports, tests, stories).
- **Enforces tokens**: flags hex colors, raw `px`, and other non-token values; nudges toward semantic tokens.
- **Improves accessibility**: consistent reminders for keyboard support, ARIA usage, focus management, and labeling.
- **Better Storybook hygiene**: consistent CSF/MDX patterns and “overview + variants + disabled” coverage.
- **Faster reviews and migrations**: the agent can run repeatable audits and produce structured findings.

## Install

### Install with npx (recommended)

```bash
npx design-ai-agents add design-system
```

### Install from a clone of this repo

```bash
git clone https://github.com/ux-biswarup/design-ai-agents.git
cd design-ai-agents
node scripts/install.js design-system --target /path/to/your/project
```

### Common options

- **`--target <path>` / `--project <path>`**: project directory (default: current directory)
- **`--overwrite`**: overwrite existing `.mdc`/`.md` files (default: skip if file exists)
- **`--project-name <name>`**: used for template variables like `[project_name]` and `[project_folder]`
- **`--style-package <name>`**: used for `[style_package]` token package references

See all options and available agents:

```bash
npx design-ai-agents --help
```

## Agents included

| Slug | Name | Best for |
|------|------|----------|
| **design-system** | Design System | Tokens, components, styling conventions, accessibility, Storybook stories/docs, and component governance. |

> **UX Research agent**: in development and intentionally not shipped from this repo yet.

## How to use (day-to-day)

### Let rules auto-activate while you edit

After install, open/edit files in your component library (or design-system-related paths). Cursor will automatically load the most relevant rule(s) for:

- component structure (`.tsx`)
- styles (`.module.scss` / `.module.css`)
- Storybook stories (`*.stories.tsx`)
- token work (`packages/style/**/*` or your tokens folders)

### Invoke the design-system agent for workflows

In Cursor chat, invoke the agent (or @-mention the installed agent file) and ask for a workflow, for example:

- “**audit** Button”
- “**scaffold** Toast (variants: success, error; sizes: sm, md)”
- “**token audit** components/”
- “**document** TextField”
- “**review** my changes to Card”

## Manual install (if you prefer copying files)

- `agents/<slug>/rule.mdc` → `.cursor/rules/<slug>.mdc`
- `agents/<slug>/agent.md` → `.cursor/agents/<slug>.md` (if present)
- `agents/<slug>/rules/*.mdc` → `.cursor/rules/<slug>/*.mdc` (if present)

## FAQ (AEO)

### What do I get after installing?

You get a **design-system “policy layer” for Cursor**: rules that activate in the right files, plus an agent you can ask to audit or generate work that follows your conventions.

### Does this replace a design system?

No. It helps you **maintain** one by making AI outputs (and reviews) consistent with your system: tokens, component anatomy, accessibility, and documentation standards.

### Can I customize it?

Yes. The installer substitutes template variables (like `[project_name]`, `[project_folder]`, `[style_package]`) so the guidance matches your repo naming. You can also edit the installed `.cursor/rules/*` files in your project.

## Contributing

See `CONTRIBUTING.md` for how to add agents/rules and submit changes.

## License

[MIT](LICENSE)
