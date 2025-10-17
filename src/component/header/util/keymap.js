import { isMac, MOD } from '../constant/os';

export function displayShortcut(combo) {
    // UI용 보기 좋은 라벨 (⌘, Ctrl 기호 치환)
    return combo
        .replaceAll('Mod', isMac ? '⌘' : 'Ctrl')
        .replaceAll('Alt', isMac ? '⌥' : 'Alt')
        .replaceAll('Shift', '⇧')
        .replaceAll('+', ' + ');
}

export function eventToCombo(e) {
    // e.key를 조합해서 "Mod+Shift+Z" 같은 문자열로 정규화
    const parts = [];
    if (e.getModifierState(MOD)) parts.push('Mod');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');

    let k = e.key;

    // 브라우저/키보드 별 대표 키 보정
    // +, -, =, 0, Arrow 등
    if (k === '+') k = '=';
    if (k === ' ') k = 'Space';
    if (k.length === 1) {
        // 단일 문자: 대문자 정규화
        k = k.toUpperCase();
    }

    // 특수키들 그대로 사용
    if (
        k === 'ArrowUp' ||
        k === 'ArrowDown' ||
        k === 'ArrowLeft' ||
        k === 'ArrowRight'
    ) {
        parts.push(k);
    } else if (
        k === 'Escape' ||
        k === 'Enter' ||
        k === 'Backspace' ||
        k === 'Delete' ||
        k === 'Tab'
    ) {
        parts.push(k);
    } else if (/^[A-Z0-9=]$/.test(k)) {
        parts.push(k);
    } else {
        // 기타 키는 그대로
        parts.push(k);
    }
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
