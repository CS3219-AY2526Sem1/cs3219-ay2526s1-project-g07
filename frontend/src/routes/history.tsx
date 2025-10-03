import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";

export const Route = createFileRoute("/history")({
  component: RouteComponent,
});

// attempt history
function RouteComponent() {
  return (
    <div>
      <Navbar />
      <div>Hello "/history"!</div>
    </div>
  );
}
