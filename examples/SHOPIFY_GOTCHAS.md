# Shopify Theme Development Gotchas

This document records common issues and solutions when developing Shopify themes with Liquivelte.

## Shopify CLI Integration

### Issue: Section type not found
**Error:** `Section type 'hero-section' does not refer to an existing section file`

**Cause:** Shopify CLI was looking at the source directory with `.liquivelte` files, which it doesn't recognize. Shopify CLI expects `.liquid` files.

**Solution:** Use the build script that compiles first, then points Shopify CLI to the dist directory:
```bash
pnpm shopify:dev  # NOT: shopify theme dev
```

The `shopify:dev` script in package.json:
```json
{
  "scripts": {
    "shopify:dev": "pnpm build && shopify theme dev --path=dist"
  }
}
```

## Shopify Theme Configuration

### Issue: theme_documentation_url required
**Error:** `Section 1: theme_documentation_url is required`

**Cause:** Shopify requires `theme_documentation_url` in `config/settings_schema.json` for theme info.

**Solution:** Include both `theme_support_url` and `theme_documentation_url`:
```json
{
  "name": "theme_info",
  "theme_name": "Liquivelte Basic Theme",
  "theme_version": "1.0.0",
  "theme_author": "Liquivelte",
  "theme_support_url": "https://github.com/liquivelte/liquivelte-v4/issues",
  "theme_documentation_url": "https://github.com/liquivelte/liquivelte-v4"
}
```

### Issue: Wrong number of arguments for script_tag
**Error:** `Liquid error (layout/theme line 13): wrong number of arguments (given 2, expected 1)`

**Cause:** The `script_tag` Liquid filter doesn't accept additional arguments like `defer: true`.

**Solution:** Use a standard HTML script tag with defer attribute:
```liquid
<!-- WRONG -->
{{ 'theme.js' | asset_url | script_tag, defer: true }}

<!-- CORRECT -->
<script src="{{ 'theme.js' | asset_url }}" defer></script>
```

## Section Type Naming

### Issue: Section type naming conventions
**Error:** `Section type 'hero_section' does not refer to an existing section file`

**Cause:** Shopify section types must match the file name pattern. Files named `hero-section.liquid` use type `"hero-section"` (with hyphens), not underscores.

**Solution:** Match section types to file names exactly:
- File: `hero-section.liquid` → Type: `"hero-section"`
- File: `featured-collection.liquid` → Type: `"featured-collection"`

In `templates/index.json`:
```json
{
  "sections": {
    "hero": {
      "type": "hero-section"
    },
    "featured_collection": {
      "type": "featured-collection"
    }
  }
}
```

## Liquivelte Compilation

### Issue: Module resolution in workspace
**Error:** `Cannot find module '../compiler/compileLiquivelte'`

**Cause:** When using workspace dependencies, relative imports don't resolve correctly.

**Solution:** In the example, we use direct relative imports from source:
```typescript
import { liquivelteVitePlugin } from '../../src/vite/plugin';
```

This works for development examples. For production packages, use proper package exports.

### Issue: Vite build scanning
**Cause:** `.liquivelte` files not being compiled during build if not imported.

**Solution:** Added `buildStart` hook to scan directories for `.liquivelte` files:
```typescript
async buildStart() {
  const root = process.cwd();
  const sectionsDir = join(root, 'sections');
  const snippetsDir = join(root, 'snippets');
  const blocksDir = join(root, 'blocks');
  
  // Scan and compile all .liquivelte files
  scanDir(sectionsDir);
  scanDir(snippetsDir);
  scanDir(blocksDir);
}
```

## File Copying

### Issue: Non-.liquivelte files not copied to dist
**Cause:** Vite plugin only handles `.liquivelte` files, but Shopify theme needs all directories.

**Solution:** Added copy plugin to copy non-.liquivelte Shopify theme files:
```typescript
{
  name: 'copy-shopify-theme-files',
  closeBundle() {
    copyDir(join(root, 'layout'), join(dist, 'layout'));
    copyDir(join(root, 'config'), join(dist, 'config'));
    copyDir(join(root, 'locales'), join(dist, 'locales'));
    copyDir(join(root, 'assets'), join(dist, 'assets'));
    copyDir(join(root, 'templates'), join(dist, 'templates'));
  }
}
```

## Development Workflow

### Recommended workflow:
1. Edit `.liquivelte` files in source directories
2. Run `pnpm build` to compile to `dist/`
3. Run `pnpm shopify:dev` to preview with Shopify CLI
4. Shopify CLI watches `dist/` for changes and syncs to dev store

### Note on hot reload:
- The current setup requires manual rebuild (`pnpm build`) before Shopify CLI picks up changes
- For automatic rebuilds, consider adding a watch mode to the Vite config
