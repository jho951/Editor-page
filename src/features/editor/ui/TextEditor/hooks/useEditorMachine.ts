import { useEffect, useMemo } from "react";

import type { Block } from "../../../type/Block.types.ts";
import { useAppDispatch, useAppSelector } from "@app/store/hooks.ts";

import { editorActions, selectEditorSession, selectEditor } from "@features/editor/state/editor.slice.ts";

/**
 * Redux-backed editor "machine".
 * Keeps TextEditor UI code stable while moving state to a single Redux source of truth.
 */
export function useEditorMachine(params: {
  initialTitle?: string;
  initialBlocks?: Block[];
  onChange?: (title: string, blocks: Block[]) => void;
}) {
  const dispatchRTK = useAppDispatch();
  const slice = useAppSelector(selectEditor);
  const session = useAppSelector(selectEditorSession);

  // Initialize only once when editor has no active doc and session is still default.
  useEffect(() => {
    // If a doc is already loaded, don't override.
    if (slice.docId) return;

    const hasUserInit = (params.initialBlocks?.length ?? 0) > 0 || (params.initialTitle != null && params.initialTitle !== "");
    if (!hasUserInit) return;

    dispatchRTK(
      editorActions.initSession({
        docId: null,
        title: params.initialTitle ?? "",
        blocks: params.initialBlocks ?? [],
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent
  useEffect(() => {
    params.onChange?.(session.title, session.blocks);
  }, [params, session.title, session.blocks]);

  const dispatch = useMemo(() => {
    return (action: { type: string; [k: string]: any }) => dispatchRTK(editorActions.apply(action));
  }, [dispatchRTK]);

  return { state: session, dispatch };
}
