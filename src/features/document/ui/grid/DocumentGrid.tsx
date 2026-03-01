import React from "react";
import {DocumentCard} from "@features/document/ui/card/DocumentCard.tsx";
import type {DocumentGridProps} from "@features/document/ui/grid/DocumentGrid.types.ts";
import styles from "@features/document/ui/grid/DocumentGrid.module.css";

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