import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/questions")({
  component: RouteComponent,
});

// crud questions for admin
function RouteComponent() {
  return <div>Hello "/admin/questions"!</div>;
}
