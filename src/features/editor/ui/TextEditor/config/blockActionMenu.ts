export type BlockActionId =
  | "turnInto"
  | "duplicate"
  | "delete";

export type BlockActionItem = {
  id: BlockActionId;
  label: string;
  desc?: string;
  rightHint?: string;
  danger?: boolean;
};

export const BLOCK_ACTION_ITEMS: BlockActionItem[] = [
  { id: "turnInto", label: "전환", desc: "블록 유형 변경", rightHint: "›" },
  { id: "duplicate", label: "복제", rightHint: "⌘D" },
  { id: "delete", label: "삭제", rightHint: "Del", danger: true },
];
