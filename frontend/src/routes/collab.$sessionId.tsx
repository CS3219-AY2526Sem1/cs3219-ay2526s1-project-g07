import { createFileRoute } from "@tanstack/react-router";
import Navbar from "../components/Navbar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export const Route = createFileRoute("/collab/$sessionId")({
  component: RouteComponent,
});

// collaborative coding session
function RouteComponent() {
  const { sessionId } = Route.useParams();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 flex-col mx-12 mb-16">
        <div className="border-red-500 border-2 h-14 mb-2">
          Welcome {sessionId} - Collab and Tool Buttons
        </div>
        <ResizablePanelGroup
          direction="horizontal"
          className="flex-1 min-h-128 h-full border-1 rounded-md"
        >
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="flex h-full items-center justify-center p-6">
              <span className="font-semibold">Question</span>
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
