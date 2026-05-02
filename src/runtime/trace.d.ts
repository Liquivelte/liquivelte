export interface TraceFrame {
    id: string;
    module: string;
    props: Record<string, unknown>;
    expressions: Record<string, unknown>;
}
export interface TracePlan {
    frames: TraceFrame[];
    expressionCaptures?: any[];
}
export interface TraceStore {
    getFrame(id: string): TraceFrame | undefined;
    expr(frame: TraceFrame | undefined, id: string, fallback: () => unknown): unknown;
    getHydrationProps(id: string): Record<string, unknown>;
}
export declare function createTraceStore(tracePlan: TracePlan): TraceStore;
