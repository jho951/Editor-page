import React from 'react';
import { Header } from '@/feature/header/component/Header';
import { CanvasStage } from '@/feature/canvas/component/CanvasStage';

function Home() {
    return (
        <React.Fragment>
            <Header />
            <CanvasStage />
        </React.Fragment>
    );
}

export default Home;
