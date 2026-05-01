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

describe('trace plan emission', () => {
  it('creates trace frames for loop and component boundaries', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), options);

    expect(result.tracePlan.frames).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: 'for', item: 'block', source: 'section.blocks' }),
      expect.objectContaining({ type: 'component', module: 'image-with-card' })
    ]));
  });

  it('records Liquid expression captures for filtered output', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), options);
    const expressionCaptures = result.tracePlan.expressionCaptures ?? [];

    expect(expressionCaptures).toContainEqual(expect.objectContaining({
      expression: 'block.settings.body | html',
      reason: 'filter'
    }));
  });

  it('emits a global JSON trace script in Liquid output when enabled', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const result = compileLiquivelte(await readFixture('slider-general.liquivelte'), options);

    expect(result.liquidCode).toContain('type="application/json"');
    expect(result.liquidCode).toContain('data-liquivelte-trace');
  });

  it('uses stable deterministic frame IDs for repeatable builds', async () => {
    const { compileLiquivelte } = await loadCompilerModule();
    const source = await readFixture('slider-general.liquivelte');
    const first = compileLiquivelte(source, options);
    const second = compileLiquivelte(source, options);

    expect(first.tracePlan.frames.map((frame: any) => frame.id)).toEqual(second.tracePlan.frames.map((frame: any) => frame.id));
  });
});
