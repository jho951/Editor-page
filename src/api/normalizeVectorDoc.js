export function normalizeVectorDoc(doc) {
    const { schema, canvas, layers = [], render, hitmap, meta } = doc || {};
    const byId = {};
    const allIds = [];
    for (const layer of layers) {
        if (!layer?.id) continue;
        byId[layer.id] = layer;
        allIds.push(layer.id);
    }
    return {
        schema: schema ?? 1,
        canvas: {
            width: canvas?.width ?? 1,
            height: canvas?.height ?? 1,
            background: canvas?.background ?? null,
            grid: canvas?.grid ?? { enabled: false, size: 10 },
        },
        layers: { byId, allIds },
        render: render ?? { buckets: [], assignment: {} },
        hitmap: hitmap ?? { encoding: 'rgb24', nextId: 1 },
        meta: meta ?? {},
    };
}
