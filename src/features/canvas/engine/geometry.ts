export interface Point {
  x: number;
  y: number;
}

export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  w: number;
  h: number;
}

export interface PathUV {
  u: number;
  v: number;
}

export const dist2 = (a: Point, b: Point): number => Math.hypot(a.x - b.x, a.y - b.y);

export function computeBBox(points: Array<Point | null | undefined>): BBox | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (!p) continue;
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
}

export function normalizePath(points: Point[], bbox: Pick<BBox, 'minX' | 'minY' | 'w' | 'h'>): PathUV[] {
  const { minX, minY, w, h } = bbox;
  const safeW = w || 1;
  const safeH = h || 1;

  return points.map((p) => ({
    u: (p.x - minX) / safeW,
    v: (p.y - minY) / safeH,
  }));
}

export function denormPath(pathUV: PathUV[], x: number, y: number, w: number, h: number): Point[] {
  return pathUV.map((q) => ({ x: x + q.u * w, y: y + q.v * h }));
}

export function distPointToSegment(P: Point, A: Point | null | undefined, B: Point | null | undefined): {
  d: number;
  t: number;
  H: Point;
} {
  if (!A || !B) {
    const fallback = A ?? B ?? { x: 0, y: 0 };
    return { d: Infinity, t: 0, H: fallback };
  }

  const vx = B.x - A.x;
  const vy = B.y - A.y;
  const wx = P.x - A.x;
  const wy = P.y - A.y;
  const vv = vx * vx + vy * vy;

  const t = vv === 0 ? 0 : Math.max(0, Math.min(1, (wx * vx + wy * vy) / vv));
  const H: Point = { x: A.x + t * vx, y: A.y + t * vy };

  const dx = P.x - H.x;
  const dy = P.y - H.y;
  return { d: Math.hypot(dx, dy), t, H };
}
