import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@app/store/store.ts";
import { useNavigate } from "react-router-dom";

import { layoutActions } from "@features/layout/state/layout.slice.ts";
import type { LnbActiveKey, LnbProps } from "@features/layout/ui/lnb/Lnb.types.ts";
import { selectFolders, selectLnbOpenFolderIds } from "@features/layout/state/layout.selector.ts";
import { FolderNode } from "@features/layout/ui/lnb/FolderNode.tsx";

import { Button, Divider, Icon } from "@jho951/ui-components";

import styles from "./Lnb.module.css";

function Lnb({ activeKey = "home", onNavigate }: LnbProps) {
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();
    const toggleFolder = (id: string) => dispatch(layoutActions.toggleFolderOpen(id));

    const openFolderIds = useSelector(selectLnbOpenFolderIds);
    const folders = useSelector(selectFolders);

    const go = (key: LnbActiveKey) => {
        onNavigate?.(key);
        dispatch(layoutActions.setActiveKey(key));
    };

    const addChild = (parentId: string) => {
        const action = dispatch(layoutActions.addChildPage({ parentId })) as unknown as {
            payload?: { childId?: string };
        };

        const newId = action?.payload?.childId;
        if (!newId) return;

        const newKey = `folder:${newId}` as LnbActiveKey;
        go(newKey);

        navigate(`/doc/${newId}/text`);
    };

    const moveToTrash = (pageId: string) => {
        dispatch(layoutActions.movePageToTrash({ pageId }));
        if (activeKey === (`folder:${pageId}` as LnbActiveKey)) {
            navigate("/");
            go("home");
        }
    };

    return (
        <aside className={styles.lnbWrap} aria-label="Sidebar">
            <div className={styles.topRow}>
                <Button
                    className={styles.logoBtn}
                    variant="ghost"
                    size="s"
                    type="button"
                    onClick={() => go("home")}>
                    <Icon name="logo" source="url" basePath="/icons" size={40} />
                </Button>
            </div>

            <Divider />

            <div className={styles.treeArea} aria-label="페이지 트리">
                {folders.map((folder) => (
                    <FolderNode
                        key={folder.id}
                        node={folder}
                        level={0}
                        activeKey={activeKey}
                        openFolderIds={openFolderIds}
                        onToggle={toggleFolder}
                        onAddChild={addChild}
                        onNavigate={(key) => go(key)}
                        onMoveToTrash={moveToTrash}
                    />
                ))}
            </div>

            <section className={styles.trashPane} aria-label="휴지통">
                <button
                    type="button"
                    className={`${styles.trashBlock} ${activeKey === "trash" ? styles.trashBlockActive : ""}`}
                    onClick={() => {
                        go("trash");
                        navigate("/delete");
                    }}
                >
                    <span className={styles.trashLeft}>
                        <span className={styles.trashIconSlot} aria-hidden="true">
                            <Icon name="trash" source="url" basePath="/icons" size={14} />
                        </span>
                        <span className={styles.trashTitle}>휴지통</span>
                    </span>
                </button>
            </section>
        </aside>
    );
}

export { Lnb };
