import { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { getCanvasPosition } from '../../../../util/canvas-helper';
import {
    getOverlayDesign,
    hitTestTextShapes,
} from '../../../../util/overlay-helper';
import { selectVectorItems } from '../../../../redux/slice/shapeSlice';

const DRAG_THRESHOLD = 6;
const MIN_W = 120;
const MIN_H = 40;

export default function useTextMode({ canvasRef, overlayCtxRef, stylePreset }) {
    // 현재 벡터 아이템(텍스트 포함)
    const vecItems = useSelector(selectVectorItems);

    // 에디터/드래그 상태
    const [textRect, setTextRect] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [editingTarget, setEditingTarget] = useState(null);

    // 드래그 상태 레퍼런스
    const textDragRef = useRef({
        drawing: false,
        moved: false,
        start: null, // {x,y}
        mode: 'create', // 'create' | 'edit'
    });

    // 오버레이 캔버스 지우기
    const clearOverlay = useCallback(() => {
        const canvas = canvasRef.current;
        const ctx = overlayCtxRef.current;
        if (!canvas || !ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }, [canvasRef, overlayCtxRef]);

    // 점선 박스 프리뷰
    const drawDashedRect = useCallback(
        (start, now) => {
            const ctx = overlayCtxRef.current;
            const canvas = canvasRef.current;
            if (!ctx || !canvas || !start || !now) return;

            const x = Math.min(start.x, now.x);
            const y = Math.min(start.y, now.y);
            const w = Math.abs(now.x - start.x);
            const h = Math.abs(now.y - start.y);

            clearOverlay();
            getOverlayDesign(overlayCtxRef, () => {
                ctx.strokeRect(x, y, w, h);
            });
        },
        [clearOverlay, canvasRef, overlayCtxRef]
    );

    // 포인터 다운: 기존 텍스트(hit)면 편집 모드, 아니면 생성 드래그 시작
    const onPointerDown = useCallback(
        (e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            const host = e.currentTarget;
            if (!host) return;
            if (e.cancelable) e.preventDefault();
            host.setPointerCapture?.(e.pointerId);

            const p = getCanvasPosition(host, e);
            const hit = hitTestTextShapes(vecItems, p);

            if (hit) {
                // 편집 진입
                setEditingTarget(hit);
                setShowEditor(false);
                setTextRect(null);
                textDragRef.current = {
                    drawing: true,
                    moved: false,
                    start: { x: hit.x, y: hit.y },
                    mode: 'edit',
                };
                return;
            }

            // 새로 만들기
            setEditingTarget(null);
            setShowEditor(false);
            setTextRect(null);
            textDragRef.current = {
                drawing: true,
                moved: false,
                start: p,
                mode: 'create',
            };
        },
        [vecItems]
    );

    // 포인터 무브: 임계거리 넘으면 점선 박스 프리뷰
    const onPointerMove = useCallback(
        (e) => {
            if (!textDragRef.current.drawing) return;
            const host = e.currentTarget;
            if (!host) return;
            if (e.cancelable) e.preventDefault();

            const p = getCanvasPosition(host, e);
            const s = textDragRef.current.start;
            const dx = Math.abs(p.x - s.x);
            const dy = Math.abs(p.y - s.y);
            const moved = dx >= DRAG_THRESHOLD || dy >= DRAG_THRESHOLD;

            if (moved) {
                textDragRef.current.moved = true;
                // 편집 모드에서도 드래그 사각형은 보여주지 않고 클릭 편집으로 처리
                if (textDragRef.current.mode === 'create') {
                    drawDashedRect(s, p);
                }
            }
        },
        [drawDashedRect]
    );

    // 드래그 완료 처리
    const finishTextDrag = useCallback(
        (p) => {
            const { start, mode } = textDragRef.current;

            // 상태 초기화
            textDragRef.current = {
                drawing: false,
                moved: false,
                start: null,
                mode: 'create',
            };

            // 편집 모드: 에디터만 띄움 (hit된 대상 기준)
            if (mode === 'edit') {
                clearOverlay();
                setTextRect(null);
                setShowEditor(true);
                return;
            }

            // 생성 모드
            let x = Math.min(start.x, p.x);
            let y = Math.min(start.y, p.y);
            let w = Math.abs(p.x - start.x);
            let h = Math.abs(p.y - start.y);

            // 최소 크기 보정
            w = Math.max(MIN_W, Math.round(w));
            h = Math.max(MIN_H, Math.round(h));

            clearOverlay();
            setTextRect({ x, y, w, h });
            setShowEditor(true);
        },
        [clearOverlay]
    );

    // 포인터 업: 클릭이면 취소, 드래그면 완료
    const onPointerUp = useCallback(
        (e) => {
            if (!textDragRef.current.drawing) return;
            const host = e.currentTarget;
            if (!host) return;
            if (e?.cancelable) e.preventDefault();
            host.releasePointerCapture?.(e.pointerId);

            if (!textDragRef.current.moved) {
                // 클릭만 한 경우: 편집(hit)일 땐 에디터 열기, 생성은 취소
                const p = getCanvasPosition(host, e);
                const hit = hitTestTextShapes(vecItems, p);

                if (hit) {
                    setEditingTarget(hit);
                    setTextRect(null);
                    clearOverlay();
                    textDragRef.current = {
                        drawing: false,
                        moved: false,
                        start: null,
                        mode: 'create',
                    };
                    setShowEditor(true);
                    return;
                }

                textDragRef.current = {
                    drawing: false,
                    moved: false,
                    start: null,
                    mode: 'create',
                };
                clearOverlay();
                return;
            }

            const p = getCanvasPosition(host, e);
            finishTextDrag(p);
        },
        [finishTextDrag, clearOverlay, vecItems]
    );

    // ESC로 프리뷰/에디터 닫기 (선택)
    const onKeyDown = useCallback(
        (e) => {
            if (e.key === 'Escape') {
                textDragRef.current = {
                    drawing: false,
                    moved: false,
                    start: null,
                    mode: 'create',
                };
                clearOverlay();
                setShowEditor(false);
                setTextRect(null);
                setEditingTarget(null);
            }
        },
        [clearOverlay]
    );

    // 바인딩 객체
    const handlers = {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerLeave: onPointerUp,
        onPointerCancel: onPointerUp,
        onKeyDown, // 부모가 tabindex/keydown 전달 가능하면 연결
    };

    // 에디터 제어 콜백
    const closeEditor = () => {
        setShowEditor(false);
        setTextRect(null);
        setEditingTarget(null);
    };
    const commitEditor = () => {
        setShowEditor(false);
        setTextRect(null);
        setEditingTarget(null);
    };

    return {
        handlers,
        textRect,
        showEditor,
        editingTarget,
        stylePreset,
        closeEditor,
        commitEditor,
    };
}
