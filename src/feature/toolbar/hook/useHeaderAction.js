import { useCallback } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { commandRouter } from '../util/command-router';

export function useHeaderAction() {
    const dispatch = useDispatch();
    const store = useStore();

    const onCommand = useCallback(
        (key) => {
            commandRouter({ dispatch, getState: store.getState }, key);
        },
        [dispatch, store]
    );

    return { onCommand };
}
