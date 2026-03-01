export interface Viewport {
    scale: number;
    tx: number;
    ty: number;
}

export interface Point {
    x: number;
    y: number;
}

export type Shape =
    | {
    id: string;
    type: 'rect';
    x: number;
    y: number;
    w: number;
    h: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
}
    | {
    id: string;
    type: 'path';
    path: Point[];
    closePath?: boolean;
    stroke?: string;
    strokeWidth?: number;
};

export interface VectorCanvasProps {
    width: number;
    height: number;
    shapes: Shape[];
    view: Viewport;
    editingId?: string | null;
}

export interface HitmapCanvasProps {
    width: number;
    height: number;
    shapes: Shape[];
    view: Viewport;
}


export interface OverlayCanvasProps {
    width: number;
    height: number;
    view: Viewport;
    shapes: Shape[];
    tool: string;
    focusedId: string | null;
    getPickId: (x: number, y: number) => string | null;
}

export type DragState =
    | {
    type: 'move';
    id: string;
    start: Point;
    origin: Point;
}
    | {
    type: 'rect';
    start: Point;
    temp: { x: number; y: number; w: number; h: number };
}
    | {
    type: 'path';
    points: Point[];
}
    | null;