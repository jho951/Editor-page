import { useEffect } from 'react';

/**
 * 모달이 열렸을 때 스크롤을 잠그는 훅
 * - 모바일 바운스 방지용 touchmove 차단 포함
 * @param locked - 스크롤을 잠글지 여부
 */
function useScrollLock(locked: boolean): void {
    useEffect(() => {
        const body = document.body;
        const docEl = document.documentElement;

        if (!locked) return;

        // 1. 스크롤바 너비 계산 (Layout Shift 방지용)
        const scrollbarWidth = window.innerWidth - docEl.clientWidth;

        // 2. 현재 스타일 백업 (Clean-up 시 복원 위함)
        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        // 3. 스크롤 잠금 적용
        body.style.overflow = 'hidden';

        if (scrollbarWidth > 0) {
            const currentPaddingRight = parseInt(
                window.getComputedStyle(body).paddingRight || '0',
                10
            );
            body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        }

        // 4. 모바일 터치 스크롤 차단 (바운스 방지)
        const preventTouch = (e: TouchEvent) => {
            // 터치 시 스크롤이 발생하는 것을 방지
            if (e.cancelable) {
                e.preventDefault();
            }
        };

        document.addEventListener('touchmove', preventTouch, {
            passive: false,
        });

        // 5. Clean-up: 원래 스타일로 복구
        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
            document.removeEventListener('touchmove', preventTouch);
        };
    }, [locked]);
}

export { useScrollLock };