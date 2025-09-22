import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";

export const Route = createFileRoute("/collab/$sessionId")({
  component: RouteComponent,
});

// collaborative coding session
function RouteComponent() {
  const { sessionId } = Route.useParams();
  return (
    <div>
      <Navbar />
      <div>Hello "/collab/{sessionId}!"</div>
    </div>
  );
}
