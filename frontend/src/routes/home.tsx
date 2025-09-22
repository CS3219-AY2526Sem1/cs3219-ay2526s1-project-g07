import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

// homepage, selector for matching
function RouteComponent() {
  return <div>Hello "/home"!</div>;
}
