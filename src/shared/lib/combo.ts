import { MOD } from "./os";

const KEY_ALIASES: Record<string, string> = Object.freeze({
    "Mod+Shift+=": "Mod+Plus",
    "Mod+Shift++": "Mod+Plus",
    "Mod++": "Mod+Plus",
});

export function eventToCombo(e: KeyboardEvent): string {
    const parts: string[] = [];

    if (e.getModifierState?.(MOD)) parts.push("Mod");
    if (e.shiftKey) parts.push("Shift");
    if (e.altKey) parts.push("Alt");

    let k = e.code || e.key || "";

    // numpad / special normalize
    if (k === "NumpadAdd") k = "=";
    if (k === "NumpadSubtract") k = "-";
    if (k === "Numpad0") k = "0";
    if (k === "Space" || k === "Spacebar") k = "Space";

    if (/^Key[A-Z]$/.test(k)) k = k.slice(3);
    if (/^Digit[0-9]$/.test(k)) k = k.slice(5);

    if (k === "+") k = "=";
    if (k.length === 1) k = k.toUpperCase();

    parts.push(k);
    return parts.join("+");
}

export function normalizeCombo(combo: string): string {
    const trimmed = combo.replace(/\s+/g, "");
    return KEY_ALIASES[trimmed] ?? trimmed;
}

export function isTypingTarget(el: Element | null): boolean {
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    const editable = el.getAttribute("contenteditable");
    return tag === "input" || tag === "textarea" || editable === "" || editable === "true";
}

export function withPreventDefaults(e: Event, fn?: () => void): void {
    e.preventDefault();
    e.stopPropagation();
    fn?.();
}

export function allowWhileTyping(combo: string): boolean {
    return (
        combo.startsWith("Mod+S") ||
        combo === "Mod+O" ||
        combo === "Mod+N" ||
        combo === "Escape" ||
        combo === "Enter"
    );
}
