import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { ensureCanonicalOrigin } from "./config/httpClient";
import "./config/httpClient";
import App from "./App";
import Loader from "./components/misc/Loader";
import { setCredentials } from "./features/auth/authSlice";
import { store, persistor } from "./store";
import { clearLegacyAuth, getLegacyAuth } from "./store/legacyAuthMigration";
import "./index.css";

ensureCanonicalOrigin();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

async function onBeforeLift() {
  const legacy = getLegacyAuth();

  if (!legacy) {
    return;
  }

  const { auth } = store.getState();

  if (!auth.token && !auth.user) {
    store.dispatch(setCredentials(legacy));
  }

  clearLegacyAuth();
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loader />} persistor={persistor} onBeforeLift={onBeforeLift}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
