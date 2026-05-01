import { describe, expect, it } from 'vitest';
import { loadExpressionModule } from '../utils/loaders';

describe('compileLiquidExpression', () => {
  it('converts Liquid boolean operators to JavaScript operators', async () => {
    const { compileLiquidExpression } = await loadExpressionModule();
    const result = compileLiquidExpression('a and b or c');

    expect(result.code).toBe('a && b || c');
    expect(result.requiresRuntime).toEqual([]);
  });

  it('converts contains to a runtime helper call', async () => {
    const { compileLiquidExpression } = await loadExpressionModule();
    const result = compileLiquidExpression("product.tags contains 'sale'");

    expect(result.code).toBe("lv.contains(product.tags, 'sale')");
    expect(result.requiresRuntime).toContain('contains');
  });

  it('converts .size to a safe runtime helper call', async () => {
    const { compileLiquidExpression } = await loadExpressionModule();
    const result = compileLiquidExpression('section.blocks.size > 0');

    expect(result.code).toBe('lv.size(section.blocks) > 0');
    expect(result.requiresRuntime).toContain('size');
  });

  it('keeps synthetic forloop references as hydration-scope references', async () => {
    const { compileLiquidExpression } = await loadExpressionModule();
    const result = compileLiquidExpression('forloop.index == 1', {
      scope: { syntheticForloopName: 'forloop' }
    });

    expect(result.code).toBe('forloop.index == 1');
    expect(result.scopeReads).toContain('forloop');
  });

  it('marks Shopify filter expressions for Liquid trace capture instead of client emulation', async () => {
    const { compileLiquidExpression } = await loadExpressionModule();
    const result = compileLiquidExpression('block.settings.body | html');

    expect(result.code).toMatch(/^lv\.expr\(/);
    expect(result.traceCapture).toEqual(expect.objectContaining({
      expression: 'block.settings.body | html',
      reason: 'filter'
    }));
  });
});
