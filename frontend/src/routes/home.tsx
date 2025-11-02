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
import { matchingService } from "../lib/matching-service";
import { type UserMatchingCancelRequest, type UserMatchingRequest } from "../../../shared/types/matching-types.ts";

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
  const [isMatching, setIsMatching] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [matchingSuccess, setMatchingSuccess] = useState<string | null>(null);
  redirectIfNotAuthenticated();
  const { user, isPending } = useCurrentUser();

  if (isPending) {
    return <></>;
  }

  console.log("User data in Home route:", user);

  const handleStartMatching = async () => {
    if (!user?.id || !topic || !difficulty) {
      setMatchingError("Please make sure you're logged in and have selected both topic and difficulty");
      return;
    }

    setIsMatching(true);
    setMatchingError(null);
    setMatchingSuccess(null);

    try {
      const matchingRequest: UserMatchingRequest = {
        userId: { id: user.id },
        preferences: {
          topic: topic,
          difficulty: difficulty as 'easy' | 'medium' | 'hard',
        },
        timestamp: Date.now(),
      };

      console.log("Starting matching with request:", matchingRequest);
      await matchingService.startMatching(matchingRequest);
      
      // TODO: You might want to redirect to a waiting/matching page here
      // or start listening to WebSocket for matching updates
      
    } catch (error) {
      console.error("Failed to start matching:", error);
      setMatchingError(error instanceof Error ? error.message : "Failed to start matching");
    }
  };

  const handleCancelMatching = async () => {
    if (!user?.id) {
      setMatchingError("User not found");
      return;
    }

    setIsMatching(true);
    setMatchingError(null);
    setMatchingSuccess(null);

    try {
      console.log("Cancelling matching for user:", user.id);
      const matchingCancelRequest: UserMatchingCancelRequest = {
        userId: { id: user.id },
      };
      
      await matchingService.cancelMatching(matchingCancelRequest);

    } catch (error) {
      console.error("Failed to cancel matching:", error);
      setMatchingError(error instanceof Error ? error.message : "Failed to cancel matching");
    } finally {
      setIsMatching(false);
    }
  };

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
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!topic || !difficulty || isMatching}
            onClick={handleStartMatching}
          >
            {isMatching ? "Looking for a Match..." : "Start Matching"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            hidden={!isMatching}
            onClick={handleCancelMatching}
          >
            Cancel Matching
          </Button>
        </div>
        
        {/* Error Message */}
        {matchingError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <strong>Error:</strong> {matchingError}
          </div>
        )}
        
        {/* Success Message */}
        {matchingSuccess && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <strong>Success:</strong> {matchingSuccess}
          </div>
        )}
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
