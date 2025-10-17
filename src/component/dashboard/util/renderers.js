import { HEADER_ELEMENTS } from '../../header/constant/item';
import { idToRGB, rgbToCss } from './id-color';

export function renderMain(ctx, shapes, selection = []) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (const s of shapes) drawShape(ctx, s);
    for (const id of selection) {
        const s = shapes.find((it) => it.id === id);
        if (!s) continue;
        const { x, y, w, h } = s.bbox;
        ctx.save();
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = '#4c8bf5';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
        drawHandles(ctx, s);
        ctx.restore();
    }
}

export function renderHitmap(ctx, shapes, selection = []) {
    // Important: disable AA artifacts
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // 1) bodies
    for (const s of shapes) drawShapeHit(ctx, s, 0);
    // 2) handles only for selected
    for (const id of selection) {
        const s = shapes.find((it) => it.id === id);
        if (!s) continue;
        drawHandlesHit(ctx, s);
    }
}

function drawShape(ctx, s) {
    ctx.save();
    ctx.beginPath();
    switch (s.type) {
        case 'rect': {
            const [x, y, w, h] = s.points;
            ctx.rect(x, y, w, h);
            break;
        }
        case 'ellipse': {
            const [cx, cy, rx, ry] = s.points;
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            break;
        }
        case 'line': {
            const [x1, y1, x2, y2] = s.points;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            break;
        }
        case 'poly': {
            const p = s.points;
            if (p.length >= 4) {
                ctx.moveTo(p[0], p[1]);
                for (let i = 2; i < p.length; i += 2)
                    ctx.lineTo(p[i], p[i + 1]);
                ctx.closePath();
            }
            break;
        }
        case 'star': {
            drawStarPath(ctx, s);
            break;
        }
        case 'path': {
            const p = s.points;
            if (p.length >= 2) {
                ctx.moveTo(p[0], p[1]);
                for (let i = 2; i < p.length; i += 2)
                    ctx.lineTo(p[i], p[i + 1]);
            }
            break;
        }
        default:
            break;
    }
    // fill + stroke
    const st = s.style || {};
    if (st.fill && st.fill !== 'transparent') {
        ctx.fillStyle = st.fill;
        ctx.fill();
    }
    ctx.lineWidth = st.strokeWidth || 2;
    ctx.strokeStyle = st.stroke || '#111';
    ctx.stroke();
    ctx.restore();
}

function drawShapeHit(ctx, s, handleCode) {
    const [r, g, b] = idToRGB(s.id, handleCode);
    ctx.save();
    ctx.beginPath();
    switch (s.type) {
        case 'rect': {
            const [x, y, w, h] = s.points;
            ctx.rect(x, y, w, h);
            break;
        }
        case 'ellipse': {
            const [cx, cy, rx, ry] = s.points;
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            break;
        }
        case 'line': {
            const [x1, y1, x2, y2] = s.points;
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            break;
        }
        case 'poly': {
            const p = s.points;
            if (p.length >= 4) {
                ctx.moveTo(p[0], p[1]);
                for (let i = 2; i < p.length; i += 2)
                    ctx.lineTo(p[i], p[i + 1]);
                ctx.closePath();
            }
            break;
        }
        case 'star': {
            drawStarPath(ctx, s);
            break;
        }
        case 'path': {
            const p = s.points;
            if (p.length >= 2) {
                ctx.moveTo(p[0], p[1]);
                for (let i = 2; i < p.length; i += 2)
                    ctx.lineTo(p[i], p[i + 1]);
            }
            break;
        }
    }
    ctx.lineWidth = (s.style?.strokeWidth || 2) + 2; // slightly thicker for safe hit
    const fill = rgbToCss(r, g, b);
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    // always paint stroke to catch edges
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}

function drawHandles(ctx, s) {
    const { x, y, w, h } = s.bbox;
    const c = 6; // half-size of handle box
    const handles = handlePositions(s);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#4c8bf5';
    for (const hnd of handles) {
        ctx.beginPath();
        ctx.rect(hnd.x - c, hnd.y - c, c * 2, c * 2);
        ctx.fill();
        ctx.stroke();
    }
    // rotate handle (top-center, offset)
    const rot = handles.find((h) => h.code === HEADER_ELEMENTS.HANDLE.N);
    if (rot) {
        ctx.beginPath();
        ctx.arc(rot.x, rot.y - 24, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(rot.x, rot.y - 18);
        ctx.lineTo(rot.x, rot.y);
        ctx.stroke();
    }
}

function drawHandlesHit(ctx, s) {
    const { x, y, w, h } = s.bbox;
    const c = 7;
    const hs = handlePositions(s);
    for (const h of hs) {
        const [r, g, b] = idToRGB(s.id, h.code);
        const fill = rgbToCss(r, g, b);
        ctx.beginPath();
        ctx.rect(h.x - c, h.y - c, c * 2, c * 2);
        ctx.fillStyle = fill;
        ctx.fill();
    }
    const rot = hs.find((hh) => hh.code === HEADER_ELEMENTS.HANDLE.N);
    if (rot) {
        const [r, g, b] = idToRGB(s.id, HEADER_ELEMENTS.HANDLE.ROTATE);
        ctx.beginPath();
        ctx.arc(rot.x, rot.y - 24, 7, 0, Math.PI * 2);
        ctx.fillStyle = rgbToCss(r, g, b);
        ctx.fill();
    }
}

function handlePositions(s) {
    const { x, y, w, h } = s.bbox;
    const midX = x + w / 2,
        midY = y + h / 2;
    return [
        { code: HEADER_ELEMENTS.HANDLE.NW, x, y },
        { code: HEADER_ELEMENTS.HANDLE.N, x: midX, y },
        { code: HEADER_ELEMENTS.HANDLE.NE, x: x + w, y },
        { code: HEADER_ELEMENTS.HANDLE.E, x: x + w, y: midY },
        { code: HEADER_ELEMENTS.HANDLE.SE, x: x + w, y: y + h },
        { code: HEADER_ELEMENTS.HANDLE.S, x: midX, y: y + h },
        { code: HEADER_ELEMENTS.HANDLE.SW, x, y: y + h },
        { code: HEADER_ELEMENTS.HANDLE.W, x, y: midY },
    ];
}

function drawStarPath(ctx, s) {
    const [cx, cy, outerR = 40, innerR = 20, spikes = 5] = s.points;
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerR;
        y = cy + Math.sin(rot) * outerR;
        ctx.lineTo(x, y);
        rot += Math.PI / spikes;
        x = cx + Math.cos(rot) * innerR;
        y = cy + Math.sin(rot) * innerR;
        ctx.lineTo(x, y);
        rot += Math.PI / spikes;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
}
