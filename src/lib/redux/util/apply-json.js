import { replaceAll as replaceCanvas } from '../slice/canvasSlice';
import { replaceAll as replaceLayers } from '../slice/layerSlice';
import { replaceAll as replaceRender } from '../slice/renderSlice';
import { replaceAllShapes } from '../slice/shapeSlice';
import { setSelection } from '../slice/selectionSlice';

/**
 * vectorJson를 상태에 적용 (dispatch 필요)
 * @param {function} dispatch - Redux dispatch 함수
 * @param {object} vj - vectorJson 객체
 * @example
 * applyVectorJson(dispatch, { canvas: {...}, layers: [...], shapes: [...] });
 */
const applyVectorJson = (dispatch, v = {}) => {
    if (v.canvas)
        dispatch({
            type: replaceCanvas.type,
            payload: v.canvas,
            meta: { fromHistory: true },
        });

    if (v.layers)
        dispatch({
            type: replaceLayers.type,
            payload: v.layers,
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
            type: replaceAllShapes.type,
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
