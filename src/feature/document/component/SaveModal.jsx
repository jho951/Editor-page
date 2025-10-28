import { useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import { DocumentModalShell } from './DocumentModalShell';

import { saveDrawingByName, fetchDrawings } from '../api/async';
import { setModal } from '../state/document.slice'; // 없다면 closeSaveModal 사용
import styles from './OpenModal.module.css';
import { useDocumentModal } from '../hook/useDocumentModal';

export function SaveModal() {
    const dispatch = useDispatch();
    const { open, items, loading, error, empty } = useDocumentModal('save', {
        fetchList: fetchDrawings,
    });
    const [title, setTitle] = useState('');

    const exists = useMemo(() => {
        const norm = (s) => (s || '').trim().toLowerCase();
        const t = norm(title);
        if (!t) return false;
        return Array.isArray(items) && items.some((d) => norm(d.title) === t);
    }, [items, title]);

    const onClose = useCallback(() => {
        if (setModal) dispatch(setModal({ key: 'save', open: false }));
    }, [dispatch]);

    const onSave = useCallback(async () => {
        const t = title.trim();
        if (!t) return alert('제목을 입력하세요.');
        if (exists) return alert('같은 제목이 이미 있습니다.');
        try {
            await dispatch(saveDrawingByName(t)).unwrap();
            onClose();
            alert('저장되었습니다.');
        } catch (e) {
            alert('저장에 실패했습니다.\n' + (e?.message || String(e)));
        }
    }, [title, exists, dispatch, onClose]);

    return (
        <DocumentModalShell
            open={!!open}
            title="저장"
            onClose={onClose}
            loading={loading}
            error={error}
            empty={false /* 저장 모달은 리스트 비어있음 표시 불필요 */}
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

            {/* footer는 쉘의 footer prop으로도 넘길 수 있지만, 여기선 간단히 내부 버튼 배치 */}
            <div className={styles.footer}>
                <button
                    className={styles.btn}
                    onClick={onClose}
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
        </DocumentModalShell>
    );
}
