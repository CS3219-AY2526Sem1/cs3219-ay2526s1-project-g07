import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";

export const Route = createFileRoute("/admin/questions")({
  component: RouteComponent,
});

// crud questions for admin
function RouteComponent() {
  return (
    <div>
      <Navbar />
      <div>Hello "/admin/questions"!</div>
    </div>
  );
}
