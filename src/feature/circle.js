import { drawStrokeFill } from './_common';

function circleFrom(a, b) {
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    const rx = Math.abs(a.x - b.x) / 2;
    const ry = Math.abs(a.y - b.y) / 2;
    const r = Math.max(rx, ry);
    return { cx, cy, r, bbox: { x: cx - r, y: cy - r, w: r * 2, h: r * 2 } };
}

export const Circle = {
    key: 'circle',
    begin(state, p, style) {
        state.a = p;
        state.b = p;
        state.stroke = {
            color: style?.strokeColor ?? '#000',
            width: Number(style?.strokeWidth ?? 2),
            opacity: Number(style?.strokeOpacity ?? 1),
            dash: style?.strokeDash || [],
        };
        state.fill =
            style?.fillColor && (style?.fillOpacity ?? 0) > 0
                ? {
                      color: style.fillColor,
                      opacity: Number(style.fillOpacity ?? 1),
                  }
                : null;
    },
    update(state, p) {
        state.b = p;
    },
    preview(ctx, state) {
        const c = circleFrom(state.a, state.b);
        drawStrokeFill(
            ctx,
            (g) => {
                g.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
            },
            { stroke: state.stroke, fill: state.fill }
        );
    },
    end(state) {
        const c = circleFrom(state.a, state.b);
        return {
            type: 'circle',
            cx: c.cx,
            cy: c.cy,
            r: c.r,
            stroke: state.stroke,
            fill: state.fill,
            bbox: c.bbox,
        };
    },
    render(ctx, item) {
        drawStrokeFill(
            ctx,
            (g) => {
                g.arc(item.cx, item.cy, item.r, 0, Math.PI * 2);
            },
            { stroke: item.stroke, fill: item.fill }
        );
    },
    hitTest(item, x, y) {
        const bb = item.bbox;
        if (!bb) return false;
        if (x < bb.x || y < bb.y || x > bb.x + bb.w || y > bb.y + bb.h)
            return false;
        const d = Math.hypot(x - item.cx, y - item.cy);
        if (item.fill && (item.fill.opacity ?? 0) > 0) return d <= item.r;
        const pad = Math.max(4, item.stroke?.width || 2);
        return Math.abs(d - item.r) <= pad;
    },
    translate(item, dx, dy) {
        item.cx += dx;
        item.cy += dy;
        item.bbox = {
            x: item.cx - item.r,
            y: item.cy - item.r,
            w: item.r * 2,
            h: item.r * 2,
        };
    },
};
