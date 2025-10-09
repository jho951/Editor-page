import { createPortal } from 'react-dom';

import { useDispatch } from 'react-redux';

import { getId } from '../../util/get-id';
import {
    add as addShape,
    update as updateShape,
} from '../../redux/slice/shapeSlice';
import TextArea from './TextArea';

function TextEditor({
    hostRef,
    show,
    rect,
    editingTarget,
    stylePreset,
    onClose,
    onCommit,
}) {
    const dispatch = useDispatch();
    const hostEl = hostRef.current?.parentElement || null;
    if (!show || !rect || !hostEl) return null;

    return createPortal(
        <TextArea
            rect={rect}
            initialText={editingTarget?.text || ''}
            stylePreset={stylePreset}
            onClose={onClose}
            onCommit={(payload) => {
                const typed = (payload.text ?? '').trim();
                if (editingTarget?.id) {
                    const nextText =
                        typed.length === 0 ? editingTarget.text : payload.text;
                    dispatch(
                        updateShape({
                            id: editingTarget.id,
                            type: 'text',
                            x: payload.rect.x,
                            y: payload.rect.y,
                            w: payload.rect.w,
                            h: payload.rect.h,
                            text: nextText,
                            style: { ...payload.style },
                        })
                    );
                } else {
                    if (typed.length === 0) return onClose();
                    dispatch(
                        addShape({
                            id: getId(),
                            type: 'text',
                            x: payload.rect.x,
                            y: payload.rect.y,
                            w: payload.rect.w,
                            h: payload.rect.h,
                            text: payload.text,
                            style: { ...payload.style },
                        })
                    );
                }
                onCommit?.(payload);
            }}
        />,
        hostEl
    );
}

export default TextEditor;
