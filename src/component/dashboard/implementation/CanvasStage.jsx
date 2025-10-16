import { useRef, useLayoutEffect, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { setSelection } from '../lib/axios/redux/slice/selectionSlice';
import {
    addShape,
    translateShapes,
    scaleShapes,
    rotateShapes,
    updatePolylineNode,
    setShapeData,
    removeShapes,
} from '../lib/axios/redux/slice/shapeSlice';
import { setZoom, setPan } from '../lib/axios/redux/slice/viewportSlice';
import { setTool } from '../lib/axios/redux/slice/toolSlice'; // ⬅ 편집 종료 시 select 로 전환

// ────────────────────────────────────────────
// 캔버스/DPR 유틸
const setupCanvas = (canvas, cssW, cssH) => {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, dpr };
};
const getLocalXY = (e, elem) => {
    const r = elem.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
};
const withMatrix = (ctx, m, draw) => {
    if (!m) return draw();
    ctx.save();
    ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    draw();
    ctx.restore();
};
const genId = () =>
    globalThis.crypto?.randomUUID?.() ||
    `s_${Math.random().toString(36).slice(2, 9)}`;

// ────────────────────────────────────────────
// 선택 핸들
const HANDLE = {
    BODY: 0,
    N: 1,
    NE: 2,
    E: 3,
    SE: 4,
    S: 5,
    SW: 6,
    W: 7,
    NW: 8,
    ROT: 9,
};
const handlePoints = (bb) => {
    const { x, y, w, h } = bb;
    const cx = x + w / 2,
        cy = y + h / 2;
    return [
        { x: cx, y: y - 24, code: HANDLE.ROT },
        { x, y, code: HANDLE.NW },
        { x: cx, y, code: HANDLE.N },
        { x: x + w, y, code: HANDLE.NE },
        { x, y: cy, code: HANDLE.W },
        { x: x + w, y: cy, code: HANDLE.E },
        { x, y: y + h, code: HANDLE.SW },
        { x: cx, y: y + h, code: HANDLE.S },
        { x: x + w, y: y + h, code: HANDLE.SE },
    ];
};

// 히트맵 픽셀 읽기
const pickRGB = (ctx, dpr, x, y) => {
    const px = Math.max(0, Math.floor(x * dpr));
    const py = Math.max(0, Math.floor(y * dpr));
    const { data } = ctx.getImageData(px, py, 1, 1);
    return `${data[0]},${data[1]},${data[2]}`;
};

