import React from "react";
import { Button, Icon } from "@jho951/ui-components";
import type { FolderItem, LnbActiveKey } from "@features/layout/ui/lnb/Lnb.types.ts";
import styles from "@features/layout/ui/lnb/FolderNode.module.css";

type OpenFolderMap = Record<string, boolean>;

type FolderNodeProps = {
  node: FolderItem;
  level: number;
  activeKey: LnbActiveKey;
  openFolderIds: OpenFolderMap;
  onToggle: (id: string) => void;
  onNavigate?: (key: LnbActiveKey) => void;
  onAddChild?: (parentId: string) => void;
  onMoveToTrash?: (pageId: string) => void;
};

function iconFallback(name: string): string {
  if (name === "logo") return "⌂";
  if (name === "document") return "•";
  if (name === "star") return "★";
  if (name === "users") return "◎";
  if (name === "folder") return "◧";
  return "•";
}

function resolveIconName(node: FolderItem): string {
  if (node.icon) return node.icon;
  if (node.key === "allDocs") return "document";
  if (node.key === "template") return "star";
  if (node.key === "shared") return "users";
  if (node.key === "home") return "logo";
  if (node.id === "my") return "folder";
  if (node.id === "pinned") return "star";
  if (node.id === "sharedRoot") return "users";
  return "document";
}

function FolderNode({
  node,
  level,
  activeKey,
  openFolderIds,
  onToggle,
  onNavigate,
  onAddChild,
  onMoveToTrash,
}: FolderNodeProps): React.ReactElement {
  const isSection = level === 0;
  const isOpen = !!openFolderIds[node.id];
  const hasChildren = !!node.children?.length;
  const myKey = (node.key ?? (`folder:${node.id}` as const)) as LnbActiveKey;
  const isActive = activeKey === myKey;
  const isFolderLike = hasChildren || !node.key;
  const iconName = resolveIconName(node);
  const isDeletable = !isSection && (node.docId != null || String(node.key ?? "").startsWith("folder:"));
  const isNewPage = node.label === "새 페이지";
  const isPersonalSection = isSection && node.label === "개인 페이지";
  const showChevron = isSection || isFolderLike;

  const onRowClick = () => {
    if (isSection || isFolderLike) {
      onToggle(node.id);
      return;
    }
    if (node.key) onNavigate?.(node.key);
  };

  return (
    <div className={styles.node} style={{ "--level": level } as React.CSSProperties}>
      <div
        className={[styles.row, isActive ? styles.active : ""].filter(Boolean).join(" ")}
        onClick={onRowClick}
      >
        <span className={styles.left}>
          <span className={styles.iconSlot} data-fallback={iconFallback(iconName)} aria-hidden="true">
            <Icon name={iconName} source="url" basePath="/icons" size={16} className={styles.nodeIcon} />
          </span>
          <span className={styles.label}>{node.label}</span>
        </span>
        <span className={styles.right}>
          {isPersonalSection ? (
            <Button
              type="button"
              variant="ghost"
              size="s"
              className={styles.actions}
              aria-label="새 페이지 추가"
              onClick={(e) => {
                e.stopPropagation();
                onAddChild?.(node.id);
              }}
            >
              <Icon name="plus" source="url" basePath="/icons" size={16} />
            </Button>
          ) : null}
          {showChevron ? (
            <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`} aria-hidden="true">
              ›
            </span>
          ) : null}
          {isDeletable ? (
            <Button
              type="button"
              variant="ghost"
              size="s"
              className={styles.deleteBtn}
              aria-label="휴지통으로 이동"
              title="휴지통으로 이동"
              onClick={(e) => {
                e.stopPropagation();
                const pid = node.docId ?? node.id;
                onMoveToTrash?.(pid);
              }}
            >
              {isNewPage ? (
                <span className={styles.deleteText}>삭제</span>
              ) : (
                <Icon name="trash" source="url" basePath="/icons" size={14} />
              )}
            </Button>
          ) : null}
        </span>
      </div>

      {isOpen && hasChildren ? (
        <div className={styles.children}>
          {node.children!.map((child) => (
            <FolderNode
              key={child.id}
              node={child}
              level={level + 1}
              activeKey={activeKey}
              openFolderIds={openFolderIds}
              onToggle={onToggle}
              onNavigate={onNavigate}
              onAddChild={onAddChild}
              onMoveToTrash={onMoveToTrash}
            />
          ))}
        </div>
      ) : null}

      {isSection && isOpen && !hasChildren ? (
        <button
          type="button"
          className={[styles.row, styles.empty].join(" ")}
          onClick={() => onAddChild?.(node.id)}
        >
          새 페이지 추가
        </button>
      ) : null}
    </div>
  );
}

export { FolderNode };
