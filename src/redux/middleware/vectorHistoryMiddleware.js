import {
    pushPast,
    pushFuture,
    clearFuture,
    popPast,
    popFuture,
} from '../slice/historyDocSlice';

// 각 슬라이스의 전체 치환 액션(필수): replaceAll
import { replaceAll as replaceCanvas } from '../slice/canvasSlice';
import { replaceAll as replaceLayers } from '../slice/layerSlice';
import { replaceAll as replaceRender } from '../slice/renderSlice';
import { replaceAll as replaceHitmap } from '../slice/hitmapSlice';

// 공개 액션 타입 (컴포넌트에서 dispatch 용)
export const UNDO_VECTOR_DOC = 'historyDoc/undo';
export const REDO_VECTOR_DOC = 'historyDoc/redo';

// 벡터 문서에 영향을 주는 액션 prefix 들
const VECTOR_PREFIXES = ['canvas/', 'layers/', 'render/', 'hitmap/'];

// 히스토리 기록에서 제외할 액션들(undo/redo 시 내부적으로 보내는 replaceAll 등)
const IGNORED_TYPES = new Set([
    'canvas/replaceAll',
    'layers/replaceAll',
    'render/replaceAll',
    'hitmap/replaceAll',
    // history 자신
    'historyDoc/pushPast',
    'historyDoc/pushFuture',
    'historyDoc/clearFuture',
    'historyDoc/popPast',
    'historyDoc/popFuture',
    'historyDoc/reset',
    UNDO_VECTOR_DOC,
    REDO_VECTOR_DOC,
]);

// 현재 vectorDoc 스냅샷(깊은 복제)
function cloneVectorSnapshot(state) {
    const snap = {
        canvas: state.vectorDoc?.canvas ?? {},
        layers: state.vectorDoc?.layers ?? { byId: {}, allIds: [] },
        render: state.vectorDoc?.render ?? { buckets: [], assignment: {} },
        hitmap: state.vectorDoc?.hitmap ?? { encoding: 'rgb24', nextId: 1 },
    };
    return JSON.parse(JSON.stringify(snap));
}

// 스냅샷을 각 슬라이스로 분배 적용
function applySnapshot(dispatch, snapshot) {
    dispatch(replaceCanvas(snapshot.canvas ?? {}));
    dispatch(replaceLayers(snapshot.layers ?? { byId: {}, allIds: [] }));
    dispatch(replaceRender(snapshot.render ?? { buckets: [], assignment: {} }));
    dispatch(
        replaceHitmap(snapshot.hitmap ?? { encoding: 'rgb24', nextId: 1 })
    );
}

const vectorHistoryMiddleware =
    ({ getState, dispatch }) =>
    (next) =>
    (action) => {
        // UNDO
        if (action.type === UNDO_VECTOR_DOC) {
            const current = cloneVectorSnapshot(getState());
            // 과거에서 하나 꺼내기
            next(popPast());
            const snap = getState()?.historyDoc?.applied;
            if (snap) {
                // 현재를 future 에 보관 후 적용
                dispatch(pushFuture({ snapshot: current }));
                applySnapshot(dispatch, snap);
            }
            return;
        }

        // REDO
        if (action.type === REDO_VECTOR_DOC) {
            const current = cloneVectorSnapshot(getState());
            // future 에서 하나 꺼내기
            next(popFuture());
            const snap = getState()?.historyDoc?.applied;
            if (snap) {
                // 현재를 past 에 보관 후 적용
                dispatch(pushPast({ snapshot: current }));
                applySnapshot(dispatch, snap);
            }
            return;
        }

        // 벡터 관련 액션인지 판단 (prefix 기준)
        const isVectorMutation =
            VECTOR_PREFIXES.some((p) => action.type.startsWith(p)) &&
            !IGNORED_TYPES.has(action.type);

        // 변경 전 스냅샷 보관
        const before = isVectorMutation
            ? cloneVectorSnapshot(getState())
            : null;

        const result = next(action);

        // 변경 발생 시: 과거 스택에 밀어넣고, future 는 비우기
        if (isVectorMutation) {
            dispatch(pushPast({ snapshot: before }));
            dispatch(clearFuture());
        }

        return result;
    };

export default vectorHistoryMiddleware;
