import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Edit from './page/Edit';
import Home from './page/Home';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/edit/:id" element={<Edit />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
