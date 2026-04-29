import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getStoredLang, translate } from "@/lib/i18n";

export const Route = createFileRoute("/admin-dashboard")({
  component: AdminDashboardPage,
  head: () => ({ meta: [{ title: translate(getStoredLang(), "meta.adminDashboardTitle") }] }),
});

function AdminDashboardPage() {
  return <Navigate to="/dashboard" />;
}
