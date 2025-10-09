// src/hook/useVector.js
/**
 * @file useVector.js
 * @description 오버레이 프리뷰(점선) → 확정 시 Redux(addShape) 커밋.
 * - 지원: 'path' | 'line' | 'rect' | 'circle' | 'polygon' | 'star' | 'pentagon'
 * - 프리드로우(path)는 드래그 중 overlay에만 그리다가 pointerup에 벡터로 커밋.
 */

import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { getCanvasPosition } from '../util/canvas-helper';
import { getOverlayDesign } from '../util/overlay-helper';
import { getId } from '../util/get-id';
import { add as addShape } from '../redux/slice/shapeSlice';
import { ShapeMap } from '../feature'; // ← 앞서 등록한 Path/Line/Rect/... 맵

export function useVector(
    previewCanvasRef, // overlay <canvas> ref
    previewCtxRef, // overlay 2D context ref
    _vectorCtxRef, // (사용 안 함: Vector 레이어가 Redux 기반 재그림)
    {
        shapeKey = 'rect',
        strokeColor = '#000',
        strokeWidth = 2,
        strokeOpacity = 1,
        fillColor = 'transparent',
        fillEnabled = false,
        // 옵션(다각형/별)
        sides = 6, // polygon
        spikes = 5, // star
        innerRatio = 0.5, // star
    } = {}
) {
    const dispatch = useDispatch();
    const isDrawingRef = useRef(false);
    const shapeStateRef = useRef(null); // 각 도형이 내부적으로 쓰는 진행 상태

    function clearPreview() {
        const canvas = previewCanvasRef.current;
        const ctx = previewCtxRef.current;
        if (!canvas || !ctx) return;
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    // 현재 도형 구현체
    const Impl = ShapeMap[shapeKey] || ShapeMap.rect;

    // 공통 스타일 객체(각 도형의 begin에서 해석)
    const style = {
        strokeColor,
        strokeWidth: Number(strokeWidth),
        strokeOpacity: Number(strokeOpacity),
        // fill은 도형에 따라 사용되지 않을 수 있음(Path는 기본 null)
        ...(fillEnabled && fillColor && fillColor !== 'transparent'
            ? { fillColor, fillOpacity: 1 }
            : { fillColor: undefined, fillOpacity: 0 }),
        // 옵션 전달(있을 때만 사용)
        sides,
        spikes,
        innerRatio,
    };

    function onPointerDown(e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const host = e.currentTarget;
        const ctx = previewCtxRef.current;
        if (!host || !ctx || !Impl?.begin) return;

        if (e.cancelable) e.preventDefault();
        host.setPointerCapture?.(e.pointerId);

        const p = getCanvasPosition(host, e);
        shapeStateRef.current = {};
        Impl.begin(shapeStateRef.current, p, style); // 도형 상태 초기화
        isDrawingRef.current = true;
    }

    function onPointerMove(e) {
        if (!isDrawingRef.current) return;
        const host = e.currentTarget;
        const ctx = previewCtxRef.current;
        if (!host || !ctx || !Impl?.update || !Impl?.preview) return;

        if (e.cancelable) e.preventDefault();
        const p = getCanvasPosition(host, e);

        Impl.update(shapeStateRef.current, p);

        clearPreview();
        getOverlayDesign(previewCtxRef, () => {
            Impl.preview(ctx, shapeStateRef.current);
        });
    }

    function onPointerUp(e) {
        if (!isDrawingRef.current) return;

        const host = e.currentTarget;
        const ctx = previewCtxRef.current;
        if (!host || !ctx || !Impl?.end) return;

        if (e?.cancelable) e.preventDefault();
        host.releasePointerCapture?.(e.pointerId);

        const p = getCanvasPosition(host, e);
        const item = Impl.end(shapeStateRef.current, p);

        // 결과 아이템이 있으면 Redux에 커밋
        if (item && typeof item === 'object') {
            const finalItem = {
                id: getId(),
                ...item,
            };

            if (!fillEnabled && 'fill' in finalItem) {
                finalItem.fill = null;
            }

            dispatch(addShape(finalItem));
        }

        clearPreview();
        shapeStateRef.current = null;
        isDrawingRef.current = false;
    }

    const onPointerLeave = onPointerUp;
    const onPointerCancel = onPointerUp;

    return {
        onPointerDown,
        onPointerMove,
        onPointerUp,
        onPointerLeave,
        onPointerCancel,
    };
}
