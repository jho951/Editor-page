import EditorCanvas from '../component/dashboard/implementation/EditCanvas';
import { Header } from '../component/header/implementation/Header';

function Home() {
    return (
        <main>
            <Header />
            <div
                style={{
                    display: 'grid',
                    placeItems: 'center',
                    height: 'calc(100vh - 56px)',
                    overflow: 'auto',
                }}
            >
                <EditorCanvas key={'new'} />
            </div>
        </main>
    );
}

export default Home;
