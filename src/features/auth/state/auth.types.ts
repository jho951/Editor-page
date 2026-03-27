/**
 * auth 관련 타입을 정의합니다.
 */

import type { AuthUser } from "@features/auth/api/auth.ts";

export type AuthStatus = "idle" | "loading" | "authenticated" | "anonymous";

export interface AuthState {
    user: AuthUser | null;
    status: AuthStatus;
    initialized: boolean;
    error: string | null;
}

export interface RejectValue {
    anonymous?: boolean;
    message: string | null;
}
