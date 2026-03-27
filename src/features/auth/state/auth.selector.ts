/**
 * 인증 상태를 조회하는 selector 모음입니다.
 */

import type { RootState } from "@app/store/store.ts";

/**
 * 현재 로그인 사용자 정보를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 로그인 사용자 정보 또는 `null`을 반환합니다.
 */
export const selectAuthUser = (state: RootState) => state.auth.user;

/**
 * 현재 인증 상태를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 현재 인증 상태 문자열을 반환합니다.
 */
export const selectAuthStatus = (state: RootState) => state.auth.status;

/**
 * 인증 초기화 완료 여부를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 인증 초기화가 끝났으면 `true`, 아니면 `false`를 반환합니다.
 */
export const selectAuthInitialized = (state: RootState) => state.auth.initialized;

/**
 * 현재 로그인 여부를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 로그인 상태이면 `true`, 아니면 `false`를 반환합니다.
 */
export const selectIsAuthenticated = (state: RootState) => state.auth.status === "authenticated";

/**
 * 마지막 인증 에러 메시지를 반환합니다.
 *
 * @param state 현재 Redux 상태입니다.
 * @returns 마지막 인증 에러 메시지 또는 `null`을 반환합니다.
 */
export const selectAuthError = (state: RootState) => state.auth.error;
