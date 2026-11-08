# Universal Prompt Library

A lightweight, file-based prompt workspace for discovering, customizing, and reusing AI prompt templates across professional fields. The initial collection is intentionally made of mock examples. Prompt content and metadata live in individual Markdown files; the UI discovers them at build time.

## Technology

- React 19 and Vite
- React Router for client-side routes
- Tailwind CSS 4 (PostCSS) plus semantic CSS variables for the product theme
- Markdown files with YAML frontmatter, discovered through `import.meta.glob`
- `gray-matter` for frontmatter, `react-markdown` and `remark-gfm` for safe rendering, and `rehype-highlight` for code highlighting
- Lucide React icons

There is no backend or database. The only browser persistence is the explicitly requested light/dark theme preference.

## Features

- Dynamic profession and prompt discovery from Markdown files
- Dashboard statistics, featured prompts, profession collections, and recent updates
- Search across titles, descriptions, tags, profession names, and prompt content
- Profession, tag, and recently-updated filters
- Dedicated profession and prompt routes
- Automatic `{{PLACEHOLDER}}` detection, generated input controls, live formatted/raw preview, and reset
- Copy original Markdown, customized Markdown, or readable plain text
- Responsive desktop/mobile navigation and persistent light/dark themes
- Malformed Markdown is skipped without crashing the rest of the catalog

## Setup and development

Requires Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

Vite prints the local development URL. To create a static production bundle:

```bash
pnpm build
pnpm start
```

The production bundle is in `dist/`. Deep links are routed by React Router; the hosting platform should send unknown application paths to `index.html`.

## Folder structure

```text
src/
  components/       Shared layout, dashboard, collection, search, and editor UI
  data/
    catalog.js      Build-time Markdown discovery and frontmatter normalization
    professions/    One folder per profession; one .md file per prompt
  utils/prompts.js  Placeholder, search, and copy-format utilities
  App.jsx           Route table and application theme state
  main.jsx          React/Vite browser entry point
app/globals.css     Tailwind import and shared theme/component styles
index.html          Vite document shell and pre-hydration theme selection
vite.config.js      Vite and React plugin configuration
```

## Add a profession

1. Create a lower-kebab-case folder under `src/data/professions/`, such as `src/data/professions/customer-success/`.
2. Add a Markdown file with valid YAML frontmatter and a unique prompt filename.
3. Set `profession` to the visible profession name, `professionSlug` to the folder slug, and `professionDescription` to a short collection description. The description is used for the first prompt discovered in the profession; keep it consistent across that folder.
4. Save the file. Vite reloads the catalog during development; for production, rebuild and redeploy.

No React component or route registration needs to change. A folder with no prompt files is not shown yet; profession sections are derived from their Markdown prompts.

## Add or update a prompt

Create a new `.md` file in the appropriate profession folder. Example:

```markdown
---
id: onboarding-email
title: Customer onboarding email
profession: Customer Success
professionSlug: customer-success
professionDescription: Help customers get value from the product with thoughtful, timely support.
description: Draft a welcoming first email with one clear next step.
tags:
  - Onboarding
  - Email
updatedAt: 2026-11-08
featured: false
---

# Role

You are a thoughtful customer success manager.

# Context

- Product: {{PRODUCT_NAME}}
- Customer goal: {{CUSTOMER_GOAL}}
- First next step: {{NEXT_STEP}}

# Instructions

Write a concise, helpful email. Do not invent product capabilities or customer details.

# Expected output

Subject line followed by the email body.
```

`id`, `title`, `profession`, `description`, `tags`, and `updatedAt` are normalized from frontmatter; `professionSlug` and `professionDescription` are recommended for explicit routes and collection copy. `featured: true` places a prompt in the dashboard feature area. Missing optional fields receive safe fallbacks. Tags should be a YAML list.

Prompt filenames determine the readable route slug: `/prompts/:professionSlug/:filename-without-extension`. Keep filenames unique within each profession folder and use lower-kebab-case.

## Frontmatter fields

| Field | Purpose | Required |
|---|---|---|
| `id` | Stable display/data identifier | No; filename is used |
| `title` | Prompt title | Recommended |
| `profession` | Visible profession name | Recommended |
| `professionSlug` | URL segment and collection key | Recommended; folder name is fallback |
| `professionDescription` | Collection description | Recommended; a generic fallback is used |
| `description` | Short prompt-card summary | Recommended |
| `tags` | Searchable/filterable YAML list | No |
| `updatedAt` | ISO date (`YYYY-MM-DD`) for sorting and display | No |
| `featured` | Show on the dashboard feature row when `true` | No |

Malformed YAML is recorded as a catalog error and skipped so valid prompts remain available. Raw HTML in Markdown is not enabled in the renderer, and unsafe links are filtered by the Markdown rendering library.

## Placeholders

Write placeholders in uppercase with underscores, for example `{{TARGET_AUDIENCE}}`. The editor detects each distinct token, converts it into a labeled field, and uses multiline textareas for names that suggest source code, context, requirements, examples, or other long-form input. Other tokens use a single-line field. Empty tokens stay visible and highlighted; filling a field replaces every occurrence in the live preview. Reset clears the current prompt's values without touching the Markdown source.

The copy actions use the original Markdown, the current customized Markdown, or a plain-text conversion of the customized template. Unfilled values are retained as tokens when copying and surfaced in the confirmation message.

## Markdown rendering and routing

`src/data/catalog.js` eagerly imports `src/data/professions/**/*.md` as raw text at build time. `gray-matter` extracts metadata, and Vite's file paths provide the fallback profession folder and prompt slug. React Router builds the dashboard (`/`), profession index (`/professions`), collection (`/professions/:professionSlug`), prompt workspace (`/prompts/:professionSlug/:promptSlug`), and search (`/search`) routes from that catalog.

`react-markdown` renders headings, lists, tables, code, quotes, and links. GFM tables and task lists are enabled. Raw HTML is disabled; code blocks are highlighted. Adding a new file is automatic in development after Vite refreshes, but Vite does not scan arbitrary production server folders at runtime: every production content change requires a new build and deployment.

## Customization

- Edit a prompt's `.md` file to change its body, tags, description, or update date.
- Add new profession folders or Markdown prompt files without changing the UI.
- Shared design tokens are defined in `app/globals.css`; both themes use the same semantic component styles.
- Routes and discovery logic live separately from page components so the file catalog can later be replaced by a database-backed data layer if needed.
