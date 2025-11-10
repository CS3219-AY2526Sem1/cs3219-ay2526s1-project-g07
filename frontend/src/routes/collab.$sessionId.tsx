import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSession } from "@/lib/auth-client";
import CodeOutput from "../components/CodeOutput";
import PythonMonacoEditor from "../components/MonacoEditor";
import Navbar from "../components/Navbar";
import {
  redirectIfNotAuthenticated,
  useCurrentUser,
} from "../hooks/user-hooks";

export const Route = createFileRoute("/collab/$sessionId")({
  // Loader fetches the question before rendering
  loader: async ({ params }) => {
    const response = await fetch(
      `/api/collab/sessions/${params.sessionId}/question`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch question");
    }
    // Assuming the API returns { question: string }
    const data = await response.json();
    return {
      question_title: data.title,
      question_text: data.question,
    };
  },
  component: RouteComponent,
});

// collaborative coding session
function RouteComponent() {
  const { sessionId } = Route.useParams();
  const { question_title, question_text } = Route.useLoaderData();
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [aiHintContent, setAiHintContent] = useState({
    loading: false,
    content: "",
    error: "",
  });
  const [aiDebugContent, setAiDebugContent] = useState({
    loading: false,
    content: "",
    error: "",
  });
  const navigate = Route.useNavigate();
  const userId = useSession().data?.user?.id;
  const { isPending, user } = useCurrentUser();

  if (isPending) {
    return <div>Loading...</div>;
  }

  const resetCode = useCallback(() => {
    setCode("");
  }, []);

  const fetchAiHint = useCallback(async () => {
    setAiHintContent({ loading: true, content: "", error: "" });
    try {
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ collabSessionId: sessionId, userId: user?.id }),
      });
      const data = await response.text();
      if (response.ok) {
        setAiHintContent({ loading: false, content: data, error: "" });
      } else {
        setAiHintContent({
          loading: false,
          content: "",
          error: `Failed to fetch hint: ${data || response.statusText}`,
        });
      }
    } catch (e: unknown) {
      console.error("Error fetching AI hint:", e);
      setAiHintContent({
        loading: false,
        content: "",
        error: `Failed to fetch hint: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }, []);

  const fetchAiDebug = useCallback(async () => {
    setAiDebugContent({ loading: true, content: "", error: "" });
    try {
      const response = await fetch("/api/ai/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question_text, code, output }),
      });
      const data = await response.text();
      setAiDebugContent({ loading: false, content: data, error: "" });
    } catch (e: unknown) {
      console.error("Error fetching AI debug info:", e);
      setAiDebugContent({
        loading: false,
        content: "",
        error: `Failed to fetch debug info: ${e instanceof Error ? e.message : String(e)}`,
      });
    }
  }, [code, output]);

  const endCollabSession = useCallback(async () => {
    // Logic to end the collaboration session
    try {
      const response = await fetch(`/api/collab/rooms/${sessionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
      if (response.ok) {
        // redirect to home
        navigate({ to: "/home" });
      } else {
        const data = await response.text();
        alert(`Failed to end session: ${data || response.statusText}`);
      }
    } catch (e: unknown) {
      console.error("Error ending collaboration session:", e);
      alert(
        `Failed to end session: ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }, [navigate, sessionId]);

  const toggleAiDebugPanel = useCallback(() => {
    setShowDebugPanel((prev) => !prev);
  }, []);

  redirectIfNotAuthenticated();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col mx-12 mb-16 min-h-148 max-h-[calc(100vh-160px)]">
        <div className="border-gray-200 border-2 h-10 shrink-0 mb-2">
          Session ID: {sessionId}
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 min-h-128 border-1 rounded-md"
        >
          <ResizablePanel
            defaultSize={25}
            minSize={20}
            maxSize={40}
            className="!overflow-auto pt-6 pb-12"
          >
            <div className="overflow-auto px-6 py-2">
              <div className="font-semibold mb-6 text-lg">{question_title}</div>
              <div className="whitespace-pre-wrap text-sm min-w-fit question-desc-markdown">
                <Markdown>{question_text}</Markdown>
              </div>
              <hr className="my-6" />
              <div className="flex flex-col gap-6 text-sm">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAiHint}
                  disabled={aiHintContent.loading}
                  className="text-sm text-violet-600 border-violet-500 hover:bg-violet-50 hover:text-violet-600 cursor-pointer"
                >
                  Get AI Hint
                </Button>
                {aiHintContent.loading && <div>Loading...</div>}
                {aiHintContent.error && (
                  <div className="text-red-500">
                    Error: {aiHintContent.error}
                  </div>
                )}
                {aiHintContent.content && (
                  <div className="whitespace-pre-wrap min-w-fit question-desc-markdown bg-violet-50 p-4 rounded">
                    <Markdown>{aiHintContent.content}</Markdown>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup
              direction="vertical"
              className="flex-1 min-h-128 h-full"
            >
              <ResizablePanel>
                <div className="h-full w-full">
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 h-11">
                    <h3 className="text-sm">Language: Python 3</h3>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={resetCode}
                        className="px-3 text-xs h-6 rounded text-red-600 border-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                      >
                        Reset Code
                      </Button>
                      {!showDebugPanel && (
                        <Button
                          variant="outline"
                          onClick={toggleAiDebugPanel}
                          className="px-3 text-xs h-6 rounded text-violet-600 border-violet-500 hover:bg-violet-50 hover:text-violet-600 cursor-pointer"
                        >
                          Open AI Panel
                        </Button>
                      )}
                    </div>
                  </div>
                  <PythonMonacoEditor
                    code={code}
                    onCodeChange={setCode}
                    sessionId={sessionId}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={10} maxSize={30}>
                <CodeOutput code={code} onOutputChange={setOutput} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
          {showDebugPanel && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel
                defaultSize={25}
                minSize={20}
                maxSize={30}
                className="!overflow-auto pt-6 pb-12"
              >
                <div className="flex flex-col gap-6 px-6 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-lg">AI Debug</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 cursor-pointer"
                      onClick={toggleAiDebugPanel}
                    >
                      <X />
                    </Button>
                  </div>
                  {!aiDebugContent.content && !aiDebugContent.loading && (
                    <p>
                      Let AI help you troubleshoot your code! Your current code
                      and output will be sent to the AI model.
                    </p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-violet-600 border-violet-500 hover:bg-violet-50 hover:text-violet-600 cursor-pointer"
                    disabled={aiDebugContent.loading}
                    onClick={fetchAiDebug}
                  >
                    Run AI Debug
                  </Button>
                  {aiDebugContent.loading && <div>Loading...</div>}
                  {aiDebugContent.error && (
                    <div className="text-red-500">
                      Error: {aiDebugContent.error}
                    </div>
                  )}
                  {aiDebugContent.content && (
                    <div className="whitespace-pre-wrap min-w-0 question-desc-markdown bg-violet-50 p-4 rounded">
                      <Markdown>{aiDebugContent.content}</Markdown>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
        <Button
          variant="destructive"
          className="m-1"
          onClick={endCollabSession}
        >
          End Session
        </Button>
      </div>
    </div>
  );
}
