import { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';

const getDPR = () => window.devicePixelRatio || 1;

export default function CanvasStage() {
    const canvasState = useSelector((s) => s.canvas);
    const layerState = useSelector((s) => s.layers);
    const shapeState = useSelector((s) => s.shapes);
    const viewport = useSelector((s) => s.viewport || { scale: 1, x: 0, y: 0 });

    const { width = 1024, height = 768, background = '#ffffff' } = canvasState;

    console.log(canvasState);
    console.log(layerState);
    console.log(shapeState);
    console.log(viewport);

    // 도형 목록(예시: byId/allIds 구조 또는 배열 구조 모두 대응)
    const shapesArray = Array.isArray(shapeState)
        ? shapeState
        : shapeState.allIds
          ? shapeState.allIds.map((id) => shapeState.byId[id])
          : Object.values(shapeState.byId || {});

    // 레이어 가시성 필터
    const visibleLayerIds = new Set(
        (layerState.items || [])
            .filter((l) => l.visible !== false)
            .map((l) => l.id)
    );

    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = getDPR();
        // DPR 대응 사이즈 세팅
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';

        const ctx = canvas.getContext('2d');
        // 픽셀-독립 좌표계
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // 배경/클리어
        ctx.clearRect(0, 0, width, height);
        if (background) {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, width, height);
        }

        // 뷰포트(팬/줌) 적용
        if (viewport) {
            const { x = 0, y = 0, scale = 1 } = viewport;
            ctx.translate(x, y);
            if (scale && scale !== 1) ctx.scale(scale, scale);
        }

        // 레이어/도형 그리기
        const toDraw = shapesArray
            .filter((sh) => !sh?.layerId || visibleLayerIds.has(sh.layerId))
            .sort((a, b) => (a?.z || 0) - (b?.z || 0));

        toDraw.forEach((sh) => drawShape(ctx, sh));
    }, [width, height, background, shapesArray, visibleLayerIds, viewport]);

    return (
        <canvas
            ref={canvasRef}
            style={{ display: 'block', width: '100%', height: 'auto' }}
        />
    );
}

function drawShape(ctx, sh) {
    if (!sh) return;

    ctx.save();
    if (sh.transform) {
        const {
            x = 0,
            y = 0,
            rotation = 0,
            scaleX = 1,
            scaleY = 1,
        } = sh.transform;
        ctx.translate(x, y);
        if (rotation) ctx.rotate((rotation * Math.PI) / 180);
        if (scaleX !== 1 || scaleY !== 1) ctx.scale(scaleX, scaleY);
    }

    applyStyle(ctx, sh.style);

    switch (sh.type) {
        case 'rect': {
            const { x = 0, y = 0, width = 0, height = 0, rx = 0, ry = 0 } = sh;
            rx || ry
                ? roundRectPath(ctx, x, y, width, height, rx || ry)
                : ctx.rect(x, y, width, height);
            if (sh.style?.fill) ctx.fill();
            if (sh.style?.stroke) ctx.stroke();
            break;
        }
        case 'circle': {
            const { cx = 0, cy = 0, r = 0 } = sh;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            if (sh.style?.fill) ctx.fill();
            if (sh.style?.stroke) ctx.stroke();
            break;
        }
        case 'line': {
            const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = sh;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            break;
        }
        case 'polygon': {
            const pts = sh.points || [];
            if (pts.length < 2) break;
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
            ctx.closePath();
            if (sh.style?.fill) ctx.fill();
            if (sh.style?.stroke) ctx.stroke();
            break;
        }
        case 'path': {
            // 자유 드로우 등 세그먼트 기반
            const segs = sh.segments || [];
            ctx.beginPath();
            segs.forEach((seg) => {
                const [cmd, ...a] = seg;
                if (cmd === 'M') ctx.moveTo(a[0], a[1]);
                else if (cmd === 'L') ctx.lineTo(a[0], a[1]);
                else if (cmd === 'Q')
                    ctx.quadraticCurveTo(a[0], a[1], a[2], a[3]);
                else if (cmd === 'C')
                    ctx.bezierCurveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
                else if (cmd === 'Z') ctx.closePath();
            });
            if (sh.style?.fill) ctx.fill();
            if (sh.style?.stroke) ctx.stroke();
            break;
        }
        default:
            // 알 수 없는 타입은 무시
            break;
    }

    ctx.restore();
}

function applyStyle(ctx, st = {}) {
    const { fill, stroke, strokeWidth = 1, opacity = 1, lineDash } = st;
    ctx.globalAlpha = opacity;
    ctx.setLineDash(Array.isArray(lineDash) ? lineDash : []);
    ctx.lineWidth = strokeWidth;
    if (fill) ctx.fillStyle = fill;
    if (stroke) ctx.strokeStyle = stroke;
}

function roundRectPath(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
}
