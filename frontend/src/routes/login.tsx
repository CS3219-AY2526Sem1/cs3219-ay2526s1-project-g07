import { createFileRoute } from "@tanstack/react-router";
import LogInCard from "@/components/auth-ui/LogInCard";
import { redirectIfAuthenticated } from "../hooks/user-hooks";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  redirectIfAuthenticated();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <LogInCard />
    </div>
  );
}
