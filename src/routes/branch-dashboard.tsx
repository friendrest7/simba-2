import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getStoredLang, translate } from "@/lib/i18n";

export const Route = createFileRoute("/branch-dashboard")({
  component: BranchDashboardPage,
  head: () => ({ meta: [{ title: translate(getStoredLang(), "meta.branchDashboardTitle") }] }),
});

export default function BranchDashboardPage() {
  return <Navigate to="/dashboard" />;
}
