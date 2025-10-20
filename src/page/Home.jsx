import CanvasStageRobustRedux from '../component/canvas/Canvs';
import { Header } from '../component/header/implementation/Header';

import ToolHeader from '../component/header/implementation/ToolHeader';

function Home() {
    return (
        <div className="page fill-viewport">
            <ToolHeader />
            <main>
                <CanvasStageRobustRedux />
            </main>
        </div>
    );
}

export default Home;
