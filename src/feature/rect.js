import { drawStrokeFill } from './_common';

function mkRect(a, b) {
    const x = Math.min(a.x, b.x),
        y = Math.min(a.y, b.y);
    const w = Math.abs(a.x - b.x),
        h = Math.abs(a.y - b.y);
    return { x, y, w, h };
}

export const Rect = {
    key: 'rect',
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
        const r = mkRect(state.a, state.b);
        drawStrokeFill(
            ctx,
            (c) => {
                c.rect(r.x, r.y, r.w, r.h);
            },
            { stroke: state.stroke, fill: state.fill }
        );
    },
    end(state) {
        const r = mkRect(state.a, state.b);
        return {
            type: 'rect',
            ...r,
            stroke: state.stroke,
            fill: state.fill,
            bbox: { ...r },
        };
    },
    render(ctx, item) {
        drawStrokeFill(
            ctx,
            (c) => {
                c.rect(item.x, item.y, item.w, item.h);
            },
            { stroke: item.stroke, fill: item.fill }
        );
    },
    hitTest(item, x, y) {
        const { x: ix, y: iy, w, h } = item;
        if (x < ix || y < iy || x > ix + w || y > iy + h) return false;
        if (item.fill && (item.fill.opacity ?? 0) > 0) return true;
        const pad = Math.max(4, item.stroke?.width || 2);
        const nearLeft = Math.abs(x - ix) <= pad && y >= iy && y <= iy + h;
        const nearRight =
            Math.abs(x - (ix + w)) <= pad && y >= iy && y <= iy + h;
        const nearTop = Math.abs(y - iy) <= pad && x >= ix && x <= ix + w;
        const nearBottom =
            Math.abs(y - (iy + h)) <= pad && x >= ix && x <= ix + w;
        return nearLeft || nearRight || nearTop || nearBottom;
    },
    translate(item, dx, dy) {
        item.x += dx;
        item.y += dy;
        item.bbox = { x: item.x, y: item.y, w: item.w, h: item.h };
    },
};
