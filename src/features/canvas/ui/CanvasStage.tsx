import {type JSX, useCallback, useEffect, useMemo, useRef, useState, type WheelEvent} from 'react';
import { setTool, setViewport } from "@features/canvas/state/canvas.slice";
import { useAppDispatch, useAppSelector } from '@app/store/hooks.ts';
import {
  selectShapes,
  selectFocusId,
  selectTool,
  selectViewport,
} from '@features/canvas/state/canvas.selector.ts';
import type { ToolKind } from '@features/canvas/types.ts';
import { pickIdAt } from '../util/picking.ts';

import type { Shape } from '../types.ts';
import type { ViewTransform } from '../util/view.ts';

import { VectorCanvas } from './VectorCanvas.tsx';
import { HitmapCanvas } from './HitmapCanvas.tsx';
import { OverlayCanvas } from './OverlayCanvas.tsx';

import styles from './Canvas.module.css';

export function CanvasStage(): JSX.Element {
  const dispatch = useAppDispatch();
  const shapes = useAppSelector(selectShapes);
  const focusId = useAppSelector(selectFocusId);
  const tool = useAppSelector(selectTool);
  const viewport = useAppSelector(selectViewport);

  const view: ViewTransform = {
    scale: viewport.scale,
    tx: viewport.tx,
    ty: viewport.ty,
  };

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const vecRef = useRef<HTMLCanvasElement | null>(null);
  const hitRef = useRef<HTMLCanvasElement | null>(null);
  const ovRef = useRef<HTMLCanvasElement | null>(null);

  const [size, setSize] = useState<{ w: number; h: number }>({ w: 1, h: 1 });

  const measure = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSize({
      w: Math.max(1, Math.floor(rect.width)),
      h: Math.max(1, Math.floor(rect.height)),
    });
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [measure]);

  const getPickId = useCallback(
    (clientX: number, clientY: number): number | null => {
      return pickIdAt(hitRef.current, clientX, clientY);
    },
    []
  );

  // Minimal toolbar for v1: select/rect/ellipse/line/freedraw/text
  const toolButtons: Array<{ id: ToolKind; label: string }> = useMemo(
    () => [
      { id: 'select', label: 'Select' },
      { id: 'rect', label: 'Rect' },
      { id: 'ellipse', label: 'Ellipse' },
      { id: 'line', label: 'Line' },
      { id: 'freedraw', label: 'Pen' },
      { id: 'text', label: 'Text' },
    ],
    []
  );

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    // Ctrl/Meta + wheel zoom (simple, v1)
    const cmd = e.ctrlKey || e.metaKey;
    if (!cmd) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.08 : 0.92;
    const nextScale = viewport.scale * factor;
    dispatch(setViewport({ scale: nextScale }));
  };

  return (
    <main className={styles.stage}>
      <div className={styles.wrap} ref={wrapRef} onWheel={onWheel}>
        <div className={styles.toolbar} role="toolbar" aria-label="Canvas tools">
          {toolButtons.map((b) => (
            <button
              key={b.id}
              type="button"
              className={[styles.toolBtn, tool === b.id ? styles.toolBtnActive : ''].join(' ')}
              onClick={() => dispatch(setTool(b.id))}
            >
              {b.label}
            </button>
          ))}
          <div className={styles.toolbarSpacer} />
          <button
            type="button"
            className={styles.toolBtn}
            onClick={() => dispatch(setViewport({ scale: 1, tx: 0, ty: 0 }))}
          >
            100%
          </button>
        </div>
        <VectorCanvas ref={vecRef} width={size.w} height={size.h} shapes={shapes as Shape[]} view={view} />
        <HitmapCanvas ref={hitRef} width={size.w} height={size.h} shapes={shapes as Shape[]} view={view} />
        <OverlayCanvas
          ref={ovRef}
          width={size.w}
          height={size.h}
          view={view}
          shapes={shapes as Shape[]}
          tool={tool}
          focusedId={focusId}
          getPickId={getPickId}
        />
      </div>
    </main>
  );
}
