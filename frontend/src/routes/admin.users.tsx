import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";

export const Route = createFileRoute("/admin/users")({
  component: RouteComponent,
});

// crud users for admin
function RouteComponent() {
  return (
    <div>
      <Navbar />
      <div>Hello "/admin/users"!</div>
    </div>
  );
}
