import { Canvas } from '../component/canvas/implementation/Canvas';

import ToolHeader from '../component/header/implementation/ToolHeader';

function Home() {
    return (
        <div className="page fill-viewport">
            <ToolHeader />
            <main>
                <Canvas />
            </main>
        </div>
    );
}

export default Home;
