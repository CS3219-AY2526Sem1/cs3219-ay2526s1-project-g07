import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import { redirectIfNotAuthenticated } from "../hooks/user-hooks";

export const Route = createFileRoute("/history")({
  component: RouteComponent,
});

// attempt history
function RouteComponent() {
  redirectIfNotAuthenticated();

  return (
    <div>
      <Navbar />
      <div>Hello "/history"!</div>
    </div>
  );
}
