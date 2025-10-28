import { selectBackground } from '@/feature/toolbar/state/toolbar.selector';
import { selectShapes } from '../state/canvas.selector';
import { selectViewport } from '@/feature/viewport/state/viewport.selector';

function takeSnapshot(rootState) {
    const shapes = selectShapes(rootState);
    const bg = selectBackground(rootState);
    const view = selectViewport(rootState);

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

export { takeSnapshot };
