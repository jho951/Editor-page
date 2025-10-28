const DOCUMENT_NAME = 'document';

const DOCUMENT_STATE = {
    items: [], // 서버 목록
    loading: false, // 공용 로딩 플래그
    error: null, // 마지막 에러 메시지
    modal: {
        loadOpen: false,
        saveOpen: false,
        restoreOpen: false,
    },
    current: {
        id: null,
        title: '',
        version: null,
        dirty: false,
    },
    meta: {
        // 부가 메타 (옵션)
        lastLoadedAt: null,
        lastSavedAt: null,
    },
};

export { DOCUMENT_NAME, DOCUMENT_STATE };
