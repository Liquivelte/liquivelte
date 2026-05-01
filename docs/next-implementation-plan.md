# Next Implementation Plan

This plan describes the next practical milestones after the initial Liquivelte v4 core implementation.

## Current milestone: stabilize the core processor

Before extension work, the core should be boring and predictable.

### Acceptance criteria

- `npm test` passes with no skipped fixture tests.
- `npm run typecheck` passes.
- Compiler output is deterministic across repeated runs.
- Fixture-based compile, trace, component, and Vite plugin tests are green.
- The compiler does not hang on malformed or partially supported input.

### Immediate priorities

1. Harden tokenizer scanning.
2. Replace regex-only compilation paths with a simple IR-driven pipeline.
3. Improve diagnostics for unsupported Liquid/Svelte syntax.
4. Make trace frame generation deterministic and source-location aware.
5. Add more fixtures from real theme sections/snippets.

## Phase 1: compiler architecture hardening

### Goals

- Make tokenizer/parser/scope responsibilities explicit.
- Avoid hidden compile behavior inside source string replacements.
- Keep Liquid and Svelte output generation coordinated through one intermediate representation.

### Work items

- Introduce stable node types for:
  - Document
  - Script
  - Html
  - LiquidOutput
  - LiquidTag
  - ForBlock
  - IfBlock
  - SchemaBlock
  - ComponentInstance
- Add source ranges to tokens and IR nodes.
- Add diagnostics with:
  - code
  - severity
  - message
  - source range
- Move component import discovery into a dedicated compiler pass.
- Move theme import discovery into a dedicated compiler pass.
- Add tests for malformed Liquid tags and unclosed component tags.

## Phase 2: trace protocol v1

### Goals

Define the runtime contract between Liquid SSR and Svelte hydration.

### Work items

- Finalize trace JSON shape.
- Add trace versioning.
- Add frame kinds:
  - root
  - loop
  - branch
  - component
  - expression
- Add deterministic IDs based on source path and traversal index.
- Add trace validation runtime helper.
- Add tests for nested loops and nested component instances.
- Add tests for branch-dependent component instances.

### Key invariant

Svelte should hydrate from Liquid-produced trace data. It should not independently reconstruct Shopify runtime truth when Liquid already produced it.

## Phase 3: runtime hydration package

### Goals

Provide the browser runtime that maps trace frames to Svelte component hydration.

### Work items

- Add a runtime entry for component discovery.
- Define DOM markers for component instances.
- Implement trace lookup by `trace_id`.
- Implement hydration prop decoding.
- Implement missing trace diagnostics.
- Add tests with a DOM environment when runtime hydration starts needing DOM APIs.

Potential Vitest config change later:

```ts
test: {
  environmentMatchGlobs: [
    ['tests/runtime/dom/**/*.test.ts', 'jsdom']
  ]
}
```

Only add `jsdom` when DOM tests are actually introduced.

## Phase 4: Vite builder integration

### Goals

Turn the current Vite plugin contract into a usable Shopify theme build flow.

### Work items

- Support configurable input roots:
  - sections
  - snippets
  - templates
  - layouts
- Emit Liquid assets to correct Shopify theme paths.
- Emit JS/CSS assets to stable asset paths.
- Integrate with Svelte plugin cleanly.
- Add watch-mode invalidation.
- Add virtual manifest for runtime bootstrapping.
- Add source maps where practical.
- Add an example Vite project under `examples/`.

### Manual acceptance

A sample theme section should produce:

- `sections/example.liquid`
- related JS asset
- related CSS asset if needed
- trace script in SSR output
- hydratable Svelte component boundary

## Phase 5: extension implementation

The extension should come after the core and Vite builder are usable from CLI/tests.

### Extension goals

- Provide developer ergonomics around `.liquivelte` files.
- Avoid embedding compiler logic directly in the extension.
- Use the core package as the single source of truth.

### Proposed extension features

1. Syntax support
   - `.liquivelte` file association.
   - Liquid + Svelte grammar injection.
   - Basic highlighting for Liquid tags, outputs, schema blocks, and component tags.

2. Diagnostics
   - Run `compileLiquivelte` on open/change/save.
   - Surface compiler diagnostics in VS Code Problems.
   - Include source ranges once compiler diagnostics support them.

3. Preview commands
   - Show generated Svelte output.
   - Show generated Liquid output.
   - Show trace plan JSON.
   - Show component/theme import manifest.

4. Project commands
   - Initialize Liquivelte v4 config.
   - Run Vite dev builder.
   - Run production build.
   - Open generated output folder.

5. Watch/build integration
   - Start Vite dev server from command palette.
   - Watch `.liquivelte` changes.
   - Display build status in a VS Code output channel.

### Suggested extension structure

```text
extension/
  package.json
  src/
    extension.ts
    commands/
      showCompiledSvelte.ts
      showCompiledLiquid.ts
      showTracePlan.ts
      startDevServer.ts
    diagnostics/
      liquivelteDiagnostics.ts
    language/
      documentCompiler.ts
    output/
      channel.ts
  syntaxes/
    liquivelte.tmLanguage.json
```

### Extension implementation order

1. Create extension package skeleton.
2. Register `.liquivelte` language ID.
3. Add command: `Liquivelte: Show Compiled Liquid`.
4. Add command: `Liquivelte: Show Compiled Svelte`.
5. Add diagnostics from `compileLiquivelte`.
6. Add output channel for compiler/build logs.
7. Add Vite dev/build commands.
8. Add trace viewer command.

### Extension acceptance criteria

- Opening a `.liquivelte` file gives syntax highlighting.
- Running a command shows generated Liquid/Svelte in readonly virtual documents.
- Compiler errors appear in Problems.
- The extension never forks its own compiler behavior.
- All compile behavior is imported from the v4 core package.

## Phase 6: real-world theme validation

### Goals

Validate against real Shopify theme patterns, not only reduced fixtures.

### Work items

- Add fixtures for:
  - nested snippets
  - nested loops
  - conditional component instances
  - sections with many block types
  - schema-heavy sections
  - `render` isolation
  - `paginate`
  - `form`
- Add snapshot tests for generated Liquid and Svelte output.
- Add golden trace fixtures.
- Add performance tests for large theme files.

## Recommended next step

The next best implementation task is:

> Build a tiny `examples/basic-theme` Vite project that consumes the plugin and compiles one `.liquivelte` section end-to-end.

This will reveal integration issues that unit tests cannot catch, while still staying smaller than the VS Code extension.

After that, start the extension skeleton and make it call the same compiler API.
