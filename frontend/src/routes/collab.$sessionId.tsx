import { createFileRoute } from "@tanstack/react-router";
import Markdown from "react-markdown";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Navbar from "../components/Navbar";

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
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Code Editor</span>
                </div>
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={10} maxSize={30}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Console Output and Run</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
