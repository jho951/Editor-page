/**
 * 캔버스 단축키 훅
 * --------------------------------------------
 * 전역 키보드 이벤트를 등록하여 캔버스 편집기의 공통 단축키(Undo/Redo, 삭제)를 처리합니다.
 * - 입력 포커스가 폼 요소(입력/텍스트 편집)일 때는 간섭하지 않습니다.
 * - 현재 텍스트/경로 편집 등 "에디팅 모드"일 때도 간섭하지 않습니다.
 * - Mac/Windows 모두에서 동작하도록 Cmd/Ctrl 판별 로직을 포함합니다.
 *
 * 주의:
 * - 이 훅은 window 수준의 keydown 리스너를 등록합니다. 컴포넌트 unmount 시 반드시 해제합니다.
 * - 의존성 배열을 통해 최신 dispatch/actions를 유지하며, 메모리 누수나 오래된 클로저를 피합니다.
 */

import { useEffect } from 'react';

/**
 * @function useCanvasHotkeys
 * @description
 * 전역 키보드 이벤트로 Undo/Redo, Delete/Backspace 삭제를 처리하는 React 훅입니다.
 *
 * @param {Object} params                     - 파라미터 객체
 * @param {Function} params.dispatch          - redux dispatch 함수
 * @param {React.MutableRefObject<any>} params.focusRef   - 포커스된 대상(도형) 존재 여부를 담은 ref
 * @param {React.MutableRefObject<boolean>} params.editingRef - 에디팅 모드 여부 ref (true면 단축키 무시)
 * @param {Object} params.actions             - 액션 크리에이터 모음
 * @param {Function} params.actions.historyStart  - 삭제 같은 변경 전에 히스토리 스냅샷 시작
 * @param {Function} params.actions.deleteFocused - 포커스된 도형 삭제
 * @param {Function} params.actions.undo          - 실행 취소 액션
 * @param {Function} params.actions.redo          - 다시 실행 액션
 *
 * 단축키 매핑:
 * - Cmd/Ctrl + Z : Undo
 * - Shift + Cmd/Ctrl + Z : Redo (맥 표준)
 * - Cmd/Ctrl + Y : Redo (윈도우 표준)
 * - Delete / Backspace : 포커스된 도형 삭제 (입력 중일 때는 차단)
 */
function useCanvasHotkeys({ dispatch, focusRef, editingRef, actions }) {
    const { historyStart, deleteFocused, undo, redo } = actions;

    useEffect(() => {
        /**
         * @private
         * @param {KeyboardEvent} e
         * @description
         * 전역 keydown 핸들러. 입력 중/에디팅 중에는 동작하지 않도록 가드하고,
         * 그 외에는 Undo/Redo/삭제 단축키를 처리한다.
         */
        function onKeyDown(e) {
            // 현재 포커스가 입력 필드인지 판별 (타이핑 중이면 에디터 단축키를 막지 않음)
            const tag = e.target?.tagName;
            const typing =
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                e.target?.isContentEditable;

            // 텍스트/경로 편집 등 에디팅 모드가 아니고,
            // 타이핑 중이 아닐 때만 Undo/Redo 단축키를 가로챈다.
            if (!typing && !editingRef.current) {
                // Mac은 metaKey(Cmd), 그 외는 ctrlKey(Ctrl)를 명령키로 간주
                const isMac = navigator.platform.toLowerCase().includes('mac');
                const cmd = isMac ? e.metaKey : e.ctrlKey;

                // Cmd/Ctrl + Z : Undo (Shift가 같이 눌리면 Redo - 맥 표준)
                if (cmd && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) dispatch(redo());
                    else dispatch(undo());
                    return;
                }
                // Cmd/Ctrl + Y : Redo (윈도우 표준)
                if (cmd && e.key.toLowerCase() === 'y') {
                    e.preventDefault();
                    dispatch(redo());
                    return;
                }
            }

            // Delete/Backspace : 포커스된 도형 삭제
            // - 입력 중(typing)일 때는 브라우저/필드 기본 동작을 방해하지 않는다.
            if ((e.key === 'Backspace' || e.key === 'Delete') && !typing) {
                // 포커스된 대상이 없으면 무시
                if (focusRef.current == null) return;

                e.preventDefault(); // 브라우저 기본 뒤로가기/스크롤 등 방지
                dispatch(historyStart()); // 삭제 전 상태 스냅샷(Undo 복구용)
                dispatch(deleteFocused()); // 실제 삭제
            }
        }

        // 전역 리스너 등록
        window.addEventListener('keydown', onKeyDown);

        // 컴포넌트 언마운트 시 정리
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
