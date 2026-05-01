# Advanced Theme Showcase Implementation Plan

This document is the implementation brief for the advanced Liquivelte theme.

The goal is not to build a generic Shopify theme. The goal is to show what Liquivelte enables:

- Shopify Liquid renders the complete initial HTML for SEO, performance, and no-layout-shift SSR.
- Svelte progressively hydrates high-value interactions.
- Liquid scope, loops, filters, schemas, and section/block data remain authoritative.
- Interactions that are usually built with React on Shopify can be built with Svelte with smaller, more targeted hydration.

## Core demo message

The theme should communicate this sentence:

> This storefront feels like a modern app, but every section still ships real Shopify Liquid SSR first.

Every feature must have a useful no-JS fallback. Svelte should enhance, not replace, the Liquid output.

## Ecosystem choices

Use these libraries deliberately. Do not add random UI packages.

### Required or recommended

1. Svelte built-ins
   - Use `svelte/transition` for simple enter/exit effects.
   - Use `svelte/animate` `flip` for list reordering, cart item changes, and bundle-builder product movements.
   - Use `svelte/motion` `Spring` or `Tween` for progress bars, counters, draggable controls, and scroll-linked polish.
   - Use Svelte actions for DOM behavior such as intersection reveal, focus trapping wrappers, inert-state helpers, and pointer gestures.

2. Embla Carousel
   - Packages: `embla-carousel`, `embla-carousel-svelte`.
   - Use for product carousels, testimonial carousels, hero media sliders, and recently viewed products.
   - SSR must render all slides as regular HTML first.
   - Hydration only upgrades scrolling, snapping, arrows, drag, and pagination.

3. Bits UI
   - Use for accessible headless primitives:
     - Dialog
     - Popover
     - Tabs
     - Accordion
     - Combobox
     - Slider
   - Use for quick-view modal, size guide modal, mega-menu popovers, search command palette, product info tabs, FAQ accordions, and price sliders.
   - Style with Tailwind classes, not prebuilt themes.
   - If using the latest Bits UI with Svelte 5 APIs, update the theme package to Svelte 5 first.

4. Nanostores
   - Already present.
   - Use for shared cart, drawer, search, wishlist, compare, and recently-viewed state.
   - Do not use it for data that Liquid can already render statically.

### Optional showcase dependency

5. LayerChart
   - Use only for one section if time permits.
   - Good fit: sustainability/impact counters, size-distribution chart, product comparison chart, or ingredient breakdown.
   - SSR should include a static fallback table/list. Svelte hydrates the chart.

6. Threlte or native model viewer
   - Treat as stretch only.
   - A 3D product viewer is impressive but can become a distraction.
   - Prefer Shopify/native product media and lazy enhancement first.

## Package dependency plan

Current `package.json` has Svelte 4. For this showcase, prefer Svelte 5 if the local compiler output remains compatible.

Suggested dependency target:

```json
{
  "devDependencies": {
    "@sveltejs/vite-plugin-svelte": "^5.0.0",
    "svelte": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  },
  "dependencies": {
    "nanostores": "^0.10.0",
    "embla-carousel": "^8.6.0",
    "embla-carousel-svelte": "^8.6.0",
    "bits-ui": "latest"
  }
}
```

Do not add LayerChart until the core sections build and run.

## Non-negotiable implementation rules

1. No section may be client-only.
2. All products, images, prices, and schema-driven text must appear in the Liquid output.
3. Hydrated Svelte behavior may improve interaction, but cannot be required to see content.
4. Avoid layout shift:
   - Always set image width/height or aspect-ratio wrappers.
   - Reserve carousel height before hydration.
   - Render fallback open/closed states carefully.
   - Use skeletons only for client-fetched data, not for Liquid-known data.
5. Respect `prefers-reduced-motion`.
6. Use `section.id` or deterministic IDs for ARIA relationships.
7. Keep merchant editability through Shopify schemas.
8. Use Shopify AJAX APIs only for interactions that actually mutate/fetch runtime state.
9. Avoid hydration for purely decorative static content.
10. Do not hardcode demo products except as schema defaults or fallback text.

## Theme information architecture

The advanced theme should include these page types:

