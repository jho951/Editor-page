import { denormPath } from '../util/geometry';
import {
    drawLinePath,
    drawEllipsePath,
    drawPolygonPath,
    drawStarPath,
    strokePath,
} from '../util/paths';
import { wrapLines } from '../util/text';

export function renderVector(ctx, shapes, view, { editingId } = {}) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
    const { scale, tx, ty } = view;
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    for (const s of shapes) {
        ctx.save();
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
            if (editingId === s.id) {
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
            const lines = wrapLines(ctx, s.text || '', Math.max(0, s.w));
            const lhPx = parseInt(font, 10) * lh;
            let x = s.x;
            if (align === 'center') x = s.x + s.w / 2;
            else if (align === 'right') x = s.x + s.w;
            ctx.textAlign = align;
            for (let i = 0; i < lines.length; i++) {
                const yy = s.y + i * lhPx;
                if (yy > s.y + s.h) break;
                ctx.fillText(lines[i], x, yy, s.w);
            }
        } else {
            if (s.type === 'ellipse') drawEllipsePath(ctx, s.x, s.y, s.w, s.h);
            else if (s.type === 'polygon')
                drawPolygonPath(ctx, s.x, s.y, s.w, s.h, s.sides || 5);
            else if (s.type === 'star')
                drawStarPath(
                    ctx,
                    s.x,
                    s.y,
                    s.w,
                    s.h,
                    s.points || 5,
                    s.innerRatio || 0.5
                );
            if (s.fill) ctx.fill();
            ctx.stroke();
        }
        ctx.restore();
    }
    ctx.restore();
}
