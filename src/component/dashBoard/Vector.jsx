// src/component/dashboard/vector/Vector.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectViewport } from '../../redux/slice/viewportSlice';

export default function Vector({ canvasRef, hitCanvasRef }) {
    const { zoom = 1, pan = { x: 0, y: 0 } } = useSelector(selectViewport);
    const { byId = {}, allIds = [] } = useSelector(
        (s) => s.vectorDoc.layers || {}
    );
    const {
        width = 800,
        height = 600,
        background = null,
    } = useSelector((s) => s.vectorDoc.canvas || {});
    const { idToColor = {} } = useSelector((s) => s.vectorDoc.hitmap || {});

    useEffect(() => {
        const c = canvasRef.current;
        const hc = hitCanvasRef.current;
        if (!c || !hc) return;
        const dpr = window.devicePixelRatio || 1;

        // 사이즈
        [c, hc].forEach((cv) => {
            cv.width = Math.max(1, Math.floor(width * dpr));
            cv.height = Math.max(1, Math.floor(height * dpr));
            cv.style.width = `${width}px`;
            cv.style.height = `${height}px`;
        });

        const ctx = c.getContext('2d');
        const htx = hc.getContext('2d');

        // reset
        [ctx, htx].forEach((x) => {
            x.setTransform(1, 0, 0, 1, 0, 0);
            x.clearRect(0, 0, c.width, c.height);
            x.setTransform(
                dpr * zoom,
                0,
                0,
                dpr * zoom,
                pan.x * dpr,
                pan.y * dpr
            );
        });

        // 배경
        if (background) {
            ctx.save();
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, width, height);
            ctx.restore();
        }

        // 레이어 페인트 (시각/히트맵 함께)
        for (const id of allIds) {
            const l = byId[id];
            if (!l || l.visible === false) continue;

            // 화면
            ctx.save();
            applyTransform(ctx, l);
            paintLayer(ctx, l);
            ctx.restore();

            // 히트맵
            const nid = l.nid ?? null;
            const color = nid && idToColor[nid];
            if (color) {
                htx.save();
                applyTransform(htx, l);
                paintLayerHit(htx, l, color); // 같은 shape를 고유색으로만 채움
                htx.restore();
            }
        }
    }, [
        canvasRef,
        hitCanvasRef,
        width,
        height,
        pan,
        zoom,
        byId,
        allIds,
        idToColor,
        background,
    ]);

    return null;
}

function applyTransform(ctx, l) {
    const t = l.transform || { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 };
    ctx.translate(t.x, t.y);
    ctx.rotate(((t.rotation || 0) * Math.PI) / 180);
    ctx.scale(t.scaleX || 1, t.scaleY || 1);
}

function paintLayer(ctx, l) {
    const st = l.style || {};
    ctx.globalAlpha = st.opacity ?? 1;
    if (l.type === 'rect') {
        if (st.fill) {
            ctx.fillStyle = st.fill;
            ctx.fillRect(0, 0, l.props?.width || 1, l.props?.height || 1);
        }
        if (st.stroke) {
            ctx.lineWidth = st.strokeWidth ?? 1;
            ctx.strokeStyle = st.stroke;
            ctx.strokeRect(0, 0, l.props?.width || 1, l.props?.height || 1);
        }
    }
    // TODO: line/ellipse/path/text 등 다른 타입도 같은 패턴으로 추가
}

function paintLayerHit(ctx, l, color) {
    const [r, g, b] = color;
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    if (l.type === 'rect') {
        ctx.fillRect(0, 0, l.props?.width || 1, l.props?.height || 1);
    }
    // 다른 타입도 동일 shape로 "채우기"만 수행
}