// 별 좌표
const starPoints = (
    cx,
    cy,
    rOuter,
    rInner,
    spikes = 5,
    rotationRad = -Math.PI / 2
) => {
    const pts = [];
    const step = Math.PI / spikes;
    for (let i = 0; i < spikes * 2; i++) {
        const r = i % 2 === 0 ? rOuter : rInner;
        const a = rotationRad + i * step;
        pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    pts.push(pts[0], pts[1]); // 닫힘 보장
    return pts;
};

// 본 그리기
const drawShapeMain = (ctx, s) => {
    const style = s.style || {};
    const stroke = style.stroke ?? '#333';
    const fill = style.fill ?? null;
    const lw = style.strokeWidth ?? 1;

    const draw = () => {
        ctx.lineWidth = lw;
        if (fill != null) ctx.fillStyle = fill;
        if (stroke != null) ctx.strokeStyle = stroke;

        if (s.type === 'rect') {
            if (fill != null) ctx.fillRect(s.x, s.y, s.w, s.h);
            if (stroke != null) ctx.strokeRect(s.x, s.y, s.w, s.h);
        } else if (s.type === 'ellipse' || s.type === 'circle') {
            ctx.beginPath();
            ctx.ellipse(
                s.x + s.w / 2,
                s.y + s.h / 2,
                Math.abs(s.w / 2),
                Math.abs(s.h / 2),
                0,
                0,
                Math.PI * 2
            );
            if (fill != null) ctx.fill();
            if (stroke != null) ctx.stroke();
        } else if (s.type === 'star') {
            const cx = s.x + s.w / 2,
                cy = s.y + s.h / 2;
            const rOuter = Math.min(Math.abs(s.w), Math.abs(s.h)) / 2;
            const rInner = rOuter * (s.data?.innerRatio ?? 0.5);
            const spikes = s.data?.points ?? 5;
            const rotRad = s.data?.rotationRad ?? -Math.PI / 2;
            const pts = starPoints(cx, cy, rOuter, rInner, spikes, rotRad);
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1]);
            for (let i = 2; i < pts.length; i += 2)
                ctx.lineTo(pts[i], pts[i + 1]);
            ctx.closePath();
            if (fill != null) ctx.fill();
            if (stroke != null) ctx.stroke();
        } else if (s.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + s.w, s.y + s.h);
            ctx.stroke();
        } else if (
            s.type === 'polyline' ||
            s.type === 'polygon' ||
            s.type === 'path'
        ) {
            const pts = s.data?.points || [];
            if (pts.length < 4) return;
            ctx.beginPath();
            ctx.moveTo(pts[0], pts[1]);
            for (let i = 2; i < pts.length; i += 2)
                ctx.lineTo(pts[i], pts[i + 1]);
            if (s.type === 'polygon') ctx.closePath();
            if (fill != null && s.type !== 'polyline') ctx.fill();
            if (stroke != null) ctx.stroke();
        } else if (s.type === 'text') {
            const text = s.data?.text ?? '';
            const fontSize = s.data?.fontSize ?? 16;
            const fontFamily = s.data?.fontFamily ?? 'sans-serif';
            ctx.font = `${fontSize}px ${fontFamily}`;
            ctx.textBaseline = 'top';
            if (fill != null) {
                ctx.fillStyle = fill;
                ctx.fillText(text, s.x, s.y);
            }
            if (stroke != null && (style.strokeWidth ?? 0) > 0) {
                ctx.strokeStyle = stroke;
                ctx.strokeText(text, s.x, s.y);
            }
            if ((s.w ?? 0) && (s.h ?? 0)) {
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(0,0,0,0.25)';
                ctx.strokeRect(s.x, s.y, s.w, s.h);
                ctx.restore();
            }
        }
    };

    withMatrix(ctx, s.matrix, draw);
};

// 선택 오버레이
const drawSelectionOverlay = (ctx, shapes, selIds) => {
    if (!selIds?.length) return;
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#4c8bf5';
    ctx.lineWidth = 1;

    for (const id of selIds) {
        const s = shapes.find((it) => it.id === id);
        if (!s) continue;
        const bb = s.bbox || { x: s.x, y: s.y, w: s.w, h: s.h };
        withMatrix(ctx, s.matrix, () => {
            ctx.strokeRect(bb.x, bb.y, bb.w, bb.h);
            const k = 6;
            const pts = handlePoints(bb);
            for (const p of pts) {
                ctx.fillStyle = p.code === HANDLE.ROT ? '#4c8bf5' : '#fff';
                ctx.strokeStyle = '#4c8bf5';
                ctx.beginPath();
                ctx.rect(p.x - k / 2, p.y - k / 2, k, k);
                ctx.fill();
                ctx.stroke();
            }
        });
    }
    ctx.restore();
};

