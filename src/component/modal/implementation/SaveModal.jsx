import { useDispatch, useSelector } from 'react-redux';
import { useState, useMemo, useEffect } from 'react';
import { closeSaveModal } from '../../../lib/redux/slice/docSlice';
import { saveDrawingByName } from '../../../lib/redux/util/async';
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

    // ESC 닫기
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === 'Escape') dispatch(closeSaveModal());
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, dispatch]);

    if (!open) return null;

    const onSave = async () => {
        if (!title.trim()) {
            alert('제목을 입력하세요.');
            return;
        }
        <div
            className={styles.helpText}
            style={{ color: exists ? 'crimson' : '#6b7280' }}
        >
            {exists
                ? '같은 제목이 이미 있습니다.'
                : '새 문서 제목을 입력하세요.'}
        </div>;

        try {
            await dispatch(saveDrawingByName(title)).unwrap();
            dispatch(closeSaveModal());
            alert('저장되었습니다.');
        } catch (e) {
            alert('저장에 실패했습니다.\n' + (e?.message || String(e)));
        }
    };

    return (
        <div
            className={styles.backdrop}
            role="none"
            onClick={() => dispatch(closeSaveModal())}
        >
            <div
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.modalHeader}>
                    <h3 id="save-title" className={styles.modalTitle}>
                        새 문서로 저장됩니다.
                    </h3>
                    <button
                        className={styles.closeBtn}
                        onClick={() => dispatch(closeSaveModal())}
                        aria-label="닫기"
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <input
                        className={styles.input}
                        placeholder="제목 입력"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <div className={styles.helpText}>
                        {exists && '같은 제목이 이미 있습니다.'}
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button
                        className={styles.btn}
                        onClick={() => dispatch(closeSaveModal())}
                        disabled={loading}
                        type="button"
                    >
                        취소
                    </button>
                    +{' '}
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={onSave}
                        disabled={loading || !title.trim() || exists}
                        type="button"
                    >
                        {loading ? '저장 중…' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { SaveModal };
