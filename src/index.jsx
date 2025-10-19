/**
 * @file index.jsx
 * @author YJH
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import { store } from './lib/redux/store/index';

import Home from './page/Home';
import Edit from './page/Edit';

import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/edit/:id" element={<Edit />} />
                <Route path="/edit/new" element={<Edit />} />
            </Routes>
        </BrowserRouter>
    </Provider>
);
