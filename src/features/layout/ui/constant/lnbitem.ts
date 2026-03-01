import type {FolderItem} from "@features/layout/ui/lnb/Lnb.types.ts";

export const DEFAULT_FOLDER: FolderItem[] = [
    {
        id: "my",
        label: "개인 페이지",
        icon: "folder",
        children: [],
    },
    {
        id: "pinned",
        label: "즐겨찾기",
        icon: "star",
        children: [
            { id: "documents", key: "allDocs", label: "Documents", icon: "star" },
            { id: "templates", key: "template", label: "Templates", icon: "star" },
        ]
    },

    {
        id: "sharedRoot",
        label: "공유",
        icon: "users",
        children: [{ id: "shared", key: "shared", label: "Shared", icon: "users" }],
    },
];
