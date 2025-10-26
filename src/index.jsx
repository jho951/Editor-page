import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';

import { store } from './app/store';
import { router } from './app/routes';

import Spinner from './shared/ui/component/spinner/Spinner';

import './style/app/reset.css';
import './style/app/theme.css';
import './style/app/class.css';

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <Suspense fallback={<Spinner />}>
            <RouterProvider router={router} />
        </Suspense>
    </Provider>
);
