# Agent Task Checklist

Use this checklist together with `docs/showcase-implementation-plan.md`.

## Principle

Do not build client-only sections. Every feature must SSR meaningful Liquid HTML first and hydrate Svelte behavior second.

## Step 0: baseline

- [ ] Run `npm install` or `pnpm install`.
- [ ] Run `npm run build` or `pnpm build`.
- [ ] Confirm `dist/layout/theme.liquid` exists.
- [ ] Confirm `dist/templates/index.json` exists.
- [ ] Confirm `.liquivelte` sections compile to `dist/sections/*.liquid`.
- [ ] Fix build errors before adding features.

## Step 1: dependency foundation

- [ ] Add `embla-carousel`.
- [ ] Add `embla-carousel-svelte`.
- [ ] Decide whether to upgrade to Svelte 5 before adding Bits UI.
- [ ] Add `bits-ui` only after Svelte compatibility is clear.
- [ ] Do not add LayerChart yet.

## Step 2: shared snippets

Create:

- [ ] `snippets/responsive-image.liquid`
- [ ] `snippets/price.liquid`
- [ ] `snippets/product-badges.liquid`
- [ ] `snippets/product-form-fallback.liquid`
- [ ] `snippets/json-product-card.liquid`

Acceptance:

- [ ] Product images reserve dimensions.
- [ ] Product prices remain Liquid-rendered.
- [ ] Add-to-cart fallback form remains normal Shopify Liquid.

## Step 3: stores and utilities

Create:

- [ ] `src/stores/cart.ts`
- [ ] `src/stores/search.ts`
- [ ] `src/stores/wishlist.ts`
- [ ] `src/stores/compare.ts`
- [ ] `src/stores/recentlyViewed.ts`
- [ ] `src/utils/shopifyAjax.ts`
- [ ] `src/actions/intersect.ts`
- [ ] `src/actions/mediaQuery.ts`

Acceptance:

- [ ] Cart APIs use `/cart.js`, `/cart/add.js`, `/cart/change.js`.
- [ ] Search API uses `/search/suggest.json`.
- [ ] Browser-only APIs are guarded.

## Step 4: product card and carousel

Update or create:

- [ ] `sections/product-card.liquivelte`
- [ ] `sections/featured-collection.liquivelte`
- [ ] `src/components/ProductCarousel.svelte`

Acceptance:

- [ ] Products render without JS.
- [ ] Embla enhances the carousel with JS.
- [ ] Product title/image/price links are Liquid-rendered.
- [ ] Wishlist/compare buttons do not break no-JS product links.

## Step 5: cart drawer and main product

Create or update:

- [ ] `src/components/CartDrawer.svelte`
- [ ] `src/components/MediaGallery.svelte`
- [ ] `src/components/VariantPicker.svelte`
- [ ] `sections/main-product.liquivelte`

Acceptance:

- [ ] Shopify form fallback still exists.
- [ ] AJAX add-to-cart opens the cart drawer.
- [ ] Variant changes update price/media with JS.
- [ ] Product media dimensions are reserved before hydration.

## Step 6: header interactions

Create or update:

- [ ] `sections/header-group.liquivelte`
- [ ] `src/components/PredictiveSearch.svelte`
- [ ] `src/components/MegaMenu.svelte`

Acceptance:

- [ ] Header navigation works without JS.
- [ ] Search form works without JS.
- [ ] Predictive search works with JS.
- [ ] Cart link works without JS; drawer enhances with JS.

## Step 7: homepage showcase sections

Create:

- [ ] `sections/bundle-builder.liquivelte`
- [ ] `src/components/BundleBuilder.svelte`
- [ ] `sections/lookbook-hotspots.liquivelte`
- [ ] `src/components/LookbookHotspots.svelte`
- [ ] `sections/before-after-slider.liquivelte`
- [ ] `src/components/BeforeAfterSlider.svelte`
- [ ] `sections/comparison-tabs.liquivelte`
- [ ] `src/components/ComparisonTabs.svelte`
- [ ] `sections/impact-metrics.liquivelte`
- [ ] `src/components/ImpactChart.svelte`
- [ ] `sections/recently-viewed.liquivelte`

Acceptance:

- [ ] Bundle builder has static product fallback and hydrated selection.
- [ ] Lookbook hotspots have fallback product list and hydrated popovers.
- [ ] Before/after slider stacks without JS and overlays with JS.
- [ ] Comparison tabs show all content without JS and tab behavior with JS.
- [ ] Impact metrics show static values without JS and animated counters with JS.
- [ ] Recently viewed uses localStorage only after hydration.

## Step 8: templates

Update or create:

- [ ] `templates/index.json`
- [ ] `templates/product.json`
- [ ] `templates/collection.json`
- [ ] `templates/search.json`

Acceptance:

- [ ] Homepage tells the full showcase story.
- [ ] Product page demonstrates advanced product interactivity.
- [ ] Collection page demonstrates filtering/sorting/quick view.
- [ ] Search page has fallback results and enhanced predictive search path.

## Step 9: collection grid

Create:

- [ ] `sections/collection-grid.liquivelte`
- [ ] `src/components/CollectionFilters.svelte`
- [ ] `src/components/ProductQuickView.svelte`

Acceptance:

- [ ] Filter links/forms work without JS.
- [ ] Filter drawer works with JS.
- [ ] Grid updates are animated only after hydration.
- [ ] URL state is preserved.

## Step 10: final proof

- [ ] Test with JavaScript disabled.
- [ ] Test with JavaScript enabled.
- [ ] Test keyboard navigation.
- [ ] Test reduced motion.
- [ ] Test mobile viewport.
- [ ] Inspect generated Liquid trace scripts.
- [ ] Verify no content is hidden until hydration.
- [ ] Update README with showcase screenshots or descriptions.

## Do not proceed if

- [ ] The build is failing.
- [ ] Any section renders empty without JS.
- [ ] Products/prices/images are fetched client-side despite being available in Liquid.
- [ ] A hydrated feature causes layout shift on initial load.
