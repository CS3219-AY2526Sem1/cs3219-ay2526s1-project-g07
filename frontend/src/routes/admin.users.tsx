import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import { redirectIfNotAuthenticated } from "../hooks/user-hooks";

export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
});

// crud users for admin
function RouteComponent() {
  redirectIfNotAuthenticated();
  
  return (
    <div>
      <Navbar />
      <div>Hello "/admin/users"!</div>
    </div>
  );
}
