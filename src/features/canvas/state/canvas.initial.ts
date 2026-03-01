import type { CanvasState } from '@features/canvas/types.ts';

/**
 * canvasSlice 초기 상태 및 슬라이스 이름
 */
export const CANVAS_NAME = 'canvas' as const;

export const CANVAS_STATE: CanvasState = {
  shapes: [],
  focusId: null,
  nextId: 1,
  past: [],
  future: [],

  // v1 minimal UI state (self-contained)
  tool: 'select',
  viewport: { scale: 1, tx: 0, ty: 0 },
  background: '#ffffff',
};
