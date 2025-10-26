import { Outlet } from 'react-router-dom';

function AppLayout() {
    return (
        <main>
            <Outlet />
        </main>
    );
}
export default AppLayout;
