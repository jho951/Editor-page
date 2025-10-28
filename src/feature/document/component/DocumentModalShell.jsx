import { Modal } from '@/shared/component/modal/Modal';
import { Spinner } from '@/shared/component/spinner/Spinner';

function DocumentModalShell({
    open,
    title,
    onClose,
    children,
    footer,
    loading,
    error,
    empty,
    emptyText = '데이터가 없습니다.',
}) {
    return (
        <Modal open={open} title={title} onClose={onClose} footer={footer}>
            {loading && <Spinner />}
            {!loading && error && (
                <div style={{ color: 'crimson' }}>{String(error)}</div>
            )}
            {!loading && !error && empty && <div>{emptyText}</div>}
            {!loading && !error && !empty && children}
        </Modal>
    );
}

export { DocumentModalShell };
