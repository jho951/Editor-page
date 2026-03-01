import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BlockActionId, BlockActionItem } from "../config/blockActionMenu";

type Props = {
  open: boolean;
  top: number;
  left: number;
  query: string;
  activeIndex: number;
  items: BlockActionItem[];
  onQuery: (q: string) => void;
  onActiveSet: (i: number) => void;
  onActiveMove?: (delta: number, max: number) => void; // optional
  onClose: () => void;
  onPick: (id: BlockActionId) => void | Promise<void>;
  onPanelRect?: (rect: DOMRect) => void;
  styles: Record<string, string>;
};

/**
 * Notion-like block action menu:
 * - fixed positioning (viewport coordinates)
 * - portal to body (prevents parent stacking/transform issues)
 * - auto clamp & flip (below -> above if needed)
 */
export function BlockActionMenu(props: Props): React.ReactElement | null {
  const { open, top, left, query, activeIndex, items, onQuery, onActiveSet, onActiveMove, onClose, onPick, onPanelRect, styles } = props;

  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [pos, setPos] = useState<{ top: number; left: number }>({ top, left });

  // filtered items by query (UI only)
  const filtered = useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((it) => it.label.toLowerCase().includes(q) || (it.desc ?? "").toLowerCase().includes(q));
  }, [items, query]);

  // keep local pos in sync when opening
  useEffect(() => {
    if (!open) return;
    setPos({ top, left });
  }, [open, top, left]);

  // focus search input on open
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  // close on outside click
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (panel.contains(e.target as Node)) return;
      onClose();
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  // clamp/flip after layout (fixed coordinates)
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const rect = panel.getBoundingClientRect();
    const margin = 8;

    let nx = left;
    let ny = top;

    // clamp horizontally
    nx = Math.max(margin, Math.min(nx, vw - rect.width - margin));

    // flip if overflow bottom
    if (ny + rect.height + margin > vh) {
      const flipped = top - rect.height - 10; // 10px gap
      ny = Math.max(margin, flipped);
    } else {
      ny = Math.max(margin, ny);
    }

    setPos({ top: ny, left: nx });
  }, [open, top, left]);

  // Report measured panel rect to parent (used for positioning the Turn-into panel to the right)
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    onPanelRect?.(panel.getBoundingClientRect());
  }, [open, pos.top, pos.left, onPanelRect]);


  const moveActive = (delta: number) => {
    const max = Math.max(filtered.length, 1);
    if (onActiveMove) {
      onActiveMove(delta, max);
      return;
    }
    const next = Math.max(0, Math.min(activeIndex + delta, max - 1));
    onActiveSet(next);
  };

  const onKeyDown = async (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveActive(1);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveActive(-1);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[activeIndex];
      if (!item) return;
      await onPick(item.id);
      return;
    }
  };

  // after hooks: safe conditional render
  if (!open) return null;

  return createPortal(
    <div className={styles.blockMenu} style={{ top: pos.top, left: pos.left }}>
      <div
        ref={panelRef}
        className={styles.blockMenuPanel}
        role="menu"
        aria-label="Block actions"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className={styles.blockMenuSearchRow}>
          <input
            ref={inputRef}
            className={styles.blockMenuSearch}
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="작업을 검색하세요"
          />
          <button className={styles.blockMenuClose} type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className={styles.blockMenuSectionTitle}>텍스트</div>

        {filtered.map((it, i) => (
          <button
            key={it.id}
            type="button"
            className={[
              styles.blockMenuItem,
              i === activeIndex ? styles.blockMenuItemActive : "",
              it.danger ? styles.blockMenuItemDanger : "",
            ].join(" ")}
            onMouseEnter={() => onActiveSet(i)}
            onClick={() => onPick(it.id)}
          >
            <span className={styles.blockMenuLabel}>
              <strong>{it.label}</strong>
              {it.desc ? <span className={styles.blockMenuDesc}>{it.desc}</span> : null}
            </span>
            {it.rightHint ? <span className={styles.blockMenuRightHint}>{it.rightHint}</span> : null}
          </button>
        ))}

        {filtered.length === 0 ? <div className={styles.blockMenuEmpty}>결과 없음</div> : null}
      </div>
    </div>,
    document.body
  );
}
