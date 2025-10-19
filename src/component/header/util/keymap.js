// ✅ 교체 권장: header/util/keymap.js
import { isMac, MOD } from '../constant/os';

export function displayShortcut(combo) {
    return combo
        .replaceAll('Mod', isMac ? '⌘' : 'Ctrl')
        .replaceAll('Alt', isMac ? '⌥' : 'Alt')
        .replaceAll('Shift', '⇧')
        .replaceAll('+', ' + ');
}

export function eventToCombo(e) {
    const parts = [];
    if (e.getModifierState?.(MOD)) parts.push('Mod');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');

    // 키 보정: code 우선 → key 보조
    let k = e.code || e.key || '';

    // 숫자패드/특수키 정규화
    // NumpadAdd/Subtract → '=' / '-'
    if (k === 'NumpadAdd') k = '=';
    if (k === 'NumpadSubtract') k = '-';
    if (k === 'Numpad0') k = '0';
    if (k === 'Space' || k === 'Spacebar') k = 'Space';

    // code가 'KeyX' / 'Digit1' 스타일이면 key로 치환
    if (/^Key[A-Z]$/.test(k)) k = k.slice(3);
    if (/^Digit[0-9]$/.test(k)) k = k.slice(5);

    // 브라우저에 따라 '+'가 실제로는 '=' 로 들어올 수 있음
    if (k === '+') k = '=';
    if (typeof k === 'string' && k.length === 1) k = k.toUpperCase();

    // 화살표/기타 특수키
    const accept = new Set([
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'Escape',
        'Enter',
        'Backspace',
        'Delete',
        'Tab',
        '=',
        '-',
        '0',
    ]);
    if (!accept.has(k) && !/^[A-Z0-9=]$/.test(k)) {
        // 기타 키는 그대로
    }

    parts.push(k);
    return parts.join('+');
}

export function isTypingTarget(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    const editable = el.getAttribute && el.getAttribute('contenteditable');
    return (
        tag === 'input' ||
        tag === 'textarea' ||
        editable === '' ||
        editable === 'true'
    );
}

export function withPreventDefaults(e, fn) {
    e.preventDefault();
    e.stopPropagation();
    fn?.();
}
