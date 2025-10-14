import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// ⚠️ 아래 두 thunk가 docSlice에 있어야 합니다 (앞서 만든 버전 기준)
import { fetchDrawings, loadDrawing } from '../../redux/slice/docSlice';

// (선택) baseURL 확인용
import { http } from '../../lib/http';

// (선택) 서비스 레이어를 직접 호출해보고 싶으면 주석 해제
// import { drawings } from '../../services/drawings';

export default function ApiProbe() {
    const dispatch = useDispatch();
    const {
        items = [],
        currentId,
        title,
        version,
        updatedAt,
        loading,
        error,
    } = useSelector((s) => s.doc || {});

    const [raw, setRaw] = useState(null);
    const [err, setErr] = useState(null);
    const [idInput, setIdInput] = useState('');

    const onFetchList = async () => {
        setErr(null);
        setRaw(null);
        try {
            const payload = await dispatch(fetchDrawings()).unwrap();
            setRaw({ type: 'fetchDrawings', payload });
        } catch (e) {
            setErr(String(e));
        }
    };

    const onLoadById = async (id) => {
        if (!id) return;
        setErr(null);
        setRaw(null);
        try {
            const payload = await dispatch(loadDrawing(id)).unwrap();
            setRaw({ type: 'loadDrawing', payload });
        } catch (e) {
            setErr(String(e));
        }
    };

    // (선택) 서비스 레이어를 직접 호출하여 axios 통신만 테스트하고 싶다면
    // const onDirectCall = async () => {
    //   setErr(null);
    //   setRaw(null);
    //   try {
    //     const res = await drawings.list();
    //     setRaw({ type: 'direct:list', res });
    //   } catch (e) {
    //     setErr(String(e));
    //   }
    // };

    return (
        <div style={box}>
            <div style={row}>
                <strong>API BaseURL:</strong>&nbsp;
                <code>{http?.defaults?.baseURL || '(unknown)'}</code>
            </div>

            <div style={row}>
                <button style={btn} onClick={onFetchList} disabled={loading}>
                    목록 요청 (GET /drawings)
                </button>
                <span style={meta}>
                    {loading ? '요청 중…' : error ? `에러: ${error}` : '대기'}
                </span>
            </div>

            <div style={row}>
                <input
                    style={input}
                    value={idInput}
                    onChange={(e) => setIdInput(e.target.value)}
                    placeholder="문서 ID 입력"
                />
                <button
                    style={btn}
                    onClick={() => onLoadById(idInput)}
                    disabled={loading || !idInput}
                >
                    단건 요청 (GET /drawings/{'{id}'})
                </button>
                {items.length > 0 && (
                    <button
                        style={btnGhost}
                        onClick={() => onLoadById(items[0].id)}
                        disabled={loading}
                    >
                        첫 번째 항목 불러오기
                    </button>
                )}
            </div>

            {/* (선택) axios 직접 테스트 버튼 */}
            {/* <div style={row}>
        <button style={btnOutline} onClick={onDirectCall} disabled={loading}>
          직접 호출 (axios) /drawings
        </button>
      </div> */}

            <hr />

            <div style={row}>
                <div style={col}>
                    <strong>Doc 상태 (요약)</strong>
                    <pre style={pre}>
                        {JSON.stringify(
                            {
                                currentId,
                                title,
                                version,
                                updatedAt,
                                itemsCount: items.length,
                                sampleItem: items[0] || null,
                            },
                            null,
                            2
                        )}
                    </pre>
                </div>

                <div style={col}>
                    <strong>마지막 응답(raw)</strong>
                    {err && <div style={errorBox}>{err}</div>}
                    <pre style={pre}>
                        {raw
                            ? JSON.stringify(raw, null, 2)
                            : '// 버튼을 눌러 요청해보세요'}
                    </pre>
                </div>
            </div>
        </div>
    );
}

/* ---------- inline styles (간단) ---------- */
const box = {
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    background: '#fafafa',
};
const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
};
const col = { flex: 1, minWidth: 280 };
const pre = {
    margin: 0,
    padding: 10,
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 6,
    maxHeight: 260,
    overflow: 'auto',
};
const input = {
    padding: '6px 8px',
    borderRadius: 6,
    border: '1px solid #cbd5e1',
    minWidth: 240,
};
const btn = {
    padding: '6px 10px',
    borderRadius: 6,
    background: '#111827',
    color: '#fff',
    border: '1px solid #111827',
    cursor: 'pointer',
};
const btnGhost = { ...btn, background: '#fff', color: '#111827' };
const btnOutline = { ...btn, background: '#fff', color: '#111827' };
const meta = { fontSize: 12, opacity: 0.8 };
const errorBox = { color: '#b91c1c', margin: '6px 0' };
