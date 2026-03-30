import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@app/store/hooks.ts";
import {
    buildSsoStartUrl,
    consumePostLoginRedirect,
    exchangeSsoTicket,
    resolveNextPathFromParams,
    selectAuthError,
    selectIsAuthenticated,
} from "@features/auth/index.ts";

const EXCHANGE_GUARD_KEY_PREFIX = "auth.exchange_ticket.once:";

function markExchangeAttempted(ticket: string): boolean {
    if (typeof window === "undefined") return true;
    const key = `${EXCHANGE_GUARD_KEY_PREFIX}${ticket}`;
    try {
        if (window.sessionStorage.getItem(key) === "1") return false;
        window.sessionStorage.setItem(key, "1");
        return true;
    } catch {
        return true;
    }
}

/**
 * 인증 콜백 티켓을 처리하고 후속 이동을 수행합니다.
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

    const ticket = params.get("ticket");

    const authError = params.get("error");

    const processedTicketsRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        if (!ticket) {
            return;
        }

        if (processedTicketsRef.current.has(ticket)) return;
        if (!markExchangeAttempted(ticket)) return;

        processedTicketsRef.current.add(ticket);
        void dispatch(exchangeSsoTicket({ ticket }));
    }, [dispatch, nextPath, ticket]);

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
    if (!ticket) {
        return (
            <div style={{ padding: 24 }}>
                <p>교환할 ticket이 없습니다.</p>
                <button type="button" onClick={() => window.location.replace(buildSsoStartUrl(nextPath))}>
                    로그인 시작
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
