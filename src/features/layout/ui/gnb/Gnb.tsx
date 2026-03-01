import React, { useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@app/store/hooks.ts";

import type { GnbProps } from "@features/layout/ui/gnb/Gnb.types.ts";
import { layoutActions } from "@features/layout/state/layout.slice.ts";
import { selectPinnedDocIds, selectTrashItems } from "@features/layout/state/layout.selector.ts";

import { uiActions } from "@features/ui/state/ui.slice.ts";
import { saveTextDoc, selectEditorDirty, selectEditorStatus } from "@features/editor/state/editor.slice.ts";

import { Button, Icon } from "@jho951/ui-components";

import styles from "./Gnb.module.css";

type HeaderMode = "default" | "doc" | "docText" | "deleteDetail";

function Gnb({ profile }: GnbProps): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isDocRoute = location.pathname.startsWith("/doc/");
  const isDeleteDetailRoute = location.pathname.startsWith("/delete/");
  const isTextPage = location.pathname.endsWith("/text");

  const pinnedDocIds = useSelector(selectPinnedDocIds);
  const trashItems = useSelector(selectTrashItems);
  const isPinned = id && isDocRoute ? pinnedDocIds.includes(id) : false;

  const dirty = useSelector(selectEditorDirty);
  const status = useSelector(selectEditorStatus);
  const isSaving = status === "saving";

  const onTogglePinned = useCallback(() => {
    if (!id || !isDocRoute) return;
    dispatch(layoutActions.togglePinned(id));
  }, [dispatch, id, isDocRoute]);

  const onSave = useCallback(() => {
    if (!id || !isDocRoute) return;
    dispatch(saveTextDoc());
  }, [dispatch, id, isDocRoute]);

  const onMoveToTrash = useCallback(() => {
    if (!id || !isDocRoute) return;
    dispatch(layoutActions.movePageToTrash({ pageId: id }));
    navigate("/");
  }, [dispatch, id, isDocRoute, navigate]);

  const onOpenProfileMenu = useCallback(
    (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      dispatch(
        uiActions.openContextMenu({
          x: rect.right,
          y: rect.bottom + 8,
          items: [
            { label: "이름 바꾸기", onClick: () => console.log("Rename") },
            { label: "로그아웃", onClick: () => {}, danger: true },
          ],
        })
      );
    },
    [dispatch]
  );

  const onBackToTrashList = useCallback(() => {
    navigate("/delete");
  }, [navigate]);

  const onRestoreFromTrash = useCallback(() => {
    if (!id || !isDeleteDetailRoute) return;
    dispatch(layoutActions.restorePageFromTrash({ pageId: id }));
    navigate(`/doc/${id}/text`);
  }, [dispatch, id, isDeleteDetailRoute, navigate]);

  const onPermanentDeleteFromTrash = useCallback(() => {
    if (!id || !isDeleteDetailRoute) return;
    const remain = trashItems.filter((item) => item.id !== id);
    dispatch(layoutActions.permanentDeleteFromTrash({ pageId: id }));
    if (remain.length > 0) {
      navigate(`/delete/${remain[0].id}`, { replace: true });
      return;
    }
    navigate("/delete", { replace: true });
  }, [dispatch, id, isDeleteDetailRoute, navigate, trashItems]);

  const headerMode: HeaderMode = (() => {
    if (id && isDeleteDetailRoute) return "deleteDetail";
    if (id && isDocRoute && isTextPage) return "docText";
    if (id && isDocRoute) return "doc";
    return "default";
  })();

  return (
    <header className={styles.gnbWrap} aria-label="Top bar">
      <div className={styles.gnbLeft}>
        {headerMode === "deleteDetail" && (
          <Button
            type="button"
            variant="ghost"
            size="s"
            className={styles.backIconBtn}
            onClick={onBackToTrashList}
            title="목록으로"
            aria-label="목록으로"
          >
            <span className={styles.backIcon} aria-hidden="true">←</span>
          </Button>
        )}
        {(headerMode === "doc" || headerMode === "docText") && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="s"
              className={`${styles.favoriteBtn} ${isPinned ? styles.active : ""}`}
              onClick={onTogglePinned}
              title={isPinned ? "즐겨찾기 해제" : "즐겨찾기 추가"}
            >
              <Icon name="star" size={22} />
            </Button>
          </>
        )}
      </div>

      <div className={styles.gnbRight}>
        {headerMode === "docText" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="s"
              className={styles.saveIconBtn}
              onClick={onSave}
              disabled={!dirty || isSaving}
              title={dirty ? "저장" : "변경 사항 없음"}
              aria-label={dirty ? "저장" : "변경 사항 없음"}
            >
              <span className={styles.saveIcon} aria-hidden="true">
                {isSaving ? "…" : "💾"}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="s"
              className={styles.trashBtn}
              onClick={onMoveToTrash}
              title="휴지통으로 이동"
              aria-label="휴지통으로 이동"
            >
              <Icon name="trash" source="url" basePath="/icons" size={16} />
            </Button>
          </>
        )}
        {headerMode === "deleteDetail" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="s"
              className={styles.deleteActionBtn}
              onClick={onPermanentDeleteFromTrash}
            >
              완전 삭제
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="s"
              className={styles.deleteActionBtn}
              onClick={onRestoreFromTrash}
            >
              복구
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="s"
          className={styles.menuBtn}
          onClick={onOpenProfileMenu}
          aria-label="Open profile menu"
        >
          <span className={styles.avatar} aria-hidden="true">
            {String(profile).slice(0, 1).toUpperCase()}
          </span>
        </Button>
      </div>
    </header>
  );
}

export { Gnb };
