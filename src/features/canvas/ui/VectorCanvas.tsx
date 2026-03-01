import { forwardRef, useEffect } from 'react';

import { setCanvasSize } from '../util/setup.ts';
import { renderVector } from '../engine/render-vector.ts';

import type { Shape } from '../types.ts';
import type { ViewTransform } from '../util/view.ts';

export interface VectorCanvasProps {
  width: number;
  height: number;
  shapes: Shape[];
  view: ViewTransform;
  editingId?: number | null;
}

export const VectorCanvas = forwardRef<HTMLCanvasElement, VectorCanvasProps>(
  function VectorCanvas({ width, height, shapes, view, editingId }, ref) {
    useEffect(() => {
      if (!ref || typeof ref === 'function' || !ref.current) return;
      if (width <= 0 || height <= 0) return;

      const { ctx } = setCanvasSize(ref.current, width, height, { alpha: true });
      renderVector(ctx, shapes, view, { editingId: editingId ?? undefined });
    }, [width, height, shapes, view, editingId, ref]);

    return <canvas ref={ref} className="layer-vector" aria-hidden />;
  }
);
