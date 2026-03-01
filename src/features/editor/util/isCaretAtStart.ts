function isCaretAtStart(el: HTMLElement) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.startContainer)) return false;
    if (range.startOffset !== 0) return false;

    const node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) return true;

    return range.startContainer === el && range.startOffset === 0;
}

export {isCaretAtStart}