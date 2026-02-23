#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const AGENTS_DIR = path.join(__dirname, '..', 'agents');
const MANIFEST_PATH = path.join(AGENTS_DIR, 'manifest.json');

function loadManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
  return JSON.parse(raw);
}

function parseArgs(argv) {
  let args = argv.slice(2);
  if (args[0] === 'add') args = args.slice(1);
  let targetDir = process.cwd();
  let overwrite = false;
  let projectName = null;
  let stylePackage = null;
  const slugs = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target' && args[i + 1]) {
      targetDir = path.resolve(args[++i]);
    } else if (args[i] === '--project' && args[i + 1]) {
      targetDir = path.resolve(args[++i]);
    } else if (args[i] === '--project-name' && args[i + 1]) {
      projectName = args[++i];
    } else if (args[i] === '--style-package' && args[i + 1]) {
      stylePackage = args[++i];
    } else if (args[i] === '--overwrite') {
      overwrite = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      return { help: true };
    } else if (!args[i].startsWith('-')) {
      slugs.push(args[i]);
    }
  }

  return { targetDir, overwrite, slugs, projectName, stylePackage, help: false };
}

/**
 * Extract just the npm scope from a package name.
 * "@vibe/core"  → "vibe"
 * "@acme/ui"    → "acme"
 * "@acme"       → "acme"
 * "myapp"       → "myapp"
 */
function extractScope(name) {
  const stripped = name.startsWith('@') ? name.slice(1) : name;
  const slashIdx = stripped.indexOf('/');
  return slashIdx > -1 ? stripped.slice(0, slashIdx) : stripped;
}

/**
 * Resolve template variables for substitution.
 * Priority: explicit flags → target package.json "name" → directory basename.
 *
 * Variables produced:
 *   [project_folder]  — npm scope only (e.g. "vibe" from "@vibe/core")
 *   [project_name]    — title-cased scope (e.g. "Vibe")
 *   [style_package]   — style/tokens package name (e.g. "vibe-style")
 */
function resolveVars(targetDir, projectNameArg, stylePackageArg) {
  let scope;
  if (projectNameArg) {
    scope = extractScope(projectNameArg);
  } else {
    const pkgPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.name) scope = extractScope(pkg.name);
      } catch (_) {}
    }
    if (!scope) scope = path.basename(targetDir);
  }

  const projectName = scope.charAt(0).toUpperCase() + scope.slice(1);
  const stylePackage = stylePackageArg || `${scope}-style`;

  return { projectFolder: scope, projectName, stylePackage };
}

/**
 * Replace template variables in file content.
 * Supported variables:
 *   [project_folder]  → npm scope (e.g. "vibe")
 *   [project_name]    → title-cased name (e.g. "Vibe")
 *   [style_package]   → style package name (e.g. "vibe-style")
 */
function resolveContent(content, vars) {
  return content
    .replace(/\[project_folder\]/g, vars.projectFolder)
    .replace(/\[project_name\]/g, vars.projectName)
    .replace(/\[style_package\]/g, vars.stylePackage);
}

/**
 * Read src, apply variable substitution, and write to dest.
 */
function writeResolved(src, dest, vars) {
  const content = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(dest, resolveContent(content, vars));
}

