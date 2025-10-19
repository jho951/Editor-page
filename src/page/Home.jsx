import CanvasStageRobustRedux from '../component/canvas/Canvs';

import ToolHeader from '../component/header/implementation/ToolHeader';

function Home() {
    return (
        <div className="page fill-viewport">
            <ToolHeader />
            <main style={{ flex: 1, minHeight: 0 }}>
                <CanvasStageRobustRedux />
            </main>
        </div>
    );
}

export default Home;
