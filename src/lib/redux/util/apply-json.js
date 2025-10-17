import { replaceAll as replaceCanvas } from '../slice/canvasSlice';
import { replaceAll as replaceRender } from '../slice/renderSlice';
import { replaceAll as replaceShape } from '../slice/shapeSlice';
import { setSelection } from '../slice/selectionSlice';

const applyVectorJson = (dispatch, v = {}) => {
    if (v.canvas)
        dispatch({
            type: replaceCanvas.type,
            payload: v.canvas,
            meta: { fromHistory: true },
        });

    if (v.render)
        dispatch({
            type: replaceRender.type,
            payload: v.render,
            meta: { fromHistory: true },
        });
    if (v.shapes)
        dispatch({
            type: replaceShape.type,
            payload: v.shapes,
            meta: { fromHistory: true },
        });

    if (v.selection !== undefined)
        dispatch({
            type: setSelection.type,
            payload: v.selection,
            meta: { fromHistory: true },
        });
};
export { applyVectorJson };
