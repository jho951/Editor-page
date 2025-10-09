/**
 * @description 벡터(=shape 상태)만 히스토리 관리
 * - 벡터 변경 액션 직전 스냅샷을 past에 push (future는 리듀서에서 clear)
 * - undo/redo 인터셉트 → shape/replaceAll 로 복원
 */

const VECTOR_MUTATIONS = [
    'shape/add',
    'shape/update',
    'shape/remove',
    'shape/clear',
    'shape/reorder',
    'shape/replaceAll', // 외부에서 상태 대체 시에도 이전 스냅샷 보존
];

// history 액션 타입 (historySlice 구현과 동일해야 함)
const PUSH_PAST_VECTOR = 'history/pushPastVector';
const PUSH_FUTURE_VECTOR = 'history/pushFutureVector';
const POP_PAST_VECTOR = 'history/popPastVector';
const POP_FUTURE_VECTOR = 'history/popFutureVector';

// 트리거(단축키/버튼에서 디스패치)
export const UNDO_VECTOR = 'history/undoVector';
export const REDO_VECTOR = 'history/redoVector';

// shape 상태 교체
const SHAPE_REPLACE_ALL = 'shape/replaceAll';

export function vectorMiddleware({ getState, dispatch }) {
    return (next) => (action) => {
        // 1) undo/redo 먼저 처리
        if (action.type === UNDO_VECTOR) {
            const currentShape = getState()?.shape;
            const result = next({ type: POP_PAST_VECTOR });
            const snap = getState()?.history?.vector?.applied;
            if (snap) {
                const clonedCurrent = JSON.parse(JSON.stringify(currentShape));
                dispatch({
                    type: PUSH_FUTURE_VECTOR,
                    payload: { snapshot: clonedCurrent },
                });
                dispatch({ type: SHAPE_REPLACE_ALL, payload: snap });
            }
            return result;
        }
        if (action.type === REDO_VECTOR) {
            const currentShape = getState()?.shape;
            const result = next({ type: POP_FUTURE_VECTOR });
            const snap = getState()?.history?.vector?.applied;
            if (snap) {
                const clonedCurrent = JSON.parse(JSON.stringify(currentShape));
                dispatch({
                    type: PUSH_PAST_VECTOR,
                    payload: { snapshot: clonedCurrent },
                });
                dispatch({ type: SHAPE_REPLACE_ALL, payload: snap });
            }
            return result;
        }

        const beforeShape = getState()?.shape;
        const result = next(action);

        if (VECTOR_MUTATIONS.includes(action.type)) {
            const clonedBefore = JSON.parse(JSON.stringify(beforeShape));
            dispatch({
                type: PUSH_PAST_VECTOR,
                payload: { snapshot: clonedBefore },
            });
        }

        return result;
    };
}

function Middleware(getDefaultMiddleware) {
    const base = getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [
                'history/pushPastVector',
                'history/pushFutureVector',
                'history/popPastVector',
                'history/popFutureVector',
                UNDO_VECTOR,
                REDO_VECTOR,
                SHAPE_REPLACE_ALL,
            ],
            ignoredPaths: [
                'history.vector.past',
                'history.vector.future',
                'history.vector.applied',
                'shape',
            ],
        },
        immutableCheck: false,
    });

    return base.concat(vectorMiddleware);
}

export default Middleware;
