import { createFileRoute } from "@tanstack/react-router";
import SignUpCard from "@/components/auth-ui/SignUpCard";

export const Route = createFileRoute("/signup")({
  component: SignUp,
});

function SignUp() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUpCard />
    </div>
  );
}
