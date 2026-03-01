import { useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import type { AppDispatch, RootState } from '@app/store/store.ts';
import { commandRouter } from '@shared/lib/command-router.ts';

export function useHeaderAction(): { onCommand: (key: string) => void } {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();

  const onCommand = useCallback(
    (key: string) => {
      commandRouter({ dispatch, getState: store.getState }, key);
    },
    [dispatch, store]
  );

  return { onCommand };
}
