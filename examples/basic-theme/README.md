# Liquivelte Basic Theme

A Shopify-themed example demonstrating end-to-end Liquivelte v4 compilation with Vite, following the official Shopify theme architecture.

## Setup

```bash
# From the root directory
pnpm install
cd examples/basic-theme
pnpm install
```

## Development

```bash
pnpm dev
```

This will:
1. Compile `.liquivelte` files using the liquivelteVitePlugin
2. Emit corresponding `.liquid` files for Shopify SSR
3. Serve the Svelte-compiled version for local development

## Build

```bash
pnpm build
```

This generates a complete Shopify theme in `dist/`:
- `dist/layout/` - Theme layout files (theme.liquid)
- `dist/sections/` - Compiled Liquid sections from .liquivelte files
- `dist/snippets/` - Compiled Liquid snippets from .liquivelte files
- `dist/blocks/` - Compiled Liquid blocks from .liquivelte files
- `dist/templates/` - JSON templates (index.json, product.json, etc.)
- `dist/config/` - Theme configuration (settings_schema.json)
- `dist/locales/` - Translation files
- `dist/assets/` - CSS and JavaScript assets

## What This Demonstrates

- **Shopify Theme Architecture**: Follows the official Shopify theme directory structure
- **Liquivelte Vite Plugin Integration**: Real-world usage of `liquivelteVitePlugin`
- **Dual Output**: Svelte for client-side hydration + Liquid for Shopify SSR
- **Schema Handling**: Shopify section schema preserved in Liquid, stripped from Svelte
- **Liquid Syntax**: `{% for %}`, `{{ output }}`, and filters compiled to Svelte
- **Trace Protocol**: JSON trace script emitted for SSR component tracking
- **Section Groups**: JSON section groups for header/footer areas
- **Blocks**: Reusable blocks within sections
- **Templates**: JSON templates that reference sections
- **Assets**: CSS and JavaScript with Liquid support (.css.liquid, .js.liquid)

## File Structure

```
examples/basic-theme/
├── assets/                        # CSS, JavaScript, images
│   ├── base.css                   # Main stylesheet with Liquid variables
│   └── theme.js                   # Theme JavaScript
├── blocks/                        # Reusable blocks for sections
├── config/                        # Theme configuration
│   └── settings_schema.json       # Theme settings schema
├── layout/                        # Theme layout files
│   └── theme.liquid              # Main layout (required)
├── locales/                       # Translation files
│   └── en.default.json           # English translations
├── sections/                      # Sections and section groups
│   ├── header-group.liquid       # Header section group (JSON)
│   ├── footer-group.liquid       # Footer section group (JSON)
│   ├── hero-section.liquivelte   # Hero section (Liquivelte)
│   └── featured-collection.liquivelte  # Featured collection (Liquivelte)
├── snippets/                      # Reusable Liquid snippets
├── templates/                     # Page templates
│   ├── customers/                # Customer account templates
│   ├── metaobject/               # Metaobject templates
│   └── index.json                # Homepage template (JSON)
├── index.html                     # HTML entry point for development
├── main.js                        # Simple entry script
├── vite.config.ts                 # Vite config with liquivelteVitePlugin
├── package.json                   # Dependencies
└── README.md                      # This file
```

## Plugin Configuration

The plugin is configured in `vite.config.ts` to:
- Scan `sections/`, `snippets/`, and `blocks/` directories for `.liquivelte` files
- Emit compiled Liquid files to corresponding directories in `dist/`
- Copy non-.liquivelte Shopify theme files (layout, config, locales, assets, templates) to `dist/`
- Transform `.liquivelte` files to Svelte for development

## Shopify Theme Architecture

This example follows the official Shopify theme architecture:

- **Layout**: Base template (theme.liquid) with repeated elements like headers/footers
- **Templates**: Page-specific templates (index.json for homepage, product.json for products)
- **Sections**: Reusable, customizable modules (hero-section, featured-collection)
- **Section Groups**: JSON containers for layout areas (header-group, footer-group)
- **Blocks**: Reusable content modules within sections
- **Snippets**: Reusable Liquid code invisible to merchants
- **Assets**: CSS, JavaScript, and images
- **Config**: Theme settings schema
- **Locales**: Translation files for internationalization

## Liquivelte vs Liquid

- `.liquivelte` files compile to both Svelte (for hydration) and Liquid (for Shopify SSR)
- `.liquid` files are copied as-is (for section groups, snippets, etc.)
- The plugin preserves schema blocks in Liquid output
- The plugin strips schema blocks from Svelte output
- Trace scripts are embedded in Liquid for SSR component tracking
