# Liquivelte v4 Core Processor Plan

This plan defines a new extension-independent Liquivelte v4 processor, trace protocol, Vite-based builder, and Vitest unit test suite that preserves the original goal: Shopify Liquid performs authoritative SSR while Svelte 5 hydrates consistently from the same execution-scope model.

## Goals

- **Core only first:** Build a reusable TypeScript processor package with no VS Code dependency.
- **Preserve ambition:** Do not reduce the project to generic islands; the core product is Liquid-authored SSR for Svelte-like components.
- **Solve the choke point:** Introduce a Liquid execution-scope model that can generate both Liquid SSR output and Svelte hydration code consistently.
- **Trace as protocol:** Let Shopify Liquid emit the actual runtime component/loop/expression trace so hydration follows what Liquid really rendered.
- **Modern build:** Use Vite + `@sveltejs/vite-plugin-svelte` + Svelte 5 + Vitest instead of the old direct Rollup pipeline.
- **Spec-driven tests:** Implement unit tests from the v4 contract before integrating the VS Code extension.

## Current v3 Lessons To Carry Forward

- **Keep:** The dual-output idea: one `.liquivelte` source produces Svelte-compatible code and Liquid-compatible SSR content.
- **Keep:** Component imports from `.liquivelte` as special SSR render boundaries.
- **Keep:** Liquid-side component rendering by Shopify itself, especially inside loops.
- **Keep:** Theme imports such as `import section.blocks from 'theme'` as the bridge between Liquid data and client props.
- **Replace:** Regex-only control-flow transformation with a token stream + scope stack.
- **Replace:** Delimiter-string prop transport (`-kvsp-`, `-prsp-`) with a trace/scope protocol and JSON-safe serialization where possible.
- **Replace:** Direct Rollup plugin as the primary interface with a Vite plugin that wraps the core compiler.
- **Avoid:** Recreating the VS Code extension until the compiler contract is stable.

## Research Notes: Modern Build Stack

- **Vite plugin API:** Vite supports `resolveId`, `load`, `transform`, `handleHotUpdate`, `configureServer`, `generateBundle`, and `writeBundle`; custom extension transformers should use a filtered `transform` hook and return `{ code, map }`.
- **Virtual modules:** Vite plugins conventionally expose `virtual:*` imports and internally resolve them as `\0virtual:*`; use this for runtime helpers like `virtual:liquivelte/runtime` or generated manifests.
- **Build output:** Vite library mode supports `build.lib.entry`, custom `fileName`, and CSS output naming; production output can still be tuned through `build.rollupOptions` because Vite uses Rollup-compatible output hooks underneath.
- **Svelte 5 plugin:** `@sveltejs/vite-plugin-svelte` supports custom extensions through Svelte config `extensions` and plugin `include`; use `dynamicCompileOptions` if `.liquivelte` files need per-file Svelte compiler options.
- **Svelte 5 changes:** `hydratable` compiler option is removed because components are hydratable by default; client hydration uses `hydrate(Component, { target, props })`; old `new Component({ hydrate: true })` can be kept only with `compatibility.componentApi: 4`.
- **Vitest:** Use Vitest for fast TypeScript unit tests, fixture/snapshot tests, and optional Vite plugin integration tests.

## Proposed Package Shape

```text
liquivelte-v4/
  package.json
  vite.config.ts
  vitest.config.ts
  src/
    index.ts
    compiler/
      compileLiquivelte.ts
      tokenize.ts
      parseDocument.ts
      scope.ts
      expressions.ts
      components.ts
      emitSvelte.ts
      emitLiquid.ts
      emitTrace.ts
      diagnostics.ts
    runtime/
      client.ts
      forloop.ts
      trace.ts
      expression-cache.ts
    vite/
      plugin.ts
    testing/
      normalize.ts
  tests/
    fixtures/
      slider-general.liquivelte
      image-with-card.liquivelte
    compiler/
      tokenize.test.ts
      scope.test.ts
      expressions.test.ts
      components.test.ts
      compile.test.ts
      trace.test.ts
    runtime/
      forloop.test.ts
      trace.test.ts
    vite/
      plugin.test.ts
```

