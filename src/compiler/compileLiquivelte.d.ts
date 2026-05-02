export interface CompileOptions {
    filename: string;
    componentName: string;
    mode: 'development' | 'production' | 'test';
    svelteVersionTarget: number;
    trace: {
        enabled: boolean;
        format: 'json-script' | 'dom-local';
    };
    themeImportsMode: string;
}
export interface CompileResult {
    svelteCode: string;
    liquidCode: string;
    tracePlan: {
        frames: any[];
        expressionCaptures: any[];
    };
    componentManifest: {
        components: any[];
        themeImports: any[];
    };
    diagnostics: any[];
    map?: unknown;
}
export declare function compileLiquivelte(source: string, options: CompileOptions): CompileResult;
