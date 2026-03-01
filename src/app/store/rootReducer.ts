import { combineReducers } from "@reduxjs/toolkit";

import { layoutReducer } from "@features/layout/state/layout.slice.ts";
import { shortcutsReducer } from "@features/shortcuts/state/shortcuts.slice.ts";

import { uiReducer } from "@features/ui/state/ui.slice.ts";
import { editorReducerRTK } from "@features/editor/state/editor.slice.ts";

import { canvasReducer } from "@features/canvas/state/canvas.slice.ts";
import { documentReducer } from "@features/document/model/document.slice.ts";
import {toolbarReducer} from "@features/canvas/state/toolbar.slice.ts";

const rootReducer = combineReducers({
  layout: layoutReducer,
  shortcut: shortcutsReducer,

  ui: uiReducer,
  editor: editorReducerRTK,

  canvas: canvasReducer,
  document: documentReducer,
    toolbar: toolbarReducer,
});

export { rootReducer };
