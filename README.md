# Liquivelte v4

Liquivelte v4 is a fresh core processor experiment for compiling `.liquivelte` files into two coordinated outputs:

- Svelte code for client hydration.
- Shopify Liquid code for authoritative SSR.

The key design rule is that Shopify Liquid remains the runtime oracle. Svelte hydration should follow Liquid loop metadata, component boundaries, and trace data instead of independently guessing scope.

## Current status

The current implementation includes:

- Compiler entry point: `src/compiler/compileLiquivelte.ts`
- Tokenizer/parser/scope/expression modules under `src/compiler/`
- Runtime helpers under `src/runtime/`
- Vite plugin under `src/vite/plugin.ts`
- Vitest contract tests under `tests/`
- Fixture `.liquivelte` files under `tests/fixtures/`

## Useful docs

- Manual testing: `docs/manual-testing.md`
- Next implementation roadmap: `docs/next-implementation-plan.md`

## Quick verification

```bash
npm install
npm test
npm run typecheck
```

For focused debugging:

```bash
npm test -- tests/compiler/tokenize.test.ts
npm test -- tests/compiler/compile.test.ts
npm test -- tests/vite/plugin.test.ts
```
