import { useMemo } from 'react';

import { ModalManager } from '@/feature/document/component/ModalManager';

import { Lnb } from './Lnb';

import Fnb from '../../viewport/component/Fnb';

import styles from './ToolBar.module.css';

function ToolBar() {
    return (
        <header className={styles.wrap}>
            <Lnb />
            <ModalManager />
            <Fnb />
        </header>
    );
}

export { ToolBar };
