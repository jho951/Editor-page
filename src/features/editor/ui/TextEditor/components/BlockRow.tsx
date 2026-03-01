import React from "react";
import type { Block } from "../../../type/Block.types";
import { Button, Icon } from "@jho951/ui-components";

type Props = {
  block: Block;
  idx: number;

  isSelected: boolean;
  isDragged: boolean;
  showPlaceholder: boolean;
  placeholderText: string;

  styles: Record<string, string>;

  onRowMouseDown: (e: React.MouseEvent<HTMLDivElement>, id: string) => void;
  onRowMouseEnter: (id: string) => void;

  onPlusClick: (idx: number) => void;

  onDragStart: (e: React.DragEvent<HTMLDivElement>, idx: number, block: Block) => void;
  onDragEnd: () => void;
  onDragHandleClick: (e: React.MouseEvent<HTMLDivElement>, block: Block) => void;

  onTodoToggle: (id: string) => void;

  setBlockRef: (id: string, el: HTMLDivElement | null) => void;

  onInput: (e: React.FormEvent<HTMLDivElement>, id: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>, block: Block, idx: number) => void;
  /** Optional: if omitted, browser default paste will apply and onInput will sync. */
  onPaste?: (e: React.ClipboardEvent<HTMLDivElement>, block: Block, idx: number) => void;
  onFocus: (id: string) => void;
  onBlur: () => void;

  isComposingRef: React.MutableRefObject<boolean>;
};

export function BlockRow(props: Props): React.ReactElement {
  const {
    block,
    idx,
    isSelected,
    isDragged,
    showPlaceholder,
    placeholderText,
    styles,
    onRowMouseDown,
    onRowMouseEnter,
    onPlusClick,
    onDragStart,
    onDragEnd,
    onDragHandleClick,
    onTodoToggle,
    setBlockRef,
    onInput,
    onKeyDown,
    onPaste,
    onFocus,
    onBlur,
    isComposingRef,
  } = props;

  return (
    <div className={styles.blockWrapper}>
      <div
        data-blockid={block.id}
        className={[
          styles.blockRow,
          isDragged ? styles.isDragging : "",
          isSelected ? styles.isSelected : "",
        ].join(" ")}
        onMouseDown={(e) => onRowMouseDown(e, block.id)}
        onMouseEnter={() => onRowMouseEnter(block.id)}
      >
        <div className={styles.gutter}>
          <Button
            variant="ghost"
            onClick={() => onPlusClick(idx)}
          >
            <Icon name="plus" source="url" basePath="/icons" size={20} />
          </Button>
          <div
            className={styles.dragHandle}
            draggable
            onDragStart={(e) => onDragStart(e, idx, block)}
            onDragEnd={onDragEnd}
            onClick={(e) => onDragHandleClick(e, block)}
            role="button"
            aria-label="Block menu / drag"
            tabIndex={-1}
          >
            <Icon name="dragHandle" source="url" basePath="/icons" size={18} />
          </div>
        </div>

        <div className={styles.blockBody}>
          {showPlaceholder && <span className={styles.placeholder}>{placeholderText}</span>}

          {block.type === "to_do" && (
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={() => onTodoToggle(block.id)}
              className={styles.todoCheckbox}
            />
          )}

          <div
            contentEditable
            suppressContentEditableWarning
            className={[styles.block, styles[block.type] ?? ""].join(" ")}
            ref={(el) => setBlockRef(block.id, el)}
            onInput={(e) => onInput(e, block.id)}
            onKeyDown={(e) => onKeyDown(e, block, idx)}
            onPaste={(e) => onPaste?.(e, block, idx)}
            onFocus={() => onFocus(block.id)}
            onBlur={onBlur}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
          />
        </div>
      </div>
    </div>
  );
}
