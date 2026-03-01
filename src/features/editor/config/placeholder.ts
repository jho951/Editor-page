import type { BlockType } from "../type/Block.types";

export const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  paragraph: "내용을 입력하세요. '/'로 명령어",
  heading1: "큰 제목",
  heading2: "중간 제목",
  heading3: "작은 제목",
  bulleted_list: "목록",
  numbered_list: "번호 목록",
  to_do: "할 일",
};
