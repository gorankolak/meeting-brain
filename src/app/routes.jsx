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
            title="Privacy"
            body="Meeting Brain processes submitted meeting content to generate structured reports. For production use, configure your LLM and email providers in Netlify environment variables and review retention policy before handling sensitive data."
          />
        )
      },
      {
        path: "terms",
        element: (
          <LegalPage
            title="Terms"
            body="Meeting Brain is provided as an MVP workspace. Generated outputs should be reviewed by a human before external distribution or project system import."
          />
        )
      },
      { path: "*", element: <NotFoundPage /> }
    ]
  }
]);
