export type AuthTokenProvider = () => string | null;

let provider: AuthTokenProvider = () => null;

/**
 * 외부(예: Redux/스토리지)에서 토큰을 읽는 함수를 주입합니다.
 * - 주입하지 않으면 getAuthToken()은 null을 반환합니다.
 */
export const attachAuthTokenProvider = (fn: unknown): void => {
    provider = typeof fn === 'function' ? (fn as AuthTokenProvider) : () => null;
};

export const getAuthToken = (): string | null => provider();
