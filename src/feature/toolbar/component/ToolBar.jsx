import { useMemo } from 'react';

import { useHeaderAction } from '../../header/hook/useHeaderAction';
import { commandRouter } from '../../header/util/command-router';

import { ModalManager } from '@/feature/document/component/ModalManager';

import { useShortcuts } from '../../header/hook/useShortcuts';
import { Lnb } from './Lnb';

import Fnb from './Fnb';

import styles from './ToolBar.module.css';

function ToolBar() {
    const handlers = useHeaderAction();

    const run = useMemo(
        () =>
            commandRouter({
                ...handlers,
                dispatch: handlers.dispatch,
            }),
        [handlers]
    );

    useShortcuts({ run });

    return (
        <header className={styles.wrap}>
            <Lnb onCommand={run} />
            <ModalManager />
            <Fnb onCommand={run} />
        </header>
    );
}

export { ToolBar };
