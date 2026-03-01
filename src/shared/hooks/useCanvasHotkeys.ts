import { useEffect, type MutableRefObject } from 'react';
import type { AppDispatch } from '@app/store/store';

type SimpleAction = { type: string; payload?: unknown };

type HotkeysActions = {
  historyStart: () => SimpleAction;
  deleteFocused: () => SimpleAction;
  undo: () => SimpleAction;
  redo: () => SimpleAction;
};

export interface UseCanvasHotkeysParams {
  dispatch: AppDispatch;
  focusRef: MutableRefObject<number | null>;
  editingRef: MutableRefObject<boolean>;
  actions: HotkeysActions;
}

export function useCanvasHotkeys({ dispatch, focusRef, editingRef, actions }: UseCanvasHotkeysParams): void {
  const { historyStart, deleteFocused, undo, redo } = actions;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      const target = e.target as Element | null;
      const tag = target?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || (target != null && 'isContentEditable' in target && (target as HTMLElement).isContentEditable);

      if (!typing && !editingRef.current) {
        const isMac = navigator.platform.toLowerCase().includes('mac');
        const cmd = isMac ? e.metaKey : e.ctrlKey;

        const key = e.key.toLowerCase();
        if (cmd && key === 'z') {
          e.preventDefault();
          dispatch(e.shiftKey ? redo() : undo());
          return;
        }
        if (cmd && key === 'y') {
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
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, focusRef, editingRef, historyStart, deleteFocused, undo, redo]);
}
