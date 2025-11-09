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
import CodeOutput from "../components/CodeOutput";
import PythonMonacoEditor from "../components/MonacoEditor";
import Navbar from "../components/Navbar";
import { redirectIfNotAuthenticated } from "../hooks/user-hooks";

const q = `
Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with \`O(1)\` extra memory.

---
**Example 1:**
**Input**: \`s = ["h","e","l","l","o"]\`
**Output**: \`["o","l","l","e","h"]\`

**Example 2:**
**Input**: \`s = ["H","a","n","n","a","h"]\`
**Output**: \`["h","a","n","n","a","H"]\`

---

**Constraints:**
*   \`1 <= s.length <= 10^5\`
*   \`s[i]\` is a printable ASCII character.
`;

const defaultCode = `def solution(s):
    """
    Reverse a string in-place with O(1) extra memory.
    :type s: List[str]
    :rtype: None Do not return anything, modify s in-place instead.
    """
    left, right = 0, len(s) - 1
    while left < right:
        s[left], s[right] = s[right], s[left]
        left += 1
        right -= 1

# Test the solution
test_input = ["h","e","l","l","o"]
solution(test_input)
print(test_input)  # Expected: ["o","l","l","e","h"]`;

export const Route = createFileRoute("/collab/$sessionId")({
  component: RouteComponent,
});

// collaborative coding session
function RouteComponent() {
  const { sessionId } = Route.useParams();
  const [code, setCode] = useState(defaultCode);
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

  const resetCode = useCallback(() => {
    setCode(defaultCode);
  }, []);

  const fetchAiHint = useCallback(async () => {
    setAiHintContent({ loading: true, content: "", error: "" });
    try {
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: q }),
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
        body: JSON.stringify({ question: q, code, output }),
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
              <div className="font-semibold mb-6 text-lg">Reverse String</div>
              <div className="whitespace-pre-wrap text-sm min-w-fit question-desc-markdown">
                <Markdown>{q}</Markdown>
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
                  <PythonMonacoEditor code={code} onCodeChange={setCode} sessionId={sessionId} />
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
      </div>
    </div>
  );
}
