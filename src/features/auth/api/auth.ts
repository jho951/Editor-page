/**
 * SSO 시작, 콜백 복귀 경로 저장, 인증 관련 API 호출을 제공합니다.
 */

import { api } from "@shared/api/client.ts";
import { markExchangeTicketSucceeded } from "@shared/api/auth-flow.ts";
import { endpoints } from "@shared/api/endpoints.ts";
import { clearAccessToken, readAccessTokenFromPayload, setAccessToken } from "@shared/api/token.ts";

/**
 * 로그인 전 경로를 세션에 저장할 때 사용하는 키입니다.
 */
const POST_LOGIN_REDIRECT_KEY = "auth.post_login_redirect";

export type AuthUser = {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  roles?: string[];
};

export type ExchangeTicketBody = {
  ticket: string;
};

/**
 * SSO 시작 요청에 사용할 기본 서버 주소를 반환합니다.
 *
 * @returns SSO 서버 기본 URL을 반환합니다.
 */
function getSsoBaseUrl(): string {
  if (typeof import.meta === "undefined") return "";

  const env = (import.meta as unknown as { env?: { VITE_SSO_BASE_URL?: string } }).env;
  return env?.VITE_SSO_BASE_URL ?? "http://localhost:8080";
}

/**
 * 별도 시작 프론트엔드가 있으면 그 기본 주소를 반환합니다.
 *
 * @returns 시작 프론트엔드 기본 URL을 반환합니다.
 */
function getStartFrontendUrl(): string {
  if (typeof import.meta === "undefined") return "http://localhost:3000";

  const env = (import.meta as unknown as { env?: { VITE_START_FRONTEND_URL?: string } }).env;
  return env?.VITE_START_FRONTEND_URL ?? "http://localhost:3000";
}

/**
 * 로그인 완료 후 돌아올 콜백 URL을 생성합니다.
 *
 * @returns 인증 콜백 절대 URL을 반환합니다.
 */
function buildCallbackUrl(): string {
  if (typeof import.meta === "undefined") return "/auth/callback";

  const env = (import.meta as unknown as { env?: { VITE_SITE_URL?: string } }).env;

  const siteUrl = env?.VITE_SITE_URL;

  if (siteUrl) {
    return new URL("/auth/callback", siteUrl).toString();
  }

  if (typeof window === "undefined") return "/auth/callback";
  return new URL("/auth/callback", window.location.origin).toString();
}

/**
 * 로그인 성공 후 되돌아갈 경로를 세션 스토리지에 저장합니다.
 *
 * @param path 저장하거나 이동할 경로 문자열입니다.
 * @returns 반환값이 없습니다.
 */
export function storePostLoginRedirect(path: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
}

/**
 * 저장해 둔 로그인 후 복귀 경로를 읽고 즉시 제거합니다.
 *
 * @returns 로그인 후 이동할 경로 문자열을 반환합니다.
 */
export function consumePostLoginRedirect(): string {
  if (typeof window === "undefined") return "/";

  const next = window.sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY) ?? "/";
  window.sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return next;
}

/**
 * SSO 로그인 시작 URL을 생성합니다.
 *
 * @param nextPath 로그인 후 돌아갈 경로 문자열입니다.
 * @returns 브라우저가 이동할 SSO 시작 URL을 반환합니다.
 */
export function buildSsoStartUrl(nextPath: string): string {
  storePostLoginRedirect(nextPath);

  if (typeof window === "undefined") return endpoints.authSsoStart;

  const base = getSsoBaseUrl() || window.location.origin;

  const url = new URL(endpoints.authSsoStart, base);

  const callbackUrl = new URL(buildCallbackUrl());
  callbackUrl.searchParams.set("next", nextPath || "/");
  url.searchParams.set("redirect_uri", callbackUrl.toString());
  return url.toString();
}

/**
 * 시작 프론트엔드의 로그인 페이지 URL을 생성합니다.
 *
 * @param nextPath 로그인 후 돌아갈 경로 문자열입니다.
 * @returns 시작 프론트엔드 로그인 URL을 반환합니다.
 */
export function buildStartFrontendSignInUrl(nextPath: string): string {

  const normalizedNext = nextPath && nextPath.startsWith("/") ? nextPath : "/";

  const url = new URL("/signin", getStartFrontendUrl());
  url.searchParams.set("next", normalizedNext);
  return url.toString();
}

/**
 * 시작 프론트엔드 루트 URL을 생성합니다.
 *
 * @returns 시작 프론트엔드 루트 절대 URL을 반환합니다.
 */
export function buildStartFrontendRootUrl(): string {
  const url = new URL("/", getStartFrontendUrl());
  return url.toString();
}

/**
 * 인증 관련 API 호출 집합입니다.
 */
export const authApi = {
  me: (): Promise<AuthUser> => api.get<AuthUser>(endpoints.authMe, { withCredentials: true }),
  exchange: async (body: ExchangeTicketBody): Promise<void> => {
    const response = await api.post<unknown, ExchangeTicketBody>(endpoints.authExchange, body, {
      withCredentials: true,
    });
    markExchangeTicketSucceeded(body.ticket);
    const token = readAccessTokenFromPayload(response);
    // Support both legacy token-payload exchange and cookie-only (204 No Content) exchange.
    if (token) {
      setAccessToken(token);
    }
  },
  logout: async (): Promise<void> => {
    try {
      await api.post(endpoints.authLogout, {});
    } finally {
      clearAccessToken();
    }
  },
};
