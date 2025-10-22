import { denormPath } from './geometry';

export function renderOverlay(ctx, focusedShape, view) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!focusedShape) return;
    ctx.save();
    const { scale, tx, ty } = view;
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgb(76,139,245)';
    ctx.lineWidth = 1;
    ctx.strokeRect(
        focusedShape.x,
        focusedShape.y,
        focusedShape.w,
        focusedShape.h
    );

    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'rgb(76,139,245)';
    ctx.lineWidth = 1;
    const s = 8;
    const f = focusedShape;
    const midX = f.x + f.w / 2,
        midY = f.y + f.h / 2;
    const boxes = [
        { x: f.x - s / 2, y: f.y - s / 2 },
        { x: midX - s / 2, y: f.y - s / 2 },
        { x: f.x + f.w - s / 2, y: f.y - s / 2 },
        { x: f.x - s / 2, y: midY - s / 2 },
        { x: f.x + f.w - s / 2, y: midY - s / 2 },
        { x: f.x - s / 2, y: f.y + f.h - s / 2 },
        { x: midX - s / 2, y: f.y + f.h - s / 2 },
        { x: f.x + f.w - s / 2, y: f.y + f.h - s / 2 },
    ];
    for (const r of boxes) {
        ctx.fillRect(r.x, r.y, s, s);
        ctx.strokeRect(r.x, r.y, s, s);
    }

    if (focusedShape.type === 'path' && Array.isArray(focusedShape.path)) {
        const pts = denormPath(focusedShape.path, f.x, f.y, f.w, f.h);
        const r = Math.max(3, 3 / scale);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgb(76,139,245)';
        for (const p of pts) {
            ctx.beginPath();
            ctx.rect(p.x - r, p.y - r, 2 * r, 2 * r);
            ctx.fill();
            ctx.stroke();
        }
    }
    ctx.restore();
}
