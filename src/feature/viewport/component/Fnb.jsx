/**
 * @file Fnb.jsx
 * @description 하단 플로팅 + 다이내믹-아일랜드형 줌 바 (Redux 직접 사용, Props 제거)
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Icon } from '@/shared/component/icon/Icon';
import { clamp } from '@/shared/util/clamp';

import { viewportActions } from '@/feature/viewport/state/viewport.slice';
import { selectViewport } from '@/feature/viewport/state/viewport.selector';

import styles from './Fnb.module.css';

function Fnb() {
    // Redux Hooks
    const { scale } = useSelector(selectViewport);
    const dispatch = useDispatch();
    const { zoomIn, zoomOut, zoomTo, rotateLeft, rotateRight, fitToScreen } =
        viewportActions;

    const autocloseMs = 2400;
    const percent = Math.round(scale * 100);

    const [phase, setPhase] = useState('collapsed');
    const expanded = phase === 'expanding' || phase === 'expanded';

    const [barW, setBarW] = useState(() => {
        const saved = Number(localStorage.getItem('island:w'));
        // NOTE: clamp 함수가 util 폴더에 있으므로 그대로 사용
        return Number.isFinite(saved) ? clamp(saved, 300, 720) : 380;
    });
    useEffect(() => {
        localStorage.setItem('island:w', String(barW));
    }, [barW]);

    // 줌 스케일 <-> 슬라이더 값 변환 로직
    const toSlider = useCallback(
        (sc) => Math.round((clamp(sc, 0.125, 8) * 1000) / 8),
        []
    );
    const fromSlider = useCallback((v) => clamp((v * 8) / 1000, 0.125, 8), []);

    const minus = useCallback(() => dispatch(zoomOut()), [dispatch, zoomOut]);
    const plus = useCallback(() => dispatch(zoomIn()), [dispatch, zoomIn]);
    const fit = useCallback(
        () => dispatch(fitToScreen()),
        [dispatch, fitToScreen]
    );
    const rotL = useCallback(
        () => dispatch(rotateLeft()),
        [dispatch, rotateLeft]
    );
    const rotR = useCallback(
        () => dispatch(rotateRight()),
        [dispatch, rotateRight]
    );
    // -----------------------------------------------------------

    // 자동 닫기 (Dynamic Island) 로직
    const timer = useRef(null);
    const open = useCallback(() => {
        if (phase === 'collapsed' || phase === 'collapsing')
            setPhase('expanding');
        requestAnimationFrame(() => {
            setPhase('expanded');
            touch();
        });
    }, [phase]);

    const close = useCallback(() => {
        if (!expanded) return setPhase('collapsed');
        setPhase('collapsing');
        setTimeout(() => setPhase('collapsed'), 160);
    }, [expanded]);

    const touch = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(close, autocloseMs);
    }, [autocloseMs, close]);

    // 외부 클릭 감지 및 닫기
    const rootRef = useRef(null);
    useEffect(() => {
        function onDocDown(e) {
            if (!expanded) return;
            if (rootRef.current?.contains(e.target)) return;
            close();
        }
        document.addEventListener('mousedown', onDocDown);
        return () => document.removeEventListener('mousedown', onDocDown);
    }, [expanded, close]);

    // 마우스 휠 이벤트 (줌 인/아웃)
    const onWheel = useCallback(
        (e) => {
            e.preventDefault();
            open();
            dispatch(e.deltaY > 0 ? zoomOut() : zoomIn());
        },
        [dispatch, zoomOut, zoomIn, open]
    );

    // 슬라이더 값 변경 이벤트 (줌 투 특정 스케일)
    const sliderValue = useMemo(() => toSlider(scale), [scale, toSlider]);
    const onSlider = useCallback(
        (e) => {
            const nextScale = fromSlider(Number(e.target.value || 0));
            // zoomTo 액션은 {payload}를 받으므로, slice 정의에 맞게 객체 형태로 전달합니다.
            dispatch(zoomTo({ scale: nextScale }));
            touch();
        },
        [fromSlider, dispatch, zoomTo, touch]
    );

    // 트랙 클릭/드래그 이벤트 (줌 투 특정 스케일)
    const trackRef = useRef(null);
    const dragging = useRef(false);

    const setZoomFromClientX = useCallback(
        (clientX) => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect) return;
            const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
            const next = 0.125 + (8 - 0.125) * ratio;
            dispatch(zoomTo({ scale: next })); // zoomTo 액션 사용
        },
        [dispatch, zoomTo]
    );

    const onTrackMove = useCallback(
        (e) => {
            if (!dragging.current) return;
            setZoomFromClientX(e.clientX);
            touch();
        },
        [setZoomFromClientX, touch]
    );

    const onTrackUp = useCallback(() => {
        dragging.current = false;
        window.removeEventListener('mousemove', onTrackMove);
    }, [onTrackMove]);

    const onTrackDown = useCallback(
        (e) => {
            if (!expanded) return open();
            if (e.button !== 0) return;
            dragging.current = true;
            setZoomFromClientX(e.clientX);
            window.addEventListener('mousemove', onTrackMove);
            window.addEventListener('mouseup', onTrackUp, { once: true });
        },
        [expanded, open, setZoomFromClientX, onTrackMove, onTrackUp]
    );

    const onDouble = useCallback(() => {
        fit();
        touch();
    }, [fit, touch]);

    // 바 폭 조절 (Grip) 로직
    const rs = useRef({ resizing: false, startX: 0, startW: 0 });
    const onGripMove = useCallback(
        (e) => {
            const info = rs.current;
            if (!info.resizing) return;
            setBarW(clamp(info.startW + (e.clientX - info.startX), 300, 720));
            touch();
        },
        [touch]
    );
    const onGripUp = useCallback(() => {
        rs.current.resizing = false;
        window.removeEventListener('mousemove', onGripMove);
    }, [onGripMove]);
    const onGripDown = useCallback(
        (e) => {
            if (!expanded) return;
            if (e.button !== 0) return;
            rs.current = { resizing: true, startX: e.clientX, startW: barW };
            window.addEventListener('mousemove', onGripMove);
            window.addEventListener('mouseup', onGripUp, { once: true });
        },
        [expanded, barW, onGripMove, onGripUp]
    );

    // 하단 오른쪽 ('br') 고정 클래스 사용
    const posClass = styles.br;
    const cls = `${styles.island} ${posClass} ${styles[phase]}`;

    // docked: false (플로팅 바) 렌더링만 남김
    return (
        <div
            ref={rootRef}
            className={cls}
            style={expanded ? { width: barW } : undefined}
            onMouseEnter={open}
            onWheel={onWheel}
        >
            <button
                className={styles.btn}
                title="축소"
                onClick={() => {
                    minus();
                    open();
                }}
            >
                −
            </button>
            <div
                ref={trackRef}
                className={styles.track}
                role="slider"
                aria-label="Zoom"
                aria-valuemin={12}
                aria-valuemax={800}
                aria-valuenow={percent}
                onMouseDown={onTrackDown}
                onDoubleClick={onDouble}
                onClick={open}
            >
                <input
                    className={styles.slider}
                    type="range"
                    min={16}
                    max={1000}
                    step={1}
                    value={sliderValue}
                    onChange={onSlider}
                    tabIndex={expanded ? 0 : -1}
                    aria-hidden={!expanded}
                />
                <div
                    className={styles.thumb}
                    style={{
                        left: `${((sliderValue - 16) / (1000 - 16)) * 100}%`,
                    }}
                />
            </div>
            <button
                className={styles.btn}
                title="확대"
                onClick={() => {
                    plus();
                    open();
                }}
            >
                +
            </button>
            <div className={styles.percent} onClick={open}>
                {percent}%
            </div>
            <button
                className={styles.btn}
                title="화면에 맞춤"
                onClick={() => {
                    fit();
                    open();
                }}
            >
                <Icon name="fit" size={14} />
            </button>

            {expanded && (
                <>
                    <div className={styles.sep} />
                    <button
                        className={styles.btn}
                        title="왼쪽 90°"
                        onClick={() => {
                            rotL();
                            touch();
                        }}
                    >
                        <Icon name="rotate" size={16} />
                    </button>
                    <button
                        className={styles.btn}
                        title="오른쪽 90°"
                        onClick={() => {
                            rotR();
                            touch();
                        }}
                    >
                        <Icon
                            name="rotate"
                            size={16}
                            style={{ transform: 'scaleX(-1)' }}
                        />
                    </button>
                    <div
                        className={styles.grip}
                        onMouseDown={onGripDown}
                        title="폭 조절"
                    />
                </>
            )}
        </div>
    );
}

export default memo(Fnb);
