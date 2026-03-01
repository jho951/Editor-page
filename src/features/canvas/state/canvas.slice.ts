import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CanvasSnapshot, CanvasState, Shape, ToolKind } from '@features/canvas/types.ts';
import { CANVAS_NAME, CANVAS_STATE } from './canvas.initial.ts';

const HISTORY_LIMIT = 100;
const clampScale = (s: number) => Math.max(0.1, Math.min(8, s));

function snapshotOf(state: CanvasState): CanvasSnapshot {
  return {
    shapes: state.shapes,
    focusId: state.focusId,
    nextId: state.nextId,
  };
}

function restoreSnapshot(state: CanvasState, snap: CanvasSnapshot): void {
  state.shapes = Array.isArray(snap.shapes) ? snap.shapes : [];
  state.focusId = snap.focusId ?? null;
  state.nextId = Number(snap.nextId) || 1;
}

function ensureShapeIds(shapes: Shape[]): { shapes: Shape[]; nextId: number } {
  let maxId = 0;
  const next = shapes.map((s, idx) => {
    const id = Number(s.id) || idx + 1;
    maxId = Math.max(maxId, id);
    const pickId = Number(s.pickId) || id;
    return { ...s, id, pickId };
  });
  return { shapes: next, nextId: maxId + 1 };
}

type AddShapePayload = Partial<Omit<Shape, 'id' | 'pickId'>> & { type: Shape['type'] };

type MoveShapePayload = { id: number; dx: number; dy: number };

const canvasSlice = createSlice({
  name: CANVAS_NAME,
  initialState: CANVAS_STATE,
  reducers: {
    // ---------- UI state ----------
    setTool(state, action: PayloadAction<ToolKind>) {
      state.tool = action.payload;
    },
    setViewport(state, action: PayloadAction<Partial<CanvasState['viewport']>>) {
      const next = { ...state.viewport, ...action.payload };
      next.scale = clampScale(Number(next.scale) || 1);
      next.tx = Number(next.tx) || 0;
      next.ty = Number(next.ty) || 0;
      state.viewport = next;
    },
    setBackground(state, action: PayloadAction<string>) {
      state.background = action.payload || '#ffffff';
    },

    // ---------- focus ----------
    setFocus(state, action: PayloadAction<number>) {
      state.focusId = action.payload;
    },
    clearFocus(state) {
      state.focusId = null;
    },

    // ---------- history ----------
    historyStart(state) {
      state.past.push(snapshotOf(state));
      if (state.past.length > HISTORY_LIMIT) state.past.shift();
      state.future = [];
    },
    undo(state) {
      const prev = state.past.pop();
      if (!prev) return;
      state.future.push(snapshotOf(state));
      restoreSnapshot(state, prev);
    },
    redo(state) {
      const next = state.future.pop();
      if (!next) return;
      state.past.push(snapshotOf(state));
      restoreSnapshot(state, next);
    },

    // ---------- shapes ----------
    addShape(state, action: PayloadAction<AddShapePayload>) {
      const base = action.payload;
      const id = state.nextId;
      state.nextId += 1;

      const shape: Shape = {
        id,
        pickId: id,
        type: base.type,
        x: Number(base.x) || 0,
        y: Number(base.y) || 0,
        w: Math.max(1, Number(base.w) || 1),
        h: Math.max(1, Number(base.h) || 1),
        stroke: base.stroke ?? '#222',
        fill: base.fill ?? 'transparent',
        strokeWidth: Number(base.strokeWidth) || 2,

        x1: base.x1,
        y1: base.y1,
        x2: base.x2,
        y2: base.y2,

        sides: base.sides,
        points: base.points,
        innerRatio: base.innerRatio,

        path: base.path,
        closePath: base.closePath,

        text: base.text,
        font: base.font,
        color: base.color,
        align: base.align,
        lineHeight: base.lineHeight,

        rotation: base.rotation,
      };

      state.shapes.push(shape);
      state.focusId = id;
    },
    moveShape(state, action: PayloadAction<MoveShapePayload>) {
      const { id, dx, dy } = action.payload;
      const s = state.shapes.find((sh) => sh.id === id);
      if (!s) return;

      s.x += dx;
      s.y += dy;

      // line endpoints도 같이 이동
      if (s.type === 'line') {
        if (typeof s.x1 === 'number') s.x1 += dx;
        if (typeof s.y1 === 'number') s.y1 += dy;
        if (typeof s.x2 === 'number') s.x2 += dx;
        if (typeof s.y2 === 'number') s.y2 += dy;
      }
    },

    replaceAll(state, action: PayloadAction<{ shapes: Shape[] }>) {
      const incoming = Array.isArray(action.payload.shapes) ? action.payload.shapes : [];
      const { shapes, nextId } = ensureShapeIds(incoming);
      state.shapes = shapes;
      state.nextId = nextId;
      state.focusId = null;
      state.past = [];
      state.future = [];
    },
  },
});

export const canvasActions = canvasSlice.actions;
export const canvasReducer = canvasSlice.reducer;

export const {
  setTool,
  setViewport,
  setBackground,
  setFocus,
  clearFocus,
  historyStart,
  undo,
  redo,
  addShape,
  moveShape,
  replaceAll,
} = canvasSlice.actions;
