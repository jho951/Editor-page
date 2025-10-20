import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    selectShapes,
    selectFocusId,
    setFocus,
    clearFocus,
    addShape,
    moveShape,
    resizeShape,
    deleteFocused,
    updateText,
    historyStart,
    redo,
    undo,
} from '../../lib/redux/slice/canvasSlice';
import {
    selectTool,
    selectPoly,
    selectStarPts,
    selectStarRatio,
    setTool,
    selectView,
    setView,
    selectCanvasBg,
} from '../../lib/redux/slice/uiSlice';

/* =========================================================
   Constants / Utilities
========================================================= */
const MIN_CSS = 16;
const RETRY_FRAMES = 30;
const DPR = () =>
    (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

function setCanvasSize(
    canvas,
    cssW,
    cssH,
    { dpr = DPR(), alpha = true, willRead = false } = {}
) {
    const prevW = Number(canvas?.dataset?.cssw) || 0;
    const prevH = Number(canvas?.dataset?.cssh) || 0;
    let w = cssW,
        h = cssH;
    if (
        !Number.isFinite(w) ||
        !Number.isFinite(h) ||
        w < MIN_CSS ||
        h < MIN_CSS
    ) {
        if (prevW >= MIN_CSS && prevH >= MIN_CSS) {
            w = prevW;
            h = prevH;
        } else {
            w = Math.max(cssW || 0, MIN_CSS);
            h = Math.max(cssH || 0, MIN_CSS);
        }
    }
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.dataset.cssw = String(w);
    canvas.dataset.cssh = String(h);
    const ctx = canvas.getContext('2d', {
        alpha,
        willReadFrequently: willRead,
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h, dpr };
}

/* id <-> RGB for hitmap picking */
const idToRGB = (id) => ({
    r: (id >> 16) & 255,
    g: (id >> 8) & 255,
    b: id & 255,
});
const rgbToId = (r, g, b) => ((r << 16) | (g << 8) | b) >>> 0;

function pickIdAt(hitCanvas, clientX, clientY) {
    if (!hitCanvas) return null;
    const rect = hitCanvas.getBoundingClientRect();
    const x = Math.floor(
        (clientX - rect.left) * (hitCanvas.width / rect.width)
    );
    const y = Math.floor(
        (clientY - rect.top) * (hitCanvas.height / rect.height)
    );
    const d = hitCanvas.getContext('2d').getImageData(x, y, 1, 1).data;
    if (d[3] === 0) return null;
    return rgbToId(d[0], d[1], d[2]);
}

const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/* --------- path helpers for ellipse / polygon / star / line --------- */
function drawEllipsePath(ctx, x, y, w, h) {
    const cx = x + w / 2,
        cy = y + h / 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
}
function drawPolygonPath(ctx, x, y, w, h, sides = 5) {
    const cx = x + w / 2,
        cy = y + h / 2;
    const rx = Math.abs(w / 2),
        ry = Math.abs(h / 2);
    const r = Math.min(rx, ry);
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
}
function drawStarPath(ctx, x, y, w, h, points = 5, innerRatio = 0.5) {
    const cx = x + w / 2,
        cy = y + h / 2;
    const rx = Math.abs(w / 2),
        ry = Math.abs(h / 2);
    const rOuter = Math.min(rx, ry);
    const rInner = rOuter * innerRatio;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = -Math.PI / 2 + (i * Math.PI) / points;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
}
function drawLinePath(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y + h);
}

function computeBBox(points) {
    let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;
    for (const p of points) {
        if (!p) continue;
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
    }
    if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
    return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}
function normalizePath(points, bbox) {
    const { minX, minY, w, h } = bbox;
    const safeW = w || 1,
        safeH = h || 1; // zero div 보호
    return points.map((p) => ({
        u: (p.x - minX) / safeW,
        v: (p.y - minY) / safeH,
    }));
}
function denormPath(pathUV, x, y, w, h) {
    return pathUV.map((q) => ({ x: x + q.u * w, y: y + q.v * h }));
}
function strokePath(ctx, pts) {
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
}

function wrapLines(ctx, text, maxW) {
    const words = (text || '').split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width <= maxW || line === '') line = test;
        else {
            lines.push(line);
            line = w;
        }
    }
    if (line) lines.push(line);
    return lines;
}

