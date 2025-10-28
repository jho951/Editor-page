/**
 * @file viewport.selector.jsd
 * @description viewport 상태 셀렉터
 */
export const selectViewport = (s) =>
    s?.viewport || { scale: 1, tx: 0, ty: 0, rotation: 0 };
export const selectScale = (s) => selectViewport(s).scale;
export const selectRotation = (s) => selectViewport(s).rotation;
export const selectTx = (s) => selectViewport(s).tx;
export const selectTy = (s) => selectViewport(s).ty;
