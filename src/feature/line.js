import { bboxOfPoints, drawStrokeFill } from './_common';

function drawer(a, b) {
    return (ctx) => {
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
    };
}

export const Line = {
    key: 'line',
    begin(state, p, style) {
        state.a = p;
        state.b = p;
        state.stroke = {
            color: style?.strokeColor ?? '#000',
            width: Number(style?.strokeWidth ?? 2),
            opacity: Number(style?.strokeOpacity ?? 1),
            dash: style?.strokeDash || [],
        };
        state.fill = null;
    },
    update(state, p) {
        state.b = p;
    },
    preview(ctx, state) {
        drawStrokeFill(ctx, drawer(state.a, state.b), {
            stroke: state.stroke,
            fill: null,
        });
    },
    end(state) {
        const pts = [state.a, state.b];
        return {
            type: 'line',
            a: state.a,
            b: state.b,
            stroke: state.stroke,
            fill: null,
            bbox: bboxOfPoints(pts, state.stroke?.width),
        };
    },
    render(ctx, item) {
        drawStrokeFill(ctx, drawer(item.a, item.b), {
            stroke: item.stroke,
            fill: null,
        });
    },
    hitTest(item, x, y) {
        const bb = item.bbox;
        if (!bb) return false;
        if (x < bb.x || y < bb.y || x > bb.x + bb.w || y > bb.y + bb.h)
            return false;
        const a = item.a,
            b = item.b;
        const abx = b.x - a.x,
            aby = b.y - a.y;
        const apx = x - a.x,
            apy = y - a.y;
        const t = Math.max(
            0,
            Math.min(
                1,
                (abx * apx + aby * apy) / (abx * abx + aby * aby + 1e-6)
            )
        );
        const px = a.x + abx * t,
            py = a.y + aby * t;
        const dx = x - px,
            dy = y - py;
        const r = Math.max(4, (item.stroke?.width || 2) / 1.6);
        return dx * dx + dy * dy <= r * r;
    },
    translate(item, dx, dy) {
        item.a = { x: item.a.x + dx, y: item.a.y + dy };
        item.b = { x: item.b.x + dx, y: item.b.y + dy };
        item.bbox = { ...item.bbox, x: item.bbox.x + dx, y: item.bbox.y + dy };
    },
};
