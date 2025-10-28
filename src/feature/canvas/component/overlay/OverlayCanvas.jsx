import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setCanvasSize } from '@/feature/canvas/util/setup';
import { renderOverlay } from '../../service/render-overlay';
import { screenToWorld } from '@/feature/canvas/util/view';

import {
    setFocus,
    clearFocus,
    moveShape,
    addShape,
    undo,
    redo,
} from '@/feature/canvas/state/canvas.slice';

const OverlayCanvas = forwardRef(function OverlayCanvas(
    { width, height, view, getPickId, tool, focusedId },
    ref
) {
    const dispatch = useDispatch();
    const shapes = useSelector((s) => s.canvas.items);

    // 드로잉 상태
    const dragRef = useRef(null); // 공용: { id?, startX, startY, origin?, type?, temp? }

    // 렌더 (선택 박스/핸들/임시 박스)
    useEffect(() => {
        if (!ref?.current || width <= 0 || height <= 0) return;
        setCanvasSize(ref.current, width, height, { alpha: true });
        const ctx = ref.current.getContext('2d');

        const focused = Array.isArray(shapes)
            ? shapes.find((s) => s.id === focusedId) || null
            : null;

        // 기본 오버레이
        renderOverlay(ctx, focused, view);

        // 툴 임시 도형(예: rect 드래그 중)
        const drag = dragRef.current;
        if (drag && drag.type === 'rect' && drag.temp) {
            ctx.save();
            const { x, y, w, h } = drag.temp;
            ctx.setLineDash([6, 4]);
            ctx.strokeStyle = 'rgb(76,139,245)';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, w, h);
            ctx.restore();
        }

        // path 그리기 중 미리보기
        if (drag && drag.type === 'path' && Array.isArray(drag.tempPoints)) {
            ctx.save();
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgb(76,139,245)';
            ctx.lineWidth = 1 / Math.max(view?.scale || 1, 1);
            ctx.beginPath();
            drag.tempPoints.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
            ctx.restore();
        }
    }, [width, height, shapes, focusedId, view, ref]);

    const getLocalPixel = useCallback(
        (evt) => {
            const c = ref?.current;
            if (!c) return { px: 0, py: 0 };
            const r = c.getBoundingClientRect();
            const px = (evt.clientX - r.left) * (c.width / r.width);
            const py = (evt.clientY - r.top) * (c.height / r.height);
            return { px, py };
        },
        [ref]
    );

    const toWorld = useCallback(
        (px, py) => {
            const v = view ?? { scale: 1, tx: 0, ty: 0 };
            return screenToWorld(v, px, py);
        },
        [view]
    );

    // 포인터 다운
    const onPointerDown = useCallback(
        (evt) => {
            const { px, py } = getLocalPixel(evt);
            const wpt = toWorld(px, py);

            if (tool === 'select') {
                const id = getPickId?.(evt.clientX, evt.clientY) ?? null;
                if (id) {
                    dispatch(setFocus(id));
                    // 이동 준비
                    const s = shapes.find((it) => it.id === id);
                    dragRef.current = s
                        ? {
                              type: 'move',
                              id,
                              startX: wpt.x,
                              startY: wpt.y,
                              originX: s.x ?? 0,
                              originY: s.y ?? 0,
                          }
                        : null;
                } else {
                    dispatch(clearFocus());
                    dragRef.current = null;
                }
                return;
            }

            if (tool === 'rect') {
                dragRef.current = {
                    type: 'rect',
                    startX: wpt.x,
                    startY: wpt.y,
                    temp: { x: wpt.x, y: wpt.y, w: 0, h: 0 },
                };
                return;
            }

            if (tool === 'path') {
                // path는 드래그가 아니라 클릭/이동으로 점 추가 (간단판: 드래그로 샘플링)
                dragRef.current = {
                    type: 'path',
                    tempPoints: [{ x: wpt.x, y: wpt.y }],
                };
                return;
            }

            // TODO: ellipse/line/polygon/star/text 등은 동일 패턴으로 확장
        },
        [dispatch, tool, shapes, getPickId, getLocalPixel, toWorld]
    );

    // 포인터 무브
    const onPointerMove = useCallback(
        (evt) => {
            const drag = dragRef.current;
            if (!drag) return;

            const { px, py } = getLocalPixel(evt);
            const wpt = toWorld(px, py);

            if (drag.type === 'move') {
                const dx = wpt.x - drag.startX;
                const dy = wpt.y - drag.startY;
                dispatch(
                    moveShape({
                        id: drag.id,
                        x: drag.originX + dx,
                        y: drag.originY + dy,
                    })
                );
                return;
            }

            if (drag.type === 'rect') {
                const x = Math.min(drag.startX, wpt.x);
                const y = Math.min(drag.startY, wpt.y);
                const w = Math.max(1, Math.abs(wpt.x - drag.startX));
                const h = Math.max(1, Math.abs(wpt.y - drag.startY));
                drag.temp = { x, y, w, h };
                // 리렌더 트리거는 상위 useEffect deps(폭/높이/상태)로 충분 (여기선 직접 ctx 갱신 X)
                return;
            }

            if (drag.type === 'path') {
                // 간단: 이동 시 점 추가(샘플링). 실제로는 거리/시간 조건으로 간헐 샘플 추천.
                drag.tempPoints.push({ x: wpt.x, y: wpt.y });
                return;
            }
        },
        [dispatch, getLocalPixel, toWorld]
    );

    // 포인터 업
    const onPointerUp = useCallback(() => {
        const drag = dragRef.current;
        if (!drag) return;

        if (drag.type === 'rect' && drag.temp) {
            const { x, y, w, h } = drag.temp;
            dispatch(
                addShape({
                    type: 'rect',
                    id: crypto.randomUUID?.() || String(Date.now()),
                    x,
                    y,
                    w,
                    h,
                    fill: 'transparent',
                    stroke: '#222',
                    strokeWidth: 2,
                })
            );
        }

        if (
            drag.type === 'path' &&
            Array.isArray(drag.tempPoints) &&
            drag.tempPoints.length > 1
        ) {
            dispatch(
                addShape({
                    type: 'path',
                    id: crypto.randomUUID?.() || String(Date.now()),
                    path: drag.tempPoints,
                    closePath: false,
                    stroke: '#222',
                    strokeWidth: 2,
                })
            );
        }

        dragRef.current = null;
    }, [dispatch]);

    const onKeyDown = useCallback(
        (evt) => {
            if ((evt.metaKey || evt.ctrlKey) && evt.key.toLowerCase() === 'z') {
                evt.preventDefault();
                if (evt.shiftKey) dispatch(redo());
                else dispatch(undo());
            }
        },
        [dispatch]
    );

    return (
        <canvas
            ref={ref}
            className="layer-overlay"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onKeyDown={onKeyDown}
            tabIndex={0}
        />
    );
});

export default OverlayCanvas;
