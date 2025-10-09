/**
 * @file Overlay.jsx
 * @description 오버레이: 벡터 프리뷰(점선) + 텍스트 생성/편집
 * - modeSlice / toolSlice 의존 제거
 * - uiSlice(tool, textMode) + styleSlice만 참조
 */
import { useRef, useLayoutEffect } from 'react';
import { useSelector } from 'react-redux';

import { setupCanvas } from '../../../util/canvas-helper';
import { useVector } from '../../../hook/useVector';
import { selectEffectiveStyle } from '../../../redux/slice/styleSlice';
import { selectTool, selectTextMode } from '../../../redux/slice/uiSlice';

import TextEditor from '../../texteditor/TextEditor'; // 기존 컴포넌트 그대로 사용

function Overlay({ canvasRef, vectorCtxRef }) {
    const teardownRef = useRef(null);
    const overlayCtxRef = useRef(null);

    // 전역 UI/스타일
    const currentTool = useSelector(selectTool); // 'path'|'line'|'rect'|'circle'|'polygon'|'star'|'pentagon'
    const isTextMode = useSelector(selectTextMode); // boolean
    const eff = useSelector(selectEffectiveStyle);

    // 유효 스타일
    const strokeColor =
        typeof eff?.stroke?.color === 'object'
            ? eff.stroke.color.value || '#000000'
            : eff?.stroke?.color || '#000000';
    const strokeWidth = Number(eff?.stroke?.width ?? 3);
    const fillOpacity = Number(eff?.fill?.opacity ?? 0);
    const fillEnabled = fillOpacity > 0;
    const fillColor =
        typeof eff?.fill?.color === 'object'
            ? eff.fill.color.value || 'transparent'
            : eff?.fill?.color || 'transparent';

    // 오버레이 캔버스 준비
    useLayoutEffect(() => {
        if (!canvasRef?.current) return;
        const { ctx, teardown } = setupCanvas(canvasRef.current, {
            smoothing: true,
            preserve: false,
            maxDpr: 3,
            observeDevicePixelRatio: true,
            onResize: () => {},
        });
        overlayCtxRef.current = ctx;
        teardownRef.current = teardown;
        return () => teardownRef.current?.();
    }, [canvasRef]);

    // 벡터 드로잉(프리드로우 포함) — 텍스트 모드가 아니면 동작
    const vecBind = useVector(canvasRef, overlayCtxRef, vectorCtxRef, {
        shapeKey: isTextMode ? 'rect' : currentTool || 'rect',
        strokeColor,
        strokeWidth,
        fillColor,
        fillEnabled,
        // 도형 옵션(다각형/별)
        sides: eff?.polygon?.sides ?? 6,
        spikes: eff?.star?.spikes ?? 5,
        innerRatio: eff?.star?.innerRatio ?? 0.5,
    });

    // 텍스트 모드 훅은 기존 파일(useTextMode) 그대로 사용
    // 단, 여기서는 TextEditor가 내부에서 onCommit 시 shapeSlice.add 등을 호출한다고 가정
    const textBind = isTextMode
        ? {
              onPointerDown: vecBind.onPointerDown, // 필요 시 텍스트용 훅으로 교체
              onPointerMove: vecBind.onPointerMove,
              onPointerUp: vecBind.onPointerUp,
              onPointerLeave: vecBind.onPointerLeave,
              onPointerCancel: vecBind.onPointerCancel,
          }
        : vecBind;

    return (
        <>
            <canvas
                className="overlay"
                ref={canvasRef}
                {...(isTextMode ? {} : vecBind)}
            />
            {/* 텍스트 모드일 때만 에디터 활성화(컴포넌트 내부에서 드래그 생성/클릭 편집 처리) */}
            {isTextMode && (
                <TextEditor
                    hostRef={canvasRef}
                    stylePreset={eff?.text}
                    // onClose / onCommit 은 TextEditor 내부에서 처리하거나 필요 시 props로 연결
                />
            )}
        </>
    );
}

export default Overlay;
