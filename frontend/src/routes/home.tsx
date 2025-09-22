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
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Session Information</h2>
          
          {session.data?.user && (
            <div className="space-y-3">
              <div>
                <span className="font-medium">Email:</span> {session.data.user.email}
              </div>
              <div>
                <span className="font-medium">User ID:</span> {session.data.user.id}
              </div>
              <div>
                <span className="font-medium">Name:</span> {session.data.user.name || 'Not set'}
              </div>
              <div>
                <span className="font-medium">Email Verified:</span> {session.data.user.emailVerified ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(session.data.user.createdAt).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {new Date(session.data.user.updatedAt).toLocaleString()}
              </div>
            </div>
          )}

          {session.data?.session && (
            <div className="mt-6 pt-4 border-t border-gray-300">
              <h3 className="text-lg font-medium mb-3">Session Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Session ID:</span> {session.data.session.id}
                </div>
                <div>
                  <span className="font-medium">Expires At:</span> {new Date(session.data.session.expiresAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">IP Address:</span> {session.data.session.ipAddress || 'Not available'}
                </div>
                <div>
                  <span className="font-medium">User Agent:</span> {session.data.session.userAgent || 'Not available'}
                </div>
              </div>
            </div>
          )}
        </div>

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