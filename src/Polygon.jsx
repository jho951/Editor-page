import { useEffect, useRef, useState } from 'react';

/**
 * 자유다각형(Polyline/Polygon) 오버레이 도구
 * - 클릭으로 점 추가, 직선 미리보기 렌더
 * - 시작점 근처(스냅 반경 내) 클릭 시 자동 닫기
 * - 더블클릭으로도 닫기
 * - ESC 취소, Backspace 마지막 점 삭제, Enter 강제 닫기
 *
 * 통합 지침(사용자 3-레이어 구조 가정):
 * 1) <canvas class="layer-overlay"> 위에서만 상호작용합니다.
 * 2) 최종 확정 시 onCommit(points)로 벡터 레이어에 다각형을 추가하세요.
 * 3) view={ scale, tx, ty } (월드→스크린 변환) 을 외부에서 넘겨주세요.
 */
export default function PolygonTool({
    width,
    height,
    view = { scale: 1, tx: 0, ty: 0 },
    onCommit, // function(points:[{x,y},...]) → 확정 시 호출
    onCancel, // function() → ESC 등 취소 시 호출
    snapRadius = 10, // 시작점 스냅 반경(px, 스크린 기준)
    stroke = '#4c8bf5',
    strokeWidth = 1,
}) {
    const canvasRef = useRef(null);
    const [points, setPoints] = useState([]); // 월드좌표 점 목록
    const [hover, setHover] = useState(null); // 미리보기용 마우스 위치(월드)
    const [isPointerDown, setIsPointerDown] = useState(false);
    const rafRef = useRef(null);

    // DPR 적용 캔버스 사이즈 세팅
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr =
            (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 좌표계를 CSS px 기준으로
    }, [width, height]);

    // 렌더 루프: 오버레이 미리보기
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // NOTE: ctx 좌표는 CSS px 기준 (위에서 setTransform 적용)
            ctx.save();
            // 월드→스크린 변환
            ctx.translate(view.tx, view.ty);
            ctx.scale(view.scale, view.scale);

            // 이미 확정된 점들 그리기
            if (points.length > 0) {
                ctx.beginPath();
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.strokeStyle = stroke;
                ctx.lineWidth = strokeWidth / view.scale; // 월드폭 보정
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++)
                    ctx.lineTo(points[i].x, points[i].y);
                // 호버 중이면 마지막 미리보기 선
                if (hover) ctx.lineTo(hover.x, hover.y);
                ctx.stroke();

                // 시작점 스냅 원 표시 (스크린 기준 반경을 월드 반경으로 환산)
                const worldSnapR = snapRadius / view.scale;
                ctx.beginPath();
                ctx.arc(points[0].x, points[0].y, worldSnapR, 0, Math.PI * 2);
                ctx.stroke();

                // 각 버텍스 핸들 점 표시
                for (const p of points) {
                    ctx.beginPath();
                    ctx.fillStyle = '#fff';
                    ctx.strokeStyle = stroke;
                    ctx.lineWidth = strokeWidth / view.scale;
                    const r = Math.max(3, 3 / view.scale);
                    ctx.rect(p.x - r, p.y - r, r * 2, r * 2);
                    ctx.fill();
                    ctx.stroke();
                }
            }

            ctx.restore();
            rafRef.current = requestAnimationFrame(draw);
        }

        rafRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(rafRef.current);
    }, [points, hover, view, stroke, strokeWidth, snapRadius]);

    // 좌표 변환: 스크린→월드
    const screenToWorld = (sx, sy) => {
        const x = (sx - view.tx) / view.scale;
        const y = (sy - view.ty) / view.scale;
        return { x, y };
    };

    // 시작점 스냅 판정 (스크린 공간)
    const isNearFirstPoint = (sx, sy) => {
        if (points.length < 2) return false;
        // 첫 점을 스크린으로 변환
        const fx = points[0].x * view.scale + view.tx;
        const fy = points[0].y * view.scale + view.ty;
        const dx = sx - fx;
        const dy = sy - fy;
        return dx * dx + dy * dy <= snapRadius * snapRadius;
    };

    const handlePointerMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        // 커서 바꾸기: 시작점 근접 시 "pointer"로 안내
        if (isNearFirstPoint(sx, sy)) {
            e.currentTarget.style.cursor = 'pointer';
        } else {
            e.currentTarget.style.cursor = 'crosshair';
        }

        const w = screenToWorld(sx, sy);
        setHover(w);
    };

    const handlePointerDown = (e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
        setIsPointerDown(true);
    };

    const handlePointerUp = (e) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        // 시작점 근처면 폴리곤 닫기
        if (isNearFirstPoint(sx, sy) && points.length >= 3) {
            commitPolygon();
            return;
        }

        // 일반 점 추가
        const w = screenToWorld(sx, sy);
        setPoints((prev) => [...prev, w]);
        setIsPointerDown(false);
    };

    // 더블클릭으로 닫기
    const handleDoubleClick = (e) => {
        e.preventDefault();
        if (points.length >= 3) commitPolygon();
    };

    const commitPolygon = () => {
        if (onCommit && points.length >= 3) onCommit(points);
        // 초기화
        setPoints([]);
        setHover(null);
    };

    // 키보드 단축키
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') {
                setPoints([]);
                setHover(null);
                onCancel && onCancel();
            } else if (e.key === 'Enter') {
                if (points.length >= 3) commitPolygon();
            } else if (e.key === 'Backspace') {
                if (points.length > 0) setPoints((prev) => prev.slice(0, -1));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [points]);

    // 컨텍스트메뉴 방지(우클릭 드래그 시 방해 방지)
    const preventContext = (e) => e.preventDefault();

    return (
        <canvas
            ref={canvasRef}
            className="layer-overlay"
            width={width}
            height={height}
            onPointerMove={handlePointerMove}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            onContextMenu={preventContext}
            style={{ touchAction: 'none', display: 'block' }}
        />
    );
}

/**
 * 사용 예시
 *
 * <PolygonTool
 *   width={stageWidth}
 *   height={stageHeight}
 *   view={view} // { scale, tx, ty }
 *   onCommit={(pts)=> dispatch(addPolygon({ id: genId(), points: pts, stroke:'#333', fill:'#fff' }))}
 *   onCancel={()=> dispatch(exitTool())}
 * />
 */
