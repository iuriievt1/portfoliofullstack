import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentOrg } from "../api/orgs.js";
import LoginPage from "../ui/LoginPage.jsx";
import Shell from "../ui/Shell.jsx";
import TimelinePage from "../ui/TimelinePage.jsx";
import TimeTravelPage from "../ui/TimeTravelPage.jsx";
import BranchesPage from "../ui/BranchesPage.jsx";
import VerifyPage from "../ui/VerifyPage.jsx";
import { getAccessToken } from "../api/http.js";

export default function App() {
  const hasToken = !!getAccessToken();

  const orgQ = useQuery({
    queryKey: ["currentOrg"],
    queryFn: getCurrentOrg,
    enabled: hasToken
  });

  if (!hasToken) return <LoginPage />;

  if (orgQ.isLoading) return <div className="p-6 text-sm text-zinc-400">Loading…</div>;
  if (orgQ.isError) return <LoginPage />;

  const ctx = orgQ.data;

  return (
    <Shell ctx={ctx}>
      <Routes>
        <Route path="/" element={<Navigate to="/timeline" replace />} />
        <Route path="/timeline" element={<TimelinePage ctx={ctx} />} />
        <Route path="/timetravel" element={<TimeTravelPage ctx={ctx} />} />
        <Route path="/branches" element={<BranchesPage ctx={ctx} />} />
        <Route path="/verify" element={<VerifyPage ctx={ctx} />} />
        <Route path="*" element={<Navigate to="/timeline" replace />} />
      </Routes>
    </Shell>
  );
}
