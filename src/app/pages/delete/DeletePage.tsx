import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import { Button, Icon } from "@jho951/ui-components";

import { selectTrashItems } from "@features/layout/state/layout.selector.ts";
import { textDocsApi } from "@features/editor/api/textDocs.ts";
import type { Block } from "@features/editor/type/Block.types.ts";

import styles from "./DeletePage.module.css";

function formatDeletedAt(ts: number): string {
  return new Date(ts).toLocaleString();
}

function renderBlockPreview(block: Block, numberedIndex: number | null): React.ReactElement {
  const text = block.text || "\u00A0";

  if (block.type === "heading1") {
    return <p className={styles.blockHeading1}>{text}</p>;
  }
  if (block.type === "heading2") {
    return <p className={styles.blockHeading2}>{text}</p>;
  }
  if (block.type === "heading3") {
    return <p className={styles.blockHeading3}>{text}</p>;
  }
  if (block.type === "bulleted_list") {
    return (
      <div className={styles.blockRow}>
        <span className={styles.blockBullet} aria-hidden="true">
          •
        </span>
        <p className={styles.blockLine}>{text}</p>
      </div>
    );
  }
  if (block.type === "numbered_list") {
    return (
      <div className={styles.blockRow}>
        <span className={styles.blockNumber} aria-hidden="true">
          {numberedIndex ?? 1}.
        </span>
        <p className={styles.blockLine}>{text}</p>
      </div>
    );
  }
  if (block.type === "to_do") {
    return (
      <div className={styles.blockRow}>
        <span className={`${styles.todoBox} ${block.checked ? styles.todoBoxChecked : ""}`} aria-hidden="true" />
        <p className={`${styles.blockLine} ${block.checked ? styles.blockChecked : ""}`}>{text}</p>
      </div>
    );
  }
  return <p className={styles.blockLine}>{text}</p>;
}

function DeletePage(): React.ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const trashItems = useSelector(selectTrashItems);
  const isDetailMode = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<{ title: string; blocks: Block[] } | null>(null);

  const selected = useMemo(
    () => trashItems.find((item) => item.id === id) ?? null,
    [trashItems, id]
  );
  const previewBlocks = useMemo(() => {
    if (!doc?.blocks) return [];
    let numbered = 0;
    return doc.blocks.map((b) => {
      if (b.type === "numbered_list") {
        numbered += 1;
        return { block: b, numberedIndex: numbered };
      }
      numbered = 0;
      return { block: b, numberedIndex: null };
    });
  }, [doc?.blocks]);

  useEffect(() => {
    let alive = true;
    if (!isDetailMode || !selected?.id) {
      setDoc(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    textDocsApi
      .get(selected.id)
      .then((res) => {
        if (!alive) return;
        setDoc({ title: res.title, blocks: Array.isArray(res.blocks) ? res.blocks : [] });
      })
      .catch((e: unknown) => {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "문서를 불러오지 못했습니다.");
        setDoc(null);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [isDetailMode, selected?.id]);

  if (!isDetailMode) {
    return (
      <section className={styles.page}>
        <section className={styles.listOnlyPane} aria-label="삭제된 페이지 목록">
          <header className={styles.listHead}>
            <span className={styles.listTitle}>휴지통</span>
          </header>
          <p className={styles.listHint}>삭제된 페이지를 선택하면 상세 내용을 볼 수 있습니다.</p>

          <div className={`${styles.listOnly} ${trashItems.length === 0 ? styles.listOnlyEmpty : ""}`}>
            {trashItems.length === 0 ? (
              <div className={styles.empty}>휴지통이 비어 있습니다.</div>
            ) : (
              trashItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="ghost"
                  size="s"
                  className={styles.item}
                  onClick={() => navigate(`/delete/${item.id}`)}
                >
                  <span className={styles.itemMain}>
                    <Icon name="document" source="url" basePath="/icons" size={14} />
                    <span className={styles.itemTitle}>{item.label}</span>
                  </span>
                  <span className={styles.itemTime}>{formatDeletedAt(item.deletedAt)}</span>
                </Button>
              ))
            )}
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <article className={styles.detailOnlyPane} aria-label="삭제 항목 상세">
        {selected ? (
          <>
            <div className={styles.detailHeader}>
              <Icon name="document" source="url" basePath="/icons" size={16} />
              <h1 className={styles.detailTitle}>{doc?.title || selected.label}</h1>
            </div>
            <p className={styles.detailMeta}>삭제됨 {formatDeletedAt(selected.deletedAt)}</p>

            {loading && <div className={styles.status}>문서를 불러오는 중...</div>}
            {error && <div className={styles.status}>에러: {error}</div>}

            {!loading && !error && (
              <div className={styles.docBody}>
                {doc && previewBlocks.length > 0 ? (
                  previewBlocks.map(({ block, numberedIndex }) => (
                    <div key={block.id} className={styles.blockWrap}>
                      {renderBlockPreview(block, numberedIndex)}
                    </div>
                  ))
                ) : (
                  <p className={styles.detailDesc}>본문이 비어 있습니다.</p>
                )}
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyDetail}>
            <Icon name="trash" source="url" basePath="/icons" size={18} />
            <span>왼쪽 목록에서 항목을 선택하세요.</span>
          </div>
        )}
      </article>
    </section>
  );
}

export default DeletePage;
