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
export { safeParseVectorJson };
