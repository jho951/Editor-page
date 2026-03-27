/**
 * Auth Callback Page 라우트 엔트리 컴포넌트입니다.
 */

import React from "react";

import { AuthCallbackView } from "@features/auth/index.ts";

/**
 * 인증 콜백 라우트 엔트리 컴포넌트입니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function AuthCallbackPage(): React.ReactElement {
    return <AuthCallbackView />;
}

export default AuthCallbackPage;
