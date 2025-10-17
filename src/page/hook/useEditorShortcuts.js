import { useEffect } from 'react';
import { useDispatch, useStore } from 'react-redux';
import {
    KEYMAP,
    HANDLE_KEYMAP,
    eventToCombo,
    isTypingTarget,
} from '../../component/header/util/keymap';
import {
    dispatchCommand,
    dispatchHandleCommand,
} from '../../component/header/util/command';

function useEditorShortcuts() {
    const dispatch = useDispatch();
    const store = useStore();
    const getState = store.getState;

    useEffect(() => {
        function onKeyDown(e) {
            if (isTypingTarget(e.target)) {
                const combo = eventToCombo(e);
                if (combo === 'Mod+S' || combo === 'Mod+O' || combo === 'Mod+N')
                    e.preventDefault();
                return;
            }

            const raw = eventToCombo(e);
            const combo = raw === 'Mod+Shift+=' ? 'Mod+Plus' : raw;

            if (HANDLE_KEYMAP[combo]) {
                e.preventDefault();
                return dispatchHandleCommand(dispatch, HANDLE_KEYMAP[combo]);
            }

            const cmd = KEYMAP[combo];
            if (cmd) {
                e.preventDefault();
                return dispatchCommand(dispatch, getState, cmd);
            }
        }

        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () =>
            window.removeEventListener('keydown', onKeyDown, { capture: true });
    }, [dispatch, getState]);
}

export { useEditorShortcuts };
