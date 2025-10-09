// src/component/historybtn/VectorBtn.jsx
import { useDispatch, useSelector } from 'react-redux';
import { UNDO_VECTOR, REDO_VECTOR } from '../../redux/middleware/middleware';

function VectorUndoRedoControl() {
    const dispatch = useDispatch();

    // history.vector.past/future 길이로 가능 여부 계산
    const canUndo = useSelector(
        (s) => (s.history?.vector?.past?.length || 0) > 0
    );
    const canRedo = useSelector(
        (s) => (s.history?.vector?.future?.length || 0) > 0
    );

    return (
        <div className="toolbar-group" aria-label="Vector history">
            <button
                type="button"
                className="tb-btn"
                disabled={!canUndo}
                onClick={() => dispatch({ type: UNDO_VECTOR })}
                title="Undo (Ctrl/⌘+Z)"
            >
                ⟲ Vector
            </button>
            <button
                type="button"
                className="tb-btn"
                disabled={!canRedo}
                onClick={() => dispatch({ type: REDO_VECTOR })}
                title="Redo (Ctrl/⌘+Shift+Z / Ctrl/⌘+Y)"
            >
                ⟳ Vector
            </button>
        </div>
    );
}

export default VectorUndoRedoControl;
