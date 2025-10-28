/**
 * @file ViewShell.jsx
 * @description 좌/하단 바 등 뷰 구성 UI를 조립하는 쉘
 */
import { useDispatch } from 'react-redux';

import { viewportActions } from '@/feature/viewport/state/viewport.slice';

import Fnb from './Fnb';

export default function ViewShell() {
    return (
        <footer className="view-shell">
            {/* 하단 줌 바 (도킹) */}
            <Fnb />
        </footer>
    );
}
