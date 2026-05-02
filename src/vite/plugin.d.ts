export interface PluginOptions {
    themeRoot?: string;
}
export declare function liquivelteVitePlugin(options?: PluginOptions): {
    name: string;
    transform(source: string, id: string): Promise<{
        code: string;
        map: null;
    } | null>;
    buildStart(): Promise<void>;
    resolveId(id: string): "\0virtual:liquivelte/runtime" | "\0virtual:liquivelte/manifest" | null;
    load(id: string): string | null;
    generateBundle(_options: any, _bundle: any): void;
    getCompiled(id: string): any;
};
