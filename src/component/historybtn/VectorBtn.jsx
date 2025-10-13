/**
 * @file VectorBtn.jsx
 * @author YJH
 */
import { useDispatch, useSelector } from 'react-redux';

import {
    UNDO_VECTOR_DOC as UNDO_VECTOR,
    REDO_VECTOR_DOC as REDO_VECTOR,
} from '../../redux/middleware/vectorHistoryMiddleware';

function VectorUndoRedoControl() {
    const dispatch = useDispatch();

    const canUndo = useSelector(
        (s) => (s.history?.vector?.past?.length || 0) > 0
    );
    const canRedo = useSelector(
        (s) => (s.history?.vector?.future?.length || 0) > 0
    );

    return (
        <article className="toolbar-group">
            <button
                type="button"
                className="tb-btn"
                disabled={!canUndo}
                onClick={() => dispatch({ type: UNDO_VECTOR })}
                title="실행 취소 (Ctrl/⌘ + Z)"
            >
                ⟲
            </button>
            <button
                type="button"
                className="tb-btn"
                disabled={!canRedo}
                onClick={() => dispatch({ type: REDO_VECTOR })}
                title="다시 실행 (Ctrl/⌘ + Shift + Z / Ctrl/⌘ + Y)"
            >
                ⟳
            </button>
        </article>
    );
}

export default VectorUndoRedoControl;
