/**
 * @file util/vectorJson.js
 * @author YJH
 * @description vectorJson 관련 유틸 함수
 */
import { replaceAll as replaceCanvas } from '../redux/slice/canvasSlice';
import { replaceAll as replaceLayers } from '../redux/slice/layerSlice';
import { replaceAll as replaceRender } from '../redux/slice/renderSlice';
import { replaceAllShapes } from '../redux/slice/shapeSlice';
import { setSelection } from '../redux/slice//selectionSlice';

/**
 * vectorJson 안전 파서 (문자열/객체 대응)
 * @param {string|object} v - vectorJson (문자열 또는 객체)
 * @returns {object|null} 파싱된 객체 또는 null
 * @example
 * const vj1 = safeParseVectorJson('{"canvas": {...}, "layers": [...]}');
 * const vj2 = safeParseVectorJson({ canvas: {...}, layers: [...] });
 */
const safeParseVectorJson = (v) => {
    if (!v) return null;
    if (typeof v === 'object') return v;
    try {
        return JSON.parse(v);
    } catch {
        return null;
    }
};

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
