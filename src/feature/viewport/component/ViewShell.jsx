/**
 * @file ViewShell.jsx
 * @description 좌/하단 바 등 뷰 구성 UI를 조립하는 쉘
 */
import { useDispatch } from 'react-redux';
import Lnb from '@/feature/viewport/ui/left/Lnb'; // 기존 Lnb.jsx 이동 경로
import ZoomBar from '@/feature/viewport/ui/bottom/ZoomBar'; // 기존 Fnb.jsx → ZoomBar.jsx
import { viewportActions } from '@/feature/viewport/state/viewport.slice';

export default function ViewShell() {
    const dispatch = useDispatch();

    const handleCommand = (cmd) => {
        if (typeof cmd === 'string') {
            switch (cmd) {
                case 'in':
                    return dispatch(viewportActions.zoomIn());
                case 'out':
                    return dispatch(viewportActions.zoomOut());
                case 'fit':
                    return dispatch(
                        viewportActions.fitToScreen({
                            // TODO: 실제 콘텐츠/뷰포트 크기로 치환
                            contentW: 2000,
                            contentH: 1200,
                            viewportW: window.innerWidth,
                            viewportH: window.innerHeight,
                            padding: 24,
                        })
                    );
                case 'rotate-left':
                    return dispatch(viewportActions.rotateLeft());
                case 'rotate-right':
                    return dispatch(viewportActions.rotateRight());
                default:
                    return;
            }
        } else if (cmd?.type === 'zoom-to') {
            return dispatch(viewportActions.zoomTo({ scale: cmd.value }));
        }
    };

    return (
        <div
            className="view-shell"
            style={{ position: 'relative', width: '100%', height: '100%' }}
        >
            {/* 좌측 내비게이션/툴 패널 */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0 }}>
                <Lnb />
            </div>

            {/* 하단 줌 바 (도킹) */}
            <ZoomBar
                onCommand={handleCommand}
                docked
                fab={{ visible: true, title: '바 열기', action: 'open' }}
            />
        </div>
    );
}
