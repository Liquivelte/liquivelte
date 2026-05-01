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

export function createTraceStore(tracePlan: TracePlan): TraceStore {
  const framesMap = new Map<string, TraceFrame>();
  
  for (const frame of tracePlan.frames) {
    framesMap.set(frame.id, frame);
  }

  return {
    getFrame(id: string): TraceFrame | undefined {
      return framesMap.get(id);
    },

    expr(frame: TraceFrame | undefined, id: string, fallback: () => unknown): unknown {
      if (frame?.expressions && id in frame.expressions) {
        return frame.expressions[id];
      }
      return fallback();
    },

    getHydrationProps(id: string): Record<string, unknown> {
      const frame = framesMap.get(id);
      if (!frame) {
        throw new Error(`Missing trace frame: ${id}`);
      }
      return frame.props;
    }
  };
}
