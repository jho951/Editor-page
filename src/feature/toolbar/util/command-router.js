import {
    historyStart,
    rotateFocused,
} from '@/feature/canvas/state/canvas.slice';
import { setSectionActive, setTool } from '../state/header.slice';

const SECTION_OF = {
    // default/select
    select: 'default',

    // file
    new: 'file',
    open: 'file',
    save: 'file',
    'another-save': 'file',
    import: 'file',
    export: 'file',

    // shape
    rect: 'shape',
    ellipse: 'shape',
    line: 'shape',
    star: 'shape',
    polygon: 'shape',
    path: 'shape',
    text: 'shape',

    // transform
    'rotate-right': 'transform',
    'rotate-left': 'transform',
    'rotate-180': 'transform',
    flipH: 'transform',
    flipV: 'transform',

    // zoom (플로팅에서 처리, 여기선 실행만)
    fit: 'zoom',
    in: 'zoom',
    out: 'zoom',
};

export function commandRouter(h) {
    const map = {
        // default/select
        select: () => h.handleSetTool?.('select'),

        // file
        new: () => h.handleOpen?.({ createNew: true }),
        open: () => h.handleOpen?.(),
        save: () => h.handleSave?.({ quick: true }),
        'another-save': () => h.handleSave?.({ quick: false }),
        import: () => {
            /* TODO */
        },
        export: () => {
            /* TODO */
        },

        // shape
        rect: () => h.handleSetTool?.('rect'),
        ellipse: () => h.handleSetTool?.('ellipse'),
        line: () => h.handleSetTool?.('line'),
        star: () => h.handleSetTool?.('star'),
        polygon: () => h.handleSetTool?.('polygon'),
        text: () => h.handleSetTool?.('text'),
        path: () => h.handleSetTool?.('freedraw'),

        // transform
        'rotate-right': () => {
            /* TODO: transform */
        },
        'rotate-left': () => {
            /* TODO: transform */
        },
        'rotate-180': () => {
            /* TODO: transform */
        },
        flipH: () => {
            /* TODO: transform */
        },
        flipV: () => {
            /* TODO: transform */
        },

        // zoom (우측하단 플로팅)
        fit: () => h.setZoom?.(1),
        in: () => h.nudgeZoom?.(1.25),
        out: () => h.nudgeZoom?.(1 / 1.25),
        'canvas-right': () => {
            h.dispatch(historyStart());
            h.dispatch(rotateFocused(90));
        },
        'canvas-left': () => {
            h.dispatch(historyStart());
            h.dispatch(rotateFocused(-90));
        },
    };

    return (cmd) => {
        const fn = map[cmd];
        if (!fn) return;
        fn();

        const section = SECTION_OF[cmd];

        if (section === 'shape') {
            const storeKey = cmd === 'path' ? 'freedraw' : cmd;
            h.dispatch(setSectionActive({ section: 'shape', itemKey: cmd }));
            h.dispatch(setTool(storeKey));
            return;
        }
    };
}
