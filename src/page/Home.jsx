import { Canvas } from '../component/canvas/implementation/Canvas';

import { Header } from '../component/header/implementation/Header';

function Home() {
    return (
        <div className="page fill-viewport">
            <Header />
            <main>
                <Canvas />
            </main>
        </div>
    );
}

export default Home;
