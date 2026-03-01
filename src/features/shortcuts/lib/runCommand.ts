import type { AppDispatch } from "@app/store/store.ts";
import { canvasActions } from "@features/canvas/state/canvas.slice.ts";

type RunCtx = {
    scope: "text" | "canvas" | "global";
    command: string;
};

export function runCommand(dispatch: AppDispatch, ctx: RunCtx) {
    const { scope, command } = ctx;

    if (command.startsWith("toggle-section:")) {
        // Right panel section toggling is not wired in current state slice.
        // Keep command recognized as no-op to avoid runtime/type errors.
        return;
    }

    if (scope === "canvas") {
        switch (command) {
            case "new":
                // dispatch(documentActions.newDoc()) 같은 걸로 연결
                return;
            case "save":
                // dispatch(documentActions.save())
                return;

            // tools
            case "select":
            case "rect":
            case "ellipse":
            case "line":
            case "text":
            case "star":
            case "polygon":
                dispatch(canvasActions.setTool(command));
                return;

            // history
            case "undo":
                // dispatch(historyActions.undo())
                return;
            case "redo":
                // dispatch(historyActions.redo())
                return;

            // zoom
            case "in":
                // dispatch(viewportActions.zoomIn())
                return;
            case "out":
                // dispatch(viewportActions.zoomOut())
                return;
            case "fit":
                // dispatch(viewportActions.fitToScreen())
                return;

            // transform
            case "flipH":
                // dispatch(canvasActions.flipH())
                return;
            case "flipV":
                // dispatch(canvasActions.flipV())
                return;

            // nudge
            case "nudge-up":
            case "nudge-down":
            case "nudge-left":
            case "nudge-right":
            case "nudge10-up":
            case "nudge10-down":
            case "nudge10-left":
            case "nudge10-right":
                // dispatch(canvasActions.nudge({ dir, step }))
                return;

            // edit mode
            case "edit-enter":
            case "edit-exit":
                // dispatch(canvasActions.setEditMode(...))
                return;

            case "node-delete":
                // dispatch(canvasActions.deleteSelection())
                return;

            default:
                return;
        }
    }

    if (scope === "text") {
        switch (command) {
            default:
                return;
        }
    }
}
