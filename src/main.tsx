import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "./index.css";
import { AppRouter } from "./router/AppRouter";
import { SocketProvider } from "./context/SocketContext";
import { store } from "./store";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <AppRouter />
      </SocketProvider>
    </Provider>
  </StrictMode>,
);
