import ReactDOM from "react-dom/client";

import Router from '@app/router/router.tsx';
import AppProviders from "@app/provider/AppProviders.tsx";

import '@assets/styles/theme.css';
import '@assets/styles/reset.css';
import '@assets/styles/font.css';
import '@assets/styles/class.css';

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
        <AppProviders>
            <Router />
       </AppProviders>
);