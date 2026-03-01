import type {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';

type TokenPair = { accessToken: string; refreshToken?: string };

export type NormalizedHttpError = {
    status: number;
    code: string;
    message: string;
    details: unknown;
};

/**
 * axios config에 프로젝트 전용 필드를 붙이는 용도
 */
export type AuthAxiosRequestConfig = InternalAxiosRequestConfig & {
    skipAuth?: boolean;
    formData?: boolean;
    __isRetryRequest?: boolean;
};

export type InterceptorDeps = {
    getAccessToken: () => string | null;
    getRefreshToken?: () => string | null;
    refresh: () => Promise<TokenPair>;
    setTokens: (tokens: TokenPair) => void;
    onLogout?: () => void;
    isPublic?: (config: AuthAxiosRequestConfig) => boolean;
};

let isRefreshing = false;
let pendingQueue: Array<{
    resolve: (accessToken: string) => void;
    reject: (err: unknown) => void;
}> = [];

function genRequestId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeError(error: unknown): NormalizedHttpError {
    const e = error as Partial<AxiosError> & {
        name?: string;
        code?: string;
        message?: string;
        response?: { status: number; data?: unknown; statusText?: string };
    };

    // 네트워크/취소
    if (e.name === 'CanceledError') {
        return {
            status: 0,
            code: 'REQUEST_CANCELED',
            message: '요청이 취소되었습니다.',
            details: null,
        };
    }
    if (e.message === 'Network Error' || e.code === 'ERR_NETWORK') {
        return {
            status: 0,
            code: 'NETWORK_ERROR',
            message: '네트워크 오류가 발생했습니다.',
            details: null,
        };
    }

    const res = e.response;
    if (!res) {
        return {
            status: 0,
            code: e.code || 'UNKNOWN',
            message: e.message || '알 수 없는 오류',
            details: null,
        };
    }

    const status = res.status;
    const payload = (res.data ?? {}) as {
        code?: string;
        message?: string;
        errors?: unknown;
        data?: unknown;
    };

    const code = payload.code || `HTTP_${status}`;
    const message = payload.message || res.statusText || '요청 처리 중 오류가 발생했습니다.';

    return {
        status,
        code,
        message,
        details: payload.errors ?? payload.data ?? null,
    };
}

/**
 * 인터셉터 주입
 */
export function setupInterceptors(
    axiosInstance: AxiosInstance,
    deps: InterceptorDeps
): AxiosInstance {
    const {
        getAccessToken,
        refresh,
        setTokens,
        onLogout,
        isPublic = (config: AuthAxiosRequestConfig) => config.skipAuth === true,
    } = deps;

    // ───────────────── 요청 인터셉터 ─────────────────
    axiosInstance.interceptors.request.use((config) => {
        const cfg = config as AuthAxiosRequestConfig;

        // 요청 ID
        cfg.headers = cfg.headers ?? {};
        (cfg.headers as Record<string, string>)['X-Request-Id'] =
            (cfg.headers as Record<string, string>)['X-Request-Id'] || genRequestId();

        // 인증 건너뛰기 옵션
        if (isPublic(cfg)) return cfg;

        // Authorization
        const token = getAccessToken();
        if (token) {
            (cfg.headers as Record<string, string>).Authorization = `Bearer ${token}`;
        }

        // JSON 기본 헤더
        const headers = cfg.headers as Record<string, string>;
        if (!headers['Content-Type'] && !cfg.formData) {
            headers['Content-Type'] = 'application/json';
        }

        // AbortController 지원
        if (!cfg.signal && cfg.timeout && typeof AbortController !== 'undefined') {
            const controller = new AbortController();
            cfg.signal = controller.signal;
        }

        return cfg;
    });

    // ───────────────── 응답 인터셉터 ─────────────────
    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error: unknown) => {
            const e = error as Partial<AxiosError> & { config?: unknown; response?: { status?: number } };
            const original = (e.config as AuthAxiosRequestConfig | undefined) ?? undefined;

            const isUnauthorized = e.response?.status === 401;
            const isRetry = original ? original.__isRetryRequest === true : false;

            if (!isUnauthorized || isRetry) {
                return Promise.reject(normalizeError(error));
            }

            // 리프레시 진행 중이면 큐에 넣고 대기
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        if (!original) {
                            return Promise.reject(normalizeError(error));
                        }
                        original.headers = original.headers ?? {};
                        (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
                        original.__isRetryRequest = true;
                        return axiosInstance(original);
                    })
                    .catch((err) => Promise.reject(normalizeError(err)));
            }

            // 리프레시 시작
            isRefreshing = true;
            try {
                const tokens = await refresh();
                setTokens(tokens);

                // 대기중인 요청들 처리
                pendingQueue.forEach((p) => p.resolve(tokens.accessToken));
                pendingQueue = [];

                // 원래 요청 재시도
                if (!original) {
                    return Promise.reject(normalizeError(error));
                }
                original.headers = original.headers ?? {};
                (original.headers as Record<string, string>).Authorization =
                    `Bearer ${tokens.accessToken}`;
                original.__isRetryRequest = true;
                return axiosInstance(original);
            } catch (err) {
                pendingQueue.forEach((p) => p.reject(err));
                pendingQueue = [];
                onLogout?.();
                return Promise.reject(normalizeError(err));
            } finally {
                isRefreshing = false;
            }
        }
    );

    return axiosInstance;
}
