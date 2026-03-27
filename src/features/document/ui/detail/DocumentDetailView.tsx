/**
 * 문서 상세 화면의 상단 정보와 에디터 영역을 구성합니다.
 */

import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@jho951/ui-components";

import { useAppDispatch } from "@app/store/hooks.ts";
import { BlockEditor } from "@features/editor/index.ts";
import { findDocById } from "@features/document/lib/catalog.ts";
import { layoutActions } from "@features/layout/index.ts";

import styles from "./DocumentDetailView.module.css";

/**
 * 문서 상세 화면의 상단 정보와 에디터 영역을 구성합니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function DocumentDetailView(): React.ReactElement {
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    const doc = id ? findDocById(id) : undefined;

    useEffect(() => {
        if (!id) return;
        dispatch(layoutActions.recordRecent(id));
        dispatch(layoutActions.setLastLocation({ docId: id }));
    }, [dispatch, id]);

    if (!id || !doc) {
        return (
            <section className={styles.content}>
                <div className={styles.headerRow}>
                    <div className={styles.headerCopy}>
                        <div className={styles.headerTitleGroup}>
                            <div className={styles.pageEyebrow}>Missing Document</div>
                            <div className={styles.tab}>
                                <h1 className={styles.tabIcon}>문서를 찾을 수 없습니다.</h1>
                            </div>
                        </div>
                        <p className={styles.headerLead}>링크가 만료되었거나 문서가 아직 준비되지 않았습니다.</p>
                    </div>
                </div>
                <div className={`${styles.surfacePanel} ${styles.emptyState}`}>
                    <div className={styles.statusRow}>문서가 존재하지 않거나 아직 불러오지 못했습니다.</div>
                    <Button type="button" variant="ghost" onClick={() => navigate("/documents")}>
                        문서 목록으로 이동
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.content}>
            <div className={styles.headerRow}>
                <div className={styles.headerCopy}>
                    <div className={styles.headerTitleGroup}>
                        <div className={styles.pageEyebrow}>Writing Space</div>
                        <div className={styles.tab}>
                            <h1 className={styles.tabIcon}>{doc.title}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.headerMeta}>
                <div className={styles.yearLabel}>Text Editor</div>
                <div className={styles.yearLabel}>Queue First Save</div>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>Document ID</span>
                    <p className={styles.infoValue}>{doc.id}</p>
                </div>
                <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>Category</span>
                    <p className={styles.infoValue}>{doc.kind}</p>
                </div>
                <div className={styles.infoCard}>
                    <span className={styles.infoLabel}>Accent</span>
                    <p className={styles.infoValue}>{doc.accent}</p>
                </div>
            </div>

            <div className={`${styles.surfacePanel} ${styles.editorShell}`}>
                <BlockEditor documentId={doc.id} />
            </div>
        </section>
    );
}

export { DocumentDetailView };
