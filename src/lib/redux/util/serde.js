import { selectShapes } from '../slice/canvasSlice';
import { selectCanvasBg, selectView } from '../slice/uiSlice';

export function takeSnapshot(rootState) {
    const shapes = selectShapes(rootState);
    const bg = selectCanvasBg(rootState);
    const view = selectView(rootState);

    return {
        canvas: { width: 1920, height: 1080, background: bg },
        view,
        layers: [
            {
                id: 'layer_vector',
                type: 'vector',
                name: 'Vector',
                shapes: shapes.map(({ pickId, ...s }) => s),
            },
        ],
    };
}
