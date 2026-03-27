/**
 * Sign In Redirect Page 라우트 엔트리 컴포넌트입니다.
 */

import React from "react";

import { SignInRedirectView } from "@features/auth/index.ts";

/**
 * 로그인 리다이렉트 라우트 엔트리 컴포넌트입니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function SignInRedirectPage(): React.ReactElement {
    return <SignInRedirectView />;
}

export default SignInRedirectPage;