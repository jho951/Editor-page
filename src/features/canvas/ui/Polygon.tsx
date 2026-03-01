import { useEffect, useRef, useState, type ReactElement } from 'react';

export interface Viewport {
    scale: number;
    tx: number;
    ty: number;
}

export interface Point {
    x: number;
    y: number;
}

interface PolygonToolProps {
    width: number;
    height: number;
    view?: Viewport;
    onCommit?: (points: Point[]) => void;
    onCancel?: () => void;
    snapRadius?: number;
    stroke?: string;
    strokeWidth?: number;
}

/**
 * 자유다각형(Polyline/Polygon) 오버레이 도구
 * - 클릭으로 점 추가, 직선 미리보기 렌더
 * - 시작점 근처(스냅 반경 내) 클릭 시 자동 닫기
 * - 더블클릭으로도 닫기
 * - ESC 취소, Backspace 마지막 점 삭제, Enter 강제 닫기
 */
export default function PolygonTool({
    width,
    height,
    view = { scale: 1, tx: 0, ty: 0 },
    onCommit,
    onCancel,
    snapRadius = 10,
    stroke = '#4c8bf5',
    strokeWidth = 1,
}: PolygonToolProps): ReactElement {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [points, setPoints] = useState<Point[]>([]); // 월드좌표 점 목록
    const [hover, setHover] = useState<Point | null>(null); // 미리보기용 마우스 위치(월드)
    const rafRef = useRef<number | null>(null);

    // DPR 적용 캔버스 사이즈 세팅
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
        canvas.width = Math.max(1, Math.floor(width * dpr));
        canvas.height = Math.max(1, Math.floor(height * dpr));
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }, [width, height]);

    // 렌더 루프: 오버레이 미리보기
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(view.tx, view.ty);
            ctx.scale(view.scale, view.scale);

            if (points.length > 0) {
                ctx.beginPath();
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                ctx.strokeStyle = stroke;
                ctx.lineWidth = strokeWidth / view.scale;
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
                if (hover) ctx.lineTo(hover.x, hover.y);
                ctx.stroke();

                const worldSnapR = snapRadius / view.scale;
                ctx.beginPath();
                ctx.arc(points[0].x, points[0].y, worldSnapR, 0, Math.PI * 2);
                ctx.stroke();

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
            rafRef.current = window.requestAnimationFrame(draw);
        };

        rafRef.current = window.requestAnimationFrame(draw);
        return () => {
            if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current);
        };
    }, [points, hover, view, stroke, strokeWidth, snapRadius]);

    const screenToWorld = (sx: number, sy: number): Point => {
        return { x: (sx - view.tx) / view.scale, y: (sy - view.ty) / view.scale };
    };

    const isNearFirstPoint = (sx: number, sy: number): boolean => {
        if (points.length < 2) return false;
        const fx = points[0].x * view.scale + view.tx;
        const fy = points[0].y * view.scale + view.ty;
        const dx = sx - fx;
        const dy = sy - fy;
        return dx * dx + dy * dy <= snapRadius * snapRadius;
    };

    const commitPolygon = (): void => {
        if (onCommit && points.length >= 3) onCommit(points);
        setPoints([]);
        setHover(null);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        e.currentTarget.style.cursor = isNearFirstPoint(sx, sy) ? 'pointer' : 'crosshair';
        setHover(screenToWorld(sx, sy));
    };

    const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture?.(e.pointerId);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const rect = e.currentTarget.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;

        if (isNearFirstPoint(sx, sy) && points.length >= 3) {
            commitPolygon();
            return;
        }

        setPoints((prev) => [...prev, screenToWorld(sx, sy)]);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        if (points.length >= 3) commitPolygon();
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setPoints([]);
                setHover(null);
                onCancel?.();
            } else if (e.key === 'Enter') {
                if (points.length >= 3) commitPolygon();
            } else if (e.key === 'Backspace') {
                if (points.length > 0) setPoints((prev) => prev.slice(0, -1));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [points, onCancel]);

    const preventContext = (e: React.MouseEvent<HTMLCanvasElement>) => e.preventDefault();

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
