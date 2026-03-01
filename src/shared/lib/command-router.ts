export type MinimalDispatch = (action: { type: string; payload?: unknown }) => void;

export function commandRouter(
  ctx: { dispatch: MinimalDispatch; getState: () => unknown },
  key: string
): void {
  const { dispatch } = ctx;
  switch (key) {
    case 'new':
      dispatch({ type: 'doc/newRequested' });
      return;
    case 'save':
      dispatch({ type: 'doc/saveRequested' });
      return;
    case 'another-save':
      dispatch({ type: 'doc/saveAsRequested' });
      return;
    case 'open':
      dispatch({ type: 'doc/openRequested' });
      return;
    case 'import':
      dispatch({ type: 'doc/importRequested' });
      return;
    case 'export':
      dispatch({ type: 'doc/exportRequested' });
      return;

    case 'select':
    case 'rect':
    case 'ellipse':
    case 'line':
    case 'polygon':
    case 'star':
    case 'path':
    case 'text':
      dispatch({ type: 'canvas/setTool', payload: key });
      return;

    case 'rotate-left':
      dispatch({ type: 'viewport/rotate', payload: -90 });
      return;
    case 'rotate-right':
      dispatch({ type: 'viewport/rotate', payload: 90 });
      return;
    case 'rotate-180':
      dispatch({ type: 'viewport/rotate', payload: 180 });
      return;

    case 'fit':
      dispatch({ type: 'viewport/fit' });
      return;
    case 'in':
      dispatch({ type: 'viewport/zoomIn' });
      return;
    case 'out':
      dispatch({ type: 'viewport/zoomOut' });
      return;

    case 'undo':
      dispatch({ type: 'canvas/undo' });
      return;
    case 'redo':
      dispatch({ type: 'canvas/redo' });
      return;

    default:
      return;
  }
}
