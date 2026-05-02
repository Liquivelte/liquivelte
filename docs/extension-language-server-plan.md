# VS Code Extension and Language Server Plan

This plan describes how to start the Liquivelte v4 editor tooling without blindly migrating the old extension.

## Current project direction

Liquivelte v4 is being rebuilt around a small, testable compiler core.

The core idea is:

- Authors write `.liquivelte` as Liquid-first Shopify SSR markup.
- The compiler produces Shopify Liquid output and Svelte hydration output from the same source.
- Liquid is the SSR oracle for Shopify data, section settings, blocks, loops, filters, and schema.
- Svelte is used for progressive hydration and browser-only interactivity.
- The extension and language server must import the v4 core package instead of duplicating compiler behavior.

## Current status summary

### Completed or started

- `src/compiler/compileLiquivelte.ts` exposes the core compile API.
- Tokenizer, parser, scope, expression, runtime, trace, and Vite plugin modules exist.
- Vitest suites cover compiler/runtime/Vite contracts.
- Basic and advanced theme examples exist.
- Advanced theme docs now define the SSR-first showcase strategy.
- A Liquivelte authoring skill exists to prevent agents from writing Svelte control flow where Liquid control flow is required.
- Recent compiler fix: static component props now compile as Svelte string literals instead of unquoted identifiers.

### Still important before deep editor work

- Compiler diagnostics need source ranges.
- Tokens/IR need stable source locations.
- Component import discovery should become dynamic instead of hardcoded names.
- The trace protocol needs a stable v1 shape.
- The Vite builder should stay the authoritative build path.

## Existing projects to reference

### Old VS Code extension

Path:

```text
/Users/malipetek/Documents/Documents/Projects/LIQUVELTE/liquivelte
```

Useful pieces:

- `package.json` contribution points:
  - language id `liquivelte`
  - extension `.liquivelte`
  - `language-configuration.json`
  - TextMate grammar contribution
  - embedded language mappings for Liquid, HTML, CSS, JS, TS
- `syntaxes/liquivelte.tmLanguage.src.yaml`
  - partially working highlighter
  - useful embedded-language injection strategy
  - good starting point, but must be corrected for v4 Liquid-first authoring
- `src/languageserver/src/extension.ts`
  - working pattern for launching a language client
  - document selector `{ scheme: 'file', language: 'liquivelte' }`
  - restart command pattern
  - output/channel wiring pattern
- `src/languageserver/src/CompiledCodeContentProvider.ts`
  - useful idea for virtual compiled documents
- `src/utils/virtual-document.ts`
  - useful virtual document approach

Do not migrate wholesale:

- Sidebar/webviews unless we need them later.
- Old theme generation commands.
- Old Svelte-language-server fork behavior.
- Large config surface for CSS/HTML/TS plugins.
- Old formatter settings before the v4 compiler has stable formatting support.

### Old language server

Path:

```text
/Users/malipetek/Documents/Documents/Projects/LIQUVELTE/liquivelte-language-server
```

Useful pieces:

- LSP server lifecycle in `src/server.ts`.
- Plugin-host architecture as a reference only.
- Document manager concepts.
- Diagnostics manager concept.
- Semantic token registration concept.

Do not migrate wholesale:

- `@ts-nocheck` server style.
- Large Svelte LS plugin architecture unless there is a very specific need.
- Complex TypeScript/CSS/HTML plugin host before basic Liquivelte diagnostics work.
- Old preprocessor behavior as source of truth.

### VS Code API reference pattern

Current VS Code extension best practice is still:

- Contribute a language in `package.json` with `.liquivelte` extension.
- Contribute a TextMate grammar through `contributes.grammars`.
- Add `language-configuration.json` for brackets, comments, folding, autoclosing.
- Launch the language server from extension activation with `vscode-languageclient/node`.
- Use `documentSelector: [{ scheme: 'file', language: 'liquivelte' }]`.

## Architecture decision

Build editor tooling in two layers:

```text
extension/             VS Code client and static language contributions
language-server/       LSP process using Liquivelte v4 core compiler
src/                   Existing compiler/runtime/vite package
```

The extension is a thin UI/client layer.

The language server owns editor intelligence:

- diagnostics
- virtual document mapping
- hovers
- completions
- semantic tokens
- document symbols

The compiler package owns language truth:

- tokenization
- parse results
- diagnostics
- generated Liquid
- generated Svelte
- trace plan
- manifests

## Recommended folder structure

Add this under `Liquivelte4`:

```text
packages/
  vscode-extension/
    package.json
    tsconfig.json
    src/
      extension.ts
      client.ts
      commands/
        showCompiledLiquid.ts
        showCompiledSvelte.ts
        showTracePlan.ts
        restartLanguageServer.ts
      virtualDocuments/
        compiledDocumentProvider.ts
    syntaxes/
      liquivelte.tmLanguage.json
      liquivelte.tmLanguage.src.yaml
    language-configuration.json

  language-server/
    package.json
    tsconfig.json
    src/
      server.ts
      documents.ts
      compilerHost.ts
      diagnostics.ts
      virtualDocuments.ts
      completions.ts
      hovers.ts
      semanticTokens.ts
      symbols.ts
```

