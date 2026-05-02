export interface TokenizeOptions {
    componentNames?: string[];
}
export interface Token {
    type: string;
    [key: string]: any;
}
export interface LiquidOutputToken extends Token {
    type: 'LiquidOutput';
    expression: string;
    trimLeft: boolean;
    trimRight: boolean;
}
export interface LiquidTagToken extends Token {
    type: 'LiquidTag';
    name: string;
    item?: string;
    source?: string;
    args?: string;
    trimLeft?: boolean;
    trimRight?: boolean;
}
export interface SchemaBlockToken extends Token {
    type: 'SchemaBlock';
    content: string;
    preserveInLiquid: boolean;
    excludeFromSvelte: boolean;
}
export interface ComponentTagToken extends Token {
    type: 'ComponentTag';
    name: string;
    selfClosing: boolean;
    props: Record<string, string>;
    children?: string;
}
export interface HtmlToken extends Token {
    type: 'Html';
    content: string;
}
export interface ScriptToken extends Token {
    type: 'Script';
    content: string;
}
export declare function tokenize(source: string, options?: TokenizeOptions): Token[];
