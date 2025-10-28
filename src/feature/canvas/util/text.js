function wrapLines(ctx, text, maxW) {
    const words = (text || '').split(/\s+/);
    const lines = [];
    let line = '';
    for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width <= maxW || line === '') line = test;
        else {
            lines.push(line);
            line = w;
        }
    }
    if (line) lines.push(line);
    return lines;
}

export { wrapLines };
