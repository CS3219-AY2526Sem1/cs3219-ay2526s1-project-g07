import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="mx-16 w-full h-180 md:h-140 p-0 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 h-full w-full">
          <div className="p-8 bg-gradient-to-b from-rose-500 via-fuchsia-800 to-indigo-700 flex flex-col justify-center rounded-t-xl md:rounded-l-xl md:rounded-t-none">
            <h1 className="text-4xl font-bold text-white">PeerPrep</h1>
            <p className="text-xl text-slate-200 mt-4 md:mt-6">
              Everything you need for your next technical interview.
            </p>
          </div>
          <div className="flex flex-col p-8 h-full">
            <CardHeader className="mb-4 md:mb-8">
              <CardTitle className="text-xl">Features</CardTitle>
            </CardHeader>
            <div className="flex-1">
              <CardContent>
                <ul className="space-y-8">
                  <li>
                    <h2 className="font-semibold text-lg">Matching</h2>
                    <p className="text-slate-500">
                      Choose your own topic and difficulty
                    </p>
                  </li>
                  <li>
                    <h2 className="font-semibold text-lg">Collaboration</h2>
                    <p className="text-slate-500">
                      Simulate a real interview environment
                    </p>
                  </li>
                  <li>
                    <h2 className="font-semibold text-lg">Real-time</h2>
                    <p className="text-slate-500">See code changes instantly</p>
                  </li>
                </ul>
              </CardContent>
            </div>
            <CardFooter className="flex justify-end gap-4">
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/login">Log in</Link>
              </Button>
            </CardFooter>
          </div>
        </div>
      </Card>
    </div>
  );
}
