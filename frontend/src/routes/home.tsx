/*
AI Assistance Disclosure:
Tool: GitHub Copilot (model: gemini-2.5-pro), date: 2025‑09‑23
Scope: Generated initial implementation of the criteria selection UI.
Author review: I validated correctness of the components and edited their styles.
*/

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
// import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "../components/Navbar";
import { redirectIfNotAuthenticated, useCurrentUser } from "../hooks/user-hooks";

export const Route = createFileRoute("/home")({
  //   loader: async () => {
  //     const session = await authClient.getSession();
  //     if (!session.data) {
  //       throw redirect({
  //         to: "/",
  //       });
  //     }
  //     console.log(session)
  //     return session;
  //   },
  component: RouteComponent,
});

function RouteComponent() {
  const session = Route.useLoaderData();
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("");
  redirectIfNotAuthenticated();
  const { user, isPending } = useCurrentUser();

  if (isPending) {
    return <></>;
  }

  console.log("User data in Home route:", user);

  return (
    <div>
      <Navbar />
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">Welcome to Home!</h1>
        <p className="mt-4 mb-6 text-gray-700">
          What would you like to practice today?
        </p>
        <div className="flex justify-center mb-4 mt-12">
          <div className="flex gap-20 mb-50">
            <Select onValueChange={setTopic}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Topic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="binary_search">Binary Search</SelectItem>
                <SelectItem value="graphs">Graphs</SelectItem>
                <SelectItem value="data_structures">Data Structures</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setDifficulty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white cursor-pointer"
          disabled={!topic || !difficulty}
        >
          Start Matching
        </Button>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <h3 className="text-lg font-medium mb-2">Raw Session Data</h3>
          <pre className="text-xs bg-white p-3 rounded border overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
