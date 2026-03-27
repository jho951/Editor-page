/**
 * Not Found 모듈입니다.
 */

import React from "react";
import { NotFoundView } from "@features/not-found/index.ts";

/**
 * 404 라우트 엔트리 컴포넌트입니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function NotFound(): React.ReactElement {
    return <NotFoundView />;
}

export default NotFound;
