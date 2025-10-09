import { bboxOfPoints, drawStrokeFill, translatePoints } from './_common';

function buildRegularPolygon(a, b, sides = 6) {
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    const r = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) / 2;
    const startAngle = -Math.PI / 2;
    const pts = [];
    for (let i = 0; i < sides; i++) {
        const ang = startAngle + (i * 2 * Math.PI) / sides;
        pts.push({ x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
    }
    return { cx, cy, r, points: pts, bbox: bboxOfPoints(pts) };
}

export const Polygon = {
    key: 'polygon',
    begin(state, p, style) {
        state.a = p;
        state.b = p;
        state.sides = Math.max(3, Number(style?.sides ?? 6));
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
        const poly = buildRegularPolygon(state.a, state.b, state.sides);
        drawStrokeFill(
            ctx,
            (g) => {
                g.moveTo(poly.points[0].x, poly.points[0].y);
                for (let i = 1; i < poly.points.length; i++)
                    g.lineTo(poly.points[i].x, poly.points[i].y);
                g.closePath();
            },
            { stroke: state.stroke, fill: state.fill }
        );
    },
    end(state) {
        const poly = buildRegularPolygon(state.a, state.b, state.sides);
        return {
            type: 'polygon',
            sides: state.sides,
            points: poly.points,
            stroke: state.stroke,
            fill: state.fill,
            bbox: poly.bbox,
        };
    },
    render(ctx, item) {
        drawStrokeFill(
            ctx,
            (g) => {
                g.moveTo(item.points[0].x, item.points[0].y);
                for (let i = 1; i < item.points.length; i++)
                    g.lineTo(item.points[i].x, item.points[i].y);
                g.closePath();
            },
            { stroke: item.stroke, fill: item.fill }
        );
    },
    hitTest(item, x, y) {
        const { bbox, points } = item || {};
        if (!bbox) return false;
        if (
            x < bbox.x ||
            y < bbox.y ||
            x > bbox.x + bbox.w ||
            y > bbox.y + bbox.h
        )
            return false;
        // 홀짝법
        let inside = false;
        for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
            const xi = points[i].x,
                yi = points[i].y,
                xj = points[j].x,
                yj = points[j].y;
            const intersect =
                yi > y !== yj > y &&
                x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-6) + xi;
            if (intersect) inside = !inside;
        }
        if (inside) return true;
        // 외곽선 근접
        const pad = Math.max(4, item.stroke?.width || 2);
        for (let i = 0; i < points.length; i++) {
            const a = points[i],
                b = points[(i + 1) % points.length];
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
            if (dx * dx + dy * dy <= pad * pad) return true;
        }
        return false;
    },
    translate(item, dx, dy) {
        item.points = translatePoints(item.points, dx, dy);
        item.bbox = { ...item.bbox, x: item.bbox.x + dx, y: item.bbox.y + dy };
    },
};
