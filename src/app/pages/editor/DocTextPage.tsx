import React, { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

import type { TextEditorRef } from "@features/editor/type/TextEditor.types.ts";
import { TextEditor } from "@features/editor/ui/TextEditor.tsx";

import { useAppDispatch, useAppSelector } from "@app/store/hooks.ts";
import { loadTextDoc, selectEditorStatus, selectEditorError } from "@features/editor/state/editor.slice.ts";

function DocTextPage(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const status = useAppSelector(selectEditorStatus);
  const error = useAppSelector(selectEditorError);

  const editorRef = useRef<TextEditorRef>(null);

  useEffect(() => {
    if (!id) return;
    dispatch(loadTextDoc({ id }));
  }, [dispatch, id]);

  return (
    <div style={{ height: "100%" }}>
      {status === "loading" && <div style={{ padding: 16 }}>불러오는 중...</div>}
      {status === "error" && <div style={{ padding: 16 }}>에러: {error ?? "문서를 불러오지 못했습니다."}</div>}
      <TextEditor ref={editorRef} />
    </div>
  );
}

export default DocTextPage;
