/**
 * @file interceptor.js
 */

// 공통 인터셉터 주입 유틸. 여러 axios 인스턴스에 재사용 가능.

let isRefreshing = false;
let pendingQueue = []; // 401 동안 대기중인 요청 재시도 큐

function genRequestId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 표준 에러 형태로 변환
 */
function normalizeError(error) {
    // 네트워크/취소
    if (error.name === 'CanceledError') {
        return {
            status: 0,
            code: 'REQUEST_CANCELED',
            message: '요청이 취소되었습니다.',
            details: null,
        };
    }
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
        return {
            status: 0,
            code: 'NETWORK_ERROR',
            message: '네트워크 오류가 발생했습니다.',
            details: null,
        };
    }

    const res = error.response;
    if (!res) {
        return {
            status: 0,
            code: error.code || 'UNKNOWN',
            message: error.message || '알 수 없는 오류',
            details: null,
        };
    }

    const status = res.status;
    const payload = res.data || {};
    const code = payload.code || `HTTP_${status}`;
    const message =
        payload.message ||
        res.statusText ||
        '요청 처리 중 오류가 발생했습니다.';
    return {
        status,
        code,
        message,
        details: payload.errors || payload.data || null,
    };
}

/**
 * 인터셉터 주입
 * @param {import('axios').AxiosInstance} axiosInstance
 * @param {{
 *   getAccessToken: () => string | null,
 *   getRefreshToken?: () => string | null,
 *   refresh: () => Promise<{ accessToken: string, refreshToken?: string }>,
 *   setTokens: (tokens: { accessToken: string, refreshToken?: string }) => void,
 *   onLogout?: () => void,
 *   isPublic?: (config: import('axios').InternalAxiosRequestConfig) => boolean
 * }} deps
 */
export function setupInterceptors(axiosInstance, deps) {
    const {
        getAccessToken,
        getRefreshToken,
        refresh,
        setTokens,
        onLogout,
        isPublic = (config) => config.skipAuth === true,
    } = deps;

    // ───────────────── 요청 인터셉터 ─────────────────
    axiosInstance.interceptors.request.use((config) => {
        // 요청 ID
        config.headers = config.headers || {};
        config.headers['X-Request-Id'] =
            config.headers['X-Request-Id'] || genRequestId();

        // 인증 건너뛰기 옵션
        if (isPublic(config)) return config;

        // Authorization
        const token = getAccessToken && getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // JSON 기본 헤더
        if (!config.headers['Content-Type'] && !config.formData) {
            config.headers['Content-Type'] = 'application/json';
        }

        // AbortController 지원(타임아웃/취소를 직접 쓰고 싶을 때)
        if (
            !config.signal &&
            config.timeout &&
            typeof AbortController !== 'undefined'
        ) {
            const controller = new AbortController();
            config.signal = controller.signal;
            // 필요하면 외부에서 controller를 저장해두고 취소 가능
        }

        return config;
    });

    // ───────────────── 응답 인터셉터 ─────────────────
    axiosInstance.interceptors.response.use(
        (response) => response, // 성공은 그대로
        async (error) => {
            const original = error.config;

            // 401 처리: 이미 한 번 재시도한 요청은 더 이상 리프레시 시도 X
            const isUnauthorized = error?.response?.status === 401;
            const isRetry = original && original.__isRetryRequest;

            if (!isUnauthorized || isRetry || !refresh) {
                // 표준화 후 throw
                throw normalizeError(error);
            }

            // 리프레시 진행 중이면 큐에 넣고 대기
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        // 새 토큰으로 헤더 바꿔서 재요청
                        original.headers = original.headers || {};
                        original.headers.Authorization = `Bearer ${token}`;
                        original.__isRetryRequest = true;
                        return axiosInstance(original);
                    })
                    .catch((e) => {
                        throw normalizeError(e);
                    });
            }

            // 리프레시 시작
            isRefreshing = true;
            try {
                const tokens = await refresh(); // 예: /api/auth/refresh 호출
                setTokens(tokens);

                // 대기중인 요청들 처리
                pendingQueue.forEach((p) => p.resolve(tokens.accessToken));
                pendingQueue = [];

                // 원래 요청 재시도
                original.headers = original.headers || {};
                original.headers.Authorization = `Bearer ${tokens.accessToken}`;
                original.__isRetryRequest = true;
                return axiosInstance(original);
            } catch (e) {
                // 실패 시 전부 거절 + 로그아웃
                pendingQueue.forEach((p) => p.reject(e));
                pendingQueue = [];
                if (onLogout) onLogout();
                throw normalizeError(e);
            } finally {
                isRefreshing = false;
            }
        }
    );

    // 해제(eject) 함수가 필요하면 반환
    return axiosInstance;
}
