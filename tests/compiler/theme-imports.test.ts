import { describe, expect, it } from 'vitest';
import { loadCompilerModule } from '../utils/loaders';

const options = {
  filename: 'theme-imports.liquivelte',
  componentName: 'ThemeImports',
  mode: 'test',
  svelteVersionTarget: 5,
  trace: { enabled: true, format: 'json-script' },
  themeImportsMode: 'props'
} as const;

describe('theme imports', () => {
  it('turns root theme imports into top-level Svelte props and manifest entries', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte('<script>import section from \'theme\';</script><h1>{{- section.settings.title -}}</h1>', options);

    expect(result.svelteCode).toContain('export let section');
    expect(result.componentManifest.themeImports).toContainEqual(expect.objectContaining({
      importPath: 'section',
      propName: 'section'
    }));
  });

  it('turns theme subpath imports into stable internal prop bindings', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte('<script>import section.blocks from \'theme\';</script>{% for block in section.blocks %}{{- block.id -}}{% endfor %}', options);

    expect(result.svelteCode).toContain('export let section$$blocks');
    expect(result.svelteCode).toContain('section.blocks = section$$blocks');
    expect(result.componentManifest.themeImports).toContainEqual(expect.objectContaining({
      importPath: 'section.blocks',
      propName: 'section$$blocks'
    }));
  });

  it('deduplicates repeated theme imports', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte('<script>import section from \'theme\';\nimport section from \'theme\';</script>', options);

    expect(result.componentManifest.themeImports.filter((entry: any) => entry.importPath === 'section')).toHaveLength(1);
  });

  it('diagnoses unsupported dynamic theme imports', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte('<script>const key = \'section\'; import(key);</script>', options);

    expect(result.diagnostics).toContainEqual(expect.objectContaining({
      code: 'unsupported-dynamic-theme-import',
      severity: 'error'
    }));
  });
});
