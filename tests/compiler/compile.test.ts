import { describe, expect, it } from 'vitest';
import { readFixture } from '../utils/fixtures';
import { loadCompilerModule } from '../utils/loaders';

const compileOptions = {
  filename: 'tests/fixtures/slider-general.liquivelte',
  componentName: 'SliderGeneral',
  mode: 'test',
  svelteVersionTarget: 5,
  trace: { enabled: true, format: 'json-script' },
  themeImportsMode: 'props'
} as const;

describe('compileLiquivelte', () => {
  it('returns the public v4 compiler result shape', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), compileOptions);

    expect(result).toEqual(expect.objectContaining({
      svelteCode: expect.any(String),
      liquidCode: expect.any(String),
      tracePlan: expect.any(Object),
      componentManifest: expect.any(Object),
      diagnostics: expect.any(Array)
    }));
  });

  it('converts Liquid loops to Svelte each blocks with synthetic forloop metadata', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), compileOptions);

    expect(result.svelteCode).toContain('{#each section.blocks as block, index}');
    expect(result.svelteCode).toContain('{@const forloop = lv.forloop(index, lv.size(section.blocks)');
    expect(result.svelteCode).toContain('{/each}');
  });

  it('converts Liquid conditionals to Svelte conditionals without losing forloop reads', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), compileOptions);

    expect(result.svelteCode).toContain('{#if block.type == \'image-card\' && forloop.index == 1}');
    expect(result.svelteCode).toContain('{:else if block.type == \'image-card\'}');
    expect(result.svelteCode).toContain('{/if}');
  });

  it('keeps Shopify Liquid loops and branches authoritative in Liquid output', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), compileOptions);

    expect(result.liquidCode).toContain('{% for block in section.blocks %}');
    expect(result.liquidCode).toContain("{% if block.type == 'image-card' and forloop.index == 1 %}");
    expect(result.liquidCode).toContain('{% elsif block.type == \'image-card\' %}');
    expect(result.liquidCode).toContain('{% endfor %}');
  });

  it('strips schema from Svelte output while preserving it in Liquid output', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), compileOptions);

    expect(result.svelteCode).not.toContain('{% schema %}');
    expect(result.svelteCode).not.toContain('"name": "Slider general"');
    expect(result.liquidCode).toContain('{% schema %}');
    expect(result.liquidCode).toContain('"name": "Slider general"');
    expect(result.liquidCode).toContain('{% endschema %}');
  });

  it('reports no diagnostics for the reduced slider fixture', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), compileOptions);

    expect(result.diagnostics.filter((diagnostic: any) => diagnostic.severity === 'error')).toEqual([]);
  });
});
