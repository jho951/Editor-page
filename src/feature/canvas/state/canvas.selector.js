/** shapes 배열 셀렉터 */
const selectShapes = (s) => s.canvas.shapes;
/** 현재 포커스된 도형 ID 셀렉터 */
const selectFocusId = (s) => s.canvas.focusId;

const selectNextId = (s) => s.canvas.nextId;

const selectPast = (s) => s.canvas.past;

const selectfuture = (s) => s.canvas.future;

export { selectShapes, selectFocusId, selectNextId, selectPast, selectfuture };
