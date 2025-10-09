/**
 * @file DashBoard.jsx
 * @author YJH
 */
import { useRef } from 'react';
import Vector from './vector/Vector';
import Overlay from './overlay/Overlay';

import './dashboard.css';

/**
 * @function DashBoard
 * @description
 * - 벡타, 오버레이 2중 캔버스
 * @returns {canvas}
 */
function DashBoard() {
    const vectorRef = useRef(null);
    const vectorCtxRef = useRef(null);
    const overlayRef = useRef(null);

    return (
        <section className="dashboard">
            <Vector
                canvasRef={vectorRef}
                onReady={(ctx) => {
                    vectorCtxRef.current = ctx;
                }}
            />
            <Overlay canvasRef={overlayRef} vectorCtxRef={vectorCtxRef} />
        </section>
    );
}
export default DashBoard;
