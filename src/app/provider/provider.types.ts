/**
 * provider 관련 타입을 정의합니다.
 */

import React from "react";

export type Theme = "light" | "dark";

export interface ThemeContextValue {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

export type ProvidersProps = {
    children: React.ReactNode;
};
