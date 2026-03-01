import { forwardRef, useCallback, useEffect, useRef, useState, type ReactElement } from 'react';

import { useAppDispatch } from '@app/store/hooks.ts';
import {
  addShape,
  clearFocus,
  historyStart,
  moveShape,
  redo,
  setFocus,
  undo,
} from '../state/canvas.slice.ts';
import { setCanvasSize } from '../util/setup.ts';
import { screenToWorld, type Point as WorldPoint, type ViewTransform } from '../util/view.ts';
import { renderOverlay } from '../engine/render-overlay.ts';
import { computeBBox, normalizePath, type Point as GeoPoint } from '../engine/geometry.ts';


import type { Shape, PathPoint } from '../types.ts';
import type { ToolKind } from '@features/canvas/types.ts';

export interface OverlayCanvasProps {
  width: number;
  height: number;
  view: ViewTransform;
  shapes: Shape[];
  tool: ToolKind;
  focusedId: number | null;
  getPickId: (clientX: number, clientY: number) => number | null;
}

type DragState =
  | {
      kind: 'move';
      id: number;
      last: WorldPoint;
    }
  | {
      kind: 'create';
      tool: ToolKind;
      start: WorldPoint;
      current: WorldPoint;
    }
  | {
      kind: 'freedraw';
      points: GeoPoint[];
    }
  | null;

function rectFromPoints(a: WorldPoint, b: WorldPoint): { x: number; y: number; w: number; h: number } {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const w = Math.abs(b.x - a.x);
  const h = Math.abs(b.y - a.y);
  return { x, y, w, h };
}

