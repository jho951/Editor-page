/**
 * @file DashBoard.jsx
 * @author YJH
 */
import { useRef } from 'react';
import { useSelector } from 'react-redux';
import Vector from './Vector';
import Overlay from './Overlay';

import './dashboard.css';

/**
 * @function DashBoard
 * @description
 * - 벡타, 오버레이 2중 캔버스
 * @returns {canvas}
 */

function DashBoard() {
    const {
        width = 800,
        height = 600,
        background = null,
    } = useSelector((s) => s.vectorDoc.canvas || {});

    const vectorRef = useRef(null);
    const vectorCtxRef = useRef(null);
    const overlayRef = useRef(null);

    return (
        <section
            className="dashboard"
            style={{
                width,
                height,
                ...(background ? { '--background-color': background } : {}),
            }}
        >
            <Vector
                canvasRef={vectorRef}
                onReady={(ctx) => (vectorCtxRef.current = ctx)}
            />
            <Overlay canvasRef={overlayRef} />
        </section>
    );
}

export default DashBoard;
