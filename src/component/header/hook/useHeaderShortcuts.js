import { useEffect } from 'react';
import { eventToCombo, isTypingTarget } from '../util/keymap';

import { setTool } from '../../../lib/redux/slice/toolSlice';
import {
    zoomIn,
    zoomOut,
    resetZoom,
} from '../../../lib/redux/slice/viewportSlice';
import {
    historyUndo,
    historyRedo,
} from '../../../lib/redux/middleware/historyDocMiddleware';

function useHeaderShortcuts({ dispatch, onFileAction }) {
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

            // 파일
            if (combo === 'Mod+N')
                return (e.preventDefault(), onFileAction('new'));
            if (combo === 'Mod+S')
                return (e.preventDefault(), onFileAction('save'));
            if (combo === 'Mod+O')
                return (e.preventDefault(), onFileAction('export'));

            // 히스토리
            if (combo === 'Mod+Z')
                return (e.preventDefault(), dispatch(historyUndo()));
            if (combo === 'Mod+Y' || combo === 'Mod+Shift+Z')
                return (e.preventDefault(), dispatch(historyRedo()));

            // 도구/도형
            const toolKey =
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
            if (toolKey)
                return (e.preventDefault(), dispatch(setTool(toolKey)));

            if (combo === 'Mod+=' || combo === 'Mod+Plus')
                return (e.preventDefault(), dispatch(zoomIn()));
            if (combo === 'Mod+-')
                return (e.preventDefault(), dispatch(zoomOut()));
            if (combo === 'Mod+0')
                return (e.preventDefault(), dispatch(resetZoom()));
        }

        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () =>
            window.removeEventListener('keydown', onKeyDown, { capture: true });
    }, [dispatch, onFileAction]);
}
export { useHeaderShortcuts };
