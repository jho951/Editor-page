import { denormPath } from './geometry';
import {
    drawLinePath,
    drawEllipsePath,
    drawPolygonPath,
    drawStarPath,
    strokePath,
} from '../util/paths';
import { wrapLines } from '../util/text';

/**
 * 벡터 도형 렌더 (가시 레이어)
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Object>} shapes
 * @param {{scale:number, tx:number, ty:number}} view
 * @param {{editingId?: string}} [options]
 */
export function renderVector(ctx, shapes, view, { editingId } = {}) {
    const v = view ?? { scale: 1, tx: 0, ty: 0 };
    const { scale = 1, tx = 0, ty = 0 } = v;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    const list = Array.isArray(shapes) ? shapes : [];

    for (const s of list) {
        const fill = s.fill || 'transparent';
        const stroke = s.stroke || '#222';
        const strokeWidth = Math.max(1, Number(s.strokeWidth) || 1);

        ctx.fillStyle = fill;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = strokeWidth;

        if (s.type === 'rect') {
            if (fill !== 'transparent') ctx.fillRect(s.x, s.y, s.w, s.h);
            if (strokeWidth > 0) {
                ctx.strokeRect(s.x, s.y, s.w, s.h);
            }
            continue;
        }

        if (s.type === 'ellipse') {
            ctx.beginPath();
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
            drawStarPath(
                ctx,
                s.x,
                s.y,
                s.w,
                s.h,
                s.points || 5,
                s.innerRatio || 0.5
            );
            if (fill !== 'transparent') ctx.fill();
            if (strokeWidth > 0) ctx.stroke();
            continue;
        }

        if (s.type === 'path') {
            const path = denormPath(s.path);
            strokePath(ctx, path, { close: s.closePath });
            continue;
        }

        if (s.type === 'text') {
            const font =
                s.font || '16px/1.3 system-ui, -apple-system, Segoe UI, Roboto';
            const color = s.color || '#111';
            const align = s.align || 'left';
            const lineHeight = s.lineHeight || 1.3;

            ctx.fillStyle = color;
            ctx.font = font;
            ctx.textAlign = align;
            ctx.textBaseline = 'top';

            const lines = wrapLines(s.text || '', s.w || 1, ctx);
            let y = s.y;
            for (const ln of lines) {
                ctx.fillText(ln, s.x, y);
                // lineHeight가 숫자면 font px*lineHeight, 아니면 1.3배수로
                const px = parseInt(font, 10) || 16;
                y += px * lineHeight;
            }
            continue;
        }

        // 그 외 타입은 무시
    }

    ctx.restore();
}
