import { bboxOfPoints, drawStrokeFill, translatePoints } from './_common';

function buildStar(a, b, spikes = 5, innerRatio = 0.5) {
    const cx = (a.x + b.x) / 2;
    const cy = (a.y + b.y) / 2;
    const r = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) / 2;
    const rOuter = r;
    const rInner = Math.max(0.1, Math.min(0.9, innerRatio)) * r;
    const pts = [];
    let angle = -Math.PI / 2;
    const step = Math.PI / spikes;
    for (let i = 0; i < spikes * 2; i++) {
        const rr = i % 2 === 0 ? rOuter : rInner;
        pts.push({
            x: cx + rr * Math.cos(angle),
            y: cy + rr * Math.sin(angle),
        });
        angle += step;
    }
    return { cx, cy, rOuter, rInner, points: pts, bbox: bboxOfPoints(pts) };
}

export const Star = {
    key: 'star',
    begin(state, p, style) {
        state.a = p;
        state.b = p;
        state.spikes = Math.max(3, Number(style?.spikes ?? 5));
        state.innerRatio = Number(style?.innerRatio ?? 0.5);
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
        const star = buildStar(
            state.a,
            state.b,
            state.spikes,
            state.innerRatio
        );
        drawStrokeFill(
            ctx,
            (g) => {
                g.moveTo(star.points[0].x, star.points[0].y);
                for (let i = 1; i < star.points.length; i++)
                    g.lineTo(star.points[i].x, star.points[i].y);
                g.closePath();
            },
            { stroke: state.stroke, fill: state.fill }
        );
    },
    end(state) {
        const star = buildStar(
            state.a,
            state.b,
            state.spikes,
            state.innerRatio
        );
        return {
            type: 'star',
            points: star.points,
            spikes: state.spikes,
            innerRatio: state.innerRatio,
            stroke: state.stroke,
            fill: state.fill,
            bbox: star.bbox,
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
        // 내부 판정
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
