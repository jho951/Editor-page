import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@app/store/store";

import { runCommand } from "@features/shortcuts/lib/runCommand";
import type { ProvidersProps } from "@app/provider/provider.types";
import {CANVAS, GLOBAL, type Scope} from "@shared/constant/keymap.data.ts";
import {
    allowWhileTyping,
    eventToCombo,
    isTypingTarget,
    normalizeCombo,
    withPreventDefaults
} from "@shared/lib/combo";


function pickMap(scope: Scope): Record<string, string> {
    if (scope === "canvas") return { ...GLOBAL, ...CANVAS };
    return GLOBAL;
}

function ShortcutProvider({ children }: ProvidersProps): React.ReactElement {
    const dispatch = useDispatch<AppDispatch>();

    const enabled = useSelector((s: RootState) => s.shortcut?.enabled ?? true);
    const scope = useSelector((s: RootState) => (s.shortcut?.scope ?? "global") as Scope);
    const overlayDepth = useSelector((s: RootState) => s.shortcut?.overlayDepth ?? 0);

    useEffect(() => {
        if (!enabled) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.isComposing) return;
            if (overlayDepth > 0) return;

            const combo = normalizeCombo(eventToCombo(e));

            const target = e.target instanceof Element ? e.target : null;
            const typing = isTypingTarget(target);

            const command = pickMap(scope)[combo];
            if (!command) return;

            if (typing && !allowWhileTyping(combo)) return;

            withPreventDefaults(e, () => {
                runCommand(dispatch, { scope, command });
            });
        };

        window.addEventListener("keydown", onKeyDown, { capture: true });
        return () => window.removeEventListener("keydown", onKeyDown, { capture: true });
    }, [dispatch, enabled, overlayDepth, scope]);

    return <>{children}</>;
}

export {ShortcutProvider}