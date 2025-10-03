import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";

export const Route = createFileRoute("/profile")({
  component: RouteComponent,
});

// edit profile
function RouteComponent() {
  return (
    <div>
      <Navbar />
      <div>Hello "/profile"!</div>
    </div>
  );
}
