import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Switch } from "@jho951/ui-components";

import { mockDocs, mockTemplates} from "@features/document/ui/documents.mock.ts";
import {DocumentGrid} from "@features/document/ui/grid/DocumentGrid.tsx";

import styles from "@app/pages/document/DocumentsPage.module.css";
import type {DocCardItem} from "@features/document/ui/card/DocumentCard.types.ts";
import type {DocumentsViewMode} from "@features/document/ui/tab/DocumentTab.types.ts";
import type {DocKind} from "@features/document/ui/grid/DocumentGrid.types.ts";

export default function DocumentsPage({mode = "documents"}: { mode?: DocKind; }): React.ReactElement {
    const navigate = useNavigate();
    const [query, setQuery] = useState<string>("");
    const [viewMode, setViewMode] = useState<DocumentsViewMode>("grid");

    const items = useMemo<DocCardItem[]>(() => {
        const base = mode === "documents" ? mockDocs : mockTemplates;
        const q = query.trim().toLowerCase();
        if (!q) return base;
        return base.filter((it) => it.title.toLowerCase().includes(q));
    }, [mode, query]);

    return (
        <div className={styles.content}>
            <div className={styles.headerRow}>
                <div className={styles.tab}>
                    <h1 className={styles.tabIcon}>
                        {mode === "documents" ? "📄 Document" : "🗂️ Template"}
                    </h1>
                </div>

                <div className={styles.headerActions}>
                    <Input
                        className={styles.searchField}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        aria-label="Search"
                        size="m"
                    />

                    <div className={styles.viewToggle} role="group" aria-label="View mode">
                        <Switch
                            checked={viewMode === "list"}
                            onChange={(checked) => setViewMode(checked ? "list" : "grid")}
                            aria-label="Toggle list view"
                            label="List"
                        />
                    </div>

                    <button className={styles.iconBtn} type="button" aria-label="Sort">
                        ⇅
                    </button>
                </div>
            </div>

            <div className={styles.yearLabel}>2024.</div>

            <DocumentGrid
                items={items}
                variant={viewMode}
                onItemClick={(id) => navigate(`/doc/${id}`)}
            />
        </div>
    );
}