```text
templates/
  index.json
  product.json
  collection.json
  search.json

sections/
  hero-section.liquivelte
  featured-collection.liquivelte
  main-product.liquivelte
  collection-grid.liquivelte
  predictive-search-panel.liquivelte
  bundle-builder.liquivelte
  lookbook-hotspots.liquivelte
  before-after-slider.liquivelte
  comparison-tabs.liquivelte
  impact-metrics.liquivelte
  testimonials-section.liquivelte
  recently-viewed.liquivelte
  header-group.liquivelte
  footer-group.liquivelte

snippets/
  responsive-image.liquid
  price.liquid
  product-badges.liquid
  product-form-fallback.liquid
  json-product-card.liquid
  trace-debug.liquid

src/
  actions/
    intersect.ts
    focusTrap.ts
    mediaQuery.ts
    swipe.ts
  components/
    CartDrawer.svelte
    ProductCarousel.svelte
    ProductQuickView.svelte
    PredictiveSearch.svelte
    VariantPicker.svelte
    MediaGallery.svelte
    BundleBuilder.svelte
    LookbookHotspots.svelte
    BeforeAfterSlider.svelte
    ComparisonTabs.svelte
    ImpactChart.svelte
  stores/
    cart.ts
    search.ts
    wishlist.ts
    compare.ts
    recentlyViewed.ts
    theme.ts
  utils/
    shopifyAjax.ts
    money.ts
    sectionHydration.ts
```

Keep `.liquivelte` sections as the Liquid/Svelte bridge. Put reusable browser-only internals in `src/components` when possible.

## Homepage section plan

Update `templates/index.json` to tell a complete story:

1. `hero-section`
2. `featured-collection`
3. `bundle-builder`
4. `lookbook-hotspots`
5. `before-after-slider`
6. `comparison-tabs`
7. `impact-metrics`
8. `testimonials-section`
9. `recently-viewed`

Each section below has a specific purpose.

## Section 1: Hero section with SSR media and hydrated motion

Existing file:

```text
sections/hero-section.liquivelte
```

### Purpose

Show that a visually rich animated hero can still be rendered as stable Liquid HTML.

### Liquid SSR output

- Heading from `section.settings.heading`.
- Subheading from `section.settings.subheading`.
- CTA buttons from section settings.
- Optional product cards rendered from `collections.frontpage.products limit: 4`.
- Optional media/image blocks from `section.blocks`.

### Hydrated Svelte behavior

- Text reveal on viewport entry.
- Parallax-like image layer movement using CSS transform only.
- Optional Embla hero media carousel if multiple hero media blocks exist.
- Progress indicator using Svelte `Tween`.

### No-layout-shift requirements

- Hero must have a CSS `min-height`.
- Media wrappers must use `aspect-ratio`.
- Product card grid must render in Liquid before hydration.
- Hydration may only add classes/styles.

### Schema settings

Add or verify:

- `heading`
- `subheading`
- `eyebrow`
- `primary_button_label`
- `primary_button_link`
- `secondary_button_label`
- `secondary_button_link`
- `show_products`
- `enable_motion`
- `motion_intensity`: select `subtle`, `medium`, `bold`

### Blocks

- `media_slide`
  - image
  - mobile_image
  - alt
  - caption
- `stat`
  - value
  - label
- `text_block`
  - rich text

### Acceptance criteria

- With JS disabled, hero content and product cards are visible.
- With JS enabled, hero animates without changing layout dimensions.
- If `prefers-reduced-motion` is enabled, animations are disabled.

## Section 2: Featured collection carousel

Existing file:

```text
sections/featured-collection.liquivelte
```

### Purpose

Show Embla-enhanced product browsing with Liquid SSR fallback.

### Liquid SSR output

- Collection title.
- Product cards in a horizontal list or grid.
- Product images, titles, prices, sale badges, and links.

### Hydrated Svelte behavior

- Embla drag carousel.
- Arrow controls.
- Pagination dots.
- Quick add button.
- Wishlist toggle.
- Compare toggle.

### Implementation details

- Prefer importing a reusable product card component.
- If current compiler struggles with imported `.liquivelte` components, use a Liquid snippet fallback first and hydrate only the carousel shell.
- Use `ProductCarousel.svelte` for the hydrated Embla behavior.

