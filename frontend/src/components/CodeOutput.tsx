/*
AI Assistance Disclosure:
Tool: GitHub Copilot (model: gemini-2.5-pro), date: 2025‑09‑25
Scope: Generated integration of the component with the Web Worker to run Pyodide for Python code execution.
Author review: I validated correctness of the components and added error handling.
*/

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface CodeOutputProps {
  code: string;
}

function CodeOutput({ code }: CodeOutputProps) {
  const [output, setOutput] = useState("Loading Pyodide worker...");
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const [defaultOutput, setDefaultOutput] = useState(
    "Loading Pyodide worker..."
  );
  const [isRunning, setIsRunning] = useState(false);

  const clearOutput = useCallback(
    () => setOutput(defaultOutput),
    [defaultOutput]
  );
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Create a new worker
    workerRef.current = new Worker(
      new URL("../workers/pyodide.worker.ts", import.meta.url)
    );

    const onMessage = (event: MessageEvent) => {
      const { type, msg, pyodideVersion, pythonVersion } = event.data;
      switch (type) {
        case "ready": {
          setPyodideLoaded(true);
          const readyMessage = `[Ready] Python ${pythonVersion} on Pyodide ${pyodideVersion}\n`;
          setDefaultOutput(readyMessage);
          setOutput(readyMessage);
          console.log("Pyodide loaded.");
          break;
        }
        case "error":
          setOutput(`[Error] Pyodide could not be loaded:\n${msg}\n`);
          break;
        case "stdout":
        case "stderr":
          setIsRunning(false);
          setOutput((prev) => prev + msg + "\n");
          break;
      }
    };

    workerRef.current.addEventListener("message", onMessage);

    // Terminate the worker on component unmount
    return () => {
      workerRef.current?.removeEventListener("message", onMessage);
      workerRef.current?.terminate();
    };
  }, []);

  const runPythonCode = () => {
    if (pyodideLoaded && workerRef.current !== null) {
      setOutput("");
      setIsRunning(true);
      workerRef.current.postMessage({ code });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 h-11">
        <h3 className="text-sm">Console Output</h3>
        <div className="flex gap-4">
          <Button
            variant="default"
            onClick={runPythonCode}
            className="px-3 py-1 text-xs h-6 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={!pyodideLoaded || isRunning}
          >
            {isRunning ? "Running..." : "Run Code"}
          </Button>
          <Button
            variant="default"
            onClick={clearOutput}
            className="px-3 py-1 text-xs h-6 bg-gray-200 text-black rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Clear
          </Button>
        </div>
      </div>
      <div className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}

export default CodeOutput;
