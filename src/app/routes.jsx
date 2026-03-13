import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { HomePage } from "../pages/HomePage";
import { LegalPage } from "../pages/LegalPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "privacy",
        element: (
          <LegalPage
            bodyKey="common:legal.privacy.body"
            titleKey="common:legal.privacy.title"
          />
        )
      },
      {
        path: "terms",
        element: (
          <LegalPage
            bodyKey="common:legal.terms.body"
            titleKey="common:legal.terms.title"
          />
        )
      },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
