import { useEffect } from 'react';
import { eventToCombo, isTypingTarget } from '../util/keymap';

function useHeaderShortcuts({ dispatchCommand }) {
    useEffect(() => {
        function onKeyDown(e) {
            if (isTypingTarget(e.target)) {
                const comboInInput = eventToCombo(e);
                if (
                    comboInInput === 'Mod+S' ||
                    comboInInput === 'Mod+O' ||
                    comboInInput === 'Mod+N'
                ) {
                    e.preventDefault();
                }
                return;
            }

            const raw = eventToCombo(e);
            const combo = raw === 'Mod+Shift+=' ? 'Mod+Plus' : raw;

            if (combo === 'Mod+N') {
                e.preventDefault();
                return dispatchCommand('new');
            }
            if (combo === 'Mod+S') {
                e.preventDefault();
                return dispatchCommand('save');
            }
            if (combo === 'Mod+O') {
                e.preventDefault();
                return dispatchCommand('open');
            }

            if (combo === 'Mod+Z') {
                e.preventDefault();
                return dispatchCommand('undo');
            }
            if (combo === 'Mod+Y' || combo === 'Mod+Shift+Z') {
                e.preventDefault();
                return dispatchCommand('redo');
            }

            // ── 툴/도형 ──
            const featureKey =
                combo === 'V'
                    ? 'select'
                    : combo === 'T'
                      ? 'text'
                      : combo === 'P'
                        ? 'path'
                        : combo === 'R'
                          ? 'rect'
                          : combo === 'O'
                            ? 'ellipse'
                            : combo === 'L'
                              ? 'line'
                              : combo === 'G'
                                ? 'polygon'
                                : combo === 'S'
                                  ? 'star'
                                  : null;
            if (featureKey) {
                e.preventDefault();
                return dispatchCommand(featureKey);
            }

            if (combo === 'Mod+=' || combo === 'Mod+Plus') {
                e.preventDefault();
                return dispatchCommand('in');
            }
            if (combo === 'Mod+-') {
                e.preventDefault();
                return dispatchCommand('out');
            }
            if (combo === 'Mod+0') {
                e.preventDefault();
                return dispatchCommand('fit');
            }
        }

        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () =>
            window.removeEventListener('keydown', onKeyDown, { capture: true });
    }, [dispatchCommand]);
}
export { useHeaderShortcuts };
