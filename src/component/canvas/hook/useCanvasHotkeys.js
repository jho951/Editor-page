import { useEffect } from 'react';

function useCanvasHotkeys({ dispatch, focusRef, editingRef, actions }) {
    const { historyStart, deleteFocused, undo, redo } = actions;

    useEffect(() => {
        function onKeyDown(e) {
            const tag = e.target?.tagName;
            const typing =
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                e.target?.isContentEditable;

            if (!typing && !editingRef.current) {
                const isMac = navigator.platform.toLowerCase().includes('mac');
                const cmd = isMac ? e.metaKey : e.ctrlKey;
                if (cmd && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) dispatch(redo());
                    else dispatch(undo());
                    return;
                }
                if (cmd && e.key.toLowerCase() === 'y') {
                    e.preventDefault();
                    dispatch(redo());
                    return;
                }
            }

            if ((e.key === 'Backspace' || e.key === 'Delete') && !typing) {
                if (focusRef.current == null) return;
                e.preventDefault();
                dispatch(historyStart());
                dispatch(deleteFocused());
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        dispatch,
        focusRef,
        editingRef,
        actions,
        redo,
        undo,
        historyStart,
        deleteFocused,
    ]);
}

export { useCanvasHotkeys };
