import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setTool,
    setPolygonSides,
    setStarPoints,
    setStarInnerRatio,
    selectTool,
    selectPoly,
    selectStarPts,
    selectStarRatio,
} from '../../../lib/redux/slice/uiSlice';

export default function ToolHeader() {
    const dispatch = useDispatch();
    const tool = useSelector(selectTool);
    const poly = useSelector(selectPoly);
    const starPts = useSelector(selectStarPts);
    const starRatio = useSelector(selectStarRatio);

    const Btn = ({ name, label }) => (
        <button
            onClick={() => dispatch(setTool(name))}
            style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border-color)',
                background: tool === name ? 'var(--primary-color)' : '#fff',
                color: tool === name ? '#fff' : 'var(--text-color)',
                cursor: 'pointer',
            }}
        >
            {label}
        </button>
    );

    return (
        <div
            style={{
                display: 'flex',
                gap: 8,
                padding: 10,
                background: '#fff',
                borderBottom: '1px solid var(--border-color)',
            }}
        >
            <Btn name="select" label="선택" />
            <Btn name="rect" label="사각형" />
            <Btn name="ellipse" label="원/타원" />
            <Btn name="line" label="직선" />
            <Btn name="polygon" label="다각형" />
            <Btn name="star" label="별" />
            <Btn name="freedraw" label="프리드로우" />
            <Btn name="text" label="텍스트" />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginLeft: 16,
                }}
            >
                <label
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    변(다각형):
                    <input
                        type="number"
                        min={3}
                        value={poly}
                        style={{ width: 64 }}
                        onChange={(e) =>
                            dispatch(setPolygonSides(e.target.value))
                        }
                    />
                </label>
            </div>
        </div>
    );
}
