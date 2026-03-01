export function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = (text || '').split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width <= maxW || line === '') {
      line = test;
    } else {
      lines.push(line);
      line = w;
    }
  }

  if (line) lines.push(line);
  return lines;
}
