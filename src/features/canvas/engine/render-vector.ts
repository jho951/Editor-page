import type { Shape } from '../types.ts';
import type { ViewTransform } from '../util/view.ts';
import { denormPath } from './geometry.ts';
import {
  drawLinePath,
  drawEllipsePath,
  drawPolygonPath,
  drawStarPath,
  strokePath,
} from '../util/paths.ts';
import { wrapLines } from '../util/text.ts';

export interface RenderVectorOptions {
  editingId?: number | null;
}

export function renderVector(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[] | null | undefined,
  view: Partial<ViewTransform> | null | undefined,
  { editingId }: RenderVectorOptions = {}
): void {
  const v = view ?? { scale: 1, tx: 0, ty: 0 };
  const { scale = 1, tx = 0, ty = 0 } = v;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  const list = Array.isArray(shapes) ? shapes : [];

  for (const s of list) {
    // 편집 중 텍스트/경로 등을 스킵하고 싶다면 여기서 분기 가능
    void editingId;

    const fill = s.fill || 'transparent';
    const stroke = s.stroke || '#222';
    const strokeWidth = Math.max(1, Number(s.strokeWidth) || 1);

    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth;

    if (s.type === 'rect') {
      if (fill !== 'transparent') ctx.fillRect(s.x, s.y, s.w, s.h);
      if (strokeWidth > 0) ctx.strokeRect(s.x, s.y, s.w, s.h);
      continue;
    }

    if (s.type === 'ellipse') {
      drawEllipsePath(ctx, s.x, s.y, s.w, s.h);
      if (fill !== 'transparent') ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      continue;
    }

    if (s.type === 'line') {
      ctx.beginPath();
      drawLinePath(
        ctx,
        s.x1 ?? s.x,
        s.y1 ?? s.y,
        s.x2 ?? s.x + s.w,
        s.y2 ?? s.y + s.h
      );
      if (strokeWidth > 0) ctx.stroke();
      continue;
    }

    if (s.type === 'polygon') {
      ctx.beginPath();
      drawPolygonPath(ctx, s.x, s.y, s.w, s.h, s.sides || 5);
      if (fill !== 'transparent') ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      continue;
    }

    if (s.type === 'star') {
      ctx.beginPath();
      drawStarPath(ctx, s.x, s.y, s.w, s.h, s.points || 5, s.innerRatio || 0.5);
      if (fill !== 'transparent') ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      continue;
    }

    if (s.type === 'path') {
      const path = denormPath(s.path ?? [], s.x, s.y, s.w, s.h);
      strokePath(ctx, path, { close: s.closePath });
      continue;
    }

    if (s.type === 'text') {
      const font = s.font || '16px/1.3 system-ui, -apple-system, Segoe UI, Roboto';
      const color = s.color || '#111';
      const align = s.align || 'left';
      const lineHeight = s.lineHeight || 1.3;

      ctx.fillStyle = color;
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = 'top';

      const lines = wrapLines(ctx, s.text || '', Math.max(1, s.w || 1));
      let y = s.y;
      for (const ln of lines) {
        ctx.fillText(ln, s.x, y);
        const px = parseInt(font, 10) || 16;
        y += px * lineHeight;
      }
      continue;
    }
  }

  ctx.restore();
}
