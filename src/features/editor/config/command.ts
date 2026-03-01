import type { BlockType } from "../type/Block.types";

export type SlashCommand = {
  type: BlockType;
  label: string;
  description: string;
  keyword: string;
};

export const SLASH_COMMANDS: SlashCommand[] = [
  { type: "paragraph", label: "텍스트", description: "일반 텍스트입니다.", keyword: "text" },
  { type: "heading1", label: "제목 1", description: "큰 제목입니다.", keyword: "h1 title" },
  { type: "heading2", label: "제목 2", description: "중간 제목입니다.", keyword: "h2 subtitle" },
  { type: "heading3", label: "제목 3", description: "작은 제목입니다.", keyword: "h3" },
  { type: "bulleted_list", label: "글머리 기호", description: "• 목록입니다.", keyword: "bullet list" },
  { type: "numbered_list", label: "번호 목록", description: "1. 목록입니다.", keyword: "number list" },
  { type: "to_do", label: "할 일", description: "체크리스트입니다.", keyword: "todo task" },
];
