export interface ExpressionResult {
  code: string;
  requiresRuntime: string[];
  scopeReads?: string[];
  traceCapture?: {
    expression: string;
    reason: string;
  };
}

export interface ExpressionOptions {
  scope?: {
    syntheticForloopName?: string;
  };
}

let exprIdCounter = 0;

export function compileLiquidExpression(expression: string, options?: ExpressionOptions): ExpressionResult {
  const result: ExpressionResult = {
    code: expression,
    requiresRuntime: [],
    scopeReads: []
  };

  // Check for filters (pipe operator)
  if (expression.includes('|')) {
    exprIdCounter++;
    result.code = `lv.expr(frame, 'expr_${exprIdCounter}', () => ${expression.split('|')[0].trim()})`;
    result.traceCapture = {
      expression: expression.trim().replace(/^-?\s*/, '').replace(/\s*-?$/, ''),
      reason: 'filter'
    };
    return result;
  }

  // Convert Liquid boolean operators
  let code = expression
    .replace(/\band\b/g, '&&')
    .replace(/\bor\b/g, '||');

  // Convert contains to runtime helper
  if (code.includes(' contains ')) {
    code = code.replace(/(\S+)\s+contains\s+(.+)/g, 'lv.contains($1, $2)');
    result.requiresRuntime.push('contains');
  }

  // Convert .size to runtime helper
  if (code.includes('.size')) {
    code = code.replace(/(\S+)\.size/g, 'lv.size($1)');
    result.requiresRuntime.push('size');
  }

  // Track forloop scope reads
  if (options?.scope?.syntheticForloopName && code.includes(options.scope.syntheticForloopName)) {
    result.scopeReads?.push(options.scope.syntheticForloopName);
  }

  result.code = code;
  return result;
}