If this lives inside the existing workspace first, use a folder such as `Liquivelte 4` or `liquivelte-v4` and keep it separate from `Liquivelte 3` so tests can compare fixtures without accidental coupling.

## Public Core API Spec

Implement one primary function:

```ts
compileLiquivelte(source: string, options: CompileOptions): CompileResult
```

Expected result shape:

```ts
type CompileResult = {
  svelteCode: string;
  liquidCode: string;
  tracePlan: TracePlan;
  componentManifest: ComponentManifest;
  diagnostics: Diagnostic[];
  map?: unknown;
};
```

`CompileOptions` should include:

- **filename:** absolute or project-relative source filename.
- **componentName:** stable component name, usually derived from filename.
- **mode:** `development | production | test`.
- **svelteVersionTarget:** initially `5`.
- **trace:** `{ enabled: true, format: 'json-script' | 'dom-local' }`.
- **themeImportsMode:** initially `props`.
- **compatibility:** optional flags for v3 syntax quirks.

## Core Compiler Architecture

### 1. Tokenize mixed `.liquivelte`

Build a tolerant tokenizer that recognizes:

- **Svelte blocks:** `<script>`, `<style>`, normal markup.
- **Liquid output:** `{{ ... }}`, including trim markers.
- **Liquid tags:** `{% if %}`, `{% elsif %}`, `{% else %}`, `{% endif %}`, `{% for %}`, `{% endfor %}`, `{% assign %}`, `{% capture %}`, `{% render %}`, `{% include %}`, `{% schema %}`.
- **Component tags:** tags matching imported `.liquivelte` component identifiers.
- **Slots/snippets:** default children and named children for component boundaries.

The tokenizer does not need to fully execute Liquid. It only needs enough structure to build scope and output dual code.

### 2. Parse to an intermediate representation

Create a minimal IR rather than directly mutating with regex.

Core nodes:

- **DocumentNode**
- **ScriptNode**
- **StyleNode**
- **HtmlNode**
- **LiquidOutputNode**
- **LiquidIfNode**
- **LiquidForNode**
- **LiquidRawTagNode**
- **LiquivelteComponentNode**
- **SchemaNode**

The IR should preserve source ranges for sourcemaps and diagnostics.

### 3. Build Liquid execution-scope model

Introduce scope frames:

```ts
type ScopeFrame =
  | { type: 'root'; variables: ScopeVariable[] }
  | { type: 'for'; item: string; source: LiquidExpression; indexName: string; forloopName: string; parent?: ScopeFrame }
  | { type: 'if'; condition: LiquidExpression; parent: ScopeFrame }
  | { type: 'component'; module: string; props: PropBinding[]; parent: ScopeFrame };
```

Rules:

- **For loops:** Every `{% for block in section.blocks %}` creates `block`, `index`, and a synthetic Svelte-compatible `forloop` object.
- **Nested loops:** Preserve `parentloop` semantics by linking to the previous loop frame.
- **Component boundaries:** A child component gets explicit props and an optional serialized scope frame.
- **Implicit Liquid variables:** Known names such as `forloop`, `section`, `product`, `collection`, `settings`, and imported theme paths are tracked rather than guessed.

### 4. Compile Liquid expressions to Svelte expressions

Implement a small expression compiler with diagnostics.

Minimum v4-alpha support:

- **Boolean operators:** `and` -> `&&`, `or` -> `||`.
- **Comparisons:** `==`, `!=`, `>`, `<`, `>=`, `<=`.
- **Contains:** `x contains y` -> `lv.contains(x, y)`.
- **Size:** `x.size` -> `lv.size(x)` or `x?.length` when safe.
- **Blank/nil/null:** normalize to runtime helper checks.
- **Forloop:** map `forloop.index`, `forloop.first`, etc. to the synthetic frame object.
- **Filters:** do not over-emulate Shopify filters initially; capture resolved Liquid values into the expression cache when filters are present.

