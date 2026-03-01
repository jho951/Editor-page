import React from "react";
import { Provider as ReduxProvider } from "react-redux";

import { store } from "@app/store/store";
import { ThemeProvider } from "@app/provider/ThemeProvider";
import { ShortcutProvider } from "@app/provider/ShortcutProvider";
import type { ProvidersProps } from "@app/provider/provider.types";
import { ContextMenuHost } from "@app/provider/ContextMenuHost.tsx";

function AppProviders({ children }: ProvidersProps): React.ReactElement {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <ShortcutProvider>
          {children}
          <ContextMenuHost />
        </ShortcutProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

export { AppProviders };

export default AppProviders;
