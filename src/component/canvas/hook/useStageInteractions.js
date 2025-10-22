import { useEffect, useRef } from 'react';

import { pickIdAt } from '../util/picking';
import { screenToWorld } from '../util/view';
import { drawEllipsePath, drawPolygonPath, drawStarPath } from '../util/paths';
import { computeBBox, normalizePath } from '../util/geometry';
import { DPR, MAX_SCALE, MIN_SCALE } from '../constant/constants';

function useStageInteractions(params) {
    const {
        ovRef,
        hitRef,
        viewRef,
        toolRef,
        shapesRef,
        focusRef,
        polygonSides,
        starPoints,
        starInnerRatio,
        dispatch,
        actions,
        beginTextEdit,
        isNodeDraggingRef,
    } = params;

    const dragRef = useRef(null);
    useEffect(() => {
        const ov = ovRef.current;
        if (!ov) return;

        function toCanvasPt(e) {
            const rect = ov.getBoundingClientRect();
            const xs =
                ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
            const ys =
                ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();
            return screenToWorld(viewRef.current, xs, ys);
        }

        function hitHandle(pt, bbox, s = 8) {
            const { x, y, w, h } = bbox;
            const corners = {
                nw: { x: x - s / 2, y: y - s / 2, w: s, h: s },
                ne: { x: x + w - s / 2, y: y - s / 2, w: s, h: s },
                sw: { x: x - s / 2, y: y + h - s / 2, w: s, h: s },
                se: { x: x + w - s / 2, y: y + h - s / 2, w: s, h: s },
            };
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
            const hit = (r) =>
                pt.x >= r.x &&
                pt.x <= r.x + r.w &&
                pt.y >= r.y &&
                pt.y <= r.y + r.h;
            for (const k of ['n', 's', 'e', 'w']) {
                const r = edges[k];
                if (r.w > 0 && r.h > 0 && hit(r)) return k;
            }
            for (const k of ['nw', 'ne', 'sw', 'se']) {
                const r = corners[k];
                if (hit(r)) return k;
            }
            return null;
        }

        function drawPreview(ctx, start, p, t) {
            const x = Math.min(start.x, p.x),
                y = Math.min(start.y, p.y);
            const w = Math.abs(p.x - start.x),
                h = Math.abs(p.y - start.y);
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = 'rgb(76,139,245)';
            ctx.lineWidth = 1;
            if (t === 'rect') ctx.strokeRect(x, y, w, h);
            else if (t === 'line') {
                ctx.beginPath();
                ctx.moveTo(start.x, start.y);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            } else if (t === 'freedraw') {
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

        function bboxByHandle(handle, p, orig) {
            switch (handle) {
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

        function onDbl(e) {
            if (toolRef.current !== 'select') return;
            const id = pickIdAt(hitRef.current, e.clientX, e.clientY);
            if (id == null) return;
            const found = shapesRef.current.find((s) => s.pickId === id);
            if (found) {
                dispatch(actions.setFocus(found.id));
                focusRef.current = found.id;
                if (found.type === 'text') beginTextEdit(found);
            } else {
                dispatch(actions.clearFocus());
                focusRef.current = null;
            }
        }

        function onDown(e) {
            if (isNodeDraggingRef?.current) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            e.preventDefault();
            const p = toCanvasPt(e);
            const currentTool = toolRef.current;

            const rect = ov.getBoundingClientRect();
            const xs =
                ((e.clientX - rect.left) * (ov.width / rect.width)) / DPR();
            const ys =
                ((e.clientY - rect.top) * (ov.height / rect.height)) / DPR();

            const isPan =
                e.button === 1 ||
                e.buttons === 4 ||
                e.shiftKey ||
                e.code === 'Space' ||
                e.key === ' ';
            if (isPan) {
                dragRef.current = { type: 'pan', startScreen: { xs, ys } };
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
                        dispatch(actions.historyStart());
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
                        dispatch(actions.historyStart());
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
                        dispatch(actions.setFocus(target.id));
                        focusRef.current = target.id;
                    }
                    const hh = hitHandle(
                        p,
                        { x: target.x, y: target.y, w: target.w, h: target.h },
                        8
                    );
                    if (hh) {
                        dispatch(actions.historyStart());
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
                        dispatch(actions.historyStart());
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

        function onMove(e) {
            const ds = dragRef.current;
            if (isNodeDraggingRef?.current) return;
            if (!ds) return;
            const p = toCanvasPt(e);

            if (ds.type === 'maybeClear') return;
            if (ds.type === 'draw') {
                const octx = ovRef.current.getContext('2d');
                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
                drawPreview(octx, ds.start, p, ds.tool);
                ds.last = p;
                return;
            }
            if (ds.type === 'move') {
                const dx = p.x - ds.start.x,
                    dy = p.y - ds.start.y;
                dispatch(actions.moveShape({ id: ds.id, dx, dy }));
                ds.start = p;
                return;
            }
            if (ds.type === 'resize') {
                const nb = bboxByHandle(ds.handle, p, ds.origBBox);
                const x = nb.x,
                    y = nb.y,
                    w = Math.max(1, nb.w),
                    h = Math.max(1, nb.h);
                dispatch(actions.resizeShape({ id: ds.id, x, y, w, h }));
                return;
            }
            if (ds.type === 'freedraw') {
                const last = ds.path[ds.path.length - 1];
                if (!last || Math.hypot(p.x - last.x, p.y - last.y) >= 1)
                    ds.path.push(p);
                const octx = ovRef.current.getContext('2d');
                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
                drawPreview(octx, ds.start, p, 'freedraw');
                ds.last = p;
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
                const { scale, tx, ty } = viewRef.current;
                dispatch(actions.setView({ tx: tx + dx, ty: ty + dy }));
                ds.startScreen = { xs, ys };
                return;
            }
        }

        function onUp(e) {
            const ds = dragRef.current;
            if (isNodeDraggingRef?.current) return;
            if (!ds) return;
            if (ds.type === 'maybeClear') {
                const end = toCanvasPt(e);
                if (Math.hypot(ds.start.x - end.x, ds.start.y - end.y) <= 3) {
                    dispatch(actions.clearFocus());
                    focusRef.current = null;
                }
            } else if (ds.type === 'draw') {
                const end = ds.last || ds.start;
                const tool = ds.tool || toolRef.current;
                const x = Math.min(ds.start.x, end.x),
                    y = Math.min(ds.start.y, end.y);
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
                    dispatch(actions.historyStart());
                    const payload = {
                        type: tool,
                        x: tool === 'line' ? ds.start.x : x,
                        y: tool === 'line' ? ds.start.y : y,
                        w,
                        h,
                    };
                    if (tool === 'text')
                        Object.assign(payload, {
                            text: '',
                            font: '16px sans-serif',
                            color: '#111',
                            align: 'left',
                            lineHeight: 1.3,
                        });
                    if (tool === 'polygon') payload.sides = polygonSides;
                    if (tool === 'star') {
                        payload.points = starPoints;
                        payload.innerRatio = starInnerRatio;
                    }
                    dispatch(actions.addShape(payload));
                    if (tool === 'text')
                        setTimeout(() => {
                            const f = shapesRef.current.find(
                                (s) =>
                                    s.type === 'text' &&
                                    s.id === focusRef.current
                            );
                            if (f) beginTextEdit(f);
                        }, 0);
                    dispatch(actions.setTool('select'));
                }
                const octx = ovRef.current.getContext('2d');
                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
            } else if (ds.type === 'freedraw') {
                const pts = ds.path || [];
                const bbox = computeBBox(pts);
                if (pts.length >= 2 && bbox) {
                    dispatch(actions.historyStart());
                    let { minX, minY, w, h } = bbox;
                    const MIN_SIDE = 2;
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
                    const pathUV = normalizePath(pts, { minX, minY, w, h });
                    dispatch(
                        actions.addShape({
                            type: 'path',
                            x: minX,
                            y: minY,
                            w,
                            h,
                            path: pathUV,
                            strokeWidth: 2,
                        })
                    );
                    dispatch(actions.setTool('select'));
                }
                const octx = ovRef.current.getContext('2d');
                octx.clearRect(0, 0, ovRef.current.width, ovRef.current.height);
            }
            if (ds.type === 'pan') {
                dragRef.current = null;
                return;
            }
            dragRef.current = null;
        }

        function onWheel(e) {
            const delta = e.deltaY;
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
            if (newScale !== scale) {
                const wx = (xs - tx) / scale,
                    wy = (ys - ty) / scale; // world point under cursor
                const ntx = xs - wx * newScale;
                const nty = ys - wy * newScale;
                dispatch(
                    actions.setView({ scale: newScale, tx: ntx, ty: nty })
                );
            }
        }

        ov.addEventListener('dblclick', onDbl);
        ov.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        ov.addEventListener('wheel', onWheel, { passive: false });

        return () => {
            ov.removeEventListener('dblclick', onDbl);
            ov.removeEventListener('mousedown', onDown);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            ov.removeEventListener('wheel', onWheel);
        };
    }, [
        ovRef,
        hitRef,
        viewRef,
        toolRef,
        shapesRef,
        focusRef,
        polygonSides,
        starPoints,
        starInnerRatio,
        dispatch,
        actions,
        beginTextEdit,
        isNodeDraggingRef,
    ]);
}

export { useStageInteractions };
