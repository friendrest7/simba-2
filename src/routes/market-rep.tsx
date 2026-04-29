import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/market-rep")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
});
