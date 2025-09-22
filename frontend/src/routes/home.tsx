import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

// homepage, selector for matching
function RouteComponent() {
  return (
    <div>
      <Navbar />
      <div>Hello "/home"!</div>
    </div>
  );
}
