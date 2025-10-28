import { useEffect } from 'react';
import { eventToCombo, isTypingTarget } from '../util/keymap';
import { KEYMAP } from '../constant/keymap';

/**
 * @param {{ run:(cmd:string)=>void, blockInInputs?: string[] }} props
 */
function useShortcuts({ run, blockInInputs = ['Mod+S', 'Mod+O', 'Mod+N'] }) {
    useEffect(() => {
        if (typeof run !== 'function') return;

        const onKeyDown = (e) => {
            if (isTypingTarget(e.target)) {
                const c = eventToCombo(e);
                if (blockInInputs.includes(c)) e.preventDefault();
                return;
            }
            const raw = eventToCombo(e);
            const combo = raw === 'Mod+Shift+=' ? 'Mod+Plus' : raw;
            const cmd = KEYMAP.FEATURE[combo];
            if (!cmd) return;
            e.preventDefault();
            run(cmd);
        };

        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () =>
            window.removeEventListener('keydown', onKeyDown, { capture: true });
    }, [run, blockInInputs]);
}

export { useShortcuts };
