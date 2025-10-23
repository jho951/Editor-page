import { idToRGB } from '../constant/constants';
import { denormPath } from '../util/geometry';
import {
    drawLinePath,
    drawEllipsePath,
    drawPolygonPath,
    drawStarPath,
    strokePath,
} from '../util/paths';

/**
 * 히트맵(피킹 버퍼) 렌더러
 * 도형이 저장된 좌표계(논리 좌표)**를 실제 화면 픽셀 좌표
 *
 * 목적
 * - 각 도형을 "보이지 않는" 캔버스에 고유 RGB로 칠해둔 뒤,
 *   마우스 위치의 픽셀 색을 읽어 어떤 도형인지 역으로 식별(picking)하기 위함.
 *
 * 핵심 아이디어
 * - 도형마다 `pickId`(0~16,777,215)를 갖고, 이를 idToRGB로 R/G/B(각 0~255)로 변환
 * - 해당 RGB를 fill/stroke에 사용 → 픽셀 샘플링 시 rgbToId로 다시 ID 복원
 *
 * 좌표계 / 스케일
 * - 실제 화면 좌표 = (월드 좌표 * scale) + (tx, ty)
 * - 여기서는 월드 좌표계에서 도형을 그리기 위해, 컨텍스트에 translate/scale을 미리 적용
 *
 * @param {CanvasRenderingContext2D} ctx   히트맵용 2D 컨텍스트
 * @param {Array<Object>}            shapes 렌더링할 도형 목록
 * @param {{scale:number, tx:number, ty:number}} view 뷰 변환(확대/이동)
 */
function renderHitmap(ctx, shapes, view) {
    // 히트맵 캔버스 초기화
    ctx.save();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // 색상값 정확도 상관없음
    ctx.imageSmoothingEnabled = false;

    // 뷰 변환 (월드→스크린)
    const { scale, tx, ty } = view;
    ctx.translate(tx, ty);
    ctx.scale(scale, scale);

    for (const s of shapes) {
        // 도형별 고유 ID → RGB로 변환
        const { r, g, b } = idToRGB(s.pickId);
        const col = `rgb(${r},${g},${b})`;

        // 채움, 선 모두 동일한 단색으로 칠해 식별 정확성 향상
        ctx.fillStyle = col;
        ctx.strokeStyle = col;

        // 사각형: 내부 fill, 테두리 stroke 처리
        if (s.type === 'rect') {
            ctx.fillRect(s.x, s.y, s.w, s.h);
            // 두껍게 칠할수록 클릭/선택 관용도가 높아짐
            ctx.lineWidth = Math.max((s.strokeWidth || 2) / scale, 8 / scale);
            ctx.strokeRect(s.x, s.y, s.w, s.h);
        } else if (s.type === 'line') {
            // 라인: 경로를 스트로크
            drawLinePath(ctx, s.x, s.y, s.w, s.h);
            // 라인은 두께가 너무 얇으면 피킹 실패
            ctx.lineWidth = Math.max(s.strokeWidth || 2, 12);
            ctx.stroke();
        } else if (s.type === 'path') {
            // 프리드로우는 정규화 좌표를 실제 좌표로 복원
            const pts = denormPath(s.path, s.x, s.y, s.w, s.h);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // 자유곡선도 관용도 확보를 위해 최소 두께 유지
            ctx.lineWidth = Math.max(s.strokeWidth || 2, 10);
            strokePath(ctx, pts);
        } else if (s.type === 'text') {
            // 텍스트 영역 박스를 색칠
            ctx.fillRect(s.x, s.y, s.w, s.h);
            ctx.strokeRect(s.x, s.y, s.w, s.h);
            ctx.lineWidth = 6;
        } else {
            // 도형: 타원, 다각형, 별
            if (s.type === 'ellipse') {
                drawEllipsePath(ctx, s.x, s.y, s.w, s.h);
            } else if (s.type === 'polygon') {
                drawPolygonPath(ctx, s.x, s.y, s.w, s.h, s.sides);
            } else if (s.type === 'star') {
                drawStarPath(
                    ctx,
                    s.x,
                    s.y,
                    s.w,
                    s.h,
                    s.points || 5,
                    s.innerRatio || 0.5
                );
            }
            // 내부를 채우고, 외곽을 두껍게 그려 피킹 안정성 향상
            ctx.fill();
            ctx.lineWidth = Math.max(s.strokeWidth || 2, 8);
            ctx.stroke();
        }
    }
    ctx.restore();
}

export { renderHitmap };
