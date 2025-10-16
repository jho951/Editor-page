import { setTool } from '../../../lib/redux/slice/toolSlice';
import { translateShapes } from '../../../lib/redux/slice/shapeSlice';
import { setZoom } from '../../../lib/redux/slice/viewportSlice';
import {
    undo as undoVector,
    redo as redoVector,
} from '../../../lib/redux/slice/historyDocSlice';
import {
    newDoc,
    saveCurrent,
    openLoadModal,
} from '../../../lib/redux/slice/docSlice';
import { setActiveHandle } from '../../../lib/redux/slice/selectionSlice';

function dispatchCommand(dispatch, getState, cmd) {
    switch (cmd) {
        case 'new':
            return dispatch(newDoc());
        case 'save':
            return dispatch(saveCurrent());
        case 'export':
            return dispatch(openLoadModal(true));
        case 'select':
            return dispatch(setTool('select'));
        case 'shape-rect':
            return dispatch(setTool('rect'));
        case 'shape-ellipse':
            return dispatch(setTool('ellipse'));
        case 'shape-line':
            return dispatch(setTool('line'));
        case 'shape-polygon':
            return dispatch(setTool('polygon'));
        case 'shape-star':
            return dispatch(setTool('star'));
        case 'path':
            return dispatch(setTool('path'));
        case 'text':
            return dispatch(setTool('text'));
        case 'undo':
            return dispatch(undoVector());
        case 'redo':
            return dispatch(redoVector());
        case 'zoom-in': {
            const { viewport } = getState();
            const next = Math.min((viewport.zoom || 1) * 1.1, 8);
            return dispatch(setZoom(next));
        }
        case 'zoom-out': {
            const { viewport } = getState();
            const next = Math.max((viewport.zoom || 1) / 1.1, 0.05);
            return dispatch(setZoom(next));
        }
        case 'fit': {
            return dispatch(setZoom(1));
        }

        case 'flipH':
            console.info('[flipH] implement your flipH action');
            return;
        case 'flipV':
            console.info('[flipV] implement your flipV action');
            return;
        case 'rotate':
            console.info('[rotate] implement your rotate action');
            return;
        case 'skew':
            console.info('[skew] implement your skew action');
            return;

        // Nudge (선택 이동)
        case 'nudge-up':
            return dispatch(translateShapes({ dx: 0, dy: -1 }));
        case 'nudge-down':
            return dispatch(translateShapes({ dx: 0, dy: 1 }));
        case 'nudge-left':
            return dispatch(translateShapes({ dx: -1, dy: 0 }));
        case 'nudge-right':
            return dispatch(translateShapes({ dx: 1, dy: 0 }));
        case 'nudge10-up':
            return dispatch(translateShapes({ dx: 0, dy: -10 }));
        case 'nudge10-down':
            return dispatch(translateShapes({ dx: 0, dy: 10 }));
        case 'nudge10-left':
            return dispatch(translateShapes({ dx: -10, dy: 0 }));
        case 'nudge10-right':
            return dispatch(translateShapes({ dx: 10, dy: 0 }));

        default:
            return;
    }
}

export { dispatchCommand };
export function dispatchHandleCommand(dispatch, handle) {
    return dispatch(setActiveHandle(handle));
}
