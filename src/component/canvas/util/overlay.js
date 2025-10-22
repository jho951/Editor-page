import { OVERLAY } from '../constant/constants';
import { denormPath } from './geometry';

/**
 * 컨텍스트를 view(패닝/줌) 기준으로 변환해주는 헬퍼.
 * 내부 콜백에서 월드 좌표계로 그릴 수 있게 함.
 */
function withViewTransform(ctx, view, draw) {
    const { scale, tx, ty } = view || { scale: 1, tx: 0, ty: 0 };
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);
    try {
        draw();
    } finally {
        ctx.restore();
    }
}

/**
 * 공통 스트로크/필 스타일 세팅
 */
function setStrokeStyle(
    ctx,
    { color = OVERLAY.focusStroke, width = OVERLAY.lineWidth, dash = [] } = {}
) {
    ctx.setLineDash(dash);
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
}
function setFillStyle(ctx, color = OVERLAY.focusFill) {
    ctx.fillStyle = color;
}

/**
 * 주어진 bbox(x,y,w,h)의 8개 리사이즈 핸들 사각형 좌표 계산
 */
function getHandleRects({ x, y, w, h }, size = OVERLAY.handleSize) {
    const s = size;
    const midX = x + w / 2;
    const midY = y + h / 2;
    return [
        { x: x - s / 2, y: y - s / 2 }, // 좌상
        { x: midX - s / 2, y: y - s / 2 }, // 상중
        { x: x + w - s / 2, y: y - s / 2 }, // 우상
        { x: x - s / 2, y: midY - s / 2 }, // 좌중
        { x: x + w - s / 2, y: midY - s / 2 }, // 우중
        { x: x - s / 2, y: y + h - s / 2 }, // 좌하
        { x: midX - s / 2, y: y + h - s / 2 }, // 하중
        { x: x + w - s / 2, y: y + h - s / 2 }, // 우하
    ];
}

/**
 * 포커스 박스(점선)와 8개 핸들을 렌더
 */
function drawFocusBoxAndHandles(ctx, bbox) {
    // 포커스 박스(점선)
    setStrokeStyle(ctx, {
        color: OVERLAY.focusStroke,
        width: OVERLAY.lineWidth,
        dash: OVERLAY.dash,
    });
    ctx.strokeRect(bbox.x, bbox.y, bbox.w, bbox.h);

    // 핸들
    setFillStyle(ctx, OVERLAY.focusFill);
    setStrokeStyle(ctx, {
        color: OVERLAY.focusStroke,
        width: OVERLAY.lineWidth,
        dash: [],
    });
    for (const r of getHandleRects(bbox, OVERLAY.handleSize)) {
        ctx.fillRect(r.x, r.y, OVERLAY.handleSize, OVERLAY.handleSize);
        ctx.strokeRect(r.x, r.y, OVERLAY.handleSize, OVERLAY.handleSize);
    }
}

/**
 * Path 타입(프리드로우 등) 편집 노드 렌더
 * - 노드 크기는 화면 스케일에 역비례하게 약간 보정해 시각적 일관성 유지
 */
function drawPathEditNodes(ctx, focusedShape, scale = 1) {
    if (focusedShape.type !== 'path' || !Array.isArray(focusedShape.path))
        return;

    const { x, y, w, h } = focusedShape;
    const pts = denormPath(focusedShape.path, x, y, w, h);
    const r = Math.max(3, 3 / (scale || 1)); // 줌 인 시 너무 커지지 않게, 줌 아웃 시 너무 작아지지 않게

    setFillStyle(ctx, OVERLAY.focusFill);
    setStrokeStyle(ctx, {
        color: OVERLAY.focusStroke,
        width: OVERLAY.lineWidth,
        dash: [],
    });

    for (const p of pts) {
        ctx.beginPath();
        ctx.rect(p.x - r, p.y - r, 2 * r, 2 * r);
        ctx.fill();
        ctx.stroke();
    }
}

/**
 * Overlay 메인 엔트리
 * - 캔버스 클리어 → view 변환 적용 → 포커스 박스/핸들 → (path 편집 노드)
 */
function renderOverlay(ctx, focusedShape, view) {
    // 1) 초기화
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!focusedShape) return;

    // 2) 월드 좌표계로 그리기
    withViewTransform(ctx, view, () => {
        const bbox = {
            x: focusedShape.x,
            y: focusedShape.y,
            w: focusedShape.w,
            h: focusedShape.h,
        };

        // 포커스 박스 & 핸들
        drawFocusBoxAndHandles(ctx, bbox);

        // 경로 편집 노드 (프리드로우 등)
        drawPathEditNodes(ctx, focusedShape, view?.scale ?? 1);
    });
}

export { renderOverlay };
