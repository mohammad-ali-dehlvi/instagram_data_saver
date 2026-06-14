import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { client } from "./api/client.gen.ts";

client.setConfig({
  baseUrl:
    import.meta.env.VITE_BACKEND_BASE_URL ||
    `http://${window.location.hostname}:8000/`,
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
