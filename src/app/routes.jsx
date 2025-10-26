import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './AppLayout';

const Home = lazy(() => import('../page/Home'));
const Edit = lazy(() => import('../page/Edit'));
const NotFound = lazy(() => import('../page/NotFound'));

function RequireAuth({ children }) {
    const isAuthed = false;
    return isAuthed ? children : <div>로그인이 필요합니다.</div>;
}

export const router = createBrowserRouter([
    {
        element: <AppLayout />,
        children: [
            { path: '/', element: <Home /> },
            {
                path: '/edit/:id',
                element: (
                    // 로그인 필요시 감싸주기
                    // <RequireAuth><Edit /></RequireAuth>
                    <Edit />
                ),
            },
            { path: '*', element: <NotFound /> },
        ],
    },
]);
