# Liquivelte Advanced Theme

A comprehensive Shopify theme example demonstrating advanced Liquivelte v4 features including Tailwind CSS integration, global state management, component composition, and complex Liquid patterns.

## Setup

```bash
# From the root directory
pnpm install
cd examples/advanced-theme
pnpm install
```

## Development

```bash
pnpm dev
```

This runs two parallel processes:
- `vite build --watch` - Compiles `.liquivelte` files and watches for changes
- `shopify theme dev --path=dist` - Syncs compiled theme to Shopify dev store

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

## Advanced Features

### Tailwind CSS Integration
- Full Tailwind CSS configuration with custom theme
- PostCSS processing for Tailwind directives
- Custom color palette and spacing
- Component classes using `@apply` directive
- Responsive design utilities

### Global State Management (Nanostores)
- **Theme Settings Store**: Manages theme colors, fonts, and global settings
- **Cart Store**: Handles shopping cart state (items, subtotal, count)
- **User Store**: Manages user authentication state
- **Search Store**: Search query and results state
- **Wishlist Store**: Product wishlist management
- Helper functions for cart operations (add, remove, toggle)

### Component Composition
- Import and use Liquivelte components within sections
- Props passing and reactive state
- Component nesting patterns
- `<svelte:component>` for dynamic rendering

### Advanced Liquid Patterns
- Conditional rendering with `{% if %}`
- Loops with `{% for %}` and `limit` filters
- Block iteration with `{% for block in section.blocks %}`
- Complex filters (`| money`, `| img_url`, etc.)
- Liquid expressions in Svelte reactive statements

### Complex Schemas
- Multiple block types per section
- Rich text settings
- Image pickers with alt text
- Select options for configuration
- Checkbox toggles
- URL inputs

## File Structure

```
examples/advanced-theme/
├── assets/                        # CSS, JavaScript, images
│   ├── base.css                   # Main stylesheet with Tailwind
│   ├── tailwind.css               # Tailwind configuration
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
│   ├── hero-section.liquivelte   # Hero section with component imports
│   ├── product-card.liquivelte   # Reusable product card component
│   ├── image-with-text.liquivelte # Image with text section
│   └── featured-collection.liquivelte  # Featured collection
├── snippets/                      # Reusable Liquid snippets
├── src/                           # Source code for state management
│   └── stores/                    # Nanostores for global state
│       ├── theme.ts              # Theme, cart, user, search stores
│       └── index.ts              # Store exports
├── templates/                     # Page templates
│   ├── customers/                # Customer account templates
│   ├── metaobject/               # Metaobject templates
│   └── index.json                # Homepage template (JSON)
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── index.html                     # HTML entry point for development
├── main.js                        # Simple entry script
├── vite.config.ts                 # Vite config with Svelte + Liquivelte
├── package.json                   # Dependencies
└── README.md                      # This file
```

## State Management Usage

```javascript
import { cart, addToCart, removeFromCart } from '../src/stores';

// Add product to cart
addToCart(product, 1);

// Remove from cart
removeFromCart(productId);

// Access cart state
const currentCart = cart.get();
console.log(currentCart.items, currentCart.subtotal);
```

## Tailwind CSS Usage

```liquid
<div class="bg-gradient-to-r from-primary-50 to-primary-100">
  <h1 class="text-4xl md:text-6xl font-bold mb-6">
    {{- heading -}}
  </h1>
</div>
```

Custom component classes are defined in `assets/base.css` using `@apply`:

```css
.btn {
  @apply inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700;
}
```

## Plugin Configuration

The plugin is configured in `vite.config.ts` to:
- Include Svelte plugin for `.svelte` compilation
- Scan `sections/`, `snippets/`, and `blocks/` directories for `.liquivelte` files
- Emit compiled Liquid files to corresponding directories in `dist/`
- Copy non-.liquivelte Shopify theme files (layout, config, locales, assets, templates) to `dist/`
- Transform `.liquivelte` files to Svelte for development
- Watch `src/` directory for state management changes

## Shopify Theme Architecture

This example follows the official Shopify theme architecture:

- **Layout**: Base template (theme.liquid) with repeated elements like headers/footers
- **Templates**: Page-specific templates (index.json for homepage, product.json for products)
- **Sections**: Reusable, customizable modules with component imports
- **Section Groups**: JSON containers for layout areas (header-group, footer-group)
- **Blocks**: Reusable content modules within sections
- **Snippets**: Reusable Liquid code invisible to merchants
- **Assets**: CSS with Tailwind, JavaScript with state management
- **Config**: Theme settings schema
- **Locales**: Translation files for internationalization

## Liquivelte vs Liquid

- `.liquivelte` files compile to both Svelte (for hydration) and Liquid (for Shopify SSR)
- `.liquid` files are copied as-is (for section groups, snippets, etc.)
- The plugin preserves schema blocks in Liquid output
- The plugin strips schema blocks from Svelte output
- Trace scripts are embedded in Liquid for SSR component tracking
- Component imports work in Svelte output, compile to Liquid includes
