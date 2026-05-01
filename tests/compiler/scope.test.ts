import { describe, expect, it } from 'vitest';
import { loadParserModule, loadScopeModule, loadTokenizerModule } from '../utils/loaders';

async function buildScope(source: string) {
  const { tokenize } = await loadTokenizerModule();
  const { parseDocument } = await loadParserModule();
  const { buildScopeModel } = await loadScopeModule();
  return buildScopeModel(parseDocument(tokenize(source, { componentNames: ['ImageWithCard'] }), { componentNames: ['ImageWithCard'] }));
}

describe('buildScopeModel', () => {
  it('synthesizes Liquid forloop variables for Svelte hydration', async () => {
    const model = await buildScope('{% for block in section.blocks %}{{- forloop.index -}}{% endfor %}');
    const loopFrame = model.frames.find((frame: any) => frame.type === 'for');

    expect(loopFrame).toEqual(expect.objectContaining({
      type: 'for',
      item: 'block',
      source: 'section.blocks',
      indexName: 'index',
      forloopName: 'forloop'
    }));

    expect(loopFrame.variables).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'block', kind: 'loop-item' }),
      expect.objectContaining({ name: 'index', kind: 'loop-index' }),
      expect.objectContaining({ name: 'forloop', kind: 'synthetic-forloop' })
    ]));
  });

  it('links nested loops through parentloop metadata', async () => {
    const model = await buildScope('{% for product in collection.products %}{% for variant in product.variants %}{{- forloop.parentloop.index -}}{% endfor %}{% endfor %}');
    const loopFrames = model.frames.filter((frame: any) => frame.type === 'for');

    expect(loopFrames).toHaveLength(2);
    expect(loopFrames[1]).toEqual(expect.objectContaining({
      item: 'variant',
      parentLoopId: loopFrames[0].id
    }));
  });

  it('records branch frames without leaking branch-local metadata to root scope', async () => {
    const model = await buildScope('{% if block.type == "image-card" %}A{% elsif block.type == "video" %}B{% else %}C{% endif %}');
    const branchFrames = model.frames.filter((frame: any) => frame.type === 'if' || frame.type === 'branch');

    expect(branchFrames.length).toBeGreaterThanOrEqual(1);
    expect(model.root.variables ?? []).not.toContainEqual(expect.objectContaining({ name: 'block' }));
  });

  it('attaches current loop scope to component boundaries', async () => {
    const model = await buildScope('{% for block in section.blocks %}<ImageWithCard block="{{- block -}}" forloop="{{- forloop -}}" />{% endfor %}');
    const componentFrame = model.frames.find((frame: any) => frame.type === 'component');

    expect(componentFrame).toEqual(expect.objectContaining({
      type: 'component',
      module: 'ImageWithCard',
      props: expect.arrayContaining([
        expect.objectContaining({ name: 'block', expression: 'block' }),
        expect.objectContaining({ name: 'forloop', expression: 'forloop' })
      ])
    }));

    expect(componentFrame.scopePath).toContainEqual(expect.stringMatching(/^for:/));
  });
});
