export function createTraceStore(tracePlan) {
    const framesMap = new Map();
    for (const frame of tracePlan.frames) {
        framesMap.set(frame.id, frame);
    }
    return {
        getFrame(id) {
            return framesMap.get(id);
        },
        expr(frame, id, fallback) {
            if (frame?.expressions && id in frame.expressions) {
                return frame.expressions[id];
            }
            return fallback();
        },
        getHydrationProps(id) {
            const frame = framesMap.get(id);
            if (!frame) {
                throw new Error(`Missing trace frame: ${id}`);
            }
            return frame.props;
        }
    };
}
//# sourceMappingURL=trace.js.map