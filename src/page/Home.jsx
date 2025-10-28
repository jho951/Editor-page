import React from 'react';
import { ToolBar } from '@/feature/toolbar/component/ToolBar';
import { CanvasStage } from '@/feature/canvas/component/CanvasStage';

function Home() {
    return (
        <React.Fragment>
            <ToolBar />
            <CanvasStage />
        </React.Fragment>
    );
}

export default Home;
