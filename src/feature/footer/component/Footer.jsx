import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { clamp } from '@/shared/util/clamp';
import { selectView } from '@/feature/header/state/header.selector';
import styles from './Footer.module.css';

function Footer({ onCommand }) {
    const scale = useSelector((s) => selectView(s).scale);
    const percent = Math.round(scale * 100);

    // 바 전체 너비 (사용자 리사이즈 저장)
    const [barW, setBarW] = useState(() => {
        const saved = Number(localStorage.getItem('zoombar:w'));
        return Number.isFinite(saved) ? clamp(saved, 240, 640) : 360;
    });
    useEffect(() => {
        localStorage.setItem('zoombar:w', String(barW));
    }, [barW]);

    // 슬라이더 맵핑 (0.125~8을 16~1000으로 선형 매핑)
    const toSlider = useCallback(
        (sc) => Math.round((clamp(sc, 0.125, 8) * 1000) / 8),
        []
    );
    const fromSlider = useCallback((v) => clamp((v * 8) / 1000, 0.125, 8), []);

    const onMinus = useCallback(() => onCommand?.('out'), [onCommand]);
    const onPlus = useCallback(() => onCommand?.('in'), [onCommand]);
    const onFit = useCallback(() => onCommand?.('fit'), [onCommand]);

    const onRotateLeft = useCallback(
        () => onCommand?.('rotate-left'),
        [onCommand]
    );
    const onRotateRight = useCallback(
        () => onCommand?.('rotate-right'),
        [onCommand]
    );

    // 슬라이더 직접 이동
    const onSlider = useCallback(
        (e) => {
            onCommand?.({
                type: 'zoom-to',
                value: fromSlider(Number(e.target.value || 0)),
            });
        },
        [onCommand, fromSlider]
    );

    // ─────────────────────────────
    // ① 바 전체 드래그로 줌 변경 (트랙 드래그)
    // ─────────────────────────────
    const trackRef = useRef(null);
    const dragInfo = useRef({ dragging: false, left: 0, width: 1 });

    const setZoomFromClientX = useCallback(
        (clientX) => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect) return;
            const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
            // 선형 매핑: 0→0.125, 1→8
            const next = 0.125 + (8 - 0.125) * ratio;
            onCommand?.({ type: 'zoom-to', value: next });
        },
        [onCommand]
    );

    const onTrackMouseDown = useCallback(
        (e) => {
            if (e.button !== 0) return;
            dragInfo.current.dragging = true;
            setZoomFromClientX(e.clientX);
            window.addEventListener('mousemove', onTrackMouseMove);
            window.addEventListener('mouseup', onTrackMouseUp, { once: true });
        },
        [setZoomFromClientX]
    );

    const onTrackMouseMove = useCallback(
        (e) => {
            if (!dragInfo.current.dragging) return;
            setZoomFromClientX(e.clientX);
        },
        [setZoomFromClientX]
    );

    const onTrackMouseUp = useCallback(() => {
        dragInfo.current.dragging = false;
        window.removeEventListener('mousemove', onTrackMouseMove);
    }, [onTrackMouseMove]);

    // 더블클릭 = 화면에 맞춤
    const onTrackDoubleClick = useCallback(() => onFit(), [onFit]);

    // 휠로 줌 (Ctrl 없이도 동작하게, 원하면 Ctrl키 조건 추가)
    const onWheel = useCallback(
        (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 'out' : 'in';
            onCommand?.(delta);
        },
        [onCommand]
    );

    // ─────────────────────────────
    // ② 우측 그립으로 폭 리사이즈
    // ─────────────────────────────
    const gripRef = useRef(null);
    const resizeInfo = useRef({ resizing: false, startX: 0, startW: 0 });

    const onGripMouseDown = useCallback(
        (e) => {
            if (e.button !== 0) return;
            const startW = barW;
            resizeInfo.current = { resizing: true, startX: e.clientX, startW };
            window.addEventListener('mousemove', onGripMouseMove);
            window.addEventListener('mouseup', onGripMouseUp, { once: true });
        },
        [barW]
    );

    const onGripMouseMove = useCallback((e) => {
        const info = resizeInfo.current;
        if (!info.resizing) return;
        const next = clamp(info.startW + (e.clientX - info.startX), 240, 640);
        setBarW(next);
    }, []);

    const onGripMouseUp = useCallback(() => {
        resizeInfo.current.resizing = false;
        window.removeEventListener('mousemove', onGripMouseMove);
    }, [onGripMouseMove]);

    // 슬라이더 value
    const sliderValue = useMemo(() => toSlider(scale), [scale, toSlider]);

    return (
        <div className={styles.footer} style={{ width: barW }}>
            <button
                className={styles.btn}
                title="왼쪽으로 90° 회전"
                onClick={onRotateLeft}
            >
                asdasd
            </button>

            <div className={styles.sep} />

            <button className={styles.btn} title="축소" onClick={onMinus}>
                −
            </button>

            {/* 드래그 가능한 트랙(어디서든 드래그하면 줌 변경) */}
            <div
                className={styles.track}
                ref={trackRef}
                onMouseDown={onTrackMouseDown}
                onDoubleClick={onTrackDoubleClick}
                onWheel={onWheel}
                role="slider"
                aria-valuemin={12}
                aria-valuemax={800}
                aria-valuenow={percent}
                aria-label="Zoom"
                tabIndex={0}
            >
                {/* 실제 input range는 접근성/키보드 대비용으로 유지 */}
                <input
                    className={styles.slider}
                    type="range"
                    min={16}
                    max={1000}
                    step={1}
                    value={sliderValue}
                    onChange={onSlider}
                    aria-hidden
                    tabIndex={-1}
                />
                <div
                    className={styles.thumb}
                    style={{
                        left: `${((sliderValue - 16) / (1000 - 16)) * 100}%`,
                    }}
                />
            </div>

            <button className={styles.btn} title="확대" onClick={onPlus}>
                +
            </button>

            <div className={styles.percent} aria-live="polite">
                {percent}%
            </div>

            <button
                className={styles.btn}
                title="화면에 맞춤(초기화)"
                onClick={onFit}
            >
                asdasd
            </button>

            <div className={styles.sep} />

            <button
                className={styles.btn}
                title="오른쪽으로 90° 회전"
                onClick={onRotateRight}
            >
                asdasd
            </button>

            {/* 우측 리사이즈 그립 */}
            <div
                className={styles.grip}
                ref={gripRef}
                onMouseDown={onGripMouseDown}
                title="폭 조절"
                aria-label="Resize"
            />
        </div>
    );
}

export { Footer };
