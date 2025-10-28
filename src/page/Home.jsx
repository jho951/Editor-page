import { Header } from '@/feature/header/component/Header';
import { CanvasStage } from '@/feature/canvas/component/CanvasStage';

function Home() {
    return (
        <div className="page fill-viewport">
            <Header />
            <main>
                <CanvasStage />
            </main>
        </div>
    );
}

export default Home;
