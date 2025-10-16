import { matrixToTransform } from './math/matrix';

export const serializeVectorJson = (state) => {
    const canvas = state.canvas;
    const render = state.render;
    const layers = [];

    // group 레이어
    const { byId = {}, allIds = [] } = state.layers || {};
    for (const id of allIds) {
        const g = byId[id];
        layers.push({
            id,
            type: 'group',
            visible: g?.visible !== false,
            locked: false,
            transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 },
        });
    }

    // 도형
    for (const sh of state.shapes?.list || []) {
        layers.push({
            id: sh.id,
            type: sh.type,
            locked: false,
            visible: true,
            transform: matrixToTransform(sh.matrix),
            x: sh.x,
            y: sh.y,
            width: sh.w,
            height: sh.h,
            style: sh.style,
        });
    }

    const buckets = (render?.buckets || []).map(({ _, ...rest }) => rest);

    return {
        schema: 1,
        canvas: {
            width: canvas.width,
            height: canvas.height,
            background: canvas.background,
            grid: canvas.grid,
        },
        layers,
        render: { ...render, buckets },
        hitmap: {
            encoding: 'rgb24',
            nextId: (state.shapes?.list?.length || 0) + 1,
        },
    };
};
