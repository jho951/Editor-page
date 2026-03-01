import { OVERLAY } from '../config/constants.ts';
import { denormPath, type Point } from './geometry.ts';
import type { Shape } from '../types.ts';
import type { ViewTransform } from '../util/view.ts';

type BBox = { x: number; y: number; w: number; h: number };

/** view(패닝/줌) 기준으로 ctx 변환을 적용해주는 헬퍼 */
function withViewTransform(
  ctx: CanvasRenderingContext2D,
  view: Partial<ViewTransform> | null | undefined,
  draw: () => void
): void {
  const scale = view?.scale ?? 1;
  const tx = view?.tx ?? 0;
  const ty = view?.ty ?? 0;

  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);
  try {
    draw();
  } finally {
    ctx.restore();
  }
}

function setStrokeStyle(
  ctx: CanvasRenderingContext2D,
  opts: { color?: string; width?: number; dash?: readonly number[] } = {}
): void {
  const color = opts.color ?? OVERLAY.focusStroke;
  const width = opts.width ?? OVERLAY.lineWidth;
  const dash = opts.dash ?? [];
  ctx.setLineDash([...dash]);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
}

function setFillStyle(ctx: CanvasRenderingContext2D, color: string = OVERLAY.focusFill): void {
  ctx.fillStyle = color;
}

function getHandleRects(bbox: BBox, size: number = OVERLAY.handleSize): Array<{ x: number; y: number }> {
  const { x, y, w, h } = bbox;
  const s = size;
  const midX = x + w / 2;
  const midY = y + h / 2;
  return [
    { x: x - s / 2, y: y - s / 2 },
    { x: midX - s / 2, y: y - s / 2 },
    { x: x + w - s / 2, y: y - s / 2 },
    { x: x - s / 2, y: midY - s / 2 },
    { x: x + w - s / 2, y: midY - s / 2 },
    { x: x - s / 2, y: y + h - s / 2 },
    { x: midX - s / 2, y: y + h - s / 2 },
    { x: x + w - s / 2, y: y + h - s / 2 },
  ];
}

function drawFocusBoxAndHandles(ctx: CanvasRenderingContext2D, bbox: BBox): void {
  setStrokeStyle(ctx, { color: OVERLAY.focusStroke, width: OVERLAY.lineWidth, dash: OVERLAY.dash });
  ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);

  setFillStyle(ctx, OVERLAY.focusFill);
  setStrokeStyle(ctx, { color: OVERLAY.focusStroke, width: OVERLAY.lineWidth, dash: [] });
  for (const r of getHandleRects(bbox, OVERLAY.handleSize)) {
    ctx.fillRect(r.x, r.y, OVERLAY.handleSize, OVERLAY.handleSize);
    ctx.strokeRect(r.x, r.y, OVERLAY.handleSize, OVERLAY.handleSize);
  }
}

function drawPathEditNodes(ctx: CanvasRenderingContext2D, focusedShape: Shape, scale: number = 1): void {
  if (focusedShape.type !== 'path' || !Array.isArray(focusedShape.path)) return;

  const { x, y, w, h } = focusedShape;
  const pts: Point[] = denormPath(focusedShape.path, x, y, w, h);
  const r = Math.max(3, 3 / (scale || 1));

  setFillStyle(ctx, OVERLAY.focusFill);
  setStrokeStyle(ctx, { color: OVERLAY.focusStroke, width: OVERLAY.lineWidth, dash: [] });

  for (const p of pts) {
    ctx.beginPath();
    ctx.rect(p.x - r, p.y - r, 2 * r, 2 * r);
    ctx.fill();
    ctx.stroke();
  }
}

export function renderOverlay(
  ctx: CanvasRenderingContext2D,
  focusedShape: Shape | null | undefined,
  view: Partial<ViewTransform> | null | undefined
): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (!focusedShape) return;

  withViewTransform(ctx, view, () => {
    const bbox: BBox = { x: focusedShape.x, y: focusedShape.y, w: focusedShape.w, h: focusedShape.h };
    drawFocusBoxAndHandles(ctx, bbox);
    drawPathEditNodes(ctx, focusedShape, view?.scale ?? 1);
  });
}
