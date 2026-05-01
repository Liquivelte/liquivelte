import { describe, expect, it } from 'vitest';
import { readFixture } from '../utils/fixtures';
import { loadTokenizerModule } from '../utils/loaders';

describe('tokenize', () => {
  it('recognizes Liquid output tokens with trim metadata', async () => {
    const { tokenize } = await loadTokenizerModule();
    const tokens = tokenize('<img src="{{- block.settings.image -}}" />');

    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'LiquidOutput',
      expression: 'block.settings.image',
      trimLeft: true,
      trimRight: true
    }));
  });

  it('recognizes Liquid for tags with item and source expressions', async () => {
    const { tokenize } = await loadTokenizerModule();
    const tokens = tokenize('{% for block in section.blocks %}<div></div>{% endfor %}');

    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'LiquidTag',
      name: 'for',
      item: 'block',
      source: 'section.blocks'
    }));

    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'LiquidTag',
      name: 'endfor'
    }));
  });

  it('preserves nested Liquid control-flow order', async () => {
    const { tokenize } = await loadTokenizerModule();
    const source = '{% for block in section.blocks %}{% if block.type == "image-card" %}x{% endif %}{% endfor %}';
    const names = tokenize(source)
      .filter((token: any) => token.type === 'LiquidTag')
      .map((token: any) => token.name);

    expect(names).toEqual(['for', 'if', 'endif', 'endfor']);
  });

  it('recognizes imported Liquivelte component tags and their children', async () => {
    const { tokenize } = await loadTokenizerModule();
    const source = await readFixture('slider-general.liquivelte');
    const tokens = tokenize(source, { componentNames: ['ImageWithCard'] });

    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'ComponentTag',
      name: 'ImageWithCard',
      selfClosing: false,
      props: expect.objectContaining({
        block: '{{- block -}}',
        forloop: '{{- forloop -}}'
      }),
      children: expect.stringContaining('block.settings.body | html')
    }));

    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'ComponentTag',
      name: 'ImageWithCard',
      selfClosing: true
    }));
  });

  it('recognizes schema blocks as Liquid-preserved and Svelte-excluded tokens', async () => {
    const { tokenize } = await loadTokenizerModule();
    const source = await readFixture('slider-general.liquivelte');
    const tokens = tokenize(source);

    expect(tokens).toContainEqual(expect.objectContaining({
      type: 'SchemaBlock',
      content: expect.stringContaining('Slider general'),
      preserveInLiquid: true,
      excludeFromSvelte: true
    }));
  });
});
