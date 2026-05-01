import { describe, expect, it } from 'vitest';
import { loadRuntimeTraceModule } from '../utils/loaders';

describe('trace runtime store', () => {
  it('registers and retrieves frames by id', async () => {
    const { createTraceStore } = await loadRuntimeTraceModule();
    const store = createTraceStore({
      frames: [
        { id: 'frame:1', module: 'slider-general', props: { section: { id: 's1' } }, expressions: {} }
      ]
    });

    expect(store.getFrame('frame:1')).toEqual(expect.objectContaining({
      id: 'frame:1',
      module: 'slider-general'
    }));
  });

  it('returns Liquid-resolved expression values before fallback values', async () => {
    const { createTraceStore } = await loadRuntimeTraceModule();
    const store = createTraceStore({
      frames: [
        { id: 'frame:1', module: 'image-with-card', props: {}, expressions: { expr_1: '<p>Liquid HTML</p>' } }
      ]
    });
    const frame = store.getFrame('frame:1');

    expect(store.expr(frame, 'expr_1', () => '<p>Client HTML</p>')).toBe('<p>Liquid HTML</p>');
  });

  it('falls back to a lazy client expression when trace data is missing', async () => {
    const { createTraceStore } = await loadRuntimeTraceModule();
    const store = createTraceStore({ frames: [] });

    expect(store.expr(undefined, 'missing', () => 'fallback')).toBe('fallback');
  });

  it('produces Svelte hydrate props from a trace frame', async () => {
    const { createTraceStore } = await loadRuntimeTraceModule();
    const store = createTraceStore({
      frames: [
        { id: 'frame:1', module: 'image-with-card', props: { block: { id: 'b1' }, forloop: { index: 1 } }, expressions: {} }
      ]
    });

    expect(store.getHydrationProps('frame:1')).toEqual({
      block: { id: 'b1' },
      forloop: { index: 1 }
    });
  });

  it('throws when hydration props are requested for an unknown frame', async () => {
    const { createTraceStore } = await loadRuntimeTraceModule();
    const store = createTraceStore({ frames: [] });

    expect(() => store.getHydrationProps('missing')).toThrow(/missing/i);
  });
});
