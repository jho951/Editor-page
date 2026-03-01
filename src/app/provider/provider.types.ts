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

export interface MenuConfig {
    x: number;
    y: number;
    items: { label: string; onClick: () => void; danger?: boolean }[];
}