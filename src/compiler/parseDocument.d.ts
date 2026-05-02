import { Token } from './tokenize.js';
export interface ParseOptions {
    componentNames?: string[];
}
export interface Document {
    type: 'Document';
    tokens: Token[];
    componentNames: string[];
}
export declare function parseDocument(tokens: Token[], options?: ParseOptions): Document;