### Schema settings

- `collection`
- `heading`
- `products_to_show`
- `layout`: `grid`, `carousel`
- `cards_per_view_desktop`
- `show_quick_add`
- `show_wishlist`
- `show_compare`

### Acceptance criteria

- Without JS, products render as a scrollable row or responsive grid.
- With JS, Embla controls work.
- Product prices remain Liquid-rendered.

## Section 3: Bundle builder

New file:

```text
sections/bundle-builder.liquivelte
```

Hydrated component:

```text
src/components/BundleBuilder.svelte
```

### Purpose

Show an interaction usually built as a React app: selecting multiple products into a bundle with progress, discount messaging, and animated list changes.

### Liquid SSR output

- Bundle heading and copy.
- Candidate products from selected collection.
- Each product has title, image, price, and checkbox/button fallback.
- A regular form fallback should post a selected variant if possible.

### Hydrated Svelte behavior

- Select/deselect products.
- Animated `flip` movement between available and selected lists.
- Progress bar using Svelte `Tween`.
- Discount threshold messaging.
- Add selected variants to cart with Shopify AJAX `/cart/add.js`.
- Optimistic cart drawer open on success.

### Schema settings

- `heading`
- `text`
- `collection`
- `minimum_items`
- `maximum_items`
- `discount_label`
- `cta_label`

### State

Use stores:

- `cart`
- `bundleSelection`

Add if missing:

```text
src/stores/bundle.ts
```

### Acceptance criteria

- Without JS, products still appear and link to product pages.
- With JS, selected list animates and cart update is optimistic.
- No layout shift when selection area changes; reserve min-height.

## Section 4: Lookbook hotspots

New file:

```text
sections/lookbook-hotspots.liquivelte
```

Hydrated component:

```text
src/components/LookbookHotspots.svelte
```

### Purpose

Show interactive editorial commerce: image hotspots, popovers, product cards.

### Liquid SSR output

- Main lookbook image.
- Hotspot product list below image as fallback.
- Product links and prices.

### Hydrated Svelte behavior

- Hotspot buttons positioned over image.
- Bits UI `Popover` for hotspot details.
- Keyboard-accessible hotspot navigation.
- Optional quick add.

### Schema settings

- `heading`
- `image`
- `image_alt`
- `mobile_image`

### Blocks

- `hotspot`
  - product
  - x_position range 0-100
  - y_position range 0-100
  - label

### Acceptance criteria

- Hotspot product data appears in Liquid fallback list.
- Popovers are accessible by keyboard.
- Hotspot positions do not move during hydration.

## Section 5: Before/after slider

New file:

```text
sections/before-after-slider.liquivelte
```

Hydrated component:

```text
src/components/BeforeAfterSlider.svelte
```

### Purpose

Show pointer-driven Svelte interactivity with stable SSR media.

### Liquid SSR output

- Before image.
- After image.
- Captions.
- Text explanation.

### Hydrated Svelte behavior

- Draggable divider.
- Keyboard-controllable slider using left/right arrows.
- Svelte `Spring` for smooth handle movement.
- Optional Bits UI `Slider` if compatible.

### Schema settings

- `heading`
- `before_image`
- `after_image`
- `before_label`
- `after_label`
- `initial_position`

### Acceptance criteria

- Without JS, before and after images stack vertically.
- With JS, they become an overlay comparison.
- Container aspect ratio is fixed before hydration.

## Section 6: Comparison tabs

New file:

```text
sections/comparison-tabs.liquivelte
```

Hydrated component:

```text
src/components/ComparisonTabs.svelte
```

### Purpose

Show app-like product education with accessible tabs and Liquid-rendered content.

### Liquid SSR output

- All tab panels rendered as semantic sections.
- Product specs, material info, shipping text, warranty text.

### Hydrated Svelte behavior

- Bits UI `Tabs` progressive enhancement.
- URL hash sync for selected tab.
- Animated panel transitions.

### Blocks

- `tab`
  - title
  - icon
  - richtext

### Acceptance criteria

- Without JS, all content is readable.
- With JS, tabs collapse content into interactive UI.
- ARIA labels and IDs are deterministic.

