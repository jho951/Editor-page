import {
    selectShapes,
    addShape,
    clearFocus,
    resetAll,
} from '../slice/canvasSlice';
import {
    setCanvasBg,
    selectCanvasBg,
    setView,
    selectView,
} from '../slice/uiSlice';

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
                shapes: shapes.map(({ pickId, ...s }) => s), // 렌더용 pickId 제거
            },
        ],
    };
}

/** 서버에서 받은 문서(JSON)를 Redux 상태로 복원 */
export function hydrateFromDoc(doc) {
    return async function (dispatch) {
        const safeDoc = doc || {};
        const layers = Array.isArray(safeDoc.layers) ? safeDoc.layers : [];
        const vector = layers[0]?.shapes || safeDoc.shapes || [];

        // 1) 전체 초기화(undo/redo 포함)
        dispatch(resetAll());

        // 2) 배경/뷰 복원
        const bg = safeDoc.canvas?.background || '#ffffff';
        dispatch(setCanvasBg(bg));
        if (safeDoc.view) dispatch(setView(safeDoc.view));

        // 3) 도형 복원 (id는 클라에서 재부여됨)
        for (const raw of vector) {
            const { id, pickId, ...base } = raw || {};
            dispatch(addShape(base));
        }

        // 4) 포커스 비우기
        dispatch(clearFocus());
    };
}
