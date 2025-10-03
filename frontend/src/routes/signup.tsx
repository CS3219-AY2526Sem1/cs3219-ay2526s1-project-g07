import { createFileRoute } from "@tanstack/react-router";
import SignUpCard from "@/components/auth-ui/SignUpCard";
import { redirectIfAuthenticated } from "../hooks/user-hooks";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  redirectIfAuthenticated();
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUpCard />
    </div>
  );
}
