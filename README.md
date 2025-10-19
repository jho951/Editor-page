## 명세

- https://www.notion.so/Web-Drowing-26f3669d1e3d8009b454e399ab476412

{
"id": "doc_9f6a…",
"title": "Untitled",
"version": 5,
"createdAt": "2025-10-20T06:10:00Z",
"updatedAt": "2025-10-20T06:30:12Z",

"canvas": {
"width": 1920,
"height": 1080,
"background": "#f5f5f5"
},

"view": {
"scale": 1,
"tx": 0,
"ty": 0
},

"layers": [
{
"id": "layer_vector",
"name": "Vector",
"type": "vector",
"opacity": 1,
"visible": true,
"shapes": [
{
"id": "sh_1",
"type": "rect",
"x": 120,
"y": 80,
"w": 240,
"h": 160,
"stroke": "#333333",
"fill": "#ffffff",
"strokeWidth": 2,
"z": 0,
"locked": false,
"hidden": false,
"meta": {}
},
{
"id": "sh_2",
"type": "ellipse",
"x": 500,
"y": 120,
"w": 200,
"h": 200,
"stroke": "#1b4da2",
"fill": "transparent",
"strokeWidth": 3,
"z": 1,
"locked": false,
"hidden": false,
"meta": {}
},
{
"id": "sh_3",
"type": "polygon",
"x": 860,
"y": 140,
"w": 180,
"h": 180,
"sides": 6,
"stroke": "#222",
"fill": "#fff",
"strokeWidth": 2,
"z": 2,
"locked": false,
"hidden": false,
"meta": {}
},
{
"id": "sh_4",
"type": "star",
"x": 1100,
"y": 160,
"w": 220,
"h": 220,
"points": 5,
"innerRatio": 0.5,
"stroke": "#222",
"fill": "#fff",
"strokeWidth": 2,
"z": 3,
"locked": false,
"hidden": false,
"meta": {}
},
{
"id": "sh_5",
"type": "line",
"x": 200,
"y": 400,
"w": 300,
"h": 60,
"stroke": "#ff0066",
"strokeWidth": 4,
"z": 4,
"locked": false,
"hidden": false,
"meta": {}
},
{
"id": "sh_6",
"type": "path",
"x": 300,
"y": 520,
"w": 260,
"h": 120,
"path": [
{ "u": 0.00, "v": 0.10 },
{ "u": 0.10, "v": 0.00 },
{ "u": 0.35, "v": 0.40 },
{ "u": 0.65, "v": 0.60 },
{ "u": 1.00, "v": 0.30 }
],
"stroke": "#222",
"strokeWidth": 2,
"z": 5,
"locked": false,
"hidden": false,
"meta": { "smoothing": "none" }
},
{
"id": "sh_7",
"type": "text",
"x": 700,
"y": 520,
"w": 400,
"h": 140,
"text": "여기에 텍스트",
"font": "16px sans-serif",
"color": "#111111",
"align": "left",
"lineHeight": 1.3,
"fill": null,
"stroke": null,
"strokeWidth": 0,
"z": 6,
"locked": false,
"hidden": false,
"meta": {}
}
]
}
],

"selection": {
"ids": ["sh_7"] // 선택 상태를 저장하고 싶다면 (선택)
}
}

type RGBA = string; // "#RRGGBB" | "transparent" 등

type BaseShape = {
id: string;
type:
| 'rect' | 'ellipse' | 'polygon' | 'star'
| 'line' | 'path' | 'text';
x: number; y: number; w: number; h: number; // world px
stroke?: RGBA | null;
fill?: RGBA | null;
strokeWidth?: number; // px
z?: number;
locked?: boolean;
hidden?: boolean;
meta?: Record<string, any>;
};

type Rect = BaseShape & { type: 'rect' };
type Ellipse = BaseShape & { type: 'ellipse' };
type Polygon = BaseShape & { type: 'polygon'; sides: number };
type Star = BaseShape & { type: 'star'; points: number; innerRatio: number };
type Line = BaseShape & { type: 'line' }; // x,y = p0 / w,h = (p1 - p0)
type Path = BaseShape & { type: 'path'; path: {u:number; v:number}[] };
type TextShape = BaseShape & {
type: 'text';
text: string;
font: string; // "16px sans-serif"
color: RGBA; // 글자색
align: 'left' | 'center' | 'right';
lineHeight: number; // 1.2 ~ 1.6
};

type Shape = Rect | Ellipse | Polygon | Star | Line | Path | TextShape;

type Layer = {
id: string;
name: string;
type: 'vector'; // 확장 가능: 'raster' 등
opacity: number;
visible: boolean;
shapes: Shape[];
};

type View = { scale: number; tx: number; ty: number };

type Doc = {
id: string;
title: string;
version: number;
createdAt: string;
updatedAt: string;
canvas: { width: number; height: number; background: RGBA };
view: View;
layers: Layer[];
selection?: { ids: string[] };
};
