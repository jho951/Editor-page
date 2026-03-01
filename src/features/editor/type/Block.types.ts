export type BlockType =
    | "paragraph"
    | "heading1"
    | "heading2"
    | "heading3"
    | "bulleted_list"
    | "numbered_list"
    | "to_do";


export interface Block {
    id: string;
    type: BlockType;
    text: string;
    checked?: boolean;
}