function installAgent(slug, targetDir, overwrite, vars) {
  const agentPath = path.join(AGENTS_DIR, slug);
  const ruleSrc = path.join(agentPath, 'rule.mdc');
  const agentSrc = path.join(agentPath, 'agent.md');

  const rulesDir = path.join(targetDir, '.cursor', 'rules');
  const agentsDir = path.join(targetDir, '.cursor', 'agents');
  const ruleDest = path.join(rulesDir, `${slug}.mdc`);
  const agentDest = path.join(agentsDir, `${slug}.md`);

  if (!fs.existsSync(ruleSrc)) {
    return { ok: false, slug, error: `Agent "${slug}" has no rule.mdc` };
  }

  const results = { slug, rule: null, agent: null, subRules: null };

  // Install main rule.mdc
  if (!fs.existsSync(rulesDir)) {
    fs.mkdirSync(rulesDir, { recursive: true });
  }
  if (fs.existsSync(ruleDest) && !overwrite) {
    results.rule = 'skipped (exists)';
  } else {
    writeResolved(ruleSrc, ruleDest, vars);
    results.rule = 'installed';
  }

  // Install agent.md if present
  if (fs.existsSync(agentSrc)) {
    if (!fs.existsSync(agentsDir)) {
      fs.mkdirSync(agentsDir, { recursive: true });
    }
    if (fs.existsSync(agentDest) && !overwrite) {
      results.agent = 'skipped (exists)';
    } else {
      writeResolved(agentSrc, agentDest, vars);
      results.agent = 'installed';
    }
  }

  // Install sub-rules from agents/{slug}/rules/ if the directory exists
  const subRulesSrcDir = path.join(agentPath, 'rules');
  if (fs.existsSync(subRulesSrcDir)) {
    const subRulesDestDir = path.join(rulesDir, slug);
    if (!fs.existsSync(subRulesDestDir)) {
      fs.mkdirSync(subRulesDestDir, { recursive: true });
    }
    const subRuleFiles = fs.readdirSync(subRulesSrcDir).filter((f) => f.endsWith('.mdc'));
    let installed = 0;
    let skipped = 0;
    for (const filename of subRuleFiles) {
      const src = path.join(subRulesSrcDir, filename);
      const dest = path.join(subRulesDestDir, filename);
      if (fs.existsSync(dest) && !overwrite) {
        skipped++;
      } else {
        writeResolved(src, dest, vars);
        installed++;
      }
    }
    results.subRules = { total: subRuleFiles.length, installed, skipped };
  }

  return { ok: true, ...results };
}

function setupUxResearch(targetDir) {
  const researchDir = path.join(targetDir, 'research');
  const subdirs = [
    path.join(researchDir, 'transcripts'),
    path.join(researchDir, 'analysis'),
    path.join(researchDir, 'insights'),
    path.join(researchDir, 'deliverables')
  ];

  if (!fs.existsSync(researchDir)) {
    fs.mkdirSync(researchDir, { recursive: true });
  }
  subdirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const gitkeep = path.join(dir, '.gitkeep');
    if (!fs.existsSync(gitkeep)) {
      fs.writeFileSync(gitkeep, '');
    }
  });

  const memoryPath = path.join(researchDir, '.research-memory.json');
  if (!fs.existsSync(memoryPath)) {
    const projectName = path.basename(targetDir) || 'project';
    const initialMemory = {
      project: {
        name: projectName,
        created: new Date().toISOString().slice(0, 10),
        research_questions: [],
        target_audience: ''
      },
      participants: [],
      themes: [],
      insights: [],
      deliverables: [],
      contradictions: [],
      config: {
        min_theme_evidence: 3,
        confidence_threshold: 0.7,
        auto_save: true,
        participant_anonymization: true
      }
    };
    fs.writeFileSync(memoryPath, JSON.stringify(initialMemory, null, 2));
  }

  const readmePath = path.join(researchDir, 'README.md');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `# UX Research

This folder contains UX research data and outputs for the UX Research Agent.

## Structure

- **transcripts/** — Raw research data (interviews, tests, observations)
- **analysis/** — Agent-generated analysis of individual sessions
- **insights/** — Cross-cutting insights and affinity maps
- **deliverables/** — Final outputs (personas, journey maps, reports)

## Getting started

1. Add research data to \`transcripts/\` (or paste in chat and mention @ux-research)
2. In Cursor, invoke the UX Research agent (e.g. @ux-research) and ask to analyze
3. The agent writes analysis here and updates \`.research-memory.json\`
4. Request deliverables (persona, journey map, report) when you have enough data (5+ sessions recommended)

## Privacy

- \`.research-memory.json\` is git-ignored by default (may contain PII)
- Remove PII from transcripts before committing
- Use participant IDs (P001, P002, etc.) instead of names
`;
    fs.writeFileSync(readmePath, readmeContent);
  }

  const templateSrc = path.join(AGENTS_DIR, 'ux-research', 'transcript-template.md');
  const templateDest = path.join(researchDir, 'transcript-template.md');
  if (fs.existsSync(templateSrc) && (!fs.existsSync(templateDest))) {
    fs.copyFileSync(templateSrc, templateDest);
  }

  const gitignorePath = path.join(targetDir, '.gitignore');
  const entries = [
    '',
    '# UX Research Agent - sensitive data',
    'research/.research-memory.json',
    'research/transcripts/*',
    '!research/transcripts/.gitkeep'
  ].join('\n');
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf8');
    if (!content.includes('research/.research-memory.json')) {
      fs.appendFileSync(gitignorePath, entries);
    }
  } else {
    fs.writeFileSync(gitignorePath, entries.trimStart());
  }
}

