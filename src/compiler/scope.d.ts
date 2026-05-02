import { Document } from './parseDocument.js';
export interface ScopeVariable {
    name: string;
    kind: string;
}
export interface ScopeFrame {
    id: string;
    type: string;
    variables?: ScopeVariable[];
    item?: string;
    source?: string;
    indexName?: string;
    forloopName?: string;
    parentLoopId?: string;
    module?: string;
    props?: Array<{
        name: string;
        expression: string;
    }>;
    scopePath?: string[];
}
export interface ScopeModel {
    root: {
        type: 'root';
        variables: ScopeVariable[];
    };
    frames: ScopeFrame[];
}
export declare function buildScopeModel(document: Document): ScopeModel;
