import { describe, expect, it } from 'vitest';
import { readFixture } from '../utils/fixtures';
import { loadCompilerModule } from '../utils/loaders';

const options = {
  filename: 'tests/fixtures/slider-general.liquivelte',
  componentName: 'SliderGeneral',
  mode: 'test',
  svelteVersionTarget: 5,
  trace: { enabled: true, format: 'json-script' },
  themeImportsMode: 'props'
} as const;

describe('component import compilation', () => {
  it('adds imported .liquivelte modules to the component manifest', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), options);

    expect(result.componentManifest.components).toContainEqual(expect.objectContaining({
      localName: 'ImageWithCard',
      source: './blocks/image-with-card.liquivelte',
      module: 'image-with-card'
    }));
  });

  it('preserves the Svelte component boundary while making Liquid props safe', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), options);

    expect(result.svelteCode).toContain('<ImageWithCard');
    expect(result.svelteCode).toMatch(/block=\{.*block.*\}/s);
    expect(result.svelteCode).toMatch(/forloop=\{.*forloop.*\}/s);
  });

  it('emits a Liquid render boundary for SSR component instances', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), options);

    expect(result.liquidCode).toMatch(/\{%\s*render\s+['"]liquivelte-component['"]/);
    expect(result.liquidCode).toContain("module: 'image-with-card'");
    expect(result.liquidCode).toContain('trace_id:');
  });

  it('records default and named slot payloads in the trace plan', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), options);
    const componentFrame = result.tracePlan.frames.find((frame: any) => frame.module === 'image-with-card');

    expect(componentFrame.slots).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'default', content: expect.stringContaining('block.settings.body') }),
      expect.objectContaining({ name: 'eyebrow', content: expect.stringContaining('block.settings.eyebrow') })
    ]));
  });

  it('preserves {% render %} tag arguments in Liquid output', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const renderOptions = {
      filename: 'tests/fixtures/render-tag.liquivelte',
      componentName: 'RenderTag',
      mode: 'test',
      svelteVersionTarget: 5,
      trace: { enabled: false, format: 'json-script' },
      themeImportsMode: 'props'
    } as const;
    const result = compileLiquivelte(await readFixture('render-tag.liquivelte'), renderOptions);

    // The render tag should preserve all its arguments
    expect(result.liquidCode).toContain("{% render 'responsive-image', image: product.featured_image, width: 400, height: 400 %}");
    // Should not be empty
    expect(result.liquidCode).not.toMatch(/\{%\s*render\s+['"]responsive-image['"]\s*%\}/);
  });
});