function printHelp(manifest) {
  const list = manifest.agents.map((a) => `  ${a.slug}  ${a.name}`).join('\n');
  console.log(`
design-ai-agents — Install Cursor AI agents (rules + subagents) into your project.

Usage:
  npx design-ai-agents add <slug> [slug ...] [options]
  node scripts/install.js <slug> [slug ...] [options]

Options:
  --target <path>        Project directory (default: current directory)
  --project <path>       Same as --target
  --project-name <name>    npm scope/name for [project_folder] and [project_name] variables
                           (default: auto-detected from package.json; "@" and sub-path stripped)
  --style-package <name>   Style/tokens package name for [style_package] variable
                           (default: <project-folder>-style, e.g. "acme-style")
  --overwrite              Overwrite existing .mdc/.md files (default: skip)
  --help, -h               Show this help

Available agents:
${list}

Template variables substituted at install time:
  [project_folder]   npm scope  (e.g. "acme" from "@acme/ui")  → used in @[project_folder]/core
  [project_name]     title-case (e.g. "Acme")                   → used in prose references
  [style_package]    style pkg  (e.g. "acme-style")             → used for CSS/tokens package name

Examples:
  npx design-ai-agents add design-system
  npx design-ai-agents add design-system --target ./my-app
  npx design-ai-agents add design-system --target ./my-app --project-name @acme --style-package acme-tokens
  node scripts/install.js design-system --target /path/to/project
`);
}

function main() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Manifest not found. Run this script from the design-ai-agents repo or from the installed package.');
    process.exit(1);
  }

  const manifest = loadManifest();
  const { targetDir, overwrite, slugs, projectName, stylePackage, help } = parseArgs(process.argv);

  if (help) {
    printHelp(manifest);
    process.exit(0);
  }

  const validSlugs = new Set(manifest.agents.map((a) => a.slug));
  const toInstall = slugs.length ? slugs.filter((s) => validSlugs.has(s)) : [];

  if (slugs.length && toInstall.length === 0) {
    console.error('No valid agent slugs. Use --help to see available agents.');
    process.exit(1);
  }
  if (slugs.length && toInstall.length < slugs.length) {
    const invalid = slugs.filter((s) => !validSlugs.has(s));
    console.error('Unknown agent(s):', invalid.join(', '));
  }

  if (toInstall.length === 0) {
    printHelp(manifest);
    process.exit(0);
  }

  const resolvedTarget = path.resolve(targetDir);
  if (!fs.existsSync(resolvedTarget)) {
    console.error('Target directory does not exist:', resolvedTarget);
    process.exit(1);
  }

  const vars = resolveVars(resolvedTarget, projectName, stylePackage);

  console.log('Installing into', resolvedTarget);
  console.log(`  [project_folder] = ${vars.projectFolder}  [project_name] = ${vars.projectName}  [style_package] = ${vars.stylePackage}`);
  if (overwrite) console.log('Overwrite: yes');

  const results = [];
  for (const slug of toInstall) {
    const r = installAgent(slug, resolvedTarget, overwrite, vars);
    results.push(r);
    if (r.ok) {
      const subRuleInfo = r.subRules
        ? `, ${r.subRules.installed} sub-rule(s) installed, ${r.subRules.skipped} skipped`
        : '';
      console.log(`  ${slug}: rule ${r.rule}${r.agent ? `, agent ${r.agent}` : ''}${subRuleInfo}`);
      if (slug === 'ux-research') {
        setupUxResearch(resolvedTarget);
        console.log('  ux-research: research/ folder, memory, and transcript template ready');
      }
    } else {
      console.error(`  ${slug}: ${r.error}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  process.exit(failed.length ? 1 : 0);
}

main();
