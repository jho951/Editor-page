import type { RootState } from '@app/store/store.ts';
import type { Shape } from '@features/canvas/types.ts';

export type SnapshotDocument = {
  view: { tx: number; ty: number; scale: number };
  canvas: { background?: string | null };
  shapes: Shape[];
};

/**
 * 현재 Redux state를 "문서 저장" 가능한 스냅샷으로 직렬화합니다.
 */
export function takeSnapshot(state: RootState): SnapshotDocument {
  const canvas = state.canvas;
  const view = canvas?.viewport ?? { tx: 0, ty: 0, scale: 1 };

  return {
    view: {
      tx: Number(view.tx) || 0,
      ty: Number(view.ty) || 0,
      scale: Number(view.scale) || 1,
    },
    canvas: { background: canvas?.background ?? null },
    shapes: Array.isArray(canvas?.shapes) ? canvas.shapes : [],
  };
}
