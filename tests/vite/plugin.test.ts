import { describe, expect, it, vi } from 'vitest';
import { readFixture } from '../utils/fixtures';
import { loadVitePluginModule } from '../utils/loaders';

describe('liquivelteVitePlugin', () => {
  it('exposes the expected Vite plugin hooks', async () => {
    const { liquivelteVitePlugin } = await loadVitePluginModule();
    const plugin = liquivelteVitePlugin({ themeRoot: 'theme' });

    expect(plugin).toEqual(expect.objectContaining({
      name: 'liquivelte-v4',
      transform: expect.any(Function),
      resolveId: expect.any(Function),
      load: expect.any(Function)
    }));
  });

  it('transforms .liquivelte files into Svelte code and caches Liquid output', async () => {
    const { liquivelteVitePlugin } = await loadVitePluginModule();
    const plugin = liquivelteVitePlugin({ themeRoot: 'theme' });
    const source = await readFixture('slider-general.liquivelte');
    const result = await plugin.transform.call({ warn: vi.fn(), error: vi.fn() }, source, '/project/src/sections/slider-general.liquivelte');

    expect(result).toEqual(expect.objectContaining({
      code: expect.stringContaining('{#each section.blocks as block, index}')
    }));
    expect(plugin.getCompiled?.('/project/src/sections/slider-general.liquivelte')).toEqual(expect.objectContaining({
      liquidCode: expect.stringContaining('{% for block in section.blocks %}')
    }));
  });

  it('does not transform unrelated files', async () => {
    const { liquivelteVitePlugin } = await loadVitePluginModule();
    const plugin = liquivelteVitePlugin({ themeRoot: 'theme' });
    const result = await plugin.transform.call({ warn: vi.fn(), error: vi.fn() }, 'export const x = 1;', '/project/src/file.ts');

    expect(result).toBeNull();
  });

  it('resolves and loads the virtual runtime module', async () => {
    const { liquivelteVitePlugin } = await loadVitePluginModule();
    const plugin = liquivelteVitePlugin({ themeRoot: 'theme' });
    const resolved = await plugin.resolveId.call({}, 'virtual:liquivelte/runtime');
    const loaded = await plugin.load.call({}, resolved);

    expect(resolved).toBe('\0virtual:liquivelte/runtime');
    expect(loaded).toContain('createForloop');
    expect(loaded).toContain('createTraceStore');
  });

  it('resolves and loads a manifest virtual module from compiled files', async () => {
    const { liquivelteVitePlugin } = await loadVitePluginModule();
    const plugin = liquivelteVitePlugin({ themeRoot: 'theme' });
    await plugin.transform.call({ warn: vi.fn(), error: vi.fn() }, await readFixture('slider-general.liquivelte'), '/project/src/sections/slider-general.liquivelte');

    const resolved = await plugin.resolveId.call({}, 'virtual:liquivelte/manifest');
    const loaded = await plugin.load.call({}, resolved);

    expect(resolved).toBe('\0virtual:liquivelte/manifest');
    expect(loaded).toContain('slider-general.liquivelte');
    expect(loaded).toContain('image-with-card');
  });

  it('emits generated Liquid files during bundle generation', async () => {
    const { liquivelteVitePlugin } = await loadVitePluginModule();
    const plugin = liquivelteVitePlugin({ themeRoot: 'theme' });
    const emitted: any[] = [];
    const context = {
      warn: vi.fn(),
      error: vi.fn(),
      emitFile: (asset: any) => emitted.push(asset)
    };

    await plugin.transform.call(context, await readFixture('slider-general.liquivelte'), '/project/src/sections/slider-general.liquivelte');
    await plugin.generateBundle.call(context, {}, {});

    expect(emitted).toContainEqual(expect.objectContaining({
      type: 'asset',
      fileName: 'sections/slider-general.liquid',
      source: expect.stringContaining('{% for block in section.blocks %}')
    }));
  });
});
