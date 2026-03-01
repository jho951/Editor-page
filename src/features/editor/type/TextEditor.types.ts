import type { Block } from "./Block.types";

export interface TextEditorProps {
  initialTitle?: string;
  initialBlocks?: Block[];
  onChange?: (title: string, blocks: Block[]) => void;
}

export interface TextEditorRef {
  focusTitle: () => void;
}