## Section 7: Impact metrics / animated stats

New file:

```text
sections/impact-metrics.liquivelte
```

Optional component:

```text
src/components/ImpactChart.svelte
```

### Purpose

Show data visualization and animated counters.

### Liquid SSR output

- Metric cards with numbers and labels.
- Optional fallback table for chart data.

### Hydrated Svelte behavior

- Count-up animation using Svelte `Tween`.
- Optional LayerChart pie/bar chart.
- Intersection-triggered animation.

### Blocks

- `metric`
  - value
  - suffix
  - label
  - description
- `chart_item`
  - label
  - value
  - color

### Acceptance criteria

- Values are visible without JS.
- Hydration animates numeric display only after section enters viewport.
- Chart is optional; fallback list remains visible to crawlers.

## Section 8: Testimonials carousel

Existing file:

```text
sections/testimonials-section.liquivelte
```

### Purpose

Show common Shopify marketing UI with SSR + carousel enhancement.

### Liquid SSR output

- Testimonials as block list.
- Quote, name, role, rating, avatar.

### Hydrated Svelte behavior

- Embla carousel.
- Autoplay only if enabled and motion allowed.
- Pause on hover/focus.
- Keyboard navigation.

### Blocks

- `testimonial`
  - quote
  - author
  - role
  - rating
  - avatar

### Acceptance criteria

- Without JS, testimonials are visible as a list/grid.
- With JS, carousel controls are accessible.

## Section 9: Main product advanced page

Existing file:

```text
sections/main-product.liquivelte
```

Hydrated components:

```text
src/components/MediaGallery.svelte
src/components/VariantPicker.svelte
src/components/CartDrawer.svelte
src/components/ProductQuickView.svelte
```

### Purpose

This should be the strongest app-like demo.

### Liquid SSR output

- Product title.
- Media gallery.
- Variant selector form.
- Price and compare-at price.
- Product description.
- Add-to-cart form.
- Inventory messaging.

### Hydrated Svelte behavior

- Variant selection updates selected media and price.
- Product media gallery with thumbnails, zoom dialog, and swipe.
- Sticky add-to-cart after scroll.
- AJAX add to cart.
- Cart drawer opens with optimistic update.
- Size guide dialog using Bits UI `Dialog`.
- Product info accordions using Bits UI `Accordion`.

### No-JS fallback

The existing Shopify form must continue to work:

```liquid
<form action="/cart/add" method="post">
```

Do not remove this form. Enhance it.

### Acceptance criteria

- Add to cart works without JS through normal form submission.
- With JS, add to cart uses AJAX and opens drawer.
- Variant selector preserves URL state if practical.
- Media dimensions are reserved.

## Section 10: Collection grid with filters

New file:

```text
sections/collection-grid.liquivelte
```

Hydrated components:

```text
src/components/CollectionFilters.svelte
src/components/ProductQuickView.svelte
```

### Purpose

Show faceted filtering, sorting, and animated grid updates.

### Liquid SSR output

- Collection title and description.
- Current products from Liquid pagination.
- Shopify filter links/forms when available.
- Sort dropdown fallback.

### Hydrated Svelte behavior

- Filter drawer using Bits UI `Dialog` or `Popover`.
- Price range slider using Bits UI `Slider`.
- Animated grid changes with `animate:flip` where possible.
- URL query sync.
- Optional Section Rendering API refresh.

### Acceptance criteria

- Without JS, filter links/forms still navigate.
- With JS, filter updates feel app-like.
- Browser back/forward works.

## Header showcase

Existing file:

```text
sections/header-group.liquivelte
```

Add components:

```text
src/components/PredictiveSearch.svelte
src/components/CartDrawer.svelte
src/components/MegaMenu.svelte
```

### Purpose

Show the highest-value global storefront interactions.

### Liquid SSR output

- Logo.
- Menu links.
- Cart link with count.
- Search form.

### Hydrated Svelte behavior

- Predictive search command palette using Bits UI `Combobox` or Dialog + custom results.
- Mega-menu popovers.
- Cart drawer.
- Wishlist count.

### Shopify APIs

