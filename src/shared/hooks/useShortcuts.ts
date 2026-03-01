import { useEffect } from 'react';
import { eventToCombo, isTypingTarget } from '@shared/lib/combo.ts';
import { CANVAS, GLOBAL } from "@shared/constant/keymap.data.ts";

export interface UseShortcutsProps {
  run: (cmd: string) => void;
  blockInInputs?: string[];
}

export function useShortcuts({
  run,
  blockInInputs = ['Mod+S', 'Mod+O', 'Mod+N'],
}: UseShortcutsProps): void {
  useEffect(() => {
    if (typeof run !== 'function') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (isTypingTarget(target)) {
        const c = eventToCombo(e);
        if (blockInInputs.includes(c)) e.preventDefault();
        return;
      }
      const raw = eventToCombo(e);
      const combo = raw === 'Mod+Shift+=' ? 'Mod+Plus' : raw;
      const cmd = ({ ...GLOBAL, ...CANVAS } as Record<string, string>)[combo];
      if (!cmd) return;
      e.preventDefault();
      run(cmd);
    };

    window.addEventListener('keydown', onKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', onKeyDown, { capture: true });
  }, [run, blockInInputs]);
}
