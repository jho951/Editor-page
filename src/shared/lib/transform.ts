import type { Shape } from "@features/canvas/types.ts";

export interface ParsedVector {
  view: { tx: number; ty: number; scale: number };
  canvas: { background: string };
  shapes: Shape[];
}

type VectorDoc = {
  view?: { tx?: unknown; ty?: unknown; scale?: unknown };
  canvas?: { background?: unknown };
  layers?: unknown;
};

type VectorLayer = { type?: unknown; shapes?: unknown };

type VectorShape = Record<string, unknown>;

type VectorPathPoint = { u?: unknown; v?: unknown };

export function parseVectorJson(vectorJson: unknown): ParsedVector {
  if (!vectorJson) {
    return {
      view: { tx: 0, ty: 0, scale: 1 },
      canvas: { background: '#f5f5f5' },
      shapes: [],
    };
  }

  const doc: VectorDoc = typeof vectorJson === 'string' ? (JSON.parse(vectorJson) as VectorDoc) : (vectorJson as VectorDoc);

  const view = {
    tx: Number(doc.view?.tx) || 0,
    ty: Number(doc.view?.ty) || 0,
    scale: Number(doc.view?.scale) || 1,
  };

  const canvas = {
    background: (typeof doc.canvas?.background === 'string' ? doc.canvas.background : '#f5f5f5') as string,
  };

  const layers = Array.isArray(doc.layers) ? (doc.layers as VectorLayer[]) : [];
  const vectorLayer =
    layers.find((l) => String(l.type ?? '').toLowerCase() === 'vector') ??
    layers[0] ??
    ({ shapes: [] } as VectorLayer);

  const arr = Array.isArray(vectorLayer.shapes) ? (vectorLayer.shapes as VectorShape[]) : [];

  const shapes: Shape[] = arr.map((s): Shape => {
    const type = String(s.type ?? 'rect');
    const id = Number(s.id) || 0;

    const base: Shape = {
      id,
      pickId: id,
      type: type as Shape['type'],
      x: Number(s.x) || 0,
      y: Number(s.y) || 0,
      w: Number(s.w) || 0,
      h: Number(s.h) || 0,
      stroke: (typeof s.stroke === 'string' ? s.stroke : '#333') as string,
      fill: type === 'line' ? undefined : ((typeof s.fill === 'string' ? s.fill : '#fff') as string),
      strokeWidth: Number(s.strokeWidth) || 2,
    };

    if (type === 'polygon') base.sides = Number(s.sides) || 5;
    if (type === 'star') {
      base.points = Number(s.points) || 5;
      base.innerRatio = Number(s.innerRatio) || 0.5;
    }
    if (type === 'path') {
      base.path = Array.isArray(s.path)
        ? (s.path as VectorPathPoint[]).map((p) => ({ u: Number(p.u) || 0, v: Number(p.v) || 0 }))
        : [];
    }
    if (type === 'text') {
      base.text = typeof s.text === 'string' ? s.text : '';
      base.font = typeof s.font === 'string' ? s.font : '16px sans-serif';
      base.color = typeof s.color === 'string' ? s.color : '#111';
      base.align = (typeof s.align === 'string' ? s.align : 'left') as CanvasTextAlign;
      base.lineHeight = Number(s.lineHeight) || 1.3;
    }

    return base;
  });

  return { view, canvas, shapes };
}
