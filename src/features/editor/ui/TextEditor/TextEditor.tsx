import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { clamp } from "@shared/lib/clamp.ts";
import { generateId } from "@shared/lib/id.ts";

import type { TextEditorProps, TextEditorRef } from "../../type/TextEditor.types";
import type { Block, BlockType } from "../../type/Block.types";

import { isCaretAtStart } from "../../util/isCaretAtStart";
import { getTextFromEditable } from "../../util/getTextFromEditable";

import { BLOCK_PLACEHOLDERS } from "../../config/placeholder";

import { A } from "./hooks/editorActions";
import { useEditorMachine } from "./hooks/useEditorMachine";
import { BlockRow } from "./components/BlockRow";
import { SlashMenu } from "./components/SlashMenu";
import { BlockActionMenu } from "./components/BlockActionMenu";
import { BLOCK_ACTION_ITEMS } from "./config/blockActionMenu";
import type { BlockActionId } from "./config/blockActionMenu";

import styles from "./TextEditor.module.css";

function getSelectionOffsetsWithin(root: HTMLElement): { start: number; end: number } {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    const len = root.innerText.length;
    return { start: len, end: len };
  }

  const range = sel.getRangeAt(0);
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) {
    const len = root.innerText.length;
    return { start: len, end: len };
  }

  const preStart = range.cloneRange();
  preStart.selectNodeContents(root);
  preStart.setEnd(range.startContainer, range.startOffset);
  const start = preStart.toString().length;

  const preEnd = range.cloneRange();
  preEnd.selectNodeContents(root);
  preEnd.setEnd(range.endContainer, range.endOffset);
  const end = preEnd.toString().length;

  return { start: Math.min(start, end), end: Math.max(start, end) };
}

