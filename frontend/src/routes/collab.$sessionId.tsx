import { createFileRoute } from "@tanstack/react-router";
import Markdown from "react-markdown";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Navbar from "../components/Navbar";
import { useState } from "react";
import PythonMonacoEditor from "../components/MonacoEditor";

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

export const Route = createFileRoute("/collab/$sessionId")({
  component: RouteComponent,
});

// collaborative coding session
function RouteComponent() {
  const { sessionId } = Route.useParams();

  const [code, setCode] = useState(`def solution(s):
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
print(test_input)  # Expected: ["o","l","l","e","h"]`);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running code...\n");

    // Simulate code execution (in a real app, you'd send this to a backend)
    setTimeout(() => {
      setOutput(
        `Running Python code...\n\n['o', 'l', 'l', 'e', 'h']\n\nExecution completed successfully.`
      );
      setIsRunning(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col mx-12 mb-16 min-h-148 max-h-[calc(100vh-160px)]">
        <div className="border-red-500 border-2 h-14 shrink-0 mb-2">
          Welcome {sessionId} - Collab and Tool Buttons
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
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ResizablePanelGroup
              direction="vertical"
              className="flex-1 min-h-128 h-full"
            >
              <ResizablePanel>
                <PythonMonacoEditor
                  code={code}
                  onCodeChange={setCode}
                  isRunning={isRunning}
                  runCode={runCode}
                  stopCode={() => setIsRunning(false)}
                />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={10} maxSize={30}>
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                    <h3 className="text-sm font-medium">Console Output</h3>
                    <button
                      onClick={() => setOutput("")}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
                    <pre className="whitespace-pre-wrap">
                      {output ||
                        "Click 'Run' to execute your code and see the output here..."}
                    </pre>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
