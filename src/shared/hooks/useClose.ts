import { useEffect } from 'react';

/**
 * 모달이 열렸을 때 ESC 키로 onClose를 호출하는 훅
 * @param open - 모달이 열린 상태
 * @param onClose - 모달을 닫게 하는 이벤트 함수
 */
function useClose(open: boolean, onClose: () => void): void {
    useEffect(() => {
        // 모달이 열려있지 않으면 이벤트를 등록하지 않음
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', onKey);

        // 클린업 함수: 컴포넌트가 언마운트되거나 open/onClose가 변경될 때 이벤트 제거
        return () => {
            window.removeEventListener('keydown', onKey);
        };
    }, [open, onClose]);
}

export { useClose };