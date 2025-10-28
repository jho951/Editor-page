import { useSelector } from 'react-redux';
import { OpenModal } from '@/feature/document/component/OpenModal';
import { SaveModal } from '@/feature/document/component/SaveModal';
import RestoreModal from '@/feature/document/component/RestoreModal';

export function ModalManager() {
    const modal = useSelector((s) => s.document?.modal || s.doc?.ui || {});
    return (
        <>
            {modal.loadOpen && <OpenModal />}
            {modal.saveOpen && <SaveModal />}
            {modal.restoreOpen && <RestoreModal />}
        </>
    );
}