const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  ({ initialTitle = "", initialBlocks, onChange }, ref) => {
    const { state, dispatch } = useEditorMachine({ initialTitle, initialBlocks, onChange });

    const wrapRef = useRef<HTMLDivElement | null>(null);

    const titleRef = useRef<HTMLDivElement | null>(null);
    const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const ghostRef = useRef<HTMLDivElement | null>(null);

    const blockMenuRectRef = useRef<{
      top: number;
      left: number;
      right: number;
      bottom: number;
      width: number;
      height: number;
    } | null>(null);

    const dragIdsRef = useRef<string[]>([]);
    const autoScrollFrameRef = useRef<number | null>(null);
    const autoScrollDeltaRef = useRef<number>(0);
    const isComposingRef = useRef(false);
    const [isTitleFocused, setIsTitleFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      focusTitle: () => titleRef.current?.focus(),
    }));

    const setBlockRef = useCallback((id: string, el: HTMLDivElement | null) => {
      blockRefs.current[id] = el;
    }, []);

    const focusBlock = useCallback((id: string, atEnd = true) => {
      const el = blockRefs.current[id];
      if (!el) return;
      el.focus();
      if (!atEnd) return;

      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }, []);

    // Keep DOM text in sync when NOT focused (avoid clobbering caret/IME)
    useEffect(() => {
      for (const b of state.blocks) {
        const el = blockRefs.current[b.id];
        if (!el) continue;
        const isFocused = document.activeElement === el;
        if (isFocused || isComposingRef.current) continue;

        const cur = getTextFromEditable(el);
        if (cur !== b.text) el.innerText = b.text;
      }
    }, [state.blocks]);

    // Sync title DOM when not focused
    useEffect(() => {
      const el = titleRef.current;
      if (!el) return;
      const isFocused = document.activeElement === el;
      if (isFocused || isComposingRef.current) return;

      const cur = el.innerText.replace(/\n$/, "");
      if (cur !== state.title) el.innerText = state.title;
    }, [state.title]);

    const createNewBlock = useCallback((type: BlockType = "paragraph"): Block => {
      return {
        id: generateId(),
        type,
        text: "",
        checked: type === "to_do" ? false : undefined,
      };
    }, []);

    // ---------- Title ----------
    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (isComposingRef.current) return;
      if (e.key === "Enter") {
        e.preventDefault();
        const first = state.blocks[0];
        if (first) focusBlock(first.id, false);
      }
    };

    const handleBlockInput = useCallback((e: React.FormEvent<HTMLDivElement>, blockId: string) => {
      const text = getTextFromEditable(e.currentTarget);
      dispatch({ type: A.BLOCK_INPUT, id: blockId, text });
    }, [dispatch]);

    /**
     * Notion-like multi-line paste:
     * - If pasted text contains line breaks, split into multiple paragraph blocks.
     * - Keep caret insertion within the current block (best-effort with Range text length).
     */
    const handleBlockPaste = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>, block: Block, idx: number) => {
        const plain = e.clipboardData.getData("text/plain");
        if (!plain) return;

        const normalized = plain.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
        if (!normalized.includes("\n")) return; // let browser handle single-line paste

        e.preventDefault();

        const el = blockRefs.current[block.id];
        const existing = state.blocks[idx]?.text ?? "";

        const { start, end } = el ? getSelectionOffsetsWithin(el) : { start: existing.length, end: existing.length };
        const before = existing.slice(0, start);
        const after = existing.slice(end);

        const lines = normalized.split("\n");
        const firstLine = lines[0] ?? "";
        const rest = lines.slice(1);

        const updatedCurrent: Block = { ...block, text: before + firstLine + after };
        const inserted: Block[] = rest.map((t) => ({ id: generateId(), type: "paragraph", text: t } as Block));

        const next = state.blocks.slice();
        next[idx] = updatedCurrent;
        if (inserted.length) next.splice(idx + 1, 0, ...inserted);

        const focusId = inserted.length ? inserted[inserted.length - 1].id : updatedCurrent.id;
        dispatch({ type: A.BLOCKS_REPLACE, blocks: next, focusId });

        // Focus last inserted block (Notion behavior: caret moves to end of pasted content)
        setTimeout(() => focusBlock(focusId, true), 0);
      },
      [dispatch, focusBlock, state.blocks]
    );

    const openSlashMenuAtEl = useCallback((blockId: string, el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      dispatch({ type: A.SLASH_OPEN, blockId, top: rect.bottom + 4, left: rect.left });
    }, [dispatch]);

    const closeSlashMenu = useCallback(() => dispatch({ type: A.SLASH_CLOSE }), [dispatch]);

    const changeBlockType = useCallback((blockId: string, newType: BlockType) => {
      dispatch({ type: A.BLOCK_CHANGE_TYPE, id: blockId, newType });
      // focus after DOM updates
      setTimeout(() => focusBlock(blockId), 0);
    }, [dispatch, focusBlock]);

    const handleBlockKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>, block: Block, idx: number) => {
      if (isComposingRef.current) return;

      const el = blockRefs.current[block.id];
      if (!el) return;

      const currentText = getTextFromEditable(el);

      // Slash: when empty + "/"
      if (e.key === "/" && currentText === "") {
        e.preventDefault();
        openSlashMenuAtEl(block.id, el);
        return;
      }

      // Enter: split / create new block
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();

        // Notion UX: empty special block -> paragraph
        if (currentText.trim() === "" && block.type !== "paragraph") {
          changeBlockType(block.id, "paragraph");
          return;
        }

        const nb = createNewBlock("paragraph");
        dispatch({ type: A.BLOCK_INSERT_AFTER, afterId: block.id, blockType: "paragraph", block: nb });
        // focus by reducer focusId
        setTimeout(() => focusBlock(nb.id, false), 0);
        closeSlashMenu();
        return;
      }

      // Backspace: merge with prev if caret at start
      if (e.key === "Backspace" && idx > 0 && isCaretAtStart(el)) {
        e.preventDefault();
        dispatch({ type: A.BLOCK_MERGE_WITH_PREV, id: block.id });
        const prevId = state.blocks[idx - 1]?.id;
        if (prevId) setTimeout(() => focusBlock(prevId, true), 0);
        return;
      }

      // Multi selection delete (when focus not inside editable)
      if ((e.key === "Backspace" || e.key === "Delete") && state.selectedIds.length > 1) {
        // allow if focus isn't on editable (Notion-like multi delete)
        if (document.activeElement !== el) {
          e.preventDefault();
          dispatch({ type: A.BLOCK_DELETE_SELECTED, ids: state.selectedIds });
          return;
        }
      }
    }, [dispatch, openSlashMenuAtEl, changeBlockType, createNewBlock, focusBlock, closeSlashMenu, state.blocks, state.selectedIds]);

    // ---------- Selection ----------
    const handleRowMouseDown = (e: React.MouseEvent<HTMLDivElement>, id: string) => {
      // ignore clicks on gutter buttons
      if ((e.target as HTMLElement).closest(`.${styles.gutter}`)) return;

      // If user clicked directly inside contentEditable, let browser handle caret
      const active = document.activeElement as HTMLElement | null;
      if (active?.contentEditable === "true") return;

      dispatch({ type: A.SELECT_BEGIN, id });
    };

    const handleRowMouseEnter = (id: string) => {
      if (!state.selecting) return;
      dispatch({ type: A.SELECT_EXTEND_TO, id });
    };

    useEffect(() => {
      const onUp = () => dispatch({ type: A.SELECT_END });
      window.addEventListener("mouseup", onUp);
      return () => window.removeEventListener("mouseup", onUp);
    }, [dispatch]);

    // ---------- Drag & drop ----------
    const cleanupDrag = useCallback(() => {
      dragIdsRef.current = [];
      dispatch({ type: A.DRAG_END });
      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.display = "none";
        ghost.dataset.count = "0";
        ghost.innerHTML = "";
      }
      autoScrollDeltaRef.current = 0;
      if (autoScrollFrameRef.current != null) {
        cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
    }, [dispatch]);

    const findScrollParent = useCallback((): HTMLElement | null => {
      let cur: HTMLElement | null = wrapRef.current;
      while (cur) {
        const style = window.getComputedStyle(cur);
        const canScroll = /(auto|scroll)/.test(style.overflowY) && cur.scrollHeight > cur.clientHeight;
        if (canScroll) return cur;
        cur = cur.parentElement;
      }
      return document.scrollingElement as HTMLElement | null;
    }, []);

    const runAutoScroll = useCallback((container: HTMLElement) => {
      if (autoScrollFrameRef.current != null) return;
      const tick = () => {
        const delta = autoScrollDeltaRef.current;
        if (delta === 0) {
          autoScrollFrameRef.current = null;
          return;
        }
        container.scrollTop += delta;
        autoScrollFrameRef.current = requestAnimationFrame(tick);
      };
      autoScrollFrameRef.current = requestAnimationFrame(tick);
    }, []);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, idx: number, block: Block) => {
      const inSelection = state.selectedIds.includes(block.id);
      const ids = inSelection ? state.selectedIds : [block.id];
      dragIdsRef.current = ids;

      // close menus while dragging
      dispatch({ type: A.BLOCK_MENU_CLOSE });
      dispatch({ type: A.SLASH_CLOSE });

      // prevent default drag image
      e.dataTransfer.effectAllowed = "move";
      const img = new Image();
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);

      // ghost
      const ghost = ghostRef.current;
      if (ghost) {
        ghost.innerHTML = "";
        const rows = Array.from(
          wrapRef.current?.querySelectorAll(`.${styles.blockRow}`) ?? []
        ) as HTMLDivElement[];
        const sourceRow = rows.find((r) => r.dataset.blockid === ids[0]) ?? null;

        if (sourceRow) {
          const clone = sourceRow.cloneNode(true) as HTMLDivElement;
          clone.classList.add(styles.ghostRow);
          clone.removeAttribute("data-blockid");

          const gutter = clone.querySelector(`.${styles.gutter}`);
          if (gutter) gutter.remove();

          clone.querySelectorAll("[contenteditable]").forEach((el) => {
            (el as HTMLElement).setAttribute("contenteditable", "false");
          });
          clone.querySelectorAll("[draggable='true']").forEach((el) => {
            (el as HTMLElement).setAttribute("draggable", "false");
          });

          ghost.appendChild(clone);
        }

        if (ids.length > 1) {
          const badge = document.createElement("div");
          badge.className = styles.ghostBadge;
          badge.innerText = `+${ids.length - 1}`;
          ghost.appendChild(badge);
        }

        ghost.style.display = "block";
        ghost.dataset.count = String(ids.length);
      }

      const remaining = state.blocks.filter((b) => !ids.includes(b.id));
      const dropIndex = clamp(idx, 0, remaining.length);

      dispatch({ type: A.DRAG_BEGIN, dragIds: ids, dropIndex });
    };

    const computeDropIndex = (clientY: number): number | null => {
      const remaining = state.blocks.filter((b) => !dragIdsRef.current.includes(b.id));
      if (!remaining.length) return 0;

      const rows = Array.from(wrapRef.current?.querySelectorAll(`.${styles.blockRow}`) ?? []) as HTMLDivElement[];
      if (!rows.length) return state.dropIndex;

      const targets = rows.filter((r) => {
        const id = r.dataset.blockid;
        return !!id && !dragIdsRef.current.includes(id);
      });
      if (!targets.length) return state.dropIndex;

      for (let i = 0; i < targets.length; i++) {
        const row = targets[i];
        const id = row.dataset.blockid!;
        const rect = row.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        if (clientY < mid) {
          const idx = remaining.findIndex((b) => b.id === id);
          return idx === -1 ? state.dropIndex : clamp(idx, 0, remaining.length);
        }
      }
      return remaining.length;
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!state.dragging) return;
      e.dataTransfer.dropEffect = "move";

      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.left = `${e.clientX + 16}px`;
        ghost.style.top = `${e.clientY + 16}px`;
      }

      const scroller = findScrollParent();
      if (scroller) {
        const rect = scroller.getBoundingClientRect();
        const edge = 80;
        const maxSpeed = 14;
        let delta = 0;
        if (e.clientY < rect.top + edge) {
          delta = -Math.ceil(((rect.top + edge) - e.clientY) / edge * maxSpeed);
        } else if (e.clientY > rect.bottom - edge) {
          delta = Math.ceil((e.clientY - (rect.bottom - edge)) / edge * maxSpeed);
        }
        autoScrollDeltaRef.current = delta;
        if (delta !== 0) runAutoScroll(scroller);
      }

      const next = computeDropIndex(e.clientY);
      if (next != null && next !== state.dropIndex) {
        dispatch({ type: A.DRAG_OVER, dropIndex: next });
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (!dragIdsRef.current.length || state.dropIndex == null) return;

      dispatch({ type: A.DRAG_DROP });

      const firstId = dragIdsRef.current[0];
      if (firstId) setTimeout(() => focusBlock(firstId, true), 0);

      cleanupDrag();
    };

    // ---------- Block action menu ----------
    const openBlockMenuAtRect = useCallback((blockId: string, rect: DOMRect) => {
      dispatch({ type: A.BLOCK_MENU_OPEN, blockId, top: rect.bottom + 6, left: rect.left });
    }, [dispatch]);

    const closeBlockMenu = useCallback(() => dispatch({ type: A.BLOCK_MENU_CLOSE }), [dispatch]);

    // Close menus on scroll/resize to avoid "floating" panels drifting away.
    useEffect(() => {
      if (!state.slash.open && !state.blockMenu.open) return;
      const closeAll = () => {
        closeSlashMenu();
        closeBlockMenu();
      };
      window.addEventListener("scroll", closeAll, true);
      window.addEventListener("resize", closeAll);
      return () => {
        window.removeEventListener("scroll", closeAll, true);
        window.removeEventListener("resize", closeAll);
      };
    }, [state.slash.open, state.blockMenu.open, closeSlashMenu, closeBlockMenu]);

    const handleDragHandleClick = (e: React.MouseEvent<HTMLDivElement>, block: Block) => {
      // Prevent page click close
      e.stopPropagation();
      e.preventDefault();

      // Notion-like: clicking the handle selects the block (and opens menu)
      if (!state.selectedIds.includes(block.id)) {
        dispatch({ type: A.SELECT_SET, ids: [block.id] });
      }

      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      openBlockMenuAtRect(block.id, rect);
    };

    const blockMenuItems = useMemo(() => {
      // filter in menu itself; we still pass full list here
      return BLOCK_ACTION_ITEMS;
    }, []);

    const getTargetBlockIds = useCallback((): string[] => {
      const menuId = state.blockMenu.blockId;
      if (!menuId) return [];
      const sel = state.selectedIds?.length ? state.selectedIds : [menuId];
      return sel.includes(menuId) ? sel : [menuId];
    }, [state.blockMenu.blockId, state.selectedIds]);

    const deleteByIds = useCallback((ids: string[]) => {
      if (!ids.length) return;
      dispatch({ type: A.BLOCK_DELETE_SELECTED, ids });
      dispatch({ type: A.BLOCK_MENU_CLOSE });
      dispatch({ type: A.SLASH_CLOSE });
    }, [dispatch]);

    const duplicateByIds = useCallback((ids: string[]) => {
      if (!ids.length) return;

      const set = new Set(ids);
      const ordered = state.blocks.filter((b) => set.has(b.id));
      if (!ordered.length) return;

      const lastIndex = Math.max(...ordered.map((b) => state.blocks.findIndex((x) => x.id === b.id)));
      const clones = ordered.map((b) => ({ ...b, id: generateId() }));

      const next = state.blocks.slice();
      next.splice(lastIndex + 1, 0, ...clones);

      dispatch({ type: A.BLOCKS_REPLACE, blocks: next, focusId: clones[0]?.id ?? null });
      dispatch({ type: A.BLOCK_MENU_CLOSE });
    }, [dispatch, state.blocks]);

    const onBlockMenuPick = async (id: BlockActionId) => {
      const ids = getTargetBlockIds();
      if (!ids.length) return;

      if (id === "turnInto") {
        const blockId = ids[0];

        // Position the turn-into panel to the immediate right of the current block menu panel (Notion-like)
        const r = blockMenuRectRef.current;
        if (r) {
          dispatch({ type: A.SLASH_OPEN, blockId, top: r.top, left: r.right + 8 });
        } else {
          // Fallback: open near the block itself
          const el = blockRefs.current[blockId];
          if (el) openSlashMenuAtEl(blockId, el);
        }

        return; // keep block menu open while turn-into panel is open
      }

      if (id === "duplicate") {
        duplicateByIds(ids);
        return;
      }

      if (id === "delete") {
        deleteByIds(ids);
        return;
      }
    };

    // Global shortcuts (Notion-like) when focus is inside this editor
    useEffect(() => {
      const onKeyDown = (e: KeyboardEvent) => {
        const root = wrapRef.current;
        if (!root) return;

        const active = document.activeElement as HTMLElement | null;
        if (active && !root.contains(active)) return;

        // ESC closes panels regardless of focus
        if (e.key === "Escape") {
          closeSlashMenu();
          closeBlockMenu();
          return;
        }

        const isEditable = !!active && active.getAttribute("contenteditable") === "true";
        const isTypingInInput = !!active && active.tagName === "INPUT";
        if (isTypingInInput) return;

        // Cmd/Ctrl + D : duplicate selected blocks (when not typing inside editable)
        if (!isEditable && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
          const ids = state.selectedIds.length ? state.selectedIds : state.focusId ? [state.focusId] : [];
          if (!ids.length) return;
          e.preventDefault();
          duplicateByIds(ids);
          return;
        }

        // Delete / Backspace : delete selected blocks (when not typing inside editable)
        if (!isEditable && (e.key === "Delete" || e.key === "Backspace") && state.selectedIds.length) {
          e.preventDefault();
          deleteByIds(state.selectedIds);
        }
      };

      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [closeBlockMenu, closeSlashMenu, deleteByIds, duplicateByIds, state.focusId, state.selectedIds]);

// ---------- Render helpers ----------
    const remainingCount = useMemo(() => {
      if (!state.dragging) return state.blocks.length;
      return state.blocks.filter((b) => !state.dragIds.includes(b.id)).length;
    }, [state.blocks, state.dragging, state.dragIds]);

    // Close menus when clicking page background
    const onPageClick = () => {
      closeSlashMenu();
      closeBlockMenu();
    };

    return (
      <div ref={wrapRef} className={styles.wrap}>
        {/* Ghost */}
        <div ref={ghostRef} className={styles.ghostElement} data-count="0" aria-hidden="true" />

        {/* Slash Menu */}
        <SlashMenu
          open={state.slash.open}
          top={state.slash.top}
          left={state.slash.left}
          query={state.slash.query}
          activeIndex={state.slash.activeIndex}
          onQuery={(q) => dispatch({ type: A.SLASH_QUERY, query: q })}
          onActiveSet={(i) => dispatch({ type: A.SLASH_ACTIVE_SET, index: i })}
          onActiveMove={(delta, max) => dispatch({ type: A.SLASH_ACTIVE_MOVE, delta, max })}
          onClose={closeSlashMenu}
          onPick={(t) => {
            const bid = state.slash.blockId;
            if (!bid) return;
            changeBlockType(bid, t);
            closeSlashMenu();
            closeBlockMenu();
          }}
          styles={styles}
        />

        {/* Block action menu */}
        <BlockActionMenu
          open={state.blockMenu.open}
          top={state.blockMenu.top}
          left={state.blockMenu.left}
          query={state.blockMenu.query}
          activeIndex={state.blockMenu.activeIndex}
          items={blockMenuItems}
          onQuery={(q) => dispatch({ type: A.BLOCK_MENU_QUERY, query: q })}
          onActiveSet={(i) => dispatch({ type: A.BLOCK_MENU_ACTIVE_SET, index: i })}
          onActiveMove={(delta, max) => dispatch({ type: A.BLOCK_MENU_ACTIVE_MOVE, delta, max })}
          onClose={closeBlockMenu}
          onPick={onBlockMenuPick}
          onPanelRect={(rect) => {
            blockMenuRectRef.current = {
              top: rect.top,
              left: rect.left,
              right: rect.right,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
            };
          }}
          styles={styles}
        />

        <div className={styles.page} onDragOver={handleDragOver} onDrop={handleDrop} onClick={onPageClick}>
          <div className={styles.titleWrapper}>
            <div
              className={styles.mainTitle}
              contentEditable
              suppressContentEditableWarning
              ref={titleRef}
              onInput={(e) => {
                const text = e.currentTarget.innerText;
                dispatch({ type: A.TITLE_SET, title: text.trim() === "" ? "" : text });
              }}
              onKeyDown={handleTitleKeyDown}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
              onCompositionStart={() => (isComposingRef.current = true)}
              onCompositionEnd={() => (isComposingRef.current = false)}
            />
            {state.title === "" && !isTitleFocused && (
              <div className={styles.titlePlaceholder} onClick={() => titleRef.current?.focus()}>
                제목 없음
              </div>
            )}
          </div>

          {state.blocks.map((block, idx) => {
            const isSelected = state.selectedIds.includes(block.id);
            const isDragged = state.dragging && state.dragIds.includes(block.id);
            const isFocused = state.focusId === block.id;
            const isEmpty = (block.text ?? "").trim() === "";
            const showPlaceholder = isEmpty && isFocused;

            return (
              <div key={block.id} className={styles.blockWrapper}>
                {state.dropIndex === idx && <div className={styles.dropLine} />}

                <BlockRow
                  block={block}
                  idx={idx}
                  isSelected={isSelected}
                  isDragged={isDragged}
                  showPlaceholder={showPlaceholder}
                  placeholderText={BLOCK_PLACEHOLDERS[block.type]}
                  styles={styles}
                  onRowMouseDown={handleRowMouseDown}
                  onRowMouseEnter={handleRowMouseEnter}
                  onPlusClick={() => {
                    const nb = createNewBlock("paragraph");
                    const next = state.blocks.slice();
                    next.splice(idx + 1, 0, nb);
                    dispatch({ type: A.BLOCKS_REPLACE, blocks: next, focusId: nb.id });
                    setTimeout(() => focusBlock(nb.id, false), 0);
                  }}
                  onDragStart={handleDragStart}
                  onDragEnd={cleanupDrag}
                  onDragHandleClick={handleDragHandleClick}
                  onTodoToggle={(id) => dispatch({ type: A.BLOCK_TOGGLE_TODO, id })}
                  setBlockRef={setBlockRef}
                  onInput={handleBlockInput}
                  onKeyDown={handleBlockKeyDown}
                  onPaste={handleBlockPaste}
                  onFocus={(id) => dispatch({ type: A.FOCUS_SET, id })}
                  onBlur={() => dispatch({ type: A.FOCUS_SET, id: null })}
                  isComposingRef={isComposingRef}
                />

                {idx === state.blocks.length - 1 && state.dropIndex === remainingCount && <div className={styles.dropLine} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

TextEditor.displayName = "TextEditor";

export { TextEditor };
