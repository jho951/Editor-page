import React from "react";
import { Switch } from "@jho951/ui-components";

import type {DocumentTabSwitchProps} from "@features/document/ui/tab/DocumentTab.types.ts";

import styles from "@features/document/ui/tab/DocumentTab.module.css";

function DocumentTab({ value, onChange }: DocumentTabSwitchProps): React.ReactElement {
    const isList = value === "list";

    return (
        <div className={styles.documentSwitch}>
            <div className={styles.documentLabel}>
                <span className={styles.documentIcon}>{isList ? "📃" : "🟦"}</span>
                <span className={styles.documentText}>{isList ? "List" : "Grid"}</span>
            </div>

            <Switch
                checked={isList}
                onChange={(checked) => onChange(checked ? "list" : "grid")}
                label="List 모드"
                aria-label="Toggle Grid/List view"
            />
        </div>
    );
}

export{DocumentTab}
