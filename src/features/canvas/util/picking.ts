import { rgbToId } from '../config/constants.ts';
import { denormPath, distPointToSegment, type Point } from '../engine/geometry.ts';
import { screenToWorld, type ViewTransform } from './view.ts';
import type { Shape } from '../types.ts';

export function pickIdAt(
  hitCanvas: HTMLCanvasElement | null,
  clientX: number,
  clientY: number
): number | null {
  if (!hitCanvas) return null;
  const rect = hitCanvas.getBoundingClientRect();
  const x = Math.floor(((clientX - rect.left) * (hitCanvas.width / rect.width)));
  const y = Math.floor(((clientY - rect.top) * (hitCanvas.height / rect.height)));
  const ctx = hitCanvas.getContext('2d');
  if (!ctx) return null;
  const d = ctx.getImageData(x, y, 1, 1).data;
  if (d[3] === 0) return null;
  return rgbToId(d[0], d[1], d[2]);
}

export type FreeDrawPickResult =
  | { kind: 'none'; index: -1; d: number }
  | { kind: 'vertex'; index: number; d: number; H: Point }
  | { kind: 'segment'; index: number; d: number; H: Point };

export function pickFreeDrawDetail(
  view: ViewTransform,
  shape: Shape | null,
  clientX: number,
  clientY: number,
  tolerancePx?: number
): FreeDrawPickResult {
  if (!shape || shape.type !== 'path' || !Array.isArray(shape.path) || shape.path.length < 2) {
    return { kind: 'none', index: -1, d: Infinity };
  }

  const P = screenToWorld(view, clientX, clientY);
  const pts = denormPath(shape.path, shape.x, shape.y, shape.w, shape.h);

  const base = Math.max(4, (shape.strokeWidth || 2) * 0.5);
  const tol = (tolerancePx ?? base) / (view.scale || 1);

  let best: FreeDrawPickResult = { kind: 'none', index: -1, d: Infinity };

  for (let i = 0; i < pts.length - 1; i++) {
    const A = pts[i];
    const B = pts[i + 1];
    const seg = distPointToSegment(P, A, B);
    if (seg.d < best.d) best = { kind: 'segment', index: i, d: seg.d, H: seg.H };

    const dA = Math.hypot(P.x - A.x, P.y - A.y);
    if (dA < best.d) best = { kind: 'vertex', index: i, d: dA, H: A };

    const dB = Math.hypot(P.x - B.x, P.y - B.y);
    if (dB < best.d) best = { kind: 'vertex', index: i + 1, d: dB, H: B };
  }

  return best.d <= tol ? best : { kind: 'none', index: -1, d: best.d };
}