If we want to keep it simpler initially, create:

```text
extension/
server/
```

But `packages/` is better if we later publish separate packages.

## MVP 0: Syntax highlighting only

Goal: make `.liquivelte` files readable again in VS Code without waiting for LSP.

### Work items

1. Create `packages/vscode-extension/package.json`.
2. Register language:

```json
{
  "id": "liquivelte",
  "aliases": ["Liquivelte", "liquivelte"],
  "extensions": [".liquivelte"],
  "configuration": "./language-configuration.json"
}
```

3. Copy old grammar source from:

```text
/Users/malipetek/Documents/Documents/Projects/LIQUVELTE/liquivelte/syntaxes/liquivelte.tmLanguage.src.yaml
```

4. Strip or adjust old Svelte-first special-tag assumptions.
5. Make Liquid constructs first-class:

```liquid
{{ product.title }}
{% if product.available %}
{% for block in section.blocks %}
{% schema %}
{% endschema %}
```

6. Keep highlighting for Svelte component tags and directives:

```svelte
<ProductCard />
on:click
bind:value
use:action
transition:fade
```

7. Keep embedded language regions:

```svelte
<script lang="ts">
<style lang="scss">
```

8. Add basic `language-configuration.json` from old extension.

### Acceptance criteria

- `.liquivelte` files open with language id `liquivelte`.
- Liquid tags and outputs highlight correctly.
- HTML tags and component tags highlight correctly.
- `<script>` and `<style>` use embedded TS/CSS highlighting.
- `{% schema %}` JSON is visually distinct enough to edit safely.

## MVP 1: Extension client and virtual compiled output

Goal: prove the extension can call the v4 compiler and show generated artifacts.

### Commands

Add commands:

- `Liquivelte: Show Compiled Liquid`
- `Liquivelte: Show Compiled Svelte`
- `Liquivelte: Show Trace Plan`
- `Liquivelte: Show Component Manifest`
- `Liquivelte: Restart Language Server`

### Implementation rule

The extension must import from the v4 core package.

Do not copy compiler logic into the extension.

### Virtual document URIs

Use schemes like:

```text
liquivelte-liquid:/path/to/file.liquivelte.liquid
liquivelte-svelte:/path/to/file.liquivelte.svelte
liquivelte-trace:/path/to/file.liquivelte.trace.json
```

### Acceptance criteria

- Running `Show Compiled Liquid` opens a readonly virtual `.liquid` document.
- Running `Show Compiled Svelte` opens a readonly virtual `.svelte` document.
- Running `Show Trace Plan` opens JSON trace output.
- The output matches `compileLiquivelte()` exactly.

## MVP 2: Minimal language server diagnostics

Goal: surface compiler diagnostics in Problems.

### Server responsibilities

- Maintain open `.liquivelte` documents.
- On open/change/save, call `compileLiquivelte()`.
- Convert compiler diagnostics to LSP diagnostics.
- Publish diagnostics to the client.

### Required compiler improvement

Before diagnostics are truly useful, compiler diagnostics need:

```ts
interface Diagnostic {
  code: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  range?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}
```

Until source ranges exist, publish file-level diagnostics at line 0.

### First diagnostics to implement

Use compiler/tokenizer output for:

- unclosed Liquid tags
- unclosed component tags
- unsupported dynamic imports
- unsupported Svelte control flow in `.liquivelte` when it references Liquid-owned data
- malformed schema JSON
- static prop expression bugs/regressions
- unknown imported component source

### Acceptance criteria

- Compiler errors appear in VS Code Problems.
- Diagnostics update after edits with debounce.
- Diagnostics clear when the file is fixed.
- The language server does not crash on malformed input.

## MVP 3: Virtual document mapping for embedded services

Goal: start getting useful TypeScript/HTML/CSS behavior without building a giant custom plugin system.

### Strategy

Generate virtual documents from compiler output:

- Svelte virtual document for generated hydrated component code.
- Liquid virtual document for generated Shopify SSR code.
- JSON virtual document for schema/trace.

Map editor positions approximately at first, then improve as compiler ranges improve.

### Reuse ideas

Reference old files:

```text
liquivelte/src/languageserver/src/CompiledCodeContentProvider.ts
liquivelte/src/utils/virtual-document.ts
```

Do not reuse old transformation logic as language truth.

### Initial features

- Hover over compiler diagnostics.
- Go to virtual generated Svelte/Liquid output.
- Document symbols from tokens/IR:
  - script
  - style
  - schema
  - Liquid blocks
  - component instances

### Acceptance criteria

- Developers can inspect generated code from editor commands.
- Language server remains fast on every keystroke.
- Source maps are not required for MVP, but the architecture allows them later.