- Predictive search: `/search/suggest.json?q=...&resources[type]=product,collection,article`
- Cart: `/cart.js`, `/cart/add.js`, `/cart/change.js`

### Acceptance criteria

- Header navigation and search form work without JS.
- Predictive search is debounced and accessible.
- Cart drawer does not block normal cart page fallback.

## Snippet plan

Create these snippets before building every section from scratch.

### `snippets/responsive-image.liquid`

Purpose:

- Centralized Shopify image output.
- Width/height/aspect ratio handling.
- Lazy loading rules.

Inputs:

- `image`
- `alt`
- `class`
- `sizes`
- `loading`
- `fetchpriority`

Acceptance:

- Every image-heavy section uses this snippet or equivalent logic.

### `snippets/price.liquid`

Purpose:

- Stable SSR price rendering.
- Sale/compare-at formatting.

Inputs:

- `product`
- `variant`
- `class`

Acceptance:

- Money filters remain Liquid-side.
- Svelte does not need to reformat initial prices.

### `snippets/product-badges.liquid`

Purpose:

- Sale badge.
- Sold out badge.
- New/custom badges from product tags.

Acceptance:

- Product card, quick view, and main product reuse badge logic.

### `snippets/product-form-fallback.liquid`

Purpose:

- No-JS add-to-cart form.
- Hidden variant input.
- Quantity input.

Acceptance:

- Main product and quick-add can both rely on this markup.

### `snippets/json-product-card.liquid`

Purpose:

- Embed safe JSON payload for hydrated product interactions.
- Keep payload small.

Include only:

- id
- title
- handle
- url
- available
- featured image URL
- price
- compare_at_price
- variants minimal fields

Acceptance:

- Hydrated product components read from SSR JSON instead of refetching when possible.

### `snippets/trace-debug.liquid`

Purpose:

- Development-only trace inspection.
- Render current trace frame IDs and component modules.

Acceptance:

- Disabled by default.
- Useful for proving Liquivelte trace alignment.

## Store plan

Split current `src/stores/theme.ts` into focused stores.

### `src/stores/cart.ts`

State:

- items
- itemCount
- subtotal
- isOpen
- isLoading
- error

Functions:

- `fetchCart()`
- `addToCart(items)`
- `changeCartLine(key, quantity)`
- `removeCartLine(key)`
- `openCart()`
- `closeCart()`

### `src/stores/search.ts`

State:

- query
- results
- isOpen
- isLoading
- error

Functions:

- `openSearch()`
- `closeSearch()`
- `setQuery(query)`
- `fetchSuggestions(query)`

### `src/stores/wishlist.ts`

State:

- productIds

Persistence:

- localStorage

Functions:

- `toggleWishlist(product)`
- `isWishlisted(productId)`

### `src/stores/compare.ts`

State:

- products
- isOpen

Functions:

- `toggleCompare(product)`
- `clearCompare()`

### `src/stores/recentlyViewed.ts`

State:

- products

Persistence:

- localStorage

Functions:

- `recordProduct(product)`
- `clearRecentlyViewed()`

## Utility plan

### `src/utils/shopifyAjax.ts`

Implement small wrappers:

- `getCart()`
- `addItemsToCart(items)`
- `changeCartLine(key, quantity)`
- `predictiveSearch(query)`
- `fetchSection(sectionId, url)` if needed later

Rules:

- Throw useful errors.
- Do not swallow Shopify API failures.
- Keep payloads typed.

### `src/actions/intersect.ts`

Reusable intersection action:

- Adds class when visible.
- Can dispatch custom event.
- Supports `once` option.
- No-op on server.

### `src/actions/mediaQuery.ts`

Reusable action/store for:

- `prefers-reduced-motion`
- mobile/desktop behavior

## Implementation order for the agent

Do this in strict order.

### Milestone 1: clean baseline

1. Run current advanced theme build.
2. Fix build errors without changing behavior.
3. Verify `dist/` contains layout, templates, assets, and current sections.
4. Confirm Shopify CLI can serve `dist`.

Commands:

```bash
npm install
npm run build
```

If using pnpm, use equivalent `pnpm install` and `pnpm build`.

### Milestone 2: dependency foundation

