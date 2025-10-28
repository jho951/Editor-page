/**
 * 헤더 전역 단축키 훅
 * --------------------------------------------
 * - 파일/도구/줌/히스토리 등 "헤더 영역"에서 처리하는 명령을 전역 키다운으로 바인딩합니다.
 * - 입력 중일 때(Mod+S/Mod+O/Mod+N 등만 예외적으로 preventDefault) 외에는 폼 타이핑을 방해하지 않습니다.
 */

import { useEffect } from 'react';
import { eventToCombo, isTypingTarget } from '../util/keymap';
import { KEYMAP } from '../constant/keymap';

/**
 * @param {{ dispatchCommand: DispatchCommand }} props
 */
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

            // 콤보 표준화(+키 보정)
            const raw = eventToCombo(e);
            const combo = raw === 'Mod+Shift+=' ? 'Mod+Plus' : raw;

            // FEATURE 맵에서 곧바로 처리 가능하면 공통 처리
            const feature = KEYMAP.FEATURE[combo];
            if (feature) {
                e.preventDefault();
                return dispatchCommand(feature);
            }
        }

        window.addEventListener('keydown', onKeyDown, { capture: true });
        return () =>
            window.removeEventListener('keydown', onKeyDown, { capture: true });
    }, [dispatchCommand]);
}

export { useHeaderShortcuts };
