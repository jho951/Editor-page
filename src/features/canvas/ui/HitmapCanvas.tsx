import { forwardRef, useEffect } from 'react';

import { setCanvasSize } from '../util/setup.ts';
import { renderHitmap } from '../engine/render-hitmap.ts';

import type { Shape } from '../types.ts';
import type { ViewTransform } from '../util/view.ts';

export interface HitmapCanvasProps {
  width: number;
  height: number;
  shapes: Shape[];
  view: ViewTransform;
}

export const HitmapCanvas = forwardRef<HTMLCanvasElement, HitmapCanvasProps>(
  function HitmapCanvas({ width, height, shapes, view }, ref) {
    useEffect(() => {
      if (!ref || typeof ref === 'function' || !ref.current) return;
      if (width <= 0 || height <= 0) return;

      const { ctx } = setCanvasSize(ref.current, width, height, { alpha: true, willRead: true });
      renderHitmap(ctx, shapes, view);
    }, [width, height, shapes, view, ref]);

    return <canvas ref={ref} className="layer-hitmap" aria-hidden style={{ display: 'none' }} />;
  }
);
