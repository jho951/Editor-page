import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@app/store/hooks.ts";
import {
    buildSsoStartUrl,
    consumePostLoginRedirect,
    resolveNextPathFromParams,
    bootstrapAuth,
    selectAuthError,
    selectIsAuthenticated,
} from "@features/auth/index.ts";

/**
 * 인증 콜백 진입 후 세션 쿠키를 확인하고 후속 이동을 수행합니다.
 * @returns 렌더링할 React 엘리먼트를 반환합니다.
 */
function AuthCallbackView(): React.ReactElement {
    const [params] = useSearchParams();

    const dispatch = useAppDispatch();

    const navigate = useNavigate();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    const error = useAppSelector(selectAuthError);

    const nextPath = useMemo(() => {
        return resolveNextPathFromParams(params, consumePostLoginRedirect());
    }, [params]);

    const authError = params.get("error");

    useEffect(() => {
        if (authError) return;
        void dispatch(bootstrapAuth());
    }, [authError, dispatch]);

    useEffect(() => {
        if (!isAuthenticated) return;
        navigate(nextPath, { replace: true });
    }, [isAuthenticated, navigate, nextPath]);

    if (authError) {
        return (
            <div style={{ padding: 24 }}>
                <p>SSO 로그인 실패: {authError}</p>
                <button type="button" onClick={() => window.location.replace(buildSsoStartUrl(nextPath))}>
                    다시 로그인
                </button>
            </div>
        );
    }
    if (error) {
        return (
            <div style={{ padding: 24 }}>
                <p>로그인 처리 실패: {error}</p>
                <button type="button" onClick={() => window.location.replace(buildSsoStartUrl(nextPath))}>
                    다시 로그인
                </button>
            </div>
        );
    }
    return <span>연결하는 중입니다.</span>;
}

export { AuthCallbackView };
