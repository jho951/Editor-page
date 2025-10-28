const selectTool = (s) => s.header.tool;
const selectView = (s) => s.header.view;
const selectZoom = (s) => s.header.view.scale;
const selectCanvasBg = (s) => s.header.canvasBg;

export const HEADER_SELECTOR = {
    selectTool,
    selectView,
    selectZoom,
    selectCanvasBg,
};