// ────────────────────────────────────────────
// 메인 컴포넌트
export default function CanvasStage() {
    const dispatch = useDispatch();

    // 상태
    const toolRaw = useSelector((s) => s.tools?.tool ?? 'select');
    const normalizeTool = (t) =>
        String(t || 'select')
            .toLowerCase()
            .replace(/^shape[._-]?/, '');
    const tool = normalizeTool(toolRaw);

    const draft = useSelector((s) => s.tools?.draft ?? {});
    const shapes = useSelector((s) => s.shapes?.list ?? []);
    const selIds = useSelector((s) => s.selection?.selectedIds ?? []);
    const zoom = useSelector((s) => s.viewport?.zoom ?? 1);
    const pan = useSelector((s) => s.viewport?.pan ?? { x: 0, y: 0 });
    const canvas = useSelector((s) => s.canvas);
    const doc = useSelector((s) => s.doc);

    const cssW = doc?.width ?? canvas?.width ?? 800;
    const cssH = doc?.height ?? canvas?.height ?? 600;
    const logicalW = canvas?.width ?? 800;
    const logicalH = canvas?.height ?? 600;
    const showGrid = canvas?.grid?.enabled ?? false;
    const gridSize = canvas?.grid?.size ?? 10;
    const background = canvas?.background ?? null;

    // 캔버스 refs
    const mainRef = useRef(null);
    const overlayRef = useRef(null);
    const hitmapRef = useRef(null);
    const ctxs = useRef({ m: null, o: null, h: null, dpr: 1 });

    // 히트맵 레지스트리
    const hitReg = useRef(new Map());
    const colorSeq = useRef(1);
    const allocColor = () => {
        let n = colorSeq.current++;
        if (n >= 0xff0000) {
            colorSeq.current = 1;
            n = 1;
        }
        const r = (n >> 16) & 255,
            g = (n >> 8) & 255,
            b = n & 255;
        return `${r},${g},${b}`;
    };
    const drawWithReg = (ctx, draw, payload) => {
        const key = allocColor();
        const [r, g, b] = key.split(',').map(Number);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.strokeStyle = `rgb(${r},${g},${b})`;
        draw();
        hitReg.current.set(key, payload);
    };

    // path 편집 모드
    const [editPathId, setEditPathId] = useState(null);

    // 텍스트 편집 상태
    const [textEdit, setTextEdit] = useState(null); // {id,x,y,w,h,value}
    const textAreaRef = useRef(null);

    // 캔버스 초기화/리사이즈/뷰변경
    useLayoutEffect(() => {
        const m = mainRef.current,
            o = overlayRef.current,
            h = hitmapRef.current;
        if (!m || !o || !h) return;

        const { ctx: mctx, dpr } = setupCanvas(m, cssW, cssH);
        const { ctx: octx } = setupCanvas(o, cssW, cssH);
        const { ctx: hctx } = setupCanvas(h, cssW, cssH);

        [mctx, octx, hctx].forEach((c) => {
            c.save();
            c.translate(pan.x, pan.y);
            c.scale(zoom, zoom);
        });
        ctxs.current = { m: mctx, o: octx, h: hctx, dpr };
        redraw();

        return () => {
            [mctx, octx, hctx].forEach((c) => c.restore());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cssW, cssH, zoom, pan.x, pan.y]);

    useEffect(() => {
        redraw();
    }, [
        shapes,
        selIds,
        background,
        showGrid,
        gridSize,
        logicalW,
        logicalH,
        editPathId,
    ]);

    // 텍스트 편집 중이면 위치/크기 갱신
    useEffect(() => {
        if (!textEdit) return;
        const s = shapes.find((it) => it.id === textEdit.id);
        if (!s) return;
        setTextEdit(
            (te) =>
                te && {
                    ...te,
                    x: s.x,
                    y: s.y,
                    w: s.w,
                    h: s.h,
                    value: s.data?.text ?? '',
                }
        );
    }, [pan.x, pan.y, zoom, shapes]);

    useEffect(() => {
        if (textEdit && textAreaRef.current) textAreaRef.current.focus();
    }, [textEdit]);

    // 전체 리드로우
    const redraw = () => {
        const { m, o, h } = ctxs.current;
        if (!m || !o || !h) return;

        hitReg.current.clear();

        // 메인
        m.clearRect(-pan.x / zoom, -pan.y / zoom, logicalW, logicalH);
        if (background) {
            m.save();
            m.fillStyle = background;
            m.fillRect(0, 0, logicalW, logicalH);
            m.restore();
        }
        if (showGrid) {
            m.save();
            m.beginPath();
            for (let x = 0.5; x < logicalW; x += gridSize) {
                m.moveTo(x, 0);
                m.lineTo(x, logicalH);
            }
            for (let y = 0.5; y < logicalH; y += gridSize) {
                m.moveTo(0, y);
                m.lineTo(logicalW, y);
            }
            m.strokeStyle = 'rgba(0,0,0,0.08)';
            m.lineWidth = 1;
            m.stroke();
            m.restore();
        }
        for (const s of shapes) drawShapeMain(m, s);

        // 히트맵
        h.clearRect(-pan.x / zoom, -pan.y / zoom, logicalW, logicalH);
        for (const s of shapes) {
            withMatrix(h, s.matrix, () => {
                drawWithReg(
                    h,
                    () => {
                        if (s.type === 'rect') {
                            h.fillRect(s.x, s.y, s.w, s.h);
                        } else if (
                            s.type === 'ellipse' ||
                            s.type === 'circle'
                        ) {
                            h.beginPath();
                            h.ellipse(
                                s.x + s.w / 2,
                                s.y + s.h / 2,
                                Math.abs(s.w / 2),
                                Math.abs(s.h / 2),
                                0,
                                0,
                                Math.PI * 2
                            );
                            h.fill();
                        } else if (s.type === 'star') {
                            const cx = s.x + s.w / 2,
                                cy = s.y + s.h / 2;
                            const rOuter =
                                Math.min(Math.abs(s.w), Math.abs(s.h)) / 2;
                            const rInner = rOuter * (s.data?.innerRatio ?? 0.5);
                            const spikes = s.data?.points ?? 5;
                            const rotRad = s.data?.rotationRad ?? -Math.PI / 2;
                            const pts = starPoints(
                                cx,
                                cy,
                                rOuter,
                                rInner,
                                spikes,
                                rotRad
                            );
                            h.beginPath();
                            h.moveTo(pts[0], pts[1]);
                            for (let i = 2; i < pts.length; i += 2)
                                h.lineTo(pts[i], pts[i + 1]);
                            h.closePath();
                            h.fill();
                        } else if (s.type === 'line') {
                            h.beginPath();
                            h.lineCap = 'round';
                            h.lineJoin = 'round';
                            h.lineWidth = Math.max(
                                1,
                                (s.style?.strokeWidth ?? 2) * 0.8
                            );
                            h.moveTo(s.x, s.y);
                            h.lineTo(s.x + s.w, s.y + s.h);
                            h.stroke();
                        } else if (
                            s.type === 'polyline' ||
                            s.type === 'polygon' ||
                            s.type === 'path'
                        ) {
                            const pts = s.data?.points || [];
                            if (pts.length < 4) return;
                            h.beginPath();
                            h.moveTo(pts[0], pts[1]);
                            for (let i = 2; i < pts.length; i += 2)
                                h.lineTo(pts[i], pts[i + 1]);
                            if (s.type === 'polygon') {
                                h.closePath();
                                h.fill();
                            } else {
                                h.lineCap = 'round';
                                h.lineJoin = 'round';
                                h.lineWidth = Math.max(
                                    1,
                                    (s.style?.strokeWidth ?? 2) * 0.6
                                );
                                h.stroke();
                            }
                        } else if (s.type === 'text') {
                            h.fillRect(
                                s.x,
                                s.y,
                                Math.max(12, s.w || 48),
                                Math.max(12, s.h || 20)
                            );
                        }
                    },
                    { type: 'body', shapeId: s.id }
                );

                // 선택 핸들
                if (selIds.includes(s.id)) {
                    const bb = s.bbox || { x: s.x, y: s.y, w: s.w, h: s.h };
                    const k = 10;
                    const pts = handlePoints(bb);
                    for (const p of pts) {
                        drawWithReg(
                            h,
                            () => {
                                h.fillRect(p.x - k / 2, p.y - k / 2, k, k);
                            },
                            { type: 'handle', shapeId: s.id, handle: p.code }
                        );
                    }
                }

                // path 편집 노드
                if (
                    editPathId &&
                    editPathId === s.id &&
                    (s.type === 'polyline' ||
                        s.type === 'polygon' ||
                        s.type === 'path')
                ) {
                    const pts = s.data?.points || [];
                    for (let i = 0; i < pts.length; i += 2) {
                        const nx = pts[i],
                            ny = pts[i + 1];
                        drawWithReg(
                            h,
                            () => {
                                h.beginPath();
                                h.arc(nx, ny, 6, 0, Math.PI * 2);
                                h.fill();
                            },
                            { type: 'node', shapeId: s.id, index: i / 2 }
                        );
                    }
                }
            });
        }

        // 오버레이 (선택)
        o.clearRect(-pan.x / zoom, -pan.y / zoom, logicalW, logicalH);
        drawSelectionOverlay(o, shapes, selIds);
    };

    // ─────────────────── 드래그 상태
    const dragRef = useRef({
        mode: null,
        start: { x: 0, y: 0 },
        id: null,
        handle: HANDLE.BODY,
        nodeIndex: -1,
        orig: null,
        drawing: null, // 드로잉 draft
    });

    const viewToDoc = (x, y) => ({
        dx: (x - pan.x) / zoom,
        dy: (y - pan.y) / zoom,
    });

    // 포인터 다운
    const onPointerDown = (e) => {
        const main = mainRef.current;
        const { h, dpr } = ctxs.current;
        if (!main || !h) return;
        if (textEdit) {
            setTextEdit(null);
            dispatch(setTool('select'));
            return;
        }

        main.setPointerCapture?.(e.pointerId);
        const { x, y } = getLocalXY(e, main);
        const { dx, dy } = viewToDoc(x, y);

        // 패닝
        if (
            (tool === 'select' && (e.button === 1 || e.altKey)) ||
            e.button === 1
        ) {
            dragRef.current = { mode: 'pan', start: { x, y } };
            return;
        }

        // 히트맵 픽
        const key = pickRGB(h, dpr, x, y);
        const hit = hitReg.current.get(key) || null;

        if (tool === 'select') {
            if (hit?.type === 'body') {
                dispatch(setSelection([hit.shapeId]));
                dragRef.current = {
                    mode: 'move',
                    start: { x: dx, y: dy },
                    id: hit.shapeId,
                };
                return;
            }
            if (hit?.type === 'handle') {
                dispatch(setSelection([hit.shapeId]));
                const orig = captureOrigin(hit.shapeId);
                dragRef.current = {
                    mode: hit.handle === HANDLE.ROT ? 'rotate' : 'scale',
                    start: { x: dx, y: dy },
                    id: hit.shapeId,
                    handle: hit.handle,
                    orig,
                };
                return;
            }
            if (hit?.type === 'node') {
                setEditPathId(hit.shapeId);
                dragRef.current = {
                    mode: 'nodeDrag',
                    start: { x: dx, y: dy },
                    id: hit.shapeId,
                    nodeIndex: hit.index,
                };
                return;
            }
            dragRef.current = { mode: 'pan', start: { x, y } };
            dispatch(setSelection([]));
            return;
        }

        // 드로잉 시작
        if (['rect', 'ellipse', 'line', 'star'].includes(tool)) {
            dragRef.current = {
                mode: 'draw',
                start: { x: dx, y: dy },
                drawing: {
                    type: tool,
                    x: dx,
                    y: dy,
                    w: 0,
                    h: 0,
                    style: { ...draft },
                    data:
                        tool === 'star' ? { points: 5, innerRatio: 0.5 } : null,
                },
            };
            previewOutline({ ...dragRef.current.drawing });
            return;
        }

        if (tool === 'polyline' || tool === 'polygon' || tool === 'path') {
            dragRef.current = {
                mode: 'draw',
                start: { x: dx, y: dy },
                drawing: {
                    type: tool,
                    data: { points: [dx, dy] },
                    style: { ...draft },
                },
            };
            previewOutline(dragRef.current.drawing);
            return;
        }

        if (tool === 'text') {
            dragRef.current = {
                mode: 'draw',
                start: { x: dx, y: dy },
                drawing: {
                    type: 'text',
                    x: dx,
                    y: dy,
                    w: 0,
                    h: 0,
                    data: { text: '', fontSize: 18 },
                    style: { ...draft, fill: draft.fill ?? '#000' },
                },
            };
            previewOutline(dragRef.current.drawing);
            return;
        }
    };

    // 포인터 무브
    const onPointerMove = (e) => {
        const main = mainRef.current;
        if (!main) return;
        const { x, y } = getLocalXY(e, main);
        const { dx, dy } = viewToDoc(x, y);
        const st = dragRef.current;
        if (!st.mode) return;

        if (st.mode === 'pan') {
            dispatch(
                setPan({
                    x: pan.x + (x - st.start.x),
                    y: pan.y + (y - st.start.y),
                })
            );
            st.start = { x, y };
            return;
        }
        if (st.mode === 'move' && st.id) {
            dispatch(
                translateShapes({
                    ids: [st.id],
                    dx: dx - st.start.x,
                    dy: dy - st.start.y,
                })
            );
            st.start = { x: dx, y: dy };
            return;
        }
        if (st.mode === 'scale' && st.id && st.orig) {
            const { bb } = st.orig;
            const ax = bb.x,
                ay = bb.y,
                aw = bb.w,
                ah = bb.h;
            let nx = ax,
                ny = ay,
                nw = aw,
                nh = ah;
            const H = HANDLE;
            if (st.handle === H.NW || st.handle === H.W || st.handle === H.SW) {
                nw = ax + aw - dx;
                nx = dx;
            }
            if (st.handle === H.NE || st.handle === H.E || st.handle === H.SE) {
                nw = dx - ax;
            }
            if (st.handle === H.N || st.handle === H.NE || st.handle === H.NW) {
                nh = ay + ah - dy;
                ny = dy;
            }
            if (st.handle === H.S || st.handle === H.SE || st.handle === H.SW) {
                nh = dy - ay;
            }
            const sx = (nw || 0.0001) / (aw || 0.0001);
            const sy = (nh || 0.0001) / (ah || 0.0001);
            dispatch(scaleShapes({ ids: [st.id], sx, sy }));
            st.orig = { ...st.orig, bb: { x: nx, y: ny, w: nw, h: nh } };
            return;
        }
        if (st.mode === 'rotate' && st.id && st.orig) {
            const { bb } = st.orig;
            const cx = bb.x + bb.w / 2,
                cy = bb.y + bb.h / 2;
            const a0 = Math.atan2(st.start.y - cy, st.start.x - cx);
            const a1 = Math.atan2(dy - cy, dx - cx);
            dispatch(
                rotateShapes({ ids: [st.id], deg: ((a1 - a0) * 180) / Math.PI })
            );
            st.start = { x: dx, y: dy };
            return;
        }
        if (st.mode === 'nodeDrag' && st.id && st.nodeIndex >= 0) {
            dispatch(
                updatePolylineNode({
                    id: st.id,
                    index: st.nodeIndex,
                    x: dx,
                    y: dy,
                })
            );
            return;
        }

        if (st.mode === 'draw' && st.drawing) {
            if (
                ['rect', 'ellipse', 'line', 'star', 'text'].includes(
                    st.drawing.type
                )
            ) {
                st.drawing.w = dx - st.start.x;
                st.drawing.h = dy - st.start.y;
            } else {
                const pts = st.drawing.data.points;
                if (
                    pts.length < 2 ||
                    Math.hypot(
                        dx - pts[pts.length - 2],
                        dy - pts[pts.length - 1]
                    ) > 1
                )
                    pts.push(dx, dy);
            }
            previewOutline(st.drawing); // 점선 미리보기
            return;
        }
    };

    // 포인터 업
    const onPointerUp = (e) => {
        const st = dragRef.current;
        const main = mainRef.current;
        if (!main) return;
        main.releasePointerCapture?.(e.pointerId);

        if (st.mode === 'draw' && st.drawing) {
            // 텍스트는 생성 후 즉시 키보드 입력 → 편집 완료되면 select 로 전환
            if (st.drawing.type === 'text') {
                const prepared = normalizeDraft(st.drawing);
                const id = genId();
                const payload = {
                    id,
                    type: 'text',
                    x: prepared.x,
                    y: prepared.y,
                    w: prepared.w,
                    h: prepared.h,
                    style: prepared.style,
                    data: { ...(prepared.data || {}), text: '' },
                    matrix: [1, 0, 0, 1, 0, 0],
                };
                dispatch(addShape(payload));
                dispatch(setSelection([id]));
                setTextEdit({
                    id,
                    x: payload.x,
                    y: payload.y,
                    w: payload.w,
                    h: payload.h,
                    value: '',
                });
            } else {
                commitNewShape(st.drawing);
            }
        }

        dragRef.current = {
            mode: null,
            start: { x: 0, y: 0 },
            id: null,
            handle: HANDLE.BODY,
            nodeIndex: -1,
            orig: null,
            drawing: null,
        };
        redraw();
    };

    // 더블클릭: path 편집/텍스트 편집
    const onDoubleClick = (e) => {
        const main = mainRef.current;
        const { h, dpr } = ctxs.current;
        if (!main || !h) return;
        const { x, y } = getLocalXY(e, main);
        const key = pickRGB(h, dpr, x, y);
        const hit = hitReg.current.get(key) || null;

        if (hit?.shapeId) {
            const s = shapes.find((it) => it.id === hit.shapeId);
            if (!s) return;
            if (s.type === 'text') {
                setTextEdit({
                    id: s.id,
                    x: s.x,
                    y: s.y,
                    w: s.w,
                    h: s.h,
                    value: s.data?.text ?? '',
                });
                dispatch(setSelection([s.id]));
                return;
            }
            if (
                s.type === 'polyline' ||
                s.type === 'polygon' ||
                s.type === 'path'
            ) {
                setEditPathId((prev) => (prev === s.id ? null : s.id));
                dispatch(setSelection([s.id]));
                return;
            }
        }
        setEditPathId(null);
    };

    // 전역 키: ESC 종료, Delete 삭제
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                if (textEdit) {
                    setTextEdit(null);
                    dispatch(setTool('select')); // ⬅ 텍스트 편집 종료 시 select 고정
                    return;
                }
                setEditPathId(null);
            }
            if (
                (e.key === 'Delete' || e.key === 'Backspace') &&
                !textEdit &&
                selIds.length
            ) {
                dispatch(removeShapes(selIds));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [textEdit, selIds, dispatch]);

    // 점선 오버레이 미리보기
    const previewOutline = (draftShape) => {
        const { o } = ctxs.current;
        if (!o) return;
        const d = normalizeDraft(draftShape);

        o.clearRect(-pan.x / zoom, -pan.y / zoom, logicalW, logicalH);
        drawSelectionOverlay(o, shapes, selIds);

        o.save();
        o.setLineDash([6, 4]);
        o.lineWidth = 1;
        o.strokeStyle = '#4c8bf5';
        o.fillStyle = 'transparent';

        if (['rect', 'text', 'star', 'ellipse'].includes(d.type)) {
            if (d.type === 'ellipse') {
                o.beginPath();
                o.ellipse(
                    d.x + d.w / 2,
                    d.y + d.h / 2,
                    Math.abs(d.w / 2),
                    Math.abs(d.h / 2),
                    0,
                    0,
                    Math.PI * 2
                );
                o.stroke();
            } else if (d.type === 'star') {
                const cx = d.x + d.w / 2,
                    cy = d.y + d.h / 2;
                const rOuter = Math.min(Math.abs(d.w), Math.abs(d.h)) / 2;
                const rInner = rOuter * (d.data?.innerRatio ?? 0.5);
                const spikes = d.data?.points ?? 5;
                const rotRad = d.data?.rotationRad ?? -Math.PI / 2;
                const pts = starPoints(cx, cy, rOuter, rInner, spikes, rotRad);
                o.beginPath();
                o.moveTo(pts[0], pts[1]);
                for (let i = 2; i < pts.length; i += 2)
                    o.lineTo(pts[i], pts[i + 1]);
                o.closePath();
                o.stroke();
            } else {
                // rect / text
                o.strokeRect(d.x, d.y, d.w, d.h);
            }
        } else if (d.type === 'line') {
            o.beginPath();
            o.moveTo(d.x, d.y);
            o.lineTo(d.x + d.w, d.y + d.h);
            o.stroke();
        } else {
            const pts = d.data?.points || [];
            if (pts.length >= 4) {
                o.beginPath();
                o.moveTo(pts[0], pts[1]);
                for (let i = 2; i < pts.length; i += 2)
                    o.lineTo(pts[i], pts[i + 1]);
                if (d.type === 'polygon') o.closePath();
                o.stroke();
            }
        }
        o.restore();
    };

    const normalizeDraft = (d) => {
        if (['rect', 'ellipse', 'text', 'star'].includes(d.type)) {
            const x = Math.min(d.x, d.x + d.w),
                y = Math.min(d.y, d.y + d.h);
            const w = Math.abs(d.w) || (d.type === 'text' ? 160 : 0);
            const h = Math.abs(d.h) || (d.type === 'text' ? 40 : 0);
            return { ...d, x, y, w, h };
        }
        return d;
    };

    const commitNewShape = (d) => {
        const s = normalizeDraft(d);
        const payload = {
            type: s.type,
            x: s.x ?? 0,
            y: s.y ?? 0,
            w: s.w ?? 0,
            h: s.h ?? 0,
            style: s.style ?? { stroke: '#333', fill: null, strokeWidth: 2 },
            data: s.data ?? null,
            matrix: [1, 0, 0, 1, 0, 0],
        };
        if (
            s.type === 'polyline' ||
            s.type === 'polygon' ||
            s.type === 'path'
        ) {
            payload.data = { points: (s.data?.points || []).slice() };
        }
        if (s.type === 'text') {
            payload.data = { ...(s.data || {}), text: s.data?.text ?? '' };
        }
        dispatch(addShape(payload));
    };

    const captureOrigin = (id) => {
        const s = shapes.find((it) => it.id === id);
        if (!s) return null;
        const bb = s.bbox || { x: s.x, y: s.y, w: s.w, h: s.h };
        return { bb };
    };

    // 휠 줌
    const onWheel = (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -Math.sign(e.deltaY);
            const next = zoom * (delta > 0 ? 1.1 : 0.9);
            dispatch(setZoom(next));
        }
    };

    // 문서좌표 → 뷰좌표 (textarea 배치)
    const docToView = (x, y) => ({ x: pan.x + x * zoom, y: pan.y + y * zoom });

    return (
        <div
            className="canvas-stage"
            style={{
                position: 'relative',
                width: cssW,
                height: cssH,
                border: '1px solid #e4e4e7',
                background: '#fff',
                userSelect: 'none',
                touchAction: 'none',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onDoubleClick={onDoubleClick}
            onWheel={onWheel}
        >
            {/* 메인 */}
            <canvas
                ref={mainRef}
                style={{ position: 'absolute', inset: 0, zIndex: 101 }}
            />
            {/* 오버레이(점선/선택) */}
            <canvas
                ref={overlayRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 102,
                    pointerEvents: 'none',
                }}
            />
            {/* 히트맵 */}
            <canvas
                ref={hitmapRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 100,
                    opacity: 0,
                    pointerEvents: 'none',
                }}
            />

            {/* 텍스트 편집기: 편집 완료(blur/ESC) 후 select 모드 유지, 새 텍스트는 만들지 않음 */}
            {textEdit && (
                <textarea
                    ref={textAreaRef}
                    value={textEdit.value}
                    onChange={(e) => {
                        const v = e.target.value;
                        setTextEdit((t) => t && { ...t, value: v });
                        dispatch(
                            setShapeData({ id: textEdit.id, data: { text: v } })
                        );
                    }}
                    onBlur={() => {
                        setTextEdit(null);
                        dispatch(setTool('select')); // ⬅ 편집 끝나면 select 로 고정
                    }}
                    style={{
                        position: 'absolute',
                        zIndex: 103,
                        resize: 'none',
                        outline: 'none',
                        border: '1px dashed #4c8bf5',
                        background: 'transparent',
                        color: '#000',
                        font: '16px sans-serif',
                        lineHeight: '1.2',
                        padding: '4px',
                        left: `${docToView(textEdit.x, textEdit.y).x}px`,
                        top: `${docToView(textEdit.x, textEdit.y).y}px`,
                        width: `${Math.max(20, textEdit.w * zoom)}px`,
                        height: `${Math.max(20, textEdit.h * zoom)}px`,
                    }}
                />
            )}
        </div>
    );
}
