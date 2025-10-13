// src/slice/vectorDocHelpers.js
import { hydrate as hydrateCanvas } from './canvasSlice';
import { hydrate as hydrateLayers, selectLayersState } from './layerSlice';
import { hydrate as hydrateRender } from './renderSlice';
import { hydrate as hydrateHitmap } from './hitmapSlice';

export const hydrateVectorDoc = (doc) => (dispatch) => {
    dispatch(hydrateCanvas(doc?.canvas || undefined));
    dispatch(hydrateLayers(doc?.layers || []));
    dispatch(hydrateRender(doc?.render || undefined));
    dispatch(hydrateHitmap(doc?.hitmap || undefined));
    // schema/meta 필요하면 별도 slice로 빼거나, 여기서 무시
};

export const selectVectorDocument = (state) => {
    const canvas = state.vectorDoc.canvas;
    const render = state.vectorDoc.render;
    const hitmap = state.vectorDoc.hitmap;

    // denormalize layers
    const { byId, rootIds } = selectLayersState(state);
    const build = (id) => {
        const n = byId[id];
        return {
            id: n.id,
            type: n.type,
            visible: n.visible,
            locked: n.locked,
            transform: n.transform,
            style: n.style,
            props: n.props,
            flags: n.flags ?? undefined,
            bbox: n.bbox ?? undefined,
            children:
                Array.isArray(n.children) && n.children.length
                    ? n.children.map(build)
                    : null,
        };
    };
    const layers = rootIds.map(build);

    return {
        schema: 1,
        canvas,
        layers,
        render,
        hitmap,
    };
};
