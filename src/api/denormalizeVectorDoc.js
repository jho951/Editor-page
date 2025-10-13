export function denormalizeVectorDoc(state) {
    const { schema, canvas, layers, render, hitmap, meta } = state.vectorDoc;
    return {
        schema,
        canvas,
        layers: layers.allIds.map((id) => layers.byId[id]),
        render,
        hitmap,
        meta,
    };
}
