import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

// edit profile
function RouteComponent() {
  return <div>Hello "/profile"!</div>;
}
