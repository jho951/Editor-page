import { useState } from 'react';
import { IconOpen, IconSave } from '../icon/Icon';
import styles from './FileOperation.module.css';
import LoadModal from '../modal/Modal';

const FileOperations = () => {
    const [openLoad, setOpenLoad] = useState(false);
    return (
        <>
            <div className={styles.fileOperationWrap}>
                <button
                    className={styles.iconBtn}
                    onClick={() => setOpenLoad(true)}
                    title="불러오기"
                >
                    <IconOpen />
                </button>

                <button
                    className={styles.iconBtn}
                    onClick={() => setOpenLoad(true)}
                    title="저장하기"
                >
                    <IconSave />
                </button>
            </div>
            <LoadModal open={openLoad} onClose={() => setOpenLoad(false)} />
        </>
    );
};

export default FileOperations;
