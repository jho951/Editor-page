/**
 * 도형별 고유 pickId를 RGB로 인코딩해 히트맵(픽 버퍼)에 렌더
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<Object>} shapes
 * @param {{scale:number, tx:number, ty:number}} view
 */
export function renderHitmap(ctx, shapes, view) {
    const v = view ?? { scale: 1, tx: 0, ty: 0 };
    const { scale = 1, tx = 0, ty = 0 } = v;

    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.imageSmoothingEnabled = false;

    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    const list = Array.isArray(shapes) ? shapes : [];

    for (const s of list) {
        const { r, g, b } = idToRGB(s.pickId);
        const col = `rgb(${r},${g},${b})`;
        ctx.fillStyle = col;
        ctx.strokeStyle = col;

        if (s.type === 'rect') {
            ctx.fillRect(s.x, s.y, s.w, s.h);
            // 테두리/굵기도 동일 색으로
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 1);
            ctx.strokeRect(s.x, s.y, s.w, s.h);
            continue;
        }

        if (s.type === 'ellipse') {
            ctx.beginPath();
            drawEllipse(ctx, s.x, s.y, s.w, s.h);
            ctx.fill();
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 1);
            ctx.stroke();
            continue;
        }

        if (s.type === 'line') {
            ctx.beginPath();
            ctx.moveTo(s.x1 ?? s.x, s.y1 ?? s.y);
            ctx.lineTo(s.x2 ?? s.x + s.w, s.y2 ?? s.y + s.h);
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 1);
            ctx.stroke();
            continue;
        }

        if (s.type === 'polygon') {
            ctx.beginPath();
            drawRegularPolygon(ctx, s.x, s.y, s.w, s.h, s.sides || 5);
            ctx.fill();
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 1);
            ctx.stroke();
            continue;
        }

        if (s.type === 'star') {
            ctx.beginPath();
            drawStar(
                ctx,
                s.x,
                s.y,
                s.w,
                s.h,
                s.points || 5,
                s.innerRatio || 0.5
            );
            ctx.fill();
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 1);
            ctx.stroke();
            continue;
        }

        if (s.type === 'path' && Array.isArray(s.path)) {
            ctx.beginPath();
            for (let i = 0; i < s.path.length; i++) {
                const p = s.path[i];
                const x = p.x ?? p[0];
                const y = p.y ?? p[1];
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            if (s.closePath) ctx.closePath();
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 6); // 피킹은 두껍게
            ctx.stroke();
            continue;
        }

        if (s.type === 'text') {
            // 텍스트는 박스로 처리(간략)
            const w = Math.max(1, s.w || 40);
            const h = Math.max(1, s.h || 20);
            ctx.fillRect(s.x, s.y, w, h);
            continue;
        }
    }

    ctx.restore();
}

/* -------- helpers (히트맵 전용 간단 도형) -------- */
function idToRGB(id) {
    const n = Number.isInteger(id) ? id : 0;
    return {
        r: (n >> 16) & 255,
        g: (n >> 8) & 255,
        b: n & 255,
    };
}

function drawEllipse(ctx, x, y, w, h) {
    const rx = Math.abs(w) / 2;
    const ry = Math.abs(h) / 2;
    const cx = x + rx;
    const cy = y + ry;
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
}

function drawRegularPolygon(ctx, x, y, w, h, sides) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const r = Math.min(Math.abs(w), Math.abs(h)) / 2;
    for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}

function drawStar(ctx, x, y, w, h, points, innerRatio) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const outer = Math.min(Math.abs(w), Math.abs(h)) / 2;
    const inner = outer * innerRatio;
    const total = points * 2;
    for (let i = 0; i < total; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i / total) * Math.PI * 2 - Math.PI / 2;
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
}
