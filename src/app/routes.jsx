import { lazy } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';

const Home = lazy(() => import('@/page/Home'));
const Edit = lazy(() => import('@/page/Edit'));
const NotFound = lazy(() => import('@/page/NotFound'));

const routes = createBrowserRouter([
    {
        element: <Outlet />,
        children: [
            { path: '/', element: <Home /> },
            {
                path: '/edit/:id',
                element: <Edit />,
            },
            { path: '*', element: <NotFound /> },
        ],
    },
]);

export { routes };

function RequireAuth({ children }) {
    const isAuthed = false;
    return isAuthed ? children : <div>로그인이 필요합니다.</div>;
}
