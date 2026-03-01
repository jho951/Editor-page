import {LAST} from "@features/layout/constant/constant.ts";
import type {EditorMode} from "@features/layout/api/pages.ts";

export function safeReadJson(key: string, fallback: any) {
    try {
        if (typeof window === "undefined") return fallback;
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback;
        return JSON.parse(raw);
    } catch {
        return fallback;
    }
}

export function readStringArray(key: string): string[] {
    const v = safeReadJson(key, []);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
}

export function readLastLocation(): { docId: string; mode: EditorMode} | null {
    const v = safeReadJson(LAST, null);
    if (!v || typeof v !== "object") return null;
    if (typeof v.docId !== "string") return null;
    if (v.mode !== "text" && v.mode !== "canvas") return null;
    return { docId: v.docId, mode: v.mode };
}