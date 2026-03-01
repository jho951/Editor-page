import type { Block, BlockType } from "../../../type/Block.types";
import { clamp } from "@shared/lib/clamp.ts";
import { generateId } from "@shared/lib/id.ts";
import { A } from "./editorActions";

export type SlashState = {
  open: boolean;
  blockId: string | null;
  query: string;
  top: number;
  left: number;
  activeIndex: number;
};

export type BlockMenuState = {
  open: boolean;
  blockId: string | null;
  top: number;
  left: number;
  query: string;
  activeIndex: number;
};

export type EditorState = {
  title: string;
  blocks: Block[];

  focusId: string | null;

  selecting: boolean;
  selectionAnchorId: string | null;
  selectedIds: string[];

  dragging: boolean;
  dragIds: string[];
  dropIndex: number | null;

  slash: SlashState;
  blockMenu: BlockMenuState;
};

type AnyAction = { type: string; [k: string]: any };

function makeBlock(type: BlockType = "paragraph"): Block {
  return {
    id: generateId(),
    type,
    text: "",
    checked: type === "to_do" ? false : undefined,
  };
}

function ensureNonEmpty(blocks: Block[]): Block[] {
  return blocks.length ? blocks : [makeBlock("paragraph")];
}

function idxOf(blocks: Block[], id: string) {
  return blocks.findIndex((b) => b.id === id);
}

function reorder(blocks: Block[], dragIds: string[], dropIndex: number) {
  const moving = blocks.filter((b) => dragIds.includes(b.id));
  const remaining = blocks.filter((b) => !dragIds.includes(b.id));
  const insertAt = clamp(dropIndex, 0, remaining.length);
  const next = remaining.slice();
  next.splice(insertAt, 0, ...moving);
  return next;
}

export function createInitialEditorState(params: { initialTitle?: string; initialBlocks?: Block[] }): EditorState {
  const blocks = ensureNonEmpty(params.initialBlocks?.length ? params.initialBlocks : [makeBlock("paragraph")]);
  return {
    title: params.initialTitle ?? "제목 없음",
    blocks,
    focusId: blocks[0]?.id ?? null,

    selecting: false,
    selectionAnchorId: null,
    selectedIds: [],

    dragging: false,
    dragIds: [],
    dropIndex: null,

    slash: { open: false, blockId: null, query: "", top: 0, left: 0, activeIndex: 0 },
    blockMenu: { open: false, blockId: null, top: 0, left: 0, query: "", activeIndex: 0 },
  };
}

export function editorReducer(state: EditorState, action: AnyAction): EditorState {
  switch (action.type) {
    case A.BLOCKS_REPLACE: {
      const blocks = ensureNonEmpty(action.blocks ?? state.blocks);
      const focusId = (action.focusId ?? state.focusId) as string | null;
      return { ...state, blocks, focusId };
    }
    case A.TITLE_SET:
      return { ...state, title: action.title };

    case A.FOCUS_SET:
      return { ...state, focusId: action.id ?? null };

    case A.SELECT_BEGIN:
      return { ...state, selecting: true, selectionAnchorId: action.id, selectedIds: [action.id] };

    case A.SELECT_EXTEND_TO: {
      if (!state.selecting || !state.selectionAnchorId) return state;
      const start = idxOf(state.blocks, state.selectionAnchorId);
      const cur = idxOf(state.blocks, action.id);
      if (start === -1 || cur === -1) return state;
      const min = Math.min(start, cur);
      const max = Math.max(start, cur);
      const selectedIds = state.blocks.slice(min, max + 1).map((b) => b.id);
      return { ...state, selectedIds };
    }

    case A.SELECT_END:
      return { ...state, selecting: false, selectionAnchorId: null };

    case A.SELECT_SET: {
      const ids = Array.isArray(action.ids) ? action.ids : [];
      return { ...state, selecting: false, selectionAnchorId: null, selectedIds: ids };
    }

    case A.SELECT_CLEAR:
      return { ...state, selectedIds: [] };

    case A.BLOCK_INPUT: {
      const blocks = state.blocks.map((b) => (b.id === action.id ? { ...b, text: action.text } : b));
      return { ...state, blocks, selectedIds: [] };
    }

    case A.BLOCK_INSERT_AFTER: {
      const i = idxOf(state.blocks, action.afterId);
      const nb = (action.block as Block | undefined) ?? makeBlock(action.blockType ?? "paragraph");
      const next = state.blocks.slice();
      next.splice(i + 1, 0, nb);
      return {
        ...state,
        blocks: next,
        focusId: nb.id,
        slash: { ...state.slash, open: false, blockId: null, query: "", activeIndex: 0 },
      };
    }

    case A.BLOCK_CHANGE_TYPE: {
      const blocks = state.blocks.map((b) => {
        if (b.id !== action.id) return b;
        const newType: BlockType = action.newType;
        return {
          ...b,
          type: newType,
          text: b.type === newType ? b.text : "",
          checked: newType === "to_do" ? false : undefined,
        };
      });
      return {
        ...state,
        blocks,
        slash: { ...state.slash, open: false, blockId: null, query: "", activeIndex: 0 },
      };
    }

    case A.BLOCK_TOGGLE_TODO: {
      const blocks = state.blocks.map((b) => (b.id === action.id ? { ...b, checked: !b.checked } : b));
      return { ...state, blocks };
    }

    case A.BLOCK_MERGE_WITH_PREV: {
      const i = idxOf(state.blocks, action.id);
      if (i <= 0) return state;
      const prev = state.blocks[i - 1];
      const cur = state.blocks[i];
      const next = state.blocks.slice();
      next[i - 1] = { ...prev, text: (prev.text ?? "") + (cur.text ?? "") };
      next.splice(i, 1);
      return { ...state, blocks: ensureNonEmpty(next), focusId: prev.id };
    }

    case A.BLOCK_DELETE_SELECTED: {
      const ids: string[] = action.ids?.length ? action.ids : state.selectedIds;
      if (!ids.length) return state;
      const remaining = state.blocks.filter((b) => !ids.includes(b.id));
      const blocks = ensureNonEmpty(remaining);

      let focusId = state.focusId;
      if (!focusId || ids.includes(focusId)) focusId = blocks[0]?.id ?? null;

      return { ...state, blocks, focusId, selectedIds: [], blockMenu: { ...state.blockMenu, open: false, blockId: null, query: "", activeIndex: 0 } };
    }

    case A.DRAG_BEGIN:
      return { ...state, dragging: true, dragIds: action.dragIds, dropIndex: action.dropIndex, selectedIds: action.dragIds };

    case A.DRAG_OVER:
      if (!state.dragging) return state;
      return { ...state, dropIndex: action.dropIndex };

    case A.DRAG_DROP:
      if (!state.dragging || state.dropIndex == null) return state;
      return { ...state, blocks: reorder(state.blocks, state.dragIds, state.dropIndex), dragging: false, dragIds: [], dropIndex: null };

    case A.DRAG_END:
      return { ...state, dragging: false, dragIds: [], dropIndex: null };

    // Slash menu
    case A.SLASH_OPEN:
      return { ...state, slash: { open: true, blockId: action.blockId, query: "", top: action.top, left: action.left, activeIndex: 0 } };

    case A.SLASH_QUERY:
      if (!state.slash.open) return state;
      return { ...state, slash: { ...state.slash, query: action.query, activeIndex: 0 } };

    case A.SLASH_ACTIVE_SET:
      return { ...state, slash: { ...state.slash, activeIndex: action.index } };

    case A.SLASH_ACTIVE_MOVE: {
      const next = clamp((state.slash.activeIndex ?? 0) + (action.delta ?? 0), 0, action.max - 1);
      return { ...state, slash: { ...state.slash, activeIndex: next } };
    }

    case A.SLASH_CLOSE:
      return { ...state, slash: { ...state.slash, open: false, blockId: null, query: "", activeIndex: 0 } };

    // Block action menu
    case A.BLOCK_MENU_OPEN:
      return { ...state, blockMenu: { open: true, blockId: action.blockId, top: action.top, left: action.left, query: "", activeIndex: 0 } };

    case A.BLOCK_MENU_QUERY:
      if (!state.blockMenu.open) return state;
      return { ...state, blockMenu: { ...state.blockMenu, query: action.query, activeIndex: 0 } };

    case A.BLOCK_MENU_ACTIVE_SET:
      return { ...state, blockMenu: { ...state.blockMenu, activeIndex: action.index } };

    case A.BLOCK_MENU_ACTIVE_MOVE: {
      const next = clamp((state.blockMenu.activeIndex ?? 0) + (action.delta ?? 0), 0, action.max - 1);
      return { ...state, blockMenu: { ...state.blockMenu, activeIndex: next } };
    }

    case A.BLOCK_MENU_CLOSE:
      return { ...state, blockMenu: { ...state.blockMenu, open: false, blockId: null, query: "", activeIndex: 0 } };


    // Backward-compat: older refactors used this magic action string.
    case "__REPLACE_BLOCKS__": {
      const blocks = ensureNonEmpty(action.blocks ?? state.blocks);
      return { ...state, blocks, focusId: action.focusId ?? state.focusId };
    }
    default:
      return state;
  }
}
