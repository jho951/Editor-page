import { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';

import { routes } from './routes';
import { store } from './store/index';

import Spinner from '@/shared/component/spinner/Spinner';

import '@/shared/style/reset.css';
import '@/shared/style/theme.css';
import '@/shared/style/class.css';

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <Suspense fallback={<Spinner />}>
            <RouterProvider router={routes} />
        </Suspense>
    </Provider>
);
