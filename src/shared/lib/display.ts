import { isMac } from "./os";

export function displayShortcut(combo: string): string {
    return combo
        .replaceAll("Mod", isMac() ? "⌘" : "Ctrl")
        .replaceAll("Alt", isMac() ? "⌥" : "Alt")
        .replaceAll("Shift", "⇧")
        .replaceAll("+", " + ");
}
