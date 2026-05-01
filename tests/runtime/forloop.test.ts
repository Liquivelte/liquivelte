import { describe, expect, it } from 'vitest';
import { loadRuntimeForloopModule } from '../utils/loaders';

describe('createForloop', () => {
  it('matches Liquid metadata for the first item', async () => {
    const { createForloop } = await loadRuntimeForloopModule();
    const loop = createForloop(0, 3);

    expect(loop).toEqual({
      index: 1,
      index0: 0,
      rindex: 3,
      rindex0: 2,
      first: true,
      last: false,
      length: 3,
      parentloop: undefined
    });
  });

  it('matches Liquid metadata for a middle item', async () => {
    const { createForloop } = await loadRuntimeForloopModule();
    const loop = createForloop(1, 3);

    expect(loop).toEqual(expect.objectContaining({
      index: 2,
      index0: 1,
      rindex: 2,
      rindex0: 1,
      first: false,
      last: false,
      length: 3
    }));
  });

  it('matches Liquid metadata for the last item', async () => {
    const { createForloop } = await loadRuntimeForloopModule();
    const loop = createForloop(2, 3);

    expect(loop).toEqual(expect.objectContaining({
      index: 3,
      index0: 2,
      rindex: 1,
      rindex0: 0,
      first: false,
      last: true,
      length: 3
    }));
  });

  it('preserves parentloop for nested loops', async () => {
    const { createForloop } = await loadRuntimeForloopModule();
    const parentloop = createForloop(0, 2);
    const childloop = createForloop(1, 4, parentloop);

    expect(childloop.parentloop).toBe(parentloop);
    expect(childloop.parentloop.index).toBe(1);
  });

  it('throws on invalid loop indexes to catch compiler/runtime mismatches early', async () => {
    const { createForloop } = await loadRuntimeForloopModule();

    expect(() => createForloop(-1, 3)).toThrow(/index/i);
    expect(() => createForloop(3, 3)).toThrow(/index/i);
    expect(() => createForloop(0, 0)).toThrow(/length/i);
  });
});
