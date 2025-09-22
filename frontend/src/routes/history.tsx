import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/history")({
  component: RouteComponent,
});

// attempt history
function RouteComponent() {
  return <div>Hello "/history"!</div>;
}
