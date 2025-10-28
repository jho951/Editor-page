import React from 'react';
import { ToolBar } from '@/feature/toolbar/component/ToolBar';
import { CanvasStage } from '@/feature/canvas/component/CanvasStage';
import ViewShell from '@/feature/viewport/component/ViewShell';

function Home() {
    return (
        <React.Fragment>
            <ToolBar />
            <CanvasStage />
            <ViewShell />
        </React.Fragment>
    );
}

export default Home;
