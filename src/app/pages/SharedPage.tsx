import React from "react";
import styles from "./SharedPage.module.css";

/**
 * Shared 페이지 (임시)
 * - 나중에 공유 문서/멤버/권한 UI로 확장
 */
export default function SharedPage(): React.ReactElement {
  return (
    <div className={styles.content}>
      <h1 className={styles.title}>Shared</h1>
      <p className={styles.desc}>
        공유된 문서/페이지가 여기에 표시됩니다.
      </p>
    </div>
  );
}
