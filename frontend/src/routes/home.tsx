import { createFileRoute, redirect } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/home")({
  loader: async () => {
    const session = await authClient.getSession();
    
    if (!session.data) {
      throw redirect({
        to: "/",
      });
    }
    console.log(session)

    
    return session;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useLoaderData();

  return (
    <div>
      <Navbar />
      {/* <div>Hello "/home"! Welcome {session.user.email}</div> */}
    </div>
  );
}