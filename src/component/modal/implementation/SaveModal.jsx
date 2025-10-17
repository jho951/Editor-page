import { useDispatch, useSelector } from 'react-redux';
import { useState, useMemo } from 'react';
import { closeSaveModal } from '../../../lib/redux/slice/docSlice';
import { saveDrawingByName } from '../../../lib/redux/util/async';

function SaveModal() {
    const dispatch = useDispatch();
    const open = useSelector((s) => s.doc?.ui?.saveOpen);
    const items = useSelector((s) => s.doc?.items || []);
    const loading = useSelector((s) => s.doc?.loading);
    const [title, setTitle] = useState('');

    const exists = useMemo(
        () => items.some((d) => (d.title || '').trim() === title.trim()),
        [items, title]
    );

    if (!open) return null;

    const onSave = async () => {
        if (!title.trim()) {
            alert('제목을 입력하세요.');
            return;
        }
        if (
            exists &&
            !window.confirm('동일한 제목이 있습니다. 계속 저장할까요?')
        ) {
            return;
        }

        try {
            await dispatch(saveDrawingByName(title)).unwrap();
            dispatch(closeSaveModal());
            alert('저장되었습니다.');
        } catch (e) {
            alert('저장에 실패했습니다.\n' + (e?.message || String(e)));
        }
    };

    return (
        <div className="modal-backdrop">
            <div
                className="modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="save-title"
            >
                <h3 id="save-title">저장</h3>

                <input
                    placeholder="제목 입력"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: '100%', marginBottom: 8 }}
                />

                <div
                    style={{
                        fontSize: 12,
                        color: exists ? '#d00' : '#666',
                        marginBottom: 8,
                    }}
                >
                    {exists
                        ? '같은 제목이 이미 있습니다.'
                        : '새 문서로 저장됩니다.'}
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        justifyContent: 'flex-end',
                    }}
                >
                    <button
                        onClick={() => dispatch(closeSaveModal())}
                        disabled={loading}
                    >
                        취소
                    </button>
                    <button onClick={onSave} disabled={loading}>
                        {loading ? '저장 중…' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export { SaveModal };