export const OverlayCanvas = forwardRef<HTMLCanvasElement, OverlayCanvasProps>(function OverlayCanvas(
  { width, height, view, shapes, tool, focusedId, getPickId },
  ref
): ReactElement {
  const dispatch = useAppDispatch();
  const dragRef = useRef<DragState>(null);
  const [tick, setTick] = useState(0);

  const requestRepaint = () => setTick((t) => (t + 1) % 1_000_000);

  const toWorld = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): WorldPoint => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const xs = e.clientX - rect.left;
      const ys = e.clientY - rect.top;
      return screenToWorld(view, xs, ys);
    },
    [view]
  );

  useEffect(() => {
    if (!ref || typeof ref === 'function' || !ref.current) return;
    if (width <= 0 || height <= 0) return;

    const { ctx } = setCanvasSize(ref.current, width, height, { alpha: true });

    const focused = focusedId != null ? shapes.find((s) => s.id === focusedId) ?? null : null;
    renderOverlay(ctx, focused, view);

    // Drag preview
    const drag = dragRef.current;
    if (!drag) return;

    ctx.save();
    ctx.translate(view.tx, view.ty);
    ctx.scale(view.scale, view.scale);

    if (drag.kind === 'create') {
      const r = rectFromPoints(drag.start, drag.current);
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#4c8bf5';
      ctx.lineWidth = Math.max(1 / (view.scale || 1), 1);

      if (drag.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(drag.start.x, drag.start.y);
        ctx.lineTo(drag.current.x, drag.current.y);
        ctx.stroke();
      } else {
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    }

    if (drag.kind === 'freedraw' && drag.points.length > 1) {
      ctx.setLineDash([]);
      ctx.strokeStyle = '#4c8bf5';
      ctx.lineWidth = Math.max(1 / (view.scale || 1), 1);
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(drag.points[0].x, drag.points[0].y);
      for (let i = 1; i < drag.points.length; i++) ctx.lineTo(drag.points[i].x, drag.points[i].y);
      ctx.stroke();
    }

    ctx.restore();
  }, [width, height, shapes, focusedId, view, ref, tick]);

  const startMove = (id: number, start: WorldPoint) => {
    dragRef.current = { kind: 'move', id, last: start };
  };

  const commitCreate = (toolKind: ToolKind, start: WorldPoint, end: WorldPoint) => {
    // 최소 크기 가드
    const min = 2 / (view.scale || 1);
    const r = rectFromPoints(start, end);
    if (toolKind !== 'line' && (r.w < min || r.h < min)) return;

    dispatch(historyStart());

    if (toolKind === 'text') {
      dispatch(
        addShape({
          type: 'text',
          x: r.x,
          y: r.y,
          w: Math.max(80 / (view.scale || 1), r.w || 120),
          h: Math.max(30 / (view.scale || 1), r.h || 40),
          text: 'Text',
          color: '#111',
        })
      );
      return;
    }

    if (toolKind === 'line') {
      dispatch(
        addShape({
          type: 'line',
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          w: Math.abs(end.x - start.x),
          h: Math.abs(end.y - start.y),
          x1: start.x,
          y1: start.y,
          x2: end.x,
          y2: end.y,
        })
      );
      return;
    }

    const base: Parameters<typeof addShape>[0] = {
      type: toolKind === 'freedraw' ? 'path' : (toolKind as Shape['type']),
      x: r.x,
      y: r.y,
      w: Math.max(min, r.w),
      h: Math.max(min, r.h),
    };

    if (toolKind === 'polygon') base.sides = 5;
    if (toolKind === 'star') {
      base.points = 5;
      base.innerRatio = 0.5;
    }

    dispatch(addShape(base));
  };

  const commitFreeDraw = (pts: GeoPoint[]) => {
    if (pts.length < 2) return;
    const bbox = computeBBox(pts);
    if (!bbox) return;

    const min = 2 / (view.scale || 1);
    const w = Math.max(min, bbox.w || min);
    const h = Math.max(min, bbox.h || min);

    const uv = normalizePath(pts, { minX: bbox.minX, minY: bbox.minY, w, h });
    const path: PathPoint[] = uv.map((p) => ({ u: p.u, v: p.v }));

    dispatch(historyStart());
    dispatch(
      addShape({
        type: 'path',
        x: bbox.minX,
        y: bbox.minY,
        w,
        h,
        path,
        closePath: false,
        strokeWidth: 3,
      })
    );
  };

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.focus();
      const world = toWorld(e);

      if (tool === 'select') {
        const id = getPickId(e.clientX, e.clientY);
        if (id != null) {
          // 이동/리사이즈 등 수정 작업은 history를 먼저 쌓아 Undo가 되게 합니다.
          dispatch(historyStart());
          dispatch(setFocus(id));
          startMove(id, world);
        } else {
          dispatch(clearFocus());
          dragRef.current = null;
        }
        requestRepaint();
        return;
      }

      if (tool === 'freedraw') {
        dragRef.current = { kind: 'freedraw', points: [{ x: world.x, y: world.y }] };
        requestRepaint();
        return;
      }

      // create tools
      dragRef.current = { kind: 'create', tool, start: world, current: world };
      requestRepaint();
    },
    [tool, toWorld, dispatch, getPickId]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const world = toWorld(e);

      if (drag.kind === 'move') {
        const dx = world.x - drag.last.x;
        const dy = world.y - drag.last.y;
        drag.last = world;
        dispatch(moveShape({ id: drag.id, dx, dy }));
        requestRepaint();
        return;
      }

      if (drag.kind === 'create') {
        drag.current = world;
        requestRepaint();
        return;
      }

      if (drag.kind === 'freedraw') {
        drag.points.push({ x: world.x, y: world.y });
        requestRepaint();
      }
    },
    [toWorld, dispatch]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (!drag) return;

      const world = toWorld(e);
      dragRef.current = null;

      if (drag.kind === 'create') {
        commitCreate(drag.tool, drag.start, world);
      } else if (drag.kind === 'freedraw') {
        commitFreeDraw(drag.points);
      }

      requestRepaint();
    },
    [toWorld]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        dispatch(e.shiftKey ? redo() : undo());
        requestRepaint();
      }
    },
    [dispatch]
  );

  return (
    <canvas
      ref={ref}
      className="layer-overlay"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      style={{ touchAction: 'none' }}
    />
  );
});
