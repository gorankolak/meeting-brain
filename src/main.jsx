import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./i18n";
import { router } from "./app/routes";
import { AppErrorBoundary } from "./components/app/AppErrorBoundary";
import "./styles/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <RouterProvider future={{ v7_startTransition: true }} router={router} />
    </AppErrorBoundary>
  </React.StrictMode>
);
