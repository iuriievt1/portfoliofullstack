import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./ui/AppLayout.jsx";
import { LoginPage } from "./ui/pages/LoginPage.jsx";
import { RegisterPage } from "./ui/pages/RegisterPage.jsx";
import { DashboardPage } from "./ui/pages/DashboardPage.jsx";
import { LeadsPage } from "./ui/pages/LeadsPage.jsx";
import { SettingsPage } from "./ui/pages/SettingsPage.jsx";
import { RequireAuth } from "./ui/RequireAuth.jsx";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "leads", element: <LeadsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  },
  { path: "*", element: <Navigate to="/" replace /> }
]);
