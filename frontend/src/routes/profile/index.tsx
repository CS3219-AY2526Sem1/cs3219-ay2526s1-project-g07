import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import Navbar from "@/src/components/Navbar";

export const Route = createFileRoute("/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && session?.user) {
      // Redirect to the user's profile page
      navigate({
        to: "/profile/$username",
        params: {
          username: session.user.name || session.user.email || "unknown",
        },
      });
    } else if (!isPending && !session) {
      // If no session, redirect to login
      navigate({ to: "/login" });
    }
  }, [session, isPending, navigate]);

  if (isPending) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div>Loading...</div>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div>Please log in to view your profile.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[50vh]">
        <div>Redirecting to your profile...</div>
      </div>
    </>
  );
}