## Dual Output Spec

### Svelte output

Generated Svelte code should be valid Svelte 5. Prefer Svelte 5 APIs for generated runtime code.

For this source:

```liquid
{% for block in section.blocks %}
  {% if forloop.index == 1 %}
    <Image source="{{- block.settings.image -}}" loading="eager" />
  {% endif %}
{% endfor %}
```

Svelte output should conceptually become:

```svelte
{#each section.blocks as block, index}
  {@const forloop = lv.forloop(index, section.blocks.length)}
  {#if forloop.index == 1}
    <Image source={lv.expr(frame, 'expr_1', () => block.settings.image)} loading="eager" />
  {/if}
{/each}
```

If `{@const}` support creates compatibility problems, emit an internal helper component or derived helper block, but the first design should target Svelte 5.

### Liquid output

Liquid output remains Shopify-executable and should not require knowing runtime loop cardinality at build time.

For component boundaries, emit:

```liquid
{% render 'liquivelte-component',
  module: 'image-with-card',
  props: lv_props,
  trace_id: lv_trace_id,
  slot_contents: slot_contents
%}
```

Prefer `render` over `include` for new v4 code, but add a compatibility option for `include` if needed.

### Trace output

Each component frame should emit enough data for hydration to know what Liquid actually rendered.

Trace frame shape:

```ts
type TraceFrame = {
  id: string;
  module: string;
  source: string;
  scopePath: string[];
  props: Record<string, unknown>;
  expressions: Record<string, unknown>;
  loop?: {
    index: number;
    index0: number;
    rindex: number;
    rindex0: number;
    first: boolean;
    last: boolean;
    length: number;
    parentId?: string;
  };
  branch?: string;
  children?: string[];
};
```

SSR should emit either:

- **Global trace script:** one `<script type="application/json" data-liquivelte-trace>` per section/template.
- **DOM-local trace packets:** `<script type="application/json" data-lv-frame="...">` close to each component root.

Start with global trace script for simpler tests; keep DOM-local packets as an option for debugging or highly dynamic snippets.

## Runtime Spec

Create a tiny browser runtime with:

- **`lv.forloop(index, length, parentloop?)`**: reproduces Liquid loop metadata.
- **`lv.expr(frame, id, fallback)`**: returns Liquid-resolved expression during hydration, fallback afterwards.
- **`lv.getFrame(id)`**: retrieves trace frame by ID.
- **`lv.hydrate(Component, frameId, target)`**: calls Svelte 5 `hydrate` with trace props.
- **`lv.contains(value, needle)`** and **`lv.size(value)`**: expression helpers.

Do not ship a full Liquid evaluator in v4-alpha. Capture resolved Liquid results instead.

## Vite Builder Plan

### Plugin responsibilities

Create `liquivelteVitePlugin(options)`.

- **`transform` hook:** For `.liquivelte`, call `compileLiquivelte`, cache the result by file ID, and return `svelteCode` plus sourcemap.
- **`resolveId/load` hooks:** Expose virtual modules:
  - `virtual:liquivelte/runtime`
  - `virtual:liquivelte/manifest`
- **`handleHotUpdate`:** Recompile changed `.liquivelte` files and invalidate virtual manifest modules.
- **`generateBundle` or `writeBundle`:** Emit generated `.liquid` snippets/sections and optional trace helper snippets into the configured Shopify theme output folders.
- **Diagnostics:** Forward compiler diagnostics as Vite warnings/errors.

### Svelte plugin configuration

Use `@sveltejs/vite-plugin-svelte` with custom extension support:

```ts
svelte({
  include: ['src/**/*.{svelte,liquivelte}'],
  compilerOptions: {
    runes: true
  }
})
```

