import type { RootState } from '@app/store/store.ts';
import type { Shape, ToolKind } from '../types.ts';

export const selectCanvas = (s: RootState) => s.canvas;
export const selectShapes = (s: RootState): Shape[] => selectCanvas(s).shapes;
export const selectFocusId = (s: RootState): number | null => selectCanvas(s).focusId;
export const selectTool = (s: RootState): ToolKind => selectCanvas(s).tool;
export const selectViewport = (s: RootState) => selectCanvas(s).viewport;
export const selectBackground = (s: RootState): string => selectCanvas(s).background;
export const selectFocusedShape = (s: RootState): Shape | undefined => {
  const id = selectFocusId(s);
  if (id == null) return undefined;
  return selectShapes(s).find((sh) => sh.id === id);
};
