import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import { selectPinnedDocIds, selectRecentDocIds } from "@features/layout/state/layout.selector.ts";
import { DocumentCard } from "@features/document/ui/card/DocumentCard.tsx";
import { mockDocs, mockTemplates } from "@features/document/ui/documents.mock.ts";
import { Button, Icon } from "@jho951/ui-components";

import styles from "./HomePage.module.css";

type DocItem = typeof mockDocs[number];

function HomePage(): React.ReactElement {
    const navigate = useNavigate();
    const recentIds = useSelector(selectRecentDocIds);
    const pinnedIds = useSelector(selectPinnedDocIds);

    const allDocs = mockDocs;
    const allTemplates = mockTemplates;

    const rowRef = useRef<HTMLDivElement | null>(null);

    // ✅ 타입 가드 (d is DocItem)를 적용하여 undefined 에러 해결
    const recentDocs = recentIds
        .map((id) => allDocs.find((d) => d.id === id))
        .filter((d): d is DocItem => Boolean(d))
        .slice(0, 4);

    const pinnedDocs = pinnedIds
        .map((id) => allDocs.find((d) => d.id === id))
        .filter((d): d is DocItem => Boolean(d))
        .slice(0, 4);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>안녕하세요.</h1>
            </header>

            {/* 최근 방문 섹션 */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>최근 방문</div>
                </div>
                <div className={styles.cards}>
                    {recentDocs.map((d) => (
                        <div key={d.id} className={styles.cardWrap}>
                            <DocumentCard item={d} onClick={() => navigate(`/doc/${d.id}`)} />
                        </div>
                    ))}
                    {recentDocs.length === 0 && <div className={styles.empty}>최근 방문한 문서가 없습니다.</div>}
                </div>
            </section>

            {/* 즐겨찾기 섹션 */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <Icon name="star" size={14} />
                        <span>즐겨찾기</span>
                    </div>
                </div>
                <div className={styles.cards}>
                    {pinnedDocs.map((d) => (
                        <div key={d.id} className={styles.cardWrap}>
                            <DocumentCard item={d} onClick={() => navigate(`/doc/${d.id}`)} />
                        </div>
                    ))}
                    {pinnedDocs.length === 0 && <div className={styles.empty}>즐겨찾기된 문서가 없습니다.</div>}
                </div>
            </section>

            {/* 추천 템플릿 섹션 - 라이브러리 없이 네이티브 스크롤 구현 */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionHeaderLeft}>
                        <Icon name="document" size={14} />
                        <div className={styles.sectionTitle}>추천 템플릿</div>
                    </div>
                    <Button type="button" variant='ghost' onClick={() => navigate('/templates')}>
                        <span>더보기</span>
                    </Button>
                </div>

                {allTemplates.length === 0 ? (
                    <div className={styles.empty}>템플릿이 없습니다.</div>
                ) : (
                    <div className={styles.templateContainer}>
                        {/* ✅ snapRow: 터치패드 제스처 전파를 막는 핵심 영역 */}
                        <div ref={rowRef} className={styles.snapRow}>
                            {allTemplates.slice(0, 12).map((t) => (
                                <div key={t.id} className={styles.snapPanel}>
                                    <DocumentCard item={t} onClick={() => navigate(`/doc/${t.id}`)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

        </div>
    );
}

export default HomePage;
