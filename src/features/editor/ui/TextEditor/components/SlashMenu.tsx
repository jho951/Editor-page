import React, { useMemo, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { BlockType } from "../../../type/Block.types";
import { SLASH_COMMANDS } from "../../../config/command";

export function SlashMenu(props: {
  open: boolean;
  top: number;
  left: number;
  query: string;
  activeIndex: number;
  onQuery: (q: string) => void;
  onActiveSet: (i: number) => void;
  onActiveMove: (delta: number, max: number) => void;
  onClose: () => void;
  onPick: (t: BlockType) => void;
  styles: Record<string, string>;
}): React.ReactElement | null {
  const { open, top, left, query, activeIndex, onQuery, onActiveSet, onActiveMove, onClose, onPick, styles } = props;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top, left });

  // Reposition & clamp to viewport (fixed positioning; Notion-like)
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;

    let nx = left;
    let ny = top + 8;

    // clamp horizontally
    nx = Math.max(margin, Math.min(nx, vw - rect.width - margin));

    // flip vertically if overflowing bottom
    if (ny + rect.height + margin > vh) {
      const flipped = top - rect.height - 10;
      ny = Math.max(margin, flipped);
    } else {
      ny = Math.max(margin, ny);
    }

    setPos({ top: ny, left: nx });
  }, [open, top, left]);

  const filtered = useMemo(() => {
    if (!query) return SLASH_COMMANDS;
    const q = query.toLowerCase();
    return SLASH_COMMANDS.filter((cmd) => cmd.label.toLowerCase().includes(q) || cmd.keyword.includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      ref={panelRef}
      className={styles.slashMenu}
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          onActiveMove(1, Math.max(filtered.length, 1));
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          onActiveMove(-1, Math.max(filtered.length, 1));
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const cmd = filtered[activeIndex];
          if (cmd) onPick(cmd.type);
        }
      }}
    >
      <div className={styles.slashSearchRow}>
        <input
          ref={inputRef}
          className={styles.slashSearch}
          value={query}
          placeholder="작업을 검색하세요"
          onChange={(e) => onQuery(e.target.value)}
        />
        <button className={styles.slashClose} type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {filtered.map((cmd, i) => (
        <button
          key={cmd.type}
          className={[styles.slashMenuItem, i === activeIndex ? styles.slashMenuItemActive : ""].join(" ")}
          onClick={() => onPick(cmd.type)}
          onMouseEnter={() => onActiveSet(i)}
          type="button"
        >
          <strong>{cmd.label}</strong>
          <span>{cmd.description}</span>
        </button>
      ))}

      {filtered.length === 0 && <div className={styles.slashMenuEmpty}>결과 없음</div>}
    </div>
  , document.body);
}
