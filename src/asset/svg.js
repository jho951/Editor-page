const ICONS = {
    select: {
        vb: '0 0 24 24',
        g: [
            { el: 'path', d: 'M4 4l5 13 2-5 5-2-12-6z', fill: 'currentColor' },
            {
                el: 'path',
                d: 'M14 14l6 6',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },
    bucket: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M4 10l6-6 6 6v6a3 3 0 01-3 3H7a3 3 0 01-3-3v-6z',
                fill: 'currentColor',
            },
            {
                el: 'path',
                d: 'M10 4l6 6',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },

    text: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M4 6h16M12 6v12',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },
    eyedrop: {
        vb: '0 0 24 24',
        g: [
            { el: 'path', d: 'M14 3l7 7-5 5-7-7 5-5z', fill: 'currentColor' },
            {
                el: 'path',
                d: 'M3 21l6-6',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },
    magnifier: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'circle',
                cx: 10,
                cy: 10,
                r: 6,
                stroke: 'currentColor',
                strokeWidth: 2,
                fill: 'none',
            },
            {
                el: 'path',
                d: 'M14.5 14.5L20 20',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },
    shapes: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'rect',
                x: 3,
                y: 3,
                width: 8,
                height: 8,
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'circle',
                cx: 17,
                cy: 7,
                r: 4,
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'path',
                d: 'M4 20l4-6 4 6H4z',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    transform: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'rect',
                x: 5,
                y: 5,
                width: 14,
                height: 14,
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'path',
                d: 'M5 9h4M15 19v-4M19 15h-4M9 5v4',
                stroke: 'currentColor',
            },
        ],
    },

    rect: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'rect',
                x: 4,
                y: 6,
                width: 16,
                height: 12,
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    ellipse: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'ellipse',
                cx: 12,
                cy: 12,
                rx: 8,
                ry: 5,
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    line: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M4 18L20 6',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },
    polygon: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M12 3l8 5-3 10H7L4 8l8-5z',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    star: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M12 3l3 6 6 .9-4.5 4.3L18 21l-6-3-6 3 1.5-6.8L3 9.9 9 9l3-6z',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    freeDraw: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M3 16c3-6 8-4 11-1s5 3 7-2',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },

    resize: {
        vb: '0 0 24 24',
        g: [
            { el: 'path', d: 'M4 20l6-6M14 10l6-6', stroke: 'currentColor' },
            {
                el: 'rect',
                x: 3,
                y: 3,
                width: 8,
                height: 8,
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'rect',
                x: 13,
                y: 13,
                width: 8,
                height: 8,
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    skew: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M5 17l4-10h10l-4 10H5z',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },

    flipH: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M12 4v16M12 4L4 12l8 8M12 4l8 8-8 8',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    flipV: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M4 12h16M4 12l8-8 8 8M4 12l8 8 8-8',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    reset: {
        vb: '0 0 24 24',
        g: [
            { el: 'path', d: 'M12 6V3l-3 3 3 3V6', stroke: 'currentColor' },
            {
                el: 'circle',
                cx: 12,
                cy: 12,
                r: 7,
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    undo: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M7 7l-4 4 4 4',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
            {
                el: 'path',
                d: 'M20 17a7 7 0 0 0-7-7H3',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },
    redo: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M17 7l4 4-4 4',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
            {
                el: 'path',
                d: 'M4 17a7 7 0 0 1 7-7h10',
                stroke: 'currentColor',
                strokeWidth: 2,
            },
        ],
    },

    save: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M4 4h12l4 4v12H4z',
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'path',
                d: 'M8 4v6h8V4',
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'rect',
                x: 7,
                y: 14,
                width: 10,
                height: 5,
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    open: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M3 7h7l2 2h9v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    trash: {
        vb: '0 0 24 24',
        g: [
            { el: 'path', d: 'M3 6h18', stroke: 'currentColor' },
            { el: 'path', d: 'M8 6V4h8v2', stroke: 'currentColor' },
            {
                el: 'rect',
                x: 6,
                y: 6,
                width: 12,
                height: 14,
                stroke: 'currentColor',
                fill: 'none',
            },
            { el: 'path', d: 'M10 10v6M14 10v6', stroke: 'currentColor' },
        ],
    },

    file: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
                fill: 'currentColor',
                opacity: 0.12,
            },
            {
                el: 'path',
                d: 'M14 2v6h6M8 13h8M8 17h8M8 9h4',
                stroke: 'currentColor',
                strokeWidth: 1.5,
                fill: 'none',
            },
        ],
    },
    shape: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'rect',
                x: 3,
                y: 3,
                width: 8,
                height: 8,
                rx: 1.5,
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'circle',
                cx: 17,
                cy: 7,
                r: 4,
                stroke: 'currentColor',
                fill: 'none',
            },
            {
                el: 'path',
                d: 'M5 21l7-12 7 12H5z',
                stroke: 'currentColor',
                fill: 'none',
            },
        ],
    },
    zoom: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'circle',
                cx: 11,
                cy: 11,
                r: 6.5,
                stroke: 'currentColor',
                fill: 'none',
            },
            { el: 'path', d: 'M20 20l-3.2-3.2', stroke: 'currentColor' },
        ],
    },
    style: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M5.5 13.5h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 1.7,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            },

            {
                el: 'path',
                d: 'M10.5 8.5h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2z',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 1.7,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            },

            {
                el: 'path',
                d: 'M15.5 3.5h5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2z',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 1.7,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
            },

            {
                el: 'path',
                d: 'M18 9a1 1 0 1 1-2 0a1 1 0 0 1 2 0z',
                fill: 'currentColor',
            },
        ],
    },
    close: {
        vb: '0 0 24 24',
        g: [
            {
                el: 'path',
                d: 'M6 6 L18 18 M18 6 L6 18',
                fill: 'none',
                stroke: 'currentColor',
                strokeWidth: 1.7,
                strokeLinecap: 'round',
            },
        ],
    },
};

export { ICONS };