1. Add Embla packages.
2. Add Bits UI only after confirming Svelte version compatibility.
3. Keep LayerChart out until Milestone 7.
4. Build after every dependency change.

### Milestone 3: snippets and utilities

Create:

- `snippets/responsive-image.liquid`
- `snippets/price.liquid`
- `snippets/product-badges.liquid`
- `snippets/product-form-fallback.liquid`
- `snippets/json-product-card.liquid`
- `src/utils/shopifyAjax.ts`
- `src/actions/intersect.ts`

Do not build advanced sections until these exist.

### Milestone 4: product card and featured collection

1. Upgrade product card markup.
2. Upgrade `featured-collection.liquivelte`.
3. Add `ProductCarousel.svelte` using Embla.
4. Keep Liquid grid fallback.

Acceptance:

- Featured collection works without JS.
- Embla works with JS.

### Milestone 5: cart drawer and product page

1. Add `src/stores/cart.ts`.
2. Add `CartDrawer.svelte`.
3. Upgrade `main-product.liquivelte`.
4. Add `VariantPicker.svelte` and `MediaGallery.svelte`.
5. Preserve Liquid form fallback.

Acceptance:

- Normal form add-to-cart still exists.
- AJAX add-to-cart opens cart drawer.

### Milestone 6: header interactions

1. Upgrade `header-group.liquivelte`.
2. Add `PredictiveSearch.svelte`.
3. Add `MegaMenu.svelte`.
4. Connect cart count to cart store.

Acceptance:

- Header links/search/cart work without JS.
- Predictive search works with JS.

### Milestone 7: homepage showcase sections

Implement in this order:

1. `bundle-builder.liquivelte`
2. `lookbook-hotspots.liquivelte`
3. `before-after-slider.liquivelte`
4. `comparison-tabs.liquivelte`
5. `impact-metrics.liquivelte`
6. Upgrade `testimonials-section.liquivelte`
7. Add `recently-viewed.liquivelte`

Acceptance:

- Each section has SSR fallback.
- Each section reserves layout size.
- Each section has schema presets.

### Milestone 8: collection page

1. Add `templates/collection.json`.
2. Add `collection-grid.liquivelte`.
3. Add filter drawer.
4. Add sort controls.
5. Add quick view.

Acceptance:

- Filter URLs work without JS.
- Drawer enhancement works with JS.

### Milestone 9: polish and proof

1. Add a visible `Liquivelte trace` debug mode for development.
2. Add a README section explaining SSR + hydration proof points.
3. Add screenshots or short screen recordings.
4. Measure Lighthouse.
5. Document no-layout-shift strategy.

## Testing checklist

After each milestone:

```bash
npm run build
```

Then verify generated files:

```text
dist/layout/theme.liquid
dist/templates/index.json
dist/sections/*.liquid
dist/assets/base.css
dist/assets/*.js
```

Manual browser checks:

- Disable JS and reload.
- Enable JS and reload.
- Use keyboard only.
- Enable reduced motion.
- Resize mobile/desktop.
- Open Shopify theme editor if available.

Performance checks:

- No large JS loaded for static-only sections.
- Images do not shift after load.
- Carousels reserve height.
- Cart drawer/predictive search code can be lazily initialized.

## What not to do

- Do not make a SPA.
- Do not fetch all product content client-side when Liquid already rendered it.
- Do not remove Liquid forms.
- Do not hide content until hydration.
- Do not add animation that changes layout after paint.
- Do not create a beautiful static theme that fails to show Liquivelte-specific trace/hydration advantages.

## Final showcase script

The final demo should be presentable like this:

1. Open homepage with JS disabled.
   - Show that products, prices, hero, testimonials, and schema-driven content are fully rendered.
2. Enable JS.
   - Show hero motion, product carousel, bundle builder, lookbook hotspots, and cart drawer.
3. Open product page.
   - Show SSR product form, then hydrated variant/media/cart behavior.
4. Open collection page.
   - Show Liquid fallback filters, then hydrated filter drawer and animated grid.
5. Open dev tools.
   - Show trace JSON and deterministic component boundaries.
6. Explain that React-style Shopify app interactions were implemented without surrendering SSR to the client.
