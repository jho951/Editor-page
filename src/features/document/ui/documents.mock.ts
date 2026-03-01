import type {DocCardItem} from "@features/document/ui/card/DocumentCard.types.ts";

export type DocEditor = "text" | "canvas";

export const mockDocs: DocCardItem[] = [
    { id: "d1", title: "Getting Started", accent: "#D7D7D7", kind: "documents", editor: "text" },
    { id: "d2", title: "Weekly To-do List", accent: "#F2A94E", kind: "documents", editor: "text" },
    { id: "d3", title: "Job Application Planner", accent: "#E7A8B2", kind: "documents", editor: "text" },
    { id: "d4", title: "Club Homepage", accent: "#B6D6C2", kind: "documents", editor: "canvas" },
];

export const mockTemplates: DocCardItem[] = [
    { id: "t1", title: "Meal Planner", accent: "#7FA9FF", kind: "templates", editor: "text" },
    { id: "t2", title: "Reading List", accent: "#F4B24E", kind: "templates" },
    { id: "t3", title: "Research Planner", accent: "#2F43FF", kind: "templates" },
    { id: "t4", title: "Class note", accent: "#F18B4E", kind: "templates" },
    { id: "t5", title: "Monthly Budget", accent: "#63B6A8", kind: "templates" },
    { id: "t6", title: "Ideas", accent: "#333333", kind: "templates" },
    { id: "t7", title: "Project Doc", accent: "#FF5A7A", kind: "templates" },
    { id: "t8", title: "Travel Planner", accent: "#6A7BFF", kind: "templates" },
    { id: "t9", title: "Meeting note", accent: "#2F43FF", kind: "templates" },
];
