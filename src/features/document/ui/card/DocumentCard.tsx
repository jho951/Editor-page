import React, { useRef } from "react";
import type {DocumentCardProps, TemplateItem} from "@features/document/ui/card/DocumentCard.types.ts";

import { Button } from "@jho951/ui-components";
import styles from "./DocumentCard.module.css";



function DocumentCard({ item, onClick, variant = "grid" }: DocumentCardProps): React.ReactElement {
    const startPos = useRef({ x: 0, y: 0 });
    const templateItem = item as TemplateItem;

    return (
        <Button
            type="button"
            className={variant === "list" ? styles.cardList : styles.card}
            onPointerDown={(e) => {
                startPos.current = { x: e.clientX, y: e.clientY };
            }}
            onPointerUp={(e) => {
                const diffX = Math.abs(e.clientX - startPos.current.x);
                const diffY = Math.abs(e.clientY - startPos.current.y);
                if (diffX < 5 && diffY < 5) onClick?.(item.id);
            }}
        >
            <div
                className={styles.cardFrame}
                style={{ "--accent": item.accent } as React.CSSProperties}
            >
                <div className={styles.cardTop}>
                    <div className={styles.titleArea}>
                        <div className={styles.cardTitle}>{item.title}</div>
                        <div className={styles.subTitle}>{templateItem.subTitle || "Notion 제작"}</div>
                    </div>
                    <div className={styles.cardDots} aria-hidden>⋯</div>
                </div>

                <div className={styles.preview}>
                    {templateItem.coverUrl ? (
                        <img className={styles.coverImg} src={templateItem.coverUrl} alt={item.title} />
                    ) : (
                        <div className={styles.skeleton}>
                            <div className={styles.previewLine} />
                            <div className={styles.previewLine} />
                            <div className={styles.previewLineShort} />
                        </div>
                    )}
                </div>

                <div className={styles.accentBar} />
            </div>
        </Button>
    );
}

export { DocumentCard };
