/**
 * @file useVectorHistory.js
 * @description 미들웨어 트리거 기반 벡터 undo/redo
 * - 캡처는 미들웨어가 VECTOR_MUTATIONS 전/후로 자동 처리
 */
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UNDO_VECTOR, REDO_VECTOR } from '../redux/middleware/historyChannels';

export function useVectorHistory() {
    const dispatch = useDispatch();
    const pastLen = useSelector((s) => s.history?.vector?.past?.length || 0);
    const futureLen = useSelector(
        (s) => s.history?.vector?.future?.length || 0
    );

    const undo = useCallback(() => {
        if (pastLen > 0) dispatch({ type: UNDO_VECTOR });
    }, [dispatch, pastLen]);
    const redo = useCallback(() => {
        if (futureLen > 0) dispatch({ type: REDO_VECTOR });
    }, [dispatch, futureLen]);

    return { undo, redo, canUndo: pastLen > 0, canRedo: futureLen > 0 };
}