If generated code must support old Svelte component APIs temporarily, use:

```ts
compilerOptions: {
  compatibility: { componentApi: 4 }
}
```

but the v4 runtime should prefer Svelte 5 `hydrate`.

### Build outputs

Use Vite library or multi-entry app build:

- **Entry files:** generated template/section entries from the plugin or explicit source entries.
- **JS assets:** output to Shopify `assets/` with names like `[name].liquivelte.js`.
- **CSS assets:** output to Shopify `assets/` with names like `[name].liquivelte.css`.
- **Liquid files:** emitted by plugin to `snippets/` or `sections/`, not bundled as JS.

Use `build.rollupOptions.output` only for output naming/manual chunk control, not as the primary API.

## Unit Test Plan

Use Vitest with TypeScript and fixture snapshots.

### Test configuration

- **Environment:** `node` for compiler tests.
- **Snapshots:** Use inline snapshots for small transformations and file snapshots for larger fixtures.
- **Coverage:** Include `src/compiler/**/*.ts` and `src/runtime/**/*.ts`.
- **Scripts:** `test`, `test:watch`, `test:update`, `test:coverage`.

### Core test cases

#### 1. Tokenizer tests

- **Liquid output token:** `{{- block.settings.image -}}` is recognized with expression and trim metadata.
- **Liquid for token:** `{% for block in section.blocks %}` parses item/source.
- **Nested tags:** nested `for` + `if` maintains open/close order.
- **Component tag:** imported `ImageWithCard` tag captures props and children.
- **Schema block:** `{% schema %}...{% endschema %}` is preserved for Liquid output but excluded from Svelte output.

#### 2. Scope model tests

- **Forloop synthesis:** `for block in section.blocks` creates `block`, `index`, and `forloop` scope variables.
- **Nested parentloop:** nested loops attach `parentloop` to inner synthetic loop.
- **Branch scope:** `if/elsif/else` produces branch metadata without leaking variables.
- **Component scope:** component inside loop receives current `block` and synthetic `forloop` bindings.

#### 3. Expression tests

- **Boolean conversion:** `a and b or c` becomes a safe JS expression.
- **Contains conversion:** `tags contains 'sale'` uses runtime helper.
- **Size conversion:** `section.blocks.size > 0` becomes safe size expression.
- **Forloop conversion:** `forloop.index == 1` resolves against synthetic loop scope.
- **Filter capture:** `block.settings.card_title | html` creates an expression-cache entry instead of trying to emulate Shopify HTML escaping.

#### 4. Theme import tests

- **Object import:** `import section from 'theme'` becomes a top-level prop/source binding.
- **Subpath import:** `import section.blocks from 'theme'` creates a stable internal binding such as `section$$blocks` and reconstructs `section.blocks` for Svelte code.
- **Multiple imports:** duplicate imports dedupe in manifest.
- **Diagnostics:** unsupported dynamic theme import reports a compiler diagnostic.

#### 5. Component import tests

- **Liquivelte import detection:** `import ImageWithCard from './blocks/image-with-card.liquivelte'` adds a component manifest entry.
- **SSR replacement:** `<ImageWithCard block="{{- block -}}" />` emits a Liquid component render boundary.
- **Svelte preservation:** the same tag remains a Svelte component with safe props.
- **Named slots:** named children become trace slot entries.
- **Default slot:** default children become trace slot entry for the child component.

#### 6. Compile fixture tests

Use a reduced `slider-general.liquivelte` based on the existing choke point.

Assertions:

- **Svelte code:** contains `{#each section.blocks as block, index}`.
- **Svelte code:** contains synthetic `forloop` creation inside the each block.
- **Svelte code:** transforms `forloop.index == 1` without unresolved Liquid globals.
- **Liquid code:** keeps `{% for block in section.blocks %}` for Shopify SSR.
- **Liquid code:** emits render/include boundary for `ImageWithCard`.
- **Trace plan:** includes frame definitions for loop/component boundaries.
- **Diagnostics:** no errors for the fixture.

