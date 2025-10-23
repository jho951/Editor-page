import { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeSaveModal } from '../../../lib/redux/slice/docSlice';
import { saveDrawingByName } from '../../../lib/redux/util/async';

import Modal from './Modal';
import styles from '../style/Modal.module.css';

function SaveModal() {
    const dispatch = useDispatch();
    const open = useSelector((s) => s.doc?.ui?.saveOpen);
    const items = useSelector((s) => s.doc?.items || []);
    const loading = useSelector((s) => s.doc?.loading);

    const [title, setTitle] = useState('');

    const exists = useMemo(() => {
        const norm = (s) => (s || '').trim().toLowerCase();
        const t = norm(title);
        if (!t) return false;
        return Array.isArray(items) && items.some((d) => norm(d.title) === t);
    }, [items, title]);

    const onSave = async () => {
        const t = title.trim();
        if (!t) return alert('제목을 입력하세요.');
        if (exists) return alert('같은 제목이 이미 있습니다.');
        try {
            await dispatch(saveDrawingByName(t)).unwrap();
            dispatch(closeSaveModal());
            alert('저장되었습니다.');
        } catch (e) {
            alert('저장에 실패했습니다.\n' + (e?.message || String(e)));
        }
    };

    return (
        <Modal
            open={!!open}
            title="저장"
            onClose={() => dispatch(closeSaveModal())}
            footer={
                <div className={styles.footer}>
                    <button
                        className={styles.btn}
                        onClick={() => dispatch(closeSaveModal())}
                        disabled={loading}
                        type="button"
                    >
                        취소
                    </button>
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={onSave}
                        disabled={loading || !title.trim() || exists}
                        type="button"
                    >
                        {loading ? '저장 중…' : '저장'}
                    </button>
                </div>
            }
        >
            <input
                className={styles.input}
                placeholder="제목 입력"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !exists && title.trim()) onSave();
                }}
            />
            <div
                className={styles.helpText}
                style={{ color: exists && 'crimson' }}
            >
                {exists && '같은 제목이 이미 있습니다.'}
            </div>
        </Modal>
    );
}

export { SaveModal };
