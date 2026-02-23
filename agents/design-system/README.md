# Design System Agent

The **design-system** agent pack installs:

- a **Cursor rule entry point** (`design-system.mdc`) that activates on design-system-related files
- a set of **specialized sub-rules** (accessibility, styling, Storybook, tokens, etc.)
- an optional **invokable agent** (`design-system.md`) that provides repeatable workflows (audit, scaffold, document, review)

This is meant for teams building a **component library** and **design tokens** with consistent standards.

## What it helps you do

- **Build components consistently** (types → component → styles → exports → tests → stories)
- **Use tokens correctly** (avoid hardcoded colors/spacing/typography)
- **Maintain accessibility** (keyboard, ARIA, focus, labeling)
- **Keep Storybook docs clean** (overview + variants + disabled, consistent controls)
- **Review changes faster** with a structured checklist

## What gets installed where

- `agents/design-system/rule.mdc` → `.cursor/rules/design-system.mdc`
- `agents/design-system/rules/*.mdc` → `.cursor/rules/design-system/*.mdc`
- `agents/design-system/agent.md` → `.cursor/agents/design-system.md`

## How the rules activate

The entry rule (`rule.mdc`) applies to common design-system file locations like:

- `**/components/**/*`
- `**/design-system/**/*`
- `**/tokens/**/*`, `**/design-tokens/**/*`
- `**/stories/**/*`, `**/.storybook/**/*`
- `**/styles/**/*`, `**/theme/**/*`

Cursor will then use the most relevant sub-rule for the file you’re editing (component structure, styling conventions, Storybook stories, etc.).

## Sub-rules included

See `rule.mdc` for the definitive list. The intent is:

- **`accessibility-guidelines`**: WCAG AA practices for interactive components
- **`component-internal-structure`**: import order, `forwardRef`, prop patterns, file organization
- **`styling-conventions`**: CSS Modules/SCSS rules, token usage, anti-patterns
- **`storybook-stories`**: Storybook CSF conventions and documentation patterns
- **`layout-components`**: layout primitives (Box/Flex) and spacing patterns
- **`new-component-implementation`**: end-to-end scaffold checklist
- **`react-context`**: provider/hook conventions
- **`color-token-management`**: process for adding/modifying tokens in the style package
- **`base-components`**: guidance for base UI primitives (inputs/lists/etc.)

## How to use the invokable agent (examples)

In Cursor chat, invoke the installed agent and use prompts like:

- “audit Button”
- “scaffold Toast (variants: success, error; sizes: sm, md)”
- “token audit components/”
- “document TextField”
- “review my changes to Card”

## Template variables

This agent pack is designed to adapt to your repo via install-time variables:

- **`@[project_folder]/core`**: component library import path example
- **`[project_name]`**: project name for prose and headings
- **`[style_package]`**: token/style package name referenced in styling/token rules

Override them via:

- `--project-name <name>`
- `--style-package <name>`