#### 7. Runtime tests

- **Forloop helper:** index/first/last/rindex values match Liquid semantics.
- **Parentloop:** nested helper preserves parent loop metadata.
- **Expression cache:** `lv.expr(frame, id, fallback)` returns trace value first and fallback when missing.
- **Trace lookup:** frames are retrievable by stable ID.

#### 8. Vite plugin tests

- **Transform hook:** `.liquivelte` input returns Svelte code and caches Liquid output.
- **Virtual runtime:** `virtual:liquivelte/runtime` resolves and loads.
- **Manifest virtual module:** includes compiled component entries.
- **Bundle emission:** plugin emits `.liquid` outputs in build mode.
- **Svelte compile smoke:** transformed `.liquivelte` fixture compiles with Svelte 5 through the Vite/Svelte plugin pipeline.

## Implementation Milestones

### Milestone 1: Core package skeleton

- Create TypeScript project with Vite library build and Vitest.
- Add `compileLiquivelte` API returning placeholder outputs.
- Add fixture structure and first failing tests.

### Milestone 2: Tokenizer + IR

- Implement mixed Liquid/Svelte tokenizer.
- Parse script imports, schema, Liquid tags, outputs, and component tags.
- Snapshot IR for `slider-general` fixture.

### Milestone 3: Scope model

- Implement scope stack for `for`, `if`, and component boundaries.
- Add synthetic `forloop` model and nested `parentloop` handling.
- Add scope diagnostics.

### Milestone 4: Svelte emitter

- Emit Svelte 5-compatible code from IR.
- Convert Liquid control flow to Svelte blocks.
- Inject `lv` runtime imports and expression helpers.
- Smoke-test generated code with Svelte compiler.

### Milestone 5: Liquid emitter + trace protocol

- Emit Shopify-compatible Liquid output.
- Add component render boundary protocol.
- Emit trace frames and expression cache captures.
- Add LiquidJS-based approximation tests where possible, while marking Shopify-specific behavior as fixture/snapshot tests.

### Milestone 6: Vite plugin

- Add Vite plugin around `compileLiquivelte`.
- Configure Svelte plugin for `.liquivelte` extension.
- Emit JS/CSS through Vite and Liquid files through plugin hooks.
- Add plugin unit tests and one integration build fixture.

### Milestone 7: Hardening

- Add diagnostics for unsupported Liquid tags/filters.
- Add source maps or at minimum source range diagnostics.
- Add production-mode trace minification.
- Add compatibility fixtures from old v3 themes.

## Key Design Decisions To Keep Explicit

- **Liquid is authoritative:** Hydration must follow Liquid’s emitted trace when static reconstruction is unsafe.
- **No full Shopify Liquid emulator:** Capture resolved expressions instead of implementing every Shopify filter/client behavior.
- **No static instance enumeration:** Build knows possible components; Liquid enumerates actual runtime instances.
- **Scope before string replacement:** Every transformation should be scope-aware before it mutates code.
- **Vite as integration layer:** The compiler must be usable without Vite, but Vite is the official builder.
- **Extension later:** VS Code preview/sidebar should consume `compileLiquivelte` results after the processor is stable.

## Initial Acceptance Criteria

The first usable v4 core is successful when:

- The reduced `slider-general` fixture compiles to valid Svelte 5 code.
- Liquid output still contains real Shopify loops/branches for SSR.
- Generated Svelte has a synthetic `forloop` object equivalent to Liquid’s `forloop` for the tested cases.
- Child component boundaries inside Liquid loops produce trace frames rather than requiring build-time instance enumeration.
- Vitest covers tokenizer, scope, expression, component, runtime, and Vite plugin behavior.
- Vite can build a fixture project with `.liquivelte` imports without direct Rollup plugin code.
