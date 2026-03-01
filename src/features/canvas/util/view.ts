export interface ViewTransform {
  scale: number;
  tx: number;
  ty: number;
}

export interface Point {
  x: number;
  y: number;
}

export function screenToWorld(view: Partial<ViewTransform> | null | undefined, xs: number, ys: number): Point {
  const v: ViewTransform = {
    scale: view?.scale ?? 1,
    tx: view?.tx ?? 0,
    ty: view?.ty ?? 0,
  };
  return { x: (xs - v.tx) / v.scale, y: (ys - v.ty) / v.scale };
}

export function worldToScreen(view: Partial<ViewTransform> | null | undefined, xw: number, yw: number): Point {
  const v: ViewTransform = {
    scale: view?.scale ?? 1,
    tx: view?.tx ?? 0,
    ty: view?.ty ?? 0,
  };
  return { x: xw * v.scale + v.tx, y: yw * v.scale + v.ty };
}
