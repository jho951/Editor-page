import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addShape } from '../../../lib/redux/slice/shapeSlice';
import { setSelection } from '../../../lib/redux/slice/selectionSlice';
import { setZoom, setPan } from '../../../lib/redux/slice/viewportSlice';

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export default function EditorCanvas() {
    const dispatch = useDispatch();

    // 상태
    const width = useSelector((s) => s.doc?.width || 1280);
    const height = useSelector((s) => s.doc?.height || 720);
    const zoom = useSelector((s) => s.viewport?.zoom || 1);
    const pan = useSelector((s) => s.viewport?.pan || { x: 0, y: 0 });
    const tool = useSelector((s) => s.tools?.tool || 'select');
    const cursor =
        useSelector((s) => s.tools?.cursor) ||
        (tool === 'text' ? 'text' : 'crosshair');
    const shapes = useSelector((s) => s.shape?.list || s.shape?.items || []);
    // 캔버스
    const vectorRef = useRef(null);
    const overlayRef = useRef(null);

    // 인터랙션 상태
    const draftingRef = useRef(null); // { startX, startY, lastX, lastY }
    const panningRef = useRef(false);
    const spaceHeld = useRef(false);

    // 좌표 변환
    const worldToScreen = useCallback(
        (wx, wy) => {
            const x = (wx + pan.x) * zoom;
            const y = (wy + pan.y) * zoom;
            return [x, y];
        },
        [pan, zoom]
    );

    const screenToWorld = useCallback(
        (sx, sy) => {
            const x = sx / zoom - pan.x;
            const y = sy / zoom - pan.y;
            return [x, y];
        },
        [pan, zoom]
    );

    // DPR 세팅
    const setupCanvas = useCallback((cvs, cssW, cssH) => {
        const dpr =
            (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
        cvs.width = Math.round(cssW * dpr);
        cvs.height = Math.round(cssH * dpr);
        cvs.style.width = cssW + 'px';
        cvs.style.height = cssH + 'px';
        const ctx = cvs.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return ctx;
    }, []);

    // 사이즈 변경 시 캔버스 초기화
    useLayoutEffect(() => {
        const v = vectorRef.current,
            o = overlayRef.current;
        if (!v || !o) return;

        setupCanvas(v, width, height);
        setupCanvas(o, width, height);

        const octx = o.getContext('2d');
        octx.clearRect(0, 0, width, height);
    }, [width, height, setupCanvas]);

    // 유틸
    const rectFromDraft = (d) => {
        const x = Math.min(d.startX, d.lastX);
        const y = Math.min(d.startY, d.lastY);
        const w = Math.abs(d.lastX - d.startX);
        const h = Math.abs(d.lastY - d.startY);
        return { x, y, w, h };
    };

    const drawRegularPolygon = (
        ctx,
        cx,
        cy,
        r,
        sides,
        rotation = -Math.PI / 2
    ) => {
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const ang = rotation + (i * 2 * Math.PI) / sides;
            const x = cx + r * Math.cos(ang);
            const y = cy + r * Math.sin(ang);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    };

    const drawStar = (
        ctx,
        cx,
        cy,
        r,
        points = 5,
        innerRatio = 0.5,
        rotation = -Math.PI / 2
    ) => {
        const innerR = r * innerRatio;
        ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const useR = i % 2 === 0 ? r : innerR;
            const ang = rotation + (i * Math.PI) / points;
            const x = cx + useR * Math.cos(ang);
            const y = cy + useR * Math.sin(ang);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
    };

    // ───────── 오버레이 프리뷰 ─────────
    const drawOverlayPreview = useCallback(() => {
        const cvs = overlayRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        const d = draftingRef.current;
        if (!d) return;

        const [sx1, sy1] = worldToScreen(d.startX, d.startY);
        const [sx2, sy2] = worldToScreen(d.lastX, d.lastY);
        const x = Math.min(sx1, sx2);
        const y = Math.min(sy1, sy2);
        const w = Math.abs(sx2 - sx1);
        const h = Math.abs(sy2 - sy1);

        ctx.save();
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#0ea5e9';

        switch (tool) {
            case 'rect': {
                ctx.strokeRect(x + 0.5, y + 0.5, w, h);
                break;
            }
            case 'ellipse': {
                const cx = x + w / 2,
                    cy = y + h / 2;
                ctx.beginPath();
                ctx.ellipse(
                    cx,
                    cy,
                    Math.abs(w / 2),
                    Math.abs(h / 2),
                    0,
                    0,
                    Math.PI * 2
                );
                ctx.stroke();
                break;
            }
            case 'line': {
                ctx.beginPath();
                ctx.moveTo(sx1 + 0.5, sy1 + 0.5);
                ctx.lineTo(sx2 + 0.5, sy2 + 0.5);
                ctx.stroke();
                break;
            }
            case 'polygon': {
                const cx = x + w / 2,
                    cy = y + h / 2;
                const r = Math.max(2, Math.min(Math.abs(w), Math.abs(h)) / 2);
                const sides = 6;
                drawRegularPolygon(ctx, cx, cy, r, sides);
                ctx.stroke();
                break;
            }
            case 'star': {
                const cx = x + w / 2,
                    cy = y + h / 2;
                const r = Math.max(2, Math.min(Math.abs(w), Math.abs(h)) / 2);
                drawStar(ctx, cx, cy, r, 5, 0.5);
                ctx.stroke();
                break;
            }
            default:
                break;
        }
        ctx.restore();
    }, [worldToScreen, tool]);

    // ───────── 포인터 핸들러 ─────────
    const onPointerDown = useCallback(
        (e) => {
            const rect = overlayRef.current.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const [wx, wy] = screenToWorld(sx, sy);

            if (spaceHeld.current || e.button === 1) {
                panningRef.current = true;
                overlayRef.current.setPointerCapture(e.pointerId);
                return;
            }

            if (['rect', 'ellipse', 'line', 'polygon', 'star'].includes(tool)) {
                draftingRef.current = {
                    startX: wx,
                    startY: wy,
                    lastX: wx,
                    lastY: wy,
                };
                overlayRef.current.setPointerCapture(e.pointerId);
                drawOverlayPreview();
                return;
            }
            // TODO: select/text/path
        },
        [tool, screenToWorld, drawOverlayPreview]
    );

    const onPointerMove = useCallback(
        (e) => {
            const rect = overlayRef.current.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;

            if (panningRef.current) {
                const dx = e.movementX / zoom;
                const dy = e.movementY / zoom;
                dispatch(setPan({ x: pan.x + dx, y: pan.y + dy }));
                return;
            }

            if (draftingRef.current) {
                const [wx, wy] = screenToWorld(sx, sy);
                draftingRef.current.lastX = wx;
                draftingRef.current.lastY = wy;
                drawOverlayPreview();
            }
        },
        [dispatch, pan, zoom, screenToWorld, drawOverlayPreview]
    );

    const onPointerUp = useCallback(
        (e) => {
            if (panningRef.current) {
                panningRef.current = false;
                overlayRef.current.releasePointerCapture?.(e.pointerId);
                return;
            }
            if (!draftingRef.current) return;

            const d = draftingRef.current;
            draftingRef.current = null;
            overlayRef.current.releasePointerCapture?.(e.pointerId);

            const { x, y, w, h } = rectFromDraft(d);
            const clearOverlay = () => {
                const cvs = overlayRef.current;
                const ctx = cvs.getContext('2d');
                ctx.clearRect(0, 0, cvs.width, cvs.height);
            };

            if (tool === 'line') {
                if (d.startX === d.lastX && d.startY === d.lastY) {
                    clearOverlay();
                    return;
                }
            } else if (w <= 0 || h <= 0) {
                clearOverlay();
                return;
            }

            let payload = null;
            switch (tool) {
                case 'rect':
                    payload = {
                        type: 'rect',
                        x,
                        y,
                        width: w,
                        height: h,
                        stroke: '#333333',
                        fill: '#ffffff',
                        strokeWidth: 2,
                    };
                    break;
                case 'ellipse':
                    payload = {
                        type: 'ellipse',
                        x,
                        y,
                        width: w,
                        height: h,
                        stroke: '#333333',
                        fill: '#ffffff',
                        strokeWidth: 2,
                    };
                    break;
                case 'line':
                    payload = {
                        type: 'line',
                        x1: d.startX,
                        y1: d.startY,
                        x2: d.lastX,
                        y2: d.lastY,
                        stroke: '#333333',
                        strokeWidth: 2,
                    };
                    break;
                case 'polygon':
                    payload = {
                        type: 'polygon',
                        x,
                        y,
                        width: w,
                        height: h,
                        sides: 6,
                        stroke: '#333333',
                        fill: '#ffffff',
                        strokeWidth: 2,
                    };
                    break;
                case 'star':
                    payload = {
                        type: 'star',
                        x,
                        y,
                        width: w,
                        height: h,
                        points: 5,
                        innerRatio: 0.5,
                        stroke: '#333333',
                        fill: '#ffffff',
                        strokeWidth: 2,
                    };
                    break;
                default:
                    break;
            }

            if (payload) {
                dispatch(addShape(payload));
                dispatch(setSelection({ ids: ['LATEST'] }));
            }
            clearOverlay();
        },
        [dispatch, tool]
    );

    // 스페이스 팬
    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.code === 'Space') spaceHeld.current = true;
        };
        const onKeyUp = (e) => {
            if (e.code === 'Space') spaceHeld.current = false;
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
        };
    }, []);

    // 휠 줌(Ctrl/Meta)
    const onWheel = useCallback(
        (e) => {
            if (!e.ctrlKey && !e.metaKey) return;
            e.preventDefault();
            const delta = -Math.sign(e.deltaY) * 0.1;
            const next = clamp(zoom + delta, 0.1, 8);
            dispatch(setZoom(next));
        },
        [dispatch, zoom]
    );

    // ───────── 벡터 레이어 렌더 ─────────
    const drawVector = useCallback(() => {
        const cvs = vectorRef.current;
        if (!cvs) return;
        const ctx = cvs.getContext('2d');
        ctx.clearRect(0, 0, cvs.width, cvs.height);

        const ws = (x, y) => worldToScreen(x, y);

        const drawOne = (sh) => {
            const stroke = sh.stroke ?? '#333333';
            const fill = sh.fill ?? null;
            // 줌과 무관한 두께로 보이게 하려면 `/ zoom` 적용
            const lw = sh.strokeWidth ?? 2;

            ctx.save();
            ctx.lineWidth = lw;
            ctx.strokeStyle = stroke;
            if (fill) ctx.fillStyle = fill;

            switch (sh.type) {
                case 'rect': {
                    const [sx, sy] = ws(sh.x, sh.y);
                    const [ex, ey] = ws(sh.x + sh.width, sh.y + sh.height);
                    const w = ex - sx,
                        h = ey - sy;
                    if (fill) ctx.fillRect(sx, sy, w, h);
                    ctx.strokeRect(sx + 0.5, sy + 0.5, w, h);
                    break;
                }
                case 'ellipse': {
                    const [sx, sy] = ws(sh.x, sh.y);
                    const [ex, ey] = ws(sh.x + sh.width, sh.y + sh.height);
                    const cx = (sx + ex) / 2,
                        cy = (sy + ey) / 2;
                    const rx = Math.abs(ex - sx) / 2,
                        ry = Math.abs(ey - sy) / 2;
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                    if (fill) ctx.fill();
                    ctx.stroke();
                    break;
                }
                case 'line': {
                    const [x1, y1] = ws(sh.x1, sh.y1);
                    const [x2, y2] = ws(sh.x2, sh.y2);
                    ctx.beginPath();
                    ctx.moveTo(x1 + 0.5, y1 + 0.5);
                    ctx.lineTo(x2 + 0.5, y2 + 0.5);
                    ctx.stroke();
                    break;
                }
                case 'polygon': {
                    const [sx, sy] = ws(sh.x, sh.y);
                    const [ex, ey] = ws(sh.x + sh.width, sh.y + sh.height);
                    const cx = (sx + ex) / 2,
                        cy = (sy + ey) / 2;
                    const r = Math.max(
                        2,
                        Math.min(Math.abs(ex - sx), Math.abs(ey - sy)) / 2
                    );
                    const sides = Math.max(3, sh.sides ?? 6);
                    ctx.beginPath();
                    for (let i = 0; i < sides; i++) {
                        const ang = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
                        const px = cx + r * Math.cos(ang);
                        const py = cy + r * Math.sin(ang);
                        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    if (fill) ctx.fill();
                    ctx.stroke();
                    break;
                }
                case 'star': {
                    const [sx, sy] = ws(sh.x, sh.y);
                    const [ex, ey] = ws(sh.x + sh.width, sh.y + sh.height);
                    const cx = (sx + ex) / 2,
                        cy = (sy + ey) / 2;
                    const r = Math.max(
                        2,
                        Math.min(Math.abs(ex - sx), Math.abs(ey - sy)) / 2
                    );
                    const points = Math.max(3, sh.points ?? 5);
                    const innerRatio = Math.min(
                        0.95,
                        Math.max(0.05, sh.innerRatio ?? 0.5)
                    );
                    const innerR = r * innerRatio;

                    ctx.beginPath();
                    for (let i = 0; i < points * 2; i++) {
                        const useR = i % 2 === 0 ? r : innerR;
                        const ang = -Math.PI / 2 + (i * Math.PI) / points;
                        const px = cx + useR * Math.cos(ang);
                        const py = cy + useR * Math.sin(ang);
                        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    if (fill) ctx.fill();
                    ctx.stroke();
                    break;
                }
                default:
                    break;
            }
            ctx.restore();
        };

        for (const sh of shapes) drawOne(sh);
    }, [shapes, worldToScreen]);

    // 도형/뷰포트/사이즈 변경 시 벡터 리렌더
    useLayoutEffect(() => {
        drawVector();
    }, [drawVector, shapes, zoom, pan, width, height]);

    return (
        <div
            style={{
                position: 'relative',
                width,
                height,
                margin: '0 auto',
                background: '#f3f4f6',
                userSelect: 'none',
                touchAction: 'none',
            }}
            onWheel={onWheel}
        >
            <canvas
                ref={vectorRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 102,
                    pointerEvents: 'none',
                }}
            />
            <canvas
                ref={overlayRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 103,
                    cursor: panningRef.current ? 'grab' : cursor,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            />
        </div>
    );
}
