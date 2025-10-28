// src/feature/canvas/component/DynamicIslandZoomBar.jsx
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '@/shared/component/icon/Icon';
import { clamp } from '@/shared/util/clamp';
import { selectView } from '@/feature/header/state/header.selector';
import styles from './Fnb.module.css';

/**
 * @param {{
 *   onCommand: (cmd: string|{type:string, value?:any}) => void,
 *   autocloseMs?: number,
 *   position?: 'br'|'bl'|'bc'
 * }} props
 */
function Fnb({ onCommand, autocloseMs = 2400, position = 'br' }) {
    const scale = useSelector((s) => selectView(s).scale);
    const percent = Math.round(scale * 100);

    // ── 상태
    const [phase, setPhase] = useState('collapsed'); // collapsed | expanding | expanded | collapsing
    const expanded = phase === 'expanding' || phase === 'expanded';

    // ── 길이(확장 상태에서만 사용)
    const [barW, setBarW] = useState(() => {
        const saved = Number(localStorage.getItem('island:w'));
        return Number.isFinite(saved) ? clamp(saved, 300, 720) : 380;
    });
    useEffect(() => {
        localStorage.setItem('island:w', String(barW));
    }, [barW]);

    // ── 맵핑
    const toSlider = useCallback(
        (sc) => Math.round((clamp(sc, 0.125, 8) * 1000) / 8),
        []
    );
    const fromSlider = useCallback((v) => clamp((v * 8) / 1000, 0.125, 8), []);

    // ── 공통 액션
    const minus = useCallback(() => onCommand?.('out'), [onCommand]);
    const plus = useCallback(() => onCommand?.('in'), [onCommand]);
    const fit = useCallback(() => onCommand?.('fit'), [onCommand]);
    const rotL = useCallback(() => onCommand?.('rotate-left'), [onCommand]);
    const rotR = useCallback(() => onCommand?.('rotate-right'), [onCommand]);

    // ── 확장/축소 제어
    const timer = useRef(null);
    const open = useCallback(() => {
        if (phase === 'collapsed' || phase === 'collapsing')
            setPhase('expanding');
        // expanding → expanded 전이(짧은 딜레이 후)
        requestAnimationFrame(() => {
            setPhase('expanded');
            touch();
        });
    }, [phase]);

    const close = useCallback(() => {
        if (!expanded) return setPhase('collapsed');
        setPhase('collapsing');
        // CSS 애니메이션 길이와 맞춤
        setTimeout(() => setPhase('collapsed'), 160);
    }, [expanded]);

    const touch = useCallback(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(close, autocloseMs);
    }, [autocloseMs, close]);

    // ── 바깥 클릭 시 닫기
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

    // ── 휠 줌: 접힘 상태에서도 확장 유도
    const onWheel = useCallback(
        (e) => {
            e.preventDefault();
            open();
            onCommand?.(e.deltaY > 0 ? 'out' : 'in');
        },
        [onCommand, open]
    );

    // ── 슬라이더
    const sliderValue = useMemo(() => toSlider(scale), [scale, toSlider]);
    const onSlider = useCallback(
        (e) => {
            onCommand?.({
                type: 'zoom-to',
                value: fromSlider(Number(e.target.value || 0)),
            });
            touch();
        },
        [fromSlider, onCommand, touch]
    );

    // ── 트랙 드래그(확장 시)
    const trackRef = useRef(null);
    const dragging = useRef(false);
    const setZoomFromClientX = useCallback(
        (clientX) => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect) return;
            const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
            const next = 0.125 + (8 - 0.125) * ratio;
            onCommand?.({ type: 'zoom-to', value: next });
        },
        [onCommand]
    );

    const onTrackDown = useCallback(
        (e) => {
            if (!expanded) return open();
            if (e.button !== 0) return;
            dragging.current = true;
            setZoomFromClientX(e.clientX);
            window.addEventListener('mousemove', onTrackMove);
            window.addEventListener('mouseup', onTrackUp, { once: true });
        },
        [expanded, open, setZoomFromClientX]
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

    const onDouble = useCallback(() => {
        fit();
        touch();
    }, [fit, touch]);

    // ── 리사이즈 그립(확장 시)
    const rs = useRef({ resizing: false, startX: 0, startW: 0 });
    const onGripDown = useCallback(
        (e) => {
            if (!expanded) return;
            if (e.button !== 0) return;
            rs.current = { resizing: true, startX: e.clientX, startW: barW };
            window.addEventListener('mousemove', onGripMove);
            window.addEventListener('mouseup', onGripUp, { once: true });
        },
        [expanded, barW]
    );

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

    // ── 클래스/스타일
    const posClass =
        position === 'bl'
            ? styles.bl
            : position === 'bc'
              ? styles.bc
              : styles.br;
    const cls = `${styles.island} ${posClass} ${styles[phase]}`;

    return (
        <div
            ref={rootRef}
            className={cls}
            style={expanded ? { width: barW } : undefined}
            onMouseEnter={open}
            onWheel={onWheel}
        >
            {/* 좌측 아이콘(접힘 시 점/아이콘처럼 보이는 부분) */}
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

            {/* 트랙/슬라이더(확장 시 노출, 접힘 시 캡슐 중앙 점처럼 보임) */}
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

            {/* 확장 시에만 보이는 보조 액션(회전/그립) */}
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