/* =========================================================
   Component
========================================================= */
function CanvasStageRobustRedux() {
    const [editingId, setEditingId] = useState(null);

    const dispatch = useDispatch();
    const shapes = useSelector(selectShapes);
    const focusId = useSelector(selectFocusId);

    const tool = useSelector(selectTool);
    const polygonSides = useSelector(selectPoly);
    const starPoints = useSelector(selectStarPts);
    const starInnerRatio = useSelector(selectStarRatio);
    const canvasBg = useSelector(selectCanvasBg);

    // DOM
    const wrapRef = useRef(null);
    const vecRef = useRef(null);
    const hitRef = useRef(null);
    const ovRef = useRef(null);
    const textRef = useRef(null);
    const editingRef = useRef(false);
    const editingIdRef = useRef(null);
    const viewRef = useRef({ scale: 1, tx: 0, ty: 0 });

    const view = useSelector(selectView);

    const MIN_SCALE = 0.2;
    const MAX_SCALE = 8;

    // local (레이아웃용)
    const [size, setSize] = useState({ w: 640, h: 420 });
    const lastGood = useRef({ w: 640, h: 420 });

    // 최신 Redux state 미러(refs)
    const shapesRef = useRef(shapes);
    useEffect(() => {
        shapesRef.current = shapes;
    }, [shapes]);

    const focusRef = useRef(focusId);
    useEffect(() => {
        focusRef.current = focusId;
    }, [focusId]);

    useEffect(() => {
        if (!view) return;
        viewRef.current = { ...viewRef.current, ...view };
        requestAnimationFrame(renderAllOnce);
    }, [view]);

    const toolRef = useRef(tool);
    useEffect(() => {
        toolRef.current = tool;
    }, [tool, polygonSides, starPoints, starInnerRatio]);

    const dragRef = useRef(null); // { type:'maybeClear'|'draw'|'move'|'resize', start:{x,y}, id, handle, origBBox, last:{x,y}?, tool? }

    /* ---------------- Stable size measurement ---------------- */
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        let raf = null,
            frames = 0;
        const measure = () => {
            const r = el.getBoundingClientRect();
            const w = Math.round(r.width),
                h = Math.round(r.height);
            if (w >= MIN_CSS && h >= MIN_CSS) {
                lastGood.current = { w, h };
                setSize({ w, h });
                return true;
            }
            setSize({ ...lastGood.current });
            return false;
        };
        const tick = () => {
            frames += 1;
            measure();
            if (frames < RETRY_FRAMES) raf = requestAnimationFrame(tick);
        };
        tick();

        const ro = new ResizeObserver(() => measure());
        ro.observe(el);
        let io = null;
        if ('IntersectionObserver' in window) {
            io = new IntersectionObserver(() => measure(), {
                threshold: [0, 0.01, 1],
            });
            io.observe(el);
        }
        const onVis = () => measure();
        document.addEventListener('visibilitychange', onVis);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io && io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
        };
    }, []);

    useEffect(() => {
        editingIdRef.current = editingId;
    }, [editingId]);

    useEffect(() => {
        if (editingId != null && focusId !== editingId) endTextEdit(true);
    }, [focusId]);

    /* ---------------- Canvas pixels on size change ---------------- */
    useEffect(() => {
        const { w, h } = size;
        if (!vecRef.current || !hitRef.current || !ovRef.current) return;
        setCanvasSize(vecRef.current, w, h, { dpr: DPR(), alpha: true });
        setCanvasSize(hitRef.current, w, h, {
            dpr: DPR(),
            alpha: false,
            willRead: true,
        });
        setCanvasSize(ovRef.current, w, h, { dpr: DPR(), alpha: true });
        requestAnimationFrame(() => {
            renderAllOnce();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size.w, size.h]);

    /* ---------------- Renderers ---------------- */
    function renderShapePath(ctx, s) {
        const { x, y, w, h } = s;
        switch (s.type) {
            case 'rect':
                /* rect는 아래에서 fillRect/strokeRect 처리 */ break;
            case 'ellipse':
                drawEllipsePath(ctx, x, y, w, h);
                break;
            case 'polygon':
                drawPolygonPath(ctx, x, y, w, h, s.sides ?? polygonSides);
                break;
            case 'star':
                drawStarPath(
                    ctx,
                    x,
                    y,
                    w,
                    h,
                    s.points ?? starPoints,
                    s.innerRatio ?? starInnerRatio
                );
                break;
            case 'line':
                drawLinePath(ctx, x, y, w, h);
                break;
            default:
                break;
        }
    }
    function screenToWorld(xs, ys) {
        const { scale, tx, ty } = viewRef.current;
        return { x: (xs - tx) / scale, y: (ys - ty) / scale };
    }
    function worldToScreen(xw, yw) {
        const { scale, tx, ty } = viewRef.current;
        return { x: xw * scale + tx, y: yw * scale + ty };
    }

    function renderVector(ctx, shapesNow) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        const { scale, tx, ty } = viewRef.current;
        ctx.translate(tx, ty);
        ctx.scale(scale, scale);

        for (const s of shapesNow) {
            ctx.save();
            // 줌 배율과 무관하게 시각적 두께를 일정하게: 화면 기준 두께 유지
            ctx.lineWidth = (s.strokeWidth || 2) / scale;
            ctx.strokeStyle = s.stroke || '#333';
            ctx.fillStyle = s.fill ?? (s.type === 'line' ? undefined : '#fff');
            if (s.type === 'rect') {
                if (s.fill) ctx.fillRect(s.x, s.y, s.w, s.h);
                ctx.strokeRect(s.x, s.y, s.w, s.h);
            } else if (s.type === 'line') {
                drawLinePath(ctx, s.x, s.y, s.w, s.h);
                ctx.stroke();
            } else if (s.type === 'path') {
                const pts = denormPath(s.path, s.x, s.y, s.w, s.h);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                strokePath(ctx, pts);
            } else if (s.type === 'text') {
                if (editingIdRef.current === s.id) {
                    ctx.restore();
                    continue;
                }
                const font = s.font || '16px sans-serif';
                const color = s.color || '#111';
                const align = s.align || 'left';
                const lh = s.lineHeight || 1.3;
                ctx.font = font;
                ctx.textBaseline = 'top';
                ctx.fillStyle = color;
                // 라인랩핑
                const lines = wrapLines(ctx, s.text || '', Math.max(0, s.w));
                const lhPx = parseInt(font, 10) * lh;
                let x = s.x;
                if (align === 'center') x = s.x + s.w / 2;
                else if (align === 'right') x = s.x + s.w;
                ctx.textAlign = align;
                for (let i = 0; i < lines.length; i++) {
                    const yy = s.y + i * lhPx;
                    if (yy > s.y + s.h) break; // 박스 밖은 잘라냄
                    ctx.fillText(lines[i], x, yy, s.w);
                }
            } else {
                renderShapePath(ctx, s);
                if (s.fill) ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    function renderHitmap(ctx, shapesNow) {
        ctx.save();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.imageSmoothingEnabled = false;
        const { scale, tx, ty } = viewRef.current;
        ctx.translate(tx, ty);
        ctx.scale(scale, scale);

        for (const s of shapesNow) {
            const { r, g, b } = idToRGB(s.pickId);
            const col = `rgb(${r},${g},${b})`;
            ctx.fillStyle = col;
            ctx.strokeStyle = col;

            if (s.type === 'rect') {
                ctx.fillRect(s.x, s.y, s.w, s.h);
                ctx.lineWidth = Math.max(
                    (s.strokeWidth || 2) / scale,
                    8 / scale
                );
                ctx.strokeRect(s.x, s.y, s.w, s.h);
            } else if (s.type === 'line') {
                drawLinePath(ctx, s.x, s.y, s.w, s.h);
                ctx.lineWidth = Math.max(s.strokeWidth || 2, 12);
                ctx.stroke();
            } else if (s.type === 'path') {
                const pts = denormPath(s.path, s.x, s.y, s.w, s.h);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.lineWidth = Math.max(s.strokeWidth || 2, 16);
                strokePath(ctx, pts);
            } else if (s.type === 'text') {
                ctx.fillRect(s.x, s.y, s.w, s.h);
                ctx.lineWidth = 6;
                ctx.strokeRect(s.x, s.y, s.w, s.h);
            } else {
                renderShapePath(ctx, s);
                ctx.fill();
                ctx.lineWidth = Math.max(s.strokeWidth || 2, 8);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    function renderOverlay(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        const fid = focusRef.current;
        if (!fid) return;
        const f = shapesRef.current.find((s) => s.id === fid);
        if (!f) return;

        ctx.save();
        const { scale, tx, ty } = viewRef.current;
        ctx.translate(tx, ty);
        ctx.scale(scale, scale);
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = 'rgb(76,139,245)';
        ctx.lineWidth = 1;
        ctx.strokeRect(f.x, f.y, f.w, f.h);

        ctx.setLineDash([]);
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'rgb(76,139,245)';
        ctx.lineWidth = 1;
        const s = 8;
        const midX = f.x + f.w / 2,
            midY = f.y + f.h / 2;
        const boxes = [
            { x: f.x - s / 2, y: f.y - s / 2 },
            { x: midX - s / 2, y: f.y - s / 2 },
            { x: f.x + f.w - s / 2, y: f.y - s / 2 },
            { x: f.x - s / 2, y: midY - s / 2 },
            { x: f.x + f.w - s / 2, y: midY - s / 2 },
            { x: f.x - s / 2, y: f.y + f.h - s / 2 },
            { x: midX - s / 2, y: f.y + f.h - s / 2 },
            { x: f.x + f.w - s / 2, y: f.y + f.h - s / 2 },
        ];
        for (const r of boxes) {
            ctx.fillRect(r.x, r.y, s, s);
            ctx.strokeRect(r.x, r.y, s, s);
        }
        ctx.restore();
    }

    /* ---------------- Re-render when state changes ---------------- */
    useEffect(() => {
        renderAllOnce();
    }, [shapes, focusId]);

    /* ---------------- Keyboard delete ---------------- */
    useEffect(() => {
        function onKeyDown(e) {
            const t = e.target;
            const tag = t && t.tagName;
            if (
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                tag === 'SELECT' ||
                (t && t.isContentEditable)
            )
                return;
            if (e.key === 'Backspace' || e.key === 'Delete') {
                if (focusRef.current == null) return;
                e.preventDefault();
                dispatch(historyStart());
                dispatch(deleteFocused());
                requestAnimationFrame(() => {
                    renderAllOnce();
                });
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [dispatch]);

    /* ---------------- Overlay interactions (register ONCE) ---------------- */
    useEffect(() => {
        const ov = ovRef.current;
        if (!ov) return;

        function toCanvasPt(e) {
            const rect = ov.getBoundingClientRect();
            const x =
                ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
            const y =
                ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();
            return screenToWorld(x, y);
        }
        // function hitHandle(pt, bbox, s = 8) {
        //     const midX = bbox.x + bbox.w / 2,
        //         midY = bbox.y + bbox.h / 2;
        //     const boxes = {
        //         nw: { x: bbox.x - s / 2, y: bbox.y - s / 2, w: s, h: s },
        //         n: { x: midX - s / 2, y: bbox.y - s / 2, w: s, h: s },
        //         ne: {
        //             x: bbox.x + bbox.w - s / 2,
        //             y: bbox.y - s / 2,
        //             w: s,
        //             h: s,
        //         },
        //         w: { x: bbox.x - s / 2, y: midY - s / 2, w: s, h: s },
        //         e: { x: bbox.x + bbox.w - s / 2, y: midY - s / 2, w: s, h: s },
        //         sw: {
        //             x: bbox.x - s / 2,
        //             y: bbox.y + bbox.h - s / 2,
        //             w: s,
        //             h: s,
        //         },
        //         s: { x: midX - s / 2, y: bbox.y + bbox.h - s / 2, w: s, h: s },
        //         se: {
        //             x: bbox.x + bbox.w - s / 2,
        //             y: bbox.y + bbox.h - s / 2,
        //             w: s,
        //             h: s,
        //         },
        //     };
        //     for (const k of Object.keys(boxes)) {
        //         const r = boxes[k];
        //         if (
        //             pt.x >= r.x &&
        //             pt.x <= r.x + r.w &&
        //             pt.y >= r.y &&
        //             pt.y <= r.y + r.h
        //         )
        //             return k;
        //     }
        //     return null;
        // }
        // 기존 hitHandle 삭제 후 교체
        function hitHandle(pt, bbox, s = 8) {
            const { x, y, w, h } = bbox;

            // 코너 정사각형
            const corners = {
                nw: { x: x - s / 2, y: y - s / 2, w: s, h: s },
                ne: { x: x + w - s / 2, y: y - s / 2, w: s, h: s },
                sw: { x: x - s / 2, y: y + h - s / 2, w: s, h: s },
                se: { x: x + w - s / 2, y: y + h - s / 2, w: s, h: s },
            };

            // 엣지 스트립(코너 영역을 제외하여 겹침 방지)
            // 매우 얇은 bbox에서도 최소 두께 보장
            const edgeH = Math.max(h - s, Math.min(h, s)); // n/s 세로 두께
            const edgeW = Math.max(w - s, Math.min(w, s)); // e/w 가로 두께
            const edges = {
                n: { x: x + s / 2, y: y - s / 2, w: Math.max(0, w - s), h: s },
                s: {
                    x: x + s / 2,
                    y: y + h - s / 2,
                    w: Math.max(0, w - s),
                    h: s,
                },
                w: { x: x - s / 2, y: y + s / 2, w: s, h: Math.max(0, h - s) },
                e: {
                    x: x + w - s / 2,
                    y: y + s / 2,
                    w: s,
                    h: Math.max(0, h - s),
                },
            };

            // 점이 사각형 안에 있는지
            const hit = (r) =>
                pt.x >= r.x &&
                pt.x <= r.x + r.w &&
                pt.y >= r.y &&
                pt.y <= r.y + r.h;

            // 1) 엣지 먼저 검사 → 한 축만 리사이즈
            for (const k of ['n', 's', 'e', 'w']) {
                const r = edges[k];
                if (r.w > 0 && r.h > 0 && hit(r)) return k;
            }
            // 2) 코너 검사 → 대각 리사이즈
            for (const k of ['nw', 'ne', 'sw', 'se']) {
                const r = corners[k];
                if (hit(r)) return k;
            }

            return null;
        }

        function drawPreview(ctx, start, p, t) {
            const x = Math.min(start.x, p.x);
            const y = Math.min(start.y, p.y);
            const w = Math.abs(p.x - start.x);
            const h = Math.abs(p.y - start.y);

            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = 'rgb(76,139,245)';
            ctx.lineWidth = 1;

            if (t === 'rect') {
                ctx.strokeRect(x, y, w, h);
            } else if (t === 'line') {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
            if (t === 'freedraw') {
                const ds = dragRef.current;
                const pts = ds?.path || [];
                ctx.setLineDash([]);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgb(76,139,245)';
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                if (pts.length > 1) {
                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length; i++)
                        ctx.lineTo(pts[i].x, pts[i].y);
                    ctx.stroke();
                }
                return;
            } else {
                ctx.setLineDash([]);
                ctx.beginPath();
                if (t === 'ellipse') drawEllipsePath(ctx, x, y, w, h);
                else if (t === 'polygon')
                    drawPolygonPath(ctx, x, y, w, h, polygonSides);
                else if (t === 'star')
                    drawStarPath(ctx, x, y, w, h, starPoints, starInnerRatio);
                ctx.stroke();
            }
        }

        function onDbl(e) {
            if (toolRef.current !== 'select') return;
            const id = pickIdAt(hitRef.current, e.clientX, e.clientY);
            if (id == null) return;
            const found = shapesRef.current.find((s) => s.pickId === id);
            if (found) {
                dispatch(setFocus(found.id));
                focusRef.current = found.id;
                if (found.type === 'text') beginTextEdit(found);
            } else {
                dispatch(clearFocus());
                focusRef.current = null;
            }
        }

        function onDown(e) {
            e.preventDefault();
            const p = toCanvasPt(e);
            const currentTool = toolRef.current;

            if (editingRef.current) {
                const s = shapesRef.current.find((v) => v.id === editingId);
                const inside =
                    s &&
                    p.x >= s.x &&
                    p.x <= s.x + s.w &&
                    p.y >= s.y &&
                    p.y <= s.y + s.h;
                if (inside) {
                    // textarea가 이벤트를 가져가므로 캔버스 인터랙션은 하지 않음
                    return;
                } else {
                    endTextEdit(true); // 커밋 후 계속 진행(다른 도형 선택/포커스 해제 등)
                }
            }
            const pScreen = (() => {
                const rect = ov.getBoundingClientRect();
                const xs =
                    ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
                const ys =
                    ((e.clientY - rect.top) * (ov.height / rect.height)) /
                    DPR();
                return { xs, ys };
            })();
            const isPan =
                e.button === 1 ||
                e.buttons === 4 ||
                e.shiftKey ||
                e.code === 'Space' ||
                e.key === ' ';
            if (isPan) {
                dragRef.current = { type: 'pan', startScreen: pScreen };
                return;
            }

            if (currentTool !== 'select') {
                if (currentTool === 'freedraw') {
                    dragRef.current = {
                        type: 'freedraw',
                        start: p,
                        tool: currentTool,
                        path: [p],
                    };
                } else if (currentTool === 'text') {
                    dragRef.current = { type: 'draw', start: p, tool: 'text' };
                    return;
                } else {
                    dragRef.current = {
                        type: 'draw',
                        start: p,
                        tool: currentTool,
                    };
                }
                return;
            }

            const fid = focusRef.current;
            if (fid != null) {
                const f = shapesRef.current.find((s) => s.id === fid);
                if (f) {
                    const hh = hitHandle(
                        p,
                        { x: f.x, y: f.y, w: f.w, h: f.h },
                        8
                    );
                    if (hh) {
                        dispatch(historyStart());
                        dragRef.current = {
                            type: 'resize',
                            id: f.id,
                            handle: hh,
                            start: p,
                            origBBox: { ...f },
                        };
                        return;
                    }
                    if (
                        p.x >= f.x &&
                        p.x <= f.x + f.w &&
                        p.y >= f.y &&
                        p.y <= f.y + f.h
                    ) {
                        dispatch(historyStart());
                        dragRef.current = { type: 'move', id: f.id, start: p };
                        return;
                    }
                }
            }

            const pickedId = pickIdAt(hitRef.current, e.clientX, e.clientY);
            if (pickedId != null) {
                const target = shapesRef.current.find(
                    (s) => s.pickId === pickedId
                );
                if (target) {
                    if (focusRef.current !== target.id) {
                        dispatch(setFocus(target.id));
                        focusRef.current = target.id;
                    }
                    const hh = hitHandle(
                        p,
                        { x: target.x, y: target.y, w: target.w, h: target.h },
                        8
                    );
                    if (hh) {
                        dispatch(historyStart());
                        dragRef.current = {
                            type: 'resize',
                            id: target.id,
                            handle: hh,
                            start: p,
                            origBBox: { ...target },
                        };
                        return;
                    }
                    if (
                        p.x >= target.x &&
                        p.x <= target.x + target.w &&
                        p.y >= target.y &&
                        p.y <= target.y + target.h
                    ) {
                        dispatch(historyStart());
                        dragRef.current = {
                            type: 'move',
                            id: target.id,
                            start: p,
                        };
                        return;
                    }
                }
            }
            dragRef.current = { type: 'maybeClear', start: p };
        }
        function bboxByHandle(handle, p, orig) {
            // orig: {x, y, w, h}, p: 현재 포인터 좌표
            switch (handle) {
                // ── 코너 ──
                case 'nw':
                    return {
                        x: Math.min(orig.x + orig.w, p.x),
                        y: Math.min(orig.y + orig.h, p.y),
                        w: Math.abs(orig.x + orig.w - p.x),
                        h: Math.abs(orig.y + orig.h - p.y),
                    };
                case 'ne':
                    return {
                        x: Math.min(orig.x, p.x),
                        y: Math.min(orig.y + orig.h, p.y),
                        w: Math.abs(p.x - orig.x),
                        h: Math.abs(orig.y + orig.h - p.y),
                    };
                case 'sw':
                    return {
                        x: Math.min(orig.x + orig.w, p.x),
                        y: Math.min(orig.y, p.y),
                        w: Math.abs(orig.x + orig.w - p.x),
                        h: Math.abs(p.y - orig.y),
                    };
                case 'se':
                    return {
                        x: Math.min(orig.x, p.x),
                        y: Math.min(orig.y, p.y),
                        w: Math.abs(p.x - orig.x),
                        h: Math.abs(p.y - orig.y),
                    };
                // ── 엣지(한 축만 변경) ──
                case 'n':
                    return {
                        x: orig.x,
                        y: Math.min(orig.y + orig.h, p.y),
                        w: orig.w,
                        h: Math.abs(orig.y + orig.h - p.y),
                    };
                case 's':
                    return {
                        x: orig.x,
                        y: Math.min(orig.y, p.y),
                        w: orig.w,
                        h: Math.abs(p.y - orig.y),
                    };
                case 'w':
                    return {
                        x: Math.min(orig.x + orig.w, p.x),
                        y: orig.y,
                        w: Math.abs(orig.x + orig.w - p.x),
                        h: orig.h,
                    };
                case 'e':
                    return {
                        x: Math.min(orig.x, p.x),
                        y: orig.y,
                        w: Math.abs(p.x - orig.x),
                        h: orig.h,
                    };
                default:
                    return { ...orig };
            }
        }

        function onMove(e) {
            const ds = dragRef.current;
            if (!ds) return;
            const p = toCanvasPt(e);

            if (ds.type === 'maybeClear') {
                // select 모드: 빈 곳 드래그는 없음(클릭 판정만)
                return;
            }
            if (ds.type === 'draw') {
                const octx = ovRef.current.getContext('2d');
                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
                drawPreview(octx, ds.start, p, ds.tool);
                dragRef.current.last = p;
                return;
            }
            if (ds.type === 'move') {
                const dx = p.x - ds.start.x,
                    dy = p.y - ds.start.y;
                dispatch(moveShape({ id: ds.id, dx, dy }));
                ds.start = p;
                return;
            }
            if (ds.type === 'resize') {
                const nb = bboxByHandle(ds.handle, p, ds.origBBox);

                const x = nb.x,
                    y = nb.y,
                    w = Math.max(1, nb.w),
                    h = Math.max(1, nb.h);
                dispatch(resizeShape({ id: ds.id, x, y, w, h }));
                return;
            }
            if (ds.type === 'freedraw') {
                const octx = ovRef.current.getContext('2d');

                const last = ds.path[ds.path.length - 1];
                if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= 1) {
                    ds.path.push(p);
                }

                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
                drawPreview(octx, ds.start, p, 'freedraw');
                dragRef.current.last = p;
                return;
            }
            if (ds.type === 'pan') {
                const rect = ov.getBoundingClientRect();
                const xs =
                    ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
                const ys =
                    ((e.clientY - rect.top) * (ov.height / rect.height)) /
                    DPR();
                const dx = xs - ds.startScreen.xs;
                const dy = ys - ds.startScreen.ys;
                dispatch(
                    setView({
                        tx: viewRef.current.tx + dx,
                        ty: viewRef.current.ty + dy,
                    })
                );
                ds.startScreen = { xs, ys };

                return;
            }
        }

        function onUp(e) {
            const ds = dragRef.current;
            if (!ds) return;

            if (ds.type === 'maybeClear') {
                const end = toCanvasPt(e);
                if (dist2(ds.start, end) <= 3) {
                    dispatch(clearFocus());
                    focusRef.current = null;
                    renderAllOnce();
                }
            } else if (ds.type === 'draw') {
                const end = ds.last || ds.start;
                const tool = ds.tool || toolRef.current;
                const x = Math.min(ds.start.x, end.x);
                const y = Math.min(ds.start.y, end.y);
                const w =
                    tool === 'line'
                        ? end.x - ds.start.x
                        : Math.abs(end.x - ds.start.x);
                const h =
                    tool === 'line'
                        ? end.y - ds.start.y
                        : Math.abs(end.y - ds.start.y);

                const minOK =
                    tool === 'line'
                        ? Math.abs(w) + Math.abs(h) >= 2
                        : w >= 2 && h >= 2;
                if (minOK) {
                    dispatch(historyStart());
                    const payload = {
                        type: tool,
                        x: tool === 'line' ? ds.start.x : x,
                        y: tool === 'line' ? ds.start.y : y,
                        w,
                        h,
                    };
                    if (tool === 'text') {
                        Object.assign(payload, {
                            text: '',
                            font: '16px sans-serif',
                            color: '#111',
                            align: 'left',
                            lineHeight: 1.3,
                        });
                    }

                    if (tool === 'polygon') payload.sides = polygonSides;
                    if (tool === 'star') {
                        payload.points = starPoints;
                        payload.innerRatio = starInnerRatio;
                    }
                    dispatch(addShape(payload));
                    if (tool === 'text') {
                        const just = { ...payload }; // bbox 정보
                        const last =
                            shapesRef.current[shapesRef.current.length - 1];
                        const id = (last?.id ?? 0) + 1; // addShape에서 nextId로 부여됨 → 포커스/렌더 후 ref에서 찾아도 됨
                        // 안전하게: 포커스된 도형을 참조해서 beginTextEdit
                        requestAnimationFrame(() => {
                            const f = shapesRef.current.find(
                                (s) =>
                                    s.type === 'text' &&
                                    s.id === focusRef.current
                            );
                            if (f) beginTextEdit(f);
                        });
                    }
                    dispatch(setTool('select'));
                }
                const octx = ovRef.current.getContext('2d');
                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
            } else if (ds.type === 'freedraw') {
                const pts = ds.path || [];
                const bbox = computeBBox(pts);
                if (pts.length >= 2 && bbox) {
                    dispatch(historyStart());
                    let { minX, minY, w, h } = bbox;
                    const MIN_SIDE = 2; // 정규화가 무의미해지지 않게 최소 두께
                    if (w < MIN_SIDE) {
                        const pad = (MIN_SIDE - w) / 2;
                        minX -= pad;
                        w = MIN_SIDE;
                    }
                    if (h < MIN_SIDE) {
                        const pad = (MIN_SIDE - h) / 2;
                        minY -= pad;
                        h = MIN_SIDE;
                    }
                    const padded = { minX, minY, w, h };

                    const pathUV = normalizePath(pts, padded);
                    const payload = {
                        type: 'path',
                        x: minX,
                        y: minY,
                        w,
                        h,
                        path: pathUV,
                        strokeWidth: 2,
                    };
                    dispatch(addShape(payload));
                    dispatch(setTool('select'));
                }
                const octx = ovRef.current.getContext('2d');
                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
            }
            if (ds.type === 'pan') {
                dragRef.current = null;
                return;
            }

            dragRef.current = null;
            renderAllOnce();
        }

        ov.addEventListener('dblclick', onDbl);
        ov.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            ov.removeEventListener('dblclick', onDbl);
            ov.removeEventListener('mousedown', onDown);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [dispatch, polygonSides, starPoints, starInnerRatio]);

    function beginTextEdit(shape) {
        setEditingId(shape.id);
        editingRef.current = true;
        requestAnimationFrame(() => {
            if (textRef.current) textRef.current.focus();
            renderAllOnce(); // ✅ 편집 시작 직후 캔버스 텍스트 숨김
        });
    }

    function endTextEdit(commit = true) {
        const id = editingIdRef.current ?? editingId;
        const val = textRef.current?.value ?? '';
        if (commit && id != null) {
            dispatch(historyStart());
            dispatch(updateText({ id, text: val }));
        }
        // 편집 플래그를 "즉시" 정리해 벡터 레이어가 더 이상 스킵하지 않도록
        editingRef.current = false;
        editingIdRef.current = null;
        setEditingId(null);
        // Redux/React 상태 플러시 이후에 렌더
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                renderAllOnce();
            });
        });
    }

    useEffect(() => {
        if (editingId != null && focusId !== editingId) {
            endTextEdit(true); // 커밋하고 종료 (원하면 false로 취소)
        }
    }, [focusId]);

    function renderAllOnce() {
        const vctx = vecRef.current?.getContext('2d');
        const hctx = hitRef.current?.getContext('2d');
        const octx = ovRef.current?.getContext('2d');

        if (vctx) renderVector(vctx, shapesRef.current);
        if (hctx) renderHitmap(hctx, shapesRef.current);
        if (octx) renderOverlay(octx);
    }

    useEffect(() => {
        function onKeyDown(e) {
            const tag = e.target?.tagName;
            const typing =
                tag === 'INPUT' ||
                tag === 'TEXTAREA' ||
                e.target?.isContentEditable;
            // 텍스트 편집 중 Ctrl+Z는 textarea 기본 undo에 맡기고, 편집 중이 아닐 때만 캔버스 undo/redo
            if (!typing && !editingRef.current) {
                const isMac = navigator.platform.toLowerCase().includes('mac');
                const cmd = isMac ? e.metaKey : e.ctrlKey;

                if (cmd && e.key.toLowerCase() === 'z') {
                    e.preventDefault();
                    if (e.shiftKey) dispatch(redo());
                    else dispatch(undo());
                    requestAnimationFrame(renderAllOnce);
                    return;
                }
                if (cmd && e.key.toLowerCase() === 'y') {
                    e.preventDefault();
                    dispatch(redo());
                    requestAnimationFrame(renderAllOnce);
                    return;
                }
            }
            // ↓ 기존 삭제 로직 유지
            if ((e.key === 'Backspace' || e.key === 'Delete') && !typing) {
                if (focusRef.current == null) return;
                e.preventDefault();
                dispatch(historyStart());
                dispatch(deleteFocused());
                requestAnimationFrame(renderAllOnce);
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [dispatch]);

    useEffect(() => {
        const ov = ovRef.current;
        if (!ov) return;

        function onWheel(e) {
            // 두 손가락 스크롤/트랙패드 줌도 고려하려면 e.ctrlKey 케이스 포함
            const delta = e.deltaY;
            if (!e.ctrlKey && !e.metaKey) {
                // 일반 스크롤은 패닝으로 쓰고 싶다면 여기서 tx,ty 변경 처리 가능
                // 이번엔 줌만 처리: 기본 스크롤 방지
            }
            e.preventDefault();

            const rect = ov.getBoundingClientRect();
            const xs =
                ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
            const ys =
                ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();

            const { scale, tx, ty } = viewRef.current;
            const zoom = Math.exp(-delta * 0.0015);
            const newScale = Math.min(
                MAX_SCALE,
                Math.max(MIN_SCALE, scale * zoom)
            );

            // 커서 고정 줌: (xs,ys)가 가리키는 월드점이 화면에서 그대로 보이도록 tx,ty 보정
            if (newScale !== scale) {
                // 현재 월드 좌표
                const wx = (xs - tx) / scale;
                const wy = (ys - ty) / scale;
                // 새로운 스케일에서 같은 월드점이 같은 화면좌표가 되도록
                const ntx = xs - wx * newScale;
                const nty = ys - wy * newScale;

                dispatch(setView({ scale: newScale, tx: ntx, ty: nty }));
            }
        }

        ov.addEventListener('wheel', onWheel, { passive: false });
        return () => ov.removeEventListener('wheel', onWheel);
    }, []);

    /* ---------------- JSX ---------------- */
    return (
        <div
            className="canvas-outer"
            style={{
                position: 'relative',
                overflow: 'auto',
                width: '100%',
                height: '100%',
            }}
        >
            <div
                className="canvas-stage-wrap fill-viewport"
                ref={wrapRef}
                style={{ background: canvasBg }}
            >
                <canvas ref={vecRef} className="layer-vector" />
                <canvas ref={hitRef} className="layer-hitmap" />
                <canvas ref={ovRef} className="layer-overlay" />
                <div
                    style={{
                        position: 'absolute',
                        left: 8,
                        top: 8,
                        zIndex: 9999,
                        fontSize: '1.2rem',
                        color: 'var(--text-color)',
                    }}
                >
                    tool: <b>{tool}</b> · 드래그: 도형 생성 ·
                    더블클릭(선택모드): 포커스 · 포커스 후 드래그: 이동/리사이즈
                    · 빈 곳 클릭: 포커스 해제 · ⌫/Del: 삭제
                </div>
                {editingId != null &&
                    (() => {
                        const s = shapes.find((v) => v.id === editingId);
                        if (!s) return null;
                        const { x: left, y: top } = worldToScreen(s.x, s.y);
                        const { x: right, y: bottom } = worldToScreen(
                            s.x + s.w,
                            s.y + s.h
                        );
                        const width = right - left;
                        const height = bottom - top;
                        // DPR 고려: 우리는 컨텍스트에 dpr을 곱해 뒀으니, CSS 좌표 기준 그대로 쓰면 됩니다.
                        const style = {
                            position: 'absolute',
                            left,
                            top,
                            width,
                            height,
                            zIndex: 10000,
                            padding: 4,
                            margin: 0,
                            border: '1px solid var(--overlay-marquee-stroke)',
                            outline: 'none',
                            background: 'transparent',
                            color: s.color || '#111',
                            font: s.font || '16px sans-serif',
                            lineHeight: s.lineHeight || 1.3,
                            resize: 'none',
                            overflow: 'auto',
                            whiteSpace: 'pre-wrap',
                        };
                        return (
                            <textarea
                                ref={textRef}
                                style={style}
                                defaultValue={s.text || ''}
                                onBlur={() => endTextEdit(true)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape') {
                                        e.preventDefault();
                                        endTextEdit(false);
                                    }
                                    if (
                                        e.key === 'Enter' &&
                                        (e.ctrlKey || e.metaKey)
                                    ) {
                                        e.preventDefault();
                                        endTextEdit(true);
                                    }
                                }}
                            />
                        );
                    })()}
            </div>
        </div>
    );
}

export default CanvasStageRobustRedux;
