import {
    bboxOfPoints,
    drawStrokeFill,
    hitTestPolyline,
    translatePoints,
} from './_common';

function simplifyRDP(points, epsilon = 1.2) {
    if (!points || points.length < 3) return points || [];
    const distPointToLine = (a, b, p) => {
        const A = b.y - a.y,
            B = a.x - b.x,
            C = b.x * a.y - a.x * b.y;
        return Math.abs(A * p.x + B * p.y + C) / Math.hypot(A, B);
    };
    const rec = (pts) => {
        let maxD = 0,
            idx = -1;
        for (let i = 1; i < pts.length - 1; i++) {
            const d = distPointToLine(pts[0], pts[pts.length - 1], pts[i]);
            if (d > maxD) {
                maxD = d;
                idx = i;
            }
        }
        if (maxD > epsilon) {
            const left = rec(pts.slice(0, idx + 1));
            const right = rec(pts.slice(idx));
            return left.slice(0, -1).concat(right);
        }
        return [pts[0], pts[pts.length - 1]];
    };
    return rec(points);
}

function quantize(points, step = 0.5) {
    const s = 1 / step;
    return points.map((p) => ({
        x: Math.round(p.x * s) / s,
        y: Math.round(p.y * s) / s,
    }));
}

function drawer(points) {
    return (ctx) => {
        if (!points?.length) return;
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);
    };
}

export const Path = {
    key: 'path',
    begin(state, p, style) {
        state.points = [p];
        state.stroke = {
            color: style?.strokeColor ?? '#000',
            width: Number(style?.strokeWidth ?? 3),
            opacity: Number(style?.strokeOpacity ?? 1),
            dash: style?.strokeDash || [],
        };
        state.fill = null;
    },
    update(state, p) {
        const last = state.points[state.points.length - 1];
        if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 0.5)
            state.points.push(p);
    },
    preview(ctx, state) {
        if (!state?.points || state.points.length < 2) return;
        drawStrokeFill(ctx, drawer(state.points), {
            stroke: state.stroke,
            fill: state.fill,
        });
    },
    end(state) {
        let pts = simplifyRDP(state.points, 1.2);
        pts = quantize(pts, 0.5);
        const bbox = bboxOfPoints(pts, state.stroke?.width);
        return {
            type: 'path',
            points: pts,
            stroke: state.stroke,
            fill: null,
            bbox,
        };
    },
    render(ctx, item) {
        drawStrokeFill(ctx, drawer(item.points), {
            stroke: item.stroke,
            fill: item.fill,
        });
    },
    hitTest(item, x, y) {
        const { bbox, stroke } = item || {};
        if (!bbox) return false;
        if (
            x < bbox.x ||
            y < bbox.y ||
            x > bbox.x + bbox.w ||
            y > bbox.y + bbox.h
        )
            return false;
        return hitTestPolyline(item.points || [], x, y, stroke?.width || 2);
    },
    translate(item, dx, dy) {
        item.points = translatePoints(item.points, dx, dy);
        item.bbox = { ...item.bbox, x: item.bbox.x + dx, y: item.bbox.y + dy };
    },
};
