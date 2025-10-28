import { useEffect } from 'react';

/**
 * 모달이 열렸을 때 스크롤을 잠금.
 * - 모바일 바운스 방지용 touchmove 차단
 * @param {boolean} locked
 */
function useScrollLock(locked) {
    useEffect(() => {
        const body = document.body;
        const docEl = document.documentElement;

        if (!locked) return;

        const scrollbarWidth = window.innerWidth - docEl.clientWidth;

        const prevOverflow = body.style.overflow;
        const prevPaddingRight = body.style.paddingRight;

        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            const currentPaddingRight = parseInt(
                window.getComputedStyle(body).paddingRight || '0',
                10
            );
            body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
        }

        const preventTouch = (e) => {
            e.preventDefault();
        };
        document.addEventListener('touchmove', preventTouch, {
            passive: false,
        });

        return () => {
            body.style.overflow = prevOverflow;
            body.style.paddingRight = prevPaddingRight;
            document.removeEventListener('touchmove', preventTouch);
        };
    }, [locked]);
}

export { useScrollLock };
