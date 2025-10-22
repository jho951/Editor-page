import { idToRGB } from '../constant/constants';
import { denormPath } from '../util/geometry';
import {
    drawLinePath,
    drawEllipsePath,
    drawPolygonPath,
    drawStarPath,
    strokePath,
} from '../util/paths';

export function renderHitmap(ctx, shapes, view) {
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.imageSmoothingEnabled = false;
    const { scale, tx, ty } = view;
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    for (const s of shapes) {
        const { r, g, b } = idToRGB(s.pickId);
        const col = `rgb(${r},${g},${b})`;
        ctx.fillStyle = col;
        ctx.strokeStyle = col;

        if (s.type === 'rect') {
            ctx.fillRect(s.x, s.y, s.w, s.h);
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 8 / scale);
            ctx.strokeRect(s.x, s.y, s.w, s.h);
        } else if (s.type === 'line') {
            drawLinePath(ctx, s.x, s.y, s.w, s.h);
            ctx.lineWidth = Math.max(s.strokeWidth || 2, 12);
            ctx.stroke();
        } else if (s.type === 'path') {
            const pts = denormPath(s.path, s.x, s.y, s.w, s.h);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.lineWidth = Math.max(s.strokeWidth || 2, 10);
            strokePath(ctx, pts);
        } else if (s.type === 'text') {
            ctx.fillRect(s.x, s.y, s.w, s.h);
            ctx.lineWidth = 6;
            ctx.strokeRect(s.x, s.y, s.w, s.h);
        } else {
            if (s.type === 'ellipse') drawEllipsePath(ctx, s.x, s.y, s.w, s.h);
            else if (s.type === 'polygon')
                drawPolygonPath(ctx, s.x, s.y, s.w, s.h, s.sides);
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
            ctx.fill();
            ctx.lineWidth = Math.max(s.strokeWidth || 2, 8);
            ctx.stroke();
        }
    }
    ctx.restore();
}
