export type ShapeType =
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'polygon'
  | 'star'
  | 'path'
  | 'text';

/**
 * Canvas tool kinds.
 * - select: pick/move shapes
 * - freedraw: creates a "path" shape
 * - rect/ellipse/line/text/polygon/star: create corresponding shapes
 */
export type ToolKind =
  | 'select'
  | 'freedraw'
  | 'rect'
  | 'ellipse'
  | 'line'
  | 'text'
  | 'polygon'
  | 'star';

export type HandleKey =
  | 'nw'
  | 'ne'
  | 'sw'
  | 'se'
  | 'n'
  | 's'
  | 'w'
  | 'e';

export interface PathPoint {
  u: number;
  v: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ViewTransform {
  scale: number;
  tx: number;
  ty: number;
  rotation?: number;
}

export interface Shape {
  id: number;
  pickId: number;
  type: ShapeType;

  // 기본 bbox
  x: number;
  y: number;
  w: number;
  h: number;

  // 스타일
  stroke?: string;
  fill?: string;
  strokeWidth?: number;

  // line 옵션 (일부 로직에서 사용)
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;

  // polygon/star 옵션
  sides?: number;
  points?: number;
  innerRatio?: number;

  // path 옵션
  path?: PathPoint[];
  closePath?: boolean;

  // text 옵션
  text?: string;
  font?: string;
  color?: string;
  align?: CanvasTextAlign;
  lineHeight?: number;

  // 변형 옵션(일부 기능에서 사용)
  rotation?: number;
}

export interface CanvasSnapshot {
  shapes: Shape[];
  focusId: number | null;
  nextId: number;
}

export interface CanvasState {
  shapes: Shape[];
  focusId: number | null;
  nextId: number;
  past: CanvasSnapshot[];
  future: CanvasSnapshot[];

  /** UI state (kept minimal for v1) */
  tool: ToolKind;
  viewport: { scale: number; tx: number; ty: number };
  background: string;
}
