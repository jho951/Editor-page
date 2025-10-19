// apply-json.js
import { replaceAll as replaceCanvas } from '../slice/canvasSlice';
import {
    replaceAll as replaceRender,
    markAllDirty,
} from '../slice/renderSlice';
import { replaceAll as replaceShape } from '../slice/shapeSlice';
import { setSelection, clearSelection } from '../slice/selectionSlice';
import { reset as resetHistory, clearFuture } from '../slice/historySlice';
import { fitIn as viewportFitIn } from '../slice/viewportSlice';

/**
 * vectorJson을 현재 상태에 적용
 * @param {function} dispatch
 * @param {object|null} v  - { canvas, shapes, render, selection }
 * @param {object} [opts]
 * @param {boolean} [opts.clearHistory=true]
 * @param {boolean} [opts.fitViewport=true]
 * @param {boolean} [opts.markDirty=true]
 * @param {boolean} [opts.preserveSelection=false]
 * @param {{w:number,h:number}} [opts.viewSize] - 뷰포트 기준 크기(없으면 canvas 크기 사용)
 */
const applyVectorJson = (dispatch, v = {}, opts = {}) => {
    const {
        clearHistory: doClearHistory = true,
        fitViewport: doFitViewport = true,
        markDirty: doMarkDirty = true,
        preserveSelection = false,
        viewSize,
    } = opts;

    if (!v || typeof v !== 'object') return false;

    const cvs = v.canvas || {};
    const shapes = Array.isArray(v.shapes) ? v.shapes : [];
    const render = v.render || {};
    const sel = v.selection;

    // 1) 캔버스 / 렌더 / 도형 반영
    dispatch(
        replaceCanvas({
            width: cvs.width ?? 0,
            height: cvs.height ?? 0,
            background: cvs.background ?? null,
            grid: cvs.grid ?? null,
        })
    );
    dispatch(replaceRender(render));
    dispatch(replaceShape(shapes));

    // 2) 선택 상태
    if (preserveSelection) {
        // 유지 모드: 아무 것도 하지 않음
    } else if (sel != null) {
        dispatch(setSelection(sel));
    } else {
        dispatch(clearSelection());
    }

    // 3) 히스토리
    if (doClearHistory) {
        dispatch(resetHistory());
        dispatch(clearFuture());
    }

    // 4) 뷰포트 맞춤
    if (doFitViewport) {
        const viewW = viewSize?.w ?? cvs.width ?? 0;
        const viewH = viewSize?.h ?? cvs.height ?? 0;
        dispatch(
            viewportFitIn({
                canvasW: cvs.width ?? 0,
                canvasH: cvs.height ?? 0,
                viewW,
                viewH,
                padding: 16,
            })
        );
    }

    // 5) 더티 플래그 일괄
    if (doMarkDirty) dispatch(markAllDirty());

    return true;
};

export { applyVectorJson };
