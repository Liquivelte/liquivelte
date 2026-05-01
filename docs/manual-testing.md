# Manual Testing Guide

This guide covers practical checks for the current Liquivelte v4 implementation.

## 1. Install dependencies

From the `Liquivelte4` directory:

```bash
npm install
```

## 2. Run the full contract suite

```bash
npm test
```

Expected goal:

- All tests pass.
- No fixture-based tests are skipped.
- The suite completes quickly without relying on timeout guards.

## 3. Run TypeScript validation

```bash
npm run typecheck
```

The current goal is type safety for the public processor/runtime/plugin modules, even if some internal structures are still lightweight.

## 4. Run focused compiler checks

Use these when working on a specific compiler area:

```bash
npm test -- tests/compiler/tokenize.test.ts
npm test -- tests/compiler/expressions.test.ts
npm test -- tests/compiler/scope.test.ts
npm test -- tests/compiler/theme-imports.test.ts
npm test -- tests/compiler/compile.test.ts
npm test -- tests/compiler/components.test.ts
npm test -- tests/compiler/trace.test.ts
```

Recommended order when debugging regressions:

1. `tokenize.test.ts`
2. `expressions.test.ts`
3. `scope.test.ts`
4. `compile.test.ts`
5. `components.test.ts`
6. `trace.test.ts`

## 5. Run focused runtime checks

```bash
npm test -- tests/runtime/forloop.test.ts
npm test -- tests/runtime/trace.test.ts
```

These tests should stay very stable. If they fail, fix them before compiler work.

## 6. Run focused Vite plugin checks

```bash
npm test -- tests/vite/plugin.test.ts
```

This verifies:

- `.liquivelte` transform behavior.
- Virtual runtime module resolution.
- Virtual manifest module generation.
- Liquid asset emission during bundle generation.

## 7. Manually inspect compiler output

The fastest manual inspection path is to add or temporarily use a focused Vitest case around `compileLiquivelte` and log:

- `result.svelteCode`
- `result.liquidCode`
- `result.tracePlan`
- `result.componentManifest`
- `result.diagnostics`

Use the existing fixture:

```text
tests/fixtures/slider-general.liquivelte
```

Manual expectations:

- Svelte output contains `{#each section.blocks as block, index}`.
- Svelte output creates synthetic `forloop` metadata.
- Liquid output preserves Shopify `{% for %}`, `{% if %}`, `{% elsif %}`, and schema blocks.
- Component instances produce Liquid render boundaries with `trace_id`.
- Trace plan contains deterministic loop/component frames.
- Filtered Liquid expressions are trace-captured instead of emulated on the client.

## 8. Manual Vite plugin smoke check

Use `tests/vite/plugin.test.ts` as the canonical smoke test for now.

The plugin should:

- Ignore non-`.liquivelte` files.
- Compile `.liquivelte` files to Svelte code.
- Cache Liquid output.
- Expose `virtual:liquivelte/runtime`.
- Expose `virtual:liquivelte/manifest`.
- Emit Liquid files to Shopify-like paths such as `sections/slider-general.liquid`.

## 9. Regression rules

Do not accept these as final fixes:

- Skipping fixture-based tests.
- Removing trace assertions.
- Replacing Liquid SSR behavior with client-only islands.
- Making Svelte the source of truth for Liquid loop metadata.

The fixture tests represent the real Liquivelte v4 contract.
