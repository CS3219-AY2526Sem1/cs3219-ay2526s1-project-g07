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
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Welcome to Home!</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium mb-2">Raw Session Data</h3>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}