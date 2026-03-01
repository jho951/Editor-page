import type { Shape } from '../types.ts';
import type { ViewTransform } from '../util/view.ts';
import { idToRGB } from '../config/constants.ts';
import { drawEllipsePath, drawPolygonPath, drawStarPath } from '../util/paths.ts';

/**
 * 도형별 pickId를 RGB로 인코딩해 히트맵(픽 버퍼)에 렌더링합니다.
 */
export function renderHitmap(
  ctx: CanvasRenderingContext2D,
  shapes: Shape[],
  view: Partial<ViewTransform> | null | undefined
): void {
  const v: ViewTransform = {
    scale: view?.scale ?? 1,
    tx: view?.tx ?? 0,
    ty: view?.ty ?? 0,
  };
  const { scale, tx, ty } = v;

  ctx.save();
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.imageSmoothingEnabled = false;

  ctx.translate(tx, ty);
  ctx.scale(scale, scale);

  for (const s of shapes) {
    const { r, g, b } = idToRGB(s.pickId);
    const col = `rgb(${r},${g},${b})`;
    ctx.fillStyle = col;
    ctx.strokeStyle = col;

    const lw = Math.max((s.strokeWidth ?? 2) / scale, 1);

    if (s.type === 'rect') {
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.lineWidth = lw;
      ctx.strokeRect(s.x, s.y, s.w, s.h);
      continue;
    }

    if (s.type === 'ellipse') {
      drawEllipsePath(ctx, s.x, s.y, s.w, s.h);
      ctx.fill();
      ctx.lineWidth = lw;
      ctx.stroke();
      continue;
    }

    if (s.type === 'line') {
      ctx.beginPath();
      ctx.moveTo(s.x1 ?? s.x, s.y1 ?? s.y);
      ctx.lineTo(s.x2 ?? s.x + s.w, s.y2 ?? s.y + s.h);
      ctx.lineWidth = lw;
      ctx.stroke();
      continue;
    }

    if (s.type === 'polygon') {
      drawPolygonPath(ctx, s.x, s.y, s.w, s.h, s.sides ?? 5);
      ctx.fill();
      ctx.lineWidth = lw;
      ctx.stroke();
      continue;
    }

    if (s.type === 'star') {
      drawStarPath(ctx, s.x, s.y, s.w, s.h, s.points ?? 5, s.innerRatio ?? 0.5);
      ctx.fill();
      ctx.lineWidth = lw;
      ctx.stroke();
      continue;
    }

    if (s.type === 'path' && Array.isArray(s.path)) {
      ctx.beginPath();
      for (let i = 0; i < s.path.length; i++) {
        const p = s.path[i];
        const x = (p as { x?: number; 0?: number }).x ?? (p as unknown as [number, number])[0];
        const y = (p as { y?: number; 1?: number }).y ?? (p as unknown as [number, number])[1];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      if (s.closePath) ctx.closePath();
      ctx.lineWidth = Math.max(lw, 6);
      ctx.stroke();
      continue;
    }

    if (s.type === 'text') {
      const w = Math.max(1, s.w || 40);
      const h = Math.max(1, s.h || 20);
      ctx.fillRect(s.x, s.y, w, h);
      continue;
    }
  }

  ctx.restore();
}
