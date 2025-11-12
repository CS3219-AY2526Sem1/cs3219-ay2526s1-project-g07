import { createFileRoute } from "@tanstack/react-router";
import { useIsAdmin } from "../hooks/user-hooks";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
});

function RouteComponent() {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) {
    <div>Loading</div>;
  }

  console.log(isAdmin);
  return <div>Hello "/test"!</div>;
}
