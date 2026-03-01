import { MIN_CSS } from '../config/setting.ts';
import { getDpr } from './get-dpr.ts';

export interface CanvasSizeOptions {
  alpha?: boolean;
  willRead?: boolean;
}

export interface CanvasSizeResult {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  dpr: number;
}

export function setCanvasSize(
  canvas: HTMLCanvasElement,
  cssW: number,
  cssH: number,
  { alpha = true, willRead = false }: CanvasSizeOptions = {}
): CanvasSizeResult {
  const dpr = getDpr();
  const prevW = Number(canvas.dataset.cssw) || 0;
  const prevH = Number(canvas.dataset.cssh) || 0;

  let w = cssW;
  let h = cssH;

  if (!Number.isFinite(w) || !Number.isFinite(h) || w < MIN_CSS || h < MIN_CSS) {
    if (prevW >= MIN_CSS && prevH >= MIN_CSS) {
      w = prevW;
      h = prevH;
    } else {
      w = Math.max(cssW || 0, MIN_CSS);
      h = Math.max(cssH || 0, MIN_CSS);
    }
  }

  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  canvas.dataset.cssw = String(w);
  canvas.dataset.cssh = String(h);

  const ctx = canvas.getContext('2d', {
    alpha,
    willReadFrequently: willRead,
  });

  if (!ctx) throw new Error('2D context not available');

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h, dpr };
}
