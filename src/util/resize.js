import { CANVAS_RESIZE as CR } from '../constant/resize';

export function drawCanvasResizeKnob(ctx, width, height) {
    const k = CR.KNOB;
    const x = width - k - 1;
    const y = height - k - 1;
    ctx.save();
    // 모서리 보이는 핸들 (코너 브래킷 + 사각형)
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#666';
    ctx.fillStyle = '#f7f7f7';
    ctx.beginPath();
    ctx.rect(x, y, k, k);
    ctx.fill();
    ctx.stroke();

    // 코너 라인 (디자인용)
    ctx.beginPath();
    ctx.moveTo(width - 0.5, height - k - 4.5);
    ctx.lineTo(width - k - 4.5, height - 0.5);
    ctx.stroke();
    ctx.restore();
}

export function drawCanvasResizeHitbox(hctx, width, height) {
    const k = CR.KNOB + CR.HIT_PAD;
    const x = width - k - 1;
    const y = height - k - 1;
    const [r, g, b] = CR.COLOR;
    hctx.save();
    hctx.imageSmoothingEnabled = false;
    hctx.fillStyle = `rgb(${r},${g},${b})`;
    hctx.fillRect(x, y, k, k);
    hctx.restore();
}

// 점선 프리뷰(overlay 전용): 0,0을 기준으로 새 크기 사각형을 표시
export function drawResizePreview(octx, nextW, nextH) {
    octx.clearRect(0, 0, octx.canvas.width, octx.canvas.height);
    octx.save();
    octx.setLineDash([6, 6]);
    octx.lineWidth = 1;
    octx.strokeStyle = '#4c8bf5';
    octx.strokeRect(0.5, 0.5, nextW - 1, nextH - 1);
    octx.restore();
}