## MVP 4: Liquivelte-aware completions and hovers

Goal: add high-value completions that generic Svelte/Liquid tooling will not know.

### Completions to add first

- Section schema skeleton:

```liquid
{% schema %}
{
  "name": "...",
  "settings": [],
  "blocks": [],
  "presets": []
}
{% endschema %}
```

- Shopify section objects:
  - `section.settings.`
  - `section.blocks`
  - `block.settings.`
  - `forloop.index`
  - `product.title`
  - `product.available`
  - `product.price | money`

- Liquivelte component imports:
  - suggest local `.liquivelte` components from `sections/`, `snippets/`, `blocks/`, or relative path.

- Snippets for safe SSR-first patterns:
  - cart count with `cart.item_count`
  - product loop
  - block loop
  - product form fallback
  - responsive image render

### Hovers to add first

- Explain Liquid-first vs Svelte hydration syntax when hovering suspicious Svelte control flow.
- Explain `trace_id` and trace frames.
- Explain component prop handling for Liquid expressions vs static strings.

### Acceptance criteria

- Completion suggestions reinforce correct Liquivelte authoring.
- The extension prevents the common mistake of writing Svelte `{#if}` for Liquid-owned data.

## MVP 5: Semantic tokens and better highlighter

Goal: move beyond TextMate where grammar is insufficient.

### Token classes

- Liquid tag keyword
- Liquid output expression
- Liquid filter
- Shopify global object
- Section setting path
- Block setting path
- Component tag
- Component prop
- Schema block
- Svelte directive
- Browser-only Svelte state

### Source of truth

Use tokenizer/parser output from the v4 compiler.

Do not build a second parser inside the language server.

### Acceptance criteria

- Liquid-owned data and Svelte-owned state are visually distinguishable.
- Schema blocks are easy to identify.
- Component boundaries are easy to identify.

## MVP 6: Formatting later, not first

Do not start with formatting.

Formatting is deceptively hard because `.liquivelte` mixes:

- Liquid
- HTML
- Svelte component syntax
- script/style blocks
- Shopify schema JSON

Only start formatting after:

- compiler ranges are stable
- tokenizer/parser support real-world fixtures
- generated output commands work
- diagnostics are reliable

Initial formatting can be limited to schema JSON or delegated to existing formatters per region.

## Features to explicitly defer

Do not migrate these from the old extension at the beginning:

- Sidebar/webview UI.
- Full old Svelte language server plugin host.
- TypeScript plugin for importing `.liquivelte` inside arbitrary TS/JS files.
- Theme generator commands from the old extension.
- Critical CSS/Penthouse integration.
- Formatting entire files.
- Publish packaging automation.

These can return later only if the v4 compiler/editor foundations are solid.

## Implementation order

### Phase A: prepare compiler for tooling

1. Add source ranges to tokenizer tokens.
2. Add source ranges to parse/IR nodes.
3. Normalize compiler diagnostics shape.
4. Add `compileForEditor(source, options)` wrapper if needed.
5. Add tests for diagnostic ranges.

### Phase B: syntax-only extension

1. Create extension package.
2. Register language and grammar.
3. Port old grammar carefully.
4. Fix grammar for Liquid-first control flow.
5. Test with advanced-theme files.

### Phase C: compiler-backed commands

1. Add virtual document providers.
2. Add compiled Liquid/Svelte/trace commands.
3. Add output channel.
4. Confirm generated output matches compiler tests.

### Phase D: minimal LSP

1. Create `packages/language-server`.
2. Start LSP server over IPC.
3. Manage open `.liquivelte` documents.
4. Run compiler diagnostics with debounce.
5. Publish diagnostics.

### Phase E: high-value editor intelligence

1. Document symbols from compiler tokens/IR.
2. Liquivelte-aware completions.
3. Hovers for syntax ownership.
4. Semantic tokens.
5. Better virtual document position mapping.

## First week task list

1. Copy old grammar source into a new extension package.
2. Register `.liquivelte` language and language configuration.
3. Create a small syntax-highlight test fixture with:
   - Liquid output
   - Liquid if/for
   - component tag
   - script lang ts
   - style
   - schema JSON
4. Add `Show Compiled Liquid` command.
5. Add `Show Compiled Svelte` command.
6. Add file-level compiler diagnostics command or LSP prototype.
7. Decide package layout: `packages/vscode-extension` and `packages/language-server`.

## Definition of done for first editor milestone

A developer can open `examples/advanced-theme/sections/main-product.liquivelte` and:

- See reasonable syntax highlighting.
- Run `Liquivelte: Show Compiled Liquid`.
- Run `Liquivelte: Show Compiled Svelte`.
- See compiler diagnostics in Problems or through a command.
- Trust that all output comes from the v4 compiler, not old copied compiler behavior.

## Key principle

Editor tooling must teach the correct mental model:

> Liquid owns SSR truth. Svelte owns hydration behavior. Liquivelte compiles between them.
