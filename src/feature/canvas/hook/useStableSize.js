import { useEffect, useRef, useState } from 'react';

import { MIN_CSS, RETRY_FRAMES } from '../constant/setting';

/**
 * @function useStableSize
 * @description
 * - 부모 엘리먼트의 브라우저 화면상 크기(CSS px)를 측정해서 반환하는 커스텀 훅
 * - 초기 마운트 시 레이아웃이 아직 잡히지 않아 width/height가 0 또는 NaN이 나올 수 있다.
 * - 마지막으로 유효했던 크기를 유지하며, 레이아웃이 안정될 때까지 requestAnimationFrame으로 재측정합니다.
 * - 이후에는 ResizeObserver/IntersectionObserver/visibilitychange로 크기 변화를 추적함.
 *
 * 좌표계 주의:
 *   - CSS px기준입니다.
 *   - 캔버스 내부 버퍼(px)는 setTransform으로 관리합니다.
 *
 * @param {*} wrapRef  React ref (부모 컨테이너 DOM 요소)
 * @param {*} init  초기 크기 { w, h } (레이아웃 안정 전까지 임시로 사용할 기본값)
 *
 * @returns
 * - size: { w, h } 현재 보고 있는 CSS px 크기 (@enum MIN_CSS 미만이면 lastGood 값을 유지)
 * - lastGood :  useRef({ w, h }) 마지막으로 유효했던 크기를 기억 (읽기 전용처럼 사용)
 *
 * @see MIN_CSS
 * @see RETRY_FRAMES
 */
function useStableSize(wrapRef, init = { w: 640, h: 420 }) {
    // 마지막으로 유효했던 크기(측정 성공 시 업데이트, 실패 시 폴백으로 사용)
    const lastGood = useRef(init);
    // 현재 표시용 크기 상태 (렌더링에 사용)
    const [size, setSize] = useState(init);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;

        let raf = null; // 초기 rAF 루프 핸들
        let frames = 0; // rAF 시도 카운터

        /**
         * 현재 wrap 요소의 CSS 크기를 측정하고,
         * - 유효(MIN_CSS 이상)하면 size/lastGood 모두 갱신하고 true 반환
         * - 무효면(lastGood으로 복원) false 반환
         */
        const measure = () => {
            const r = el.getBoundingClientRect();
            const w = Math.round(r.width);
            const h = Math.round(r.height);

            if (w >= MIN_CSS && h >= MIN_CSS) {
                lastGood.current = { w, h };
                setSize({ w, h });
            }
            setSize({ ...lastGood.current });
        };

        /**
         * 초기 마운트 직후 레이아웃이 불안정할 수 있어
         * requestAnimationFrame으로 일정 프레임 동안 재측정.
         * (폰트 로딩/스크롤바/슬롯 레이아웃 등 지연 요소 보정)
         */
        const tick = () => {
            frames += 1;
            measure();
            if (frames < RETRY_FRAMES) raf = requestAnimationFrame(tick);
        };
        tick();

        // 이후엔 브라우저가 제공하는 관찰자들로 변화 추적
        const ro = new ResizeObserver(() => measure());
        ro.observe(el);

        // 가시성/뷰포트 진입 변화에 따른 크기 갱신(지연 마운트, 탭 전환 등)
        let io = null;
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(() => measure(), {
                threshold: [0, 0.01, 1], // 진입/이탈/완전노출 등 다양한 타이밍에서 콜백
            });
            io.observe(el);
        }

        // 탭 전환/숨김 → 다시 보일 때 레이아웃 바뀐 경우 갱신
        const onVis = () => measure();
        document.addEventListener('visibilitychange', onVis);

        // 정리
        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io && io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
        };
    }, [wrapRef]);

    return { size, lastGood };
}

export { useStableSize };
