/**
 * Document Tab UI 컴포넌트입니다.
 */

import React from "react";
import { Switch } from "@jho951/ui-components";

import type {DocumentTabSwitchProps} from "@features/document/ui/tab/DocumentTab.types.ts";

import styles from "@features/document/ui/tab/DocumentTab.module.css";

/**
 * 문서 목록 탭 전환 UI를 렌더링합니다.
 *
 * @param props 컴포넌트에 전달된 props 객체입니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
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
