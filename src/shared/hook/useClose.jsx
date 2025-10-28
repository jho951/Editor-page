import { useEffect } from 'react';

/**
 * 모달이 열렸을 때 ESC 키로 onClose를 호출하는 훅
 * @param {boolean} open  모달이 열린 상태
 * @param {() => void} onClose 모달을 닫게 하는 이벤트
 */
function useClose(open, onClose) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);
}

export { useClose };
