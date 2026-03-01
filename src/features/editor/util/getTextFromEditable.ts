function getTextFromEditable(el: HTMLDivElement | null) {
    if (!el) return "";
    return el.innerText.replace(/\n$/, "");
}

export {getTextFromEditable}