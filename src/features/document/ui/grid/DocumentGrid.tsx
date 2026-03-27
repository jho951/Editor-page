/**
 * 문서 카드 목록을 그리드 형태로 배치합니다.
 */

import React from "react";
import {DocumentCard} from "@features/document/ui/card/DocumentCard.tsx";
import type {DocumentGridProps} from "@features/document/ui/grid/DocumentGrid.types.ts";
import styles from "@features/document/ui/grid/DocumentGrid.module.css";

/**
 * 문서 카드 목록을 그리드 형태로 배치합니다.
 *
 * @param props 컴포넌트에 전달된 props 객체입니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function DocumentGrid({items, variant = "grid", onItemClick}: DocumentGridProps): React.ReactElement {
        return (
            <section className={variant === "list" ? styles.list : styles.grid}>
                {items.map((it) => (
                    <DocumentCard key={it.id} item={it} onClick={onItemClick} variant ={variant=== "list" ? "list":"grid"} />
                ))}
            </section>
        );
}
export {DocumentGrid};