import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { loadDrawing } from '../redux/slice/docSlice';

import Toolbar from '../component/toolbar/Toolbar';

export default function Edit() {
    const { id } = useParams();
    const nav = useNavigate();
    const dispatch = useDispatch();

    const { currentId, loading, error, title, updatedAt } = useSelector(
        (s) => s.doc || {}
    );

    // URL로 직접 접근/새로고침 시에도 로딩 보장
    useEffect(() => {
        if (id && id !== currentId) {
            dispatch(loadDrawing(id));
        }
    }, [id, currentId, dispatch]);

    // 에러 상태
    if (error) {
        return (
            <div style={centerCol}>
                <div style={{ color: '#b91c1c', marginBottom: 8 }}>
                    문서를 불러오지 못했습니다.
                </div>
                <code style={codeBox}>{String(error)}</code>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <button
                        style={btn}
                        onClick={() => dispatch(loadDrawing(id))}
                    >
                        다시 시도
                    </button>
                    <button style={btnGhost} onClick={() => nav(-1)}>
                        뒤로
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateRows: 'auto 1fr',
                height: '100vh',
            }}
        >
            {/* 상단 헤더 */}
            <header style={header}>
                <button style={btnGhost} onClick={() => nav('/')}>
                    ←
                </button>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{title || 'Untitled'}</div>
                    {updatedAt && (
                        <div style={{ fontSize: 12, opacity: 0.75 }}>
                            최근 수정: {new Date(updatedAt).toLocaleString()}
                        </div>
                    )}
                </div>
                {/* 필요 시: 저장/삭제 버튼 여기 배치 */}
            </header>

            {/* 에디터 영역: 툴바 + 캔버스 */}
            <main
                style={{
                    display: 'grid',
                    gridTemplateRows: 'auto 1fr',
                    minHeight: 0,
                }}
            >
                <Toolbar />
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    {/* 실제 캔버스 렌더러를 여기에 넣으세요 */}
                    <div style={canvasPlaceholder}>
                        {/* <Canvas /> */}
                        캔버스 컴포넌트를 여기 넣으세요.
                    </div>
                </div>
            </main>
        </div>
    );
}

/* --------- inline styles --------- */
const center = {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
const centerCol = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
};
const header = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 12px',
    borderBottom: '1px solid #e5e7eb',
    background: '#fff',
};
const btn = {
    padding: '8px 12px',
    borderRadius: 8,
    background: '#111827',
    color: '#fff',
    border: '1px solid #111827',
    cursor: 'pointer',
};
const btnGhost = { ...btn, background: '#fff', color: '#111827' };
const codeBox = {
    background: '#f8fafc',
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid #e5e7eb',
};
const canvasPlaceholder = {
    height: '100%',
    border: '1px dashed #cbd5e1',
    borderRadius: 8,
    margin: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
};
