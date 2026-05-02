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
export declare function compileLiquidExpression(expression: string, options?: ExpressionOptions): ExpressionResult;
