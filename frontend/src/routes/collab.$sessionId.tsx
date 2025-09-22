import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/collab/$sessionId")({
  component: RouteComponent,
});

// collaborative coding session
function RouteComponent() {
  const { sessionId } = Route.useParams();
  return <div>Hello "/collab/{sessionId}!"</div>;
}
