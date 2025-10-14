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
  onOutputChange?: (output: string) => void;
}

function CodeOutput({ code, onOutputChange }: CodeOutputProps) {
  const [output, setOutput] = useState("Loading Pyodide worker...");
  const [pyodideLoaded, setPyodideLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const interruptBufferRef = useRef(new Uint8Array(new SharedArrayBuffer(1)));
  const lastExecTimeRef = useRef<number | null>(null);

  const onMessage = useCallback((event: MessageEvent) => {
    const { type, msg, pyodideVersion, pythonVersion } = event.data;
    switch (type) {
      case "ready": {
        setPyodideLoaded(true);
        setOutput(
          `[Ready] Python ${pythonVersion} on Pyodide ${pyodideVersion}\n`
        );
        console.log("Pyodide loaded.");
        break;
      }
      case "error":
        setOutput(`[Error] Pyodide could not be loaded:\n${msg}\n`);
        break;
      case "stdout":
      case "stderr":
        setOutput((prev) => `${prev + msg}\n`);
        break;
      case "executionComplete":
        setIsRunning(false);
        setOutput(
          (prev) =>
            prev +
            `[Finished in ${
              (Date.now() - (lastExecTimeRef.current || 0)) / 1000
            }s]\n`
        );
        break;
      default:
        console.warn("Unknown message type from worker:", type);
        break;
    }
  }, []);

  const createWorker = useCallback(() => {
    interruptBufferRef.current[0] = 0;
    workerRef.current = new Worker(
      new URL("../workers/pyodide.worker.ts", import.meta.url)
    );

    workerRef.current.addEventListener("message", onMessage);
    workerRef.current.postMessage({
      cmd: "setInterruptBuffer",
      interruptBuffer: interruptBufferRef.current,
    });
  }, [onMessage]);

  const killWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.removeEventListener("message", onMessage);
      workerRef.current.terminate();
      workerRef.current = null;
      setPyodideLoaded(false);
      setIsRunning(false);
    }
  }, [onMessage]);

  const interruptExecution = useCallback(() => {
    interruptBufferRef.current[0] = 2;
  }, []);

  const killAndRestartWorker = useCallback(() => {
    interruptBufferRef.current[0] = 2;
    killWorker();
    setOutput("Pyodide worker terminated. Recreating worker, please wait...");
    createWorker();
  }, [createWorker, killWorker]);

  const runPythonCode = useCallback(() => {
    if (pyodideLoaded && workerRef.current !== null) {
      setOutput("");
      setIsRunning(true);
      lastExecTimeRef.current = Date.now();
      interruptBufferRef.current[0] = 0;
      workerRef.current.postMessage({ cmd: "runCode", code });
    }
  }, [pyodideLoaded, code]);

  useEffect(() => {
    createWorker();
    return killWorker;
  }, [createWorker, killWorker]);

  useEffect(() => {
    if (onOutputChange) {
      onOutputChange(output);
    }
  }, [output, onOutputChange]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 h-11">
        <h3 className="text-sm">Console Output</h3>
        <div className="flex gap-4">
          {isRunning && (
            <Button
              variant="destructive"
              onClick={interruptExecution}
              className="px-3 text-xs h-6 bg-amber-600 text-white rounded hover:bg-amber-700 cursor-pointer"
            >
              Interrupt
            </Button>
          )}
          {isRunning && (
            <Button
              variant="destructive"
              onClick={killAndRestartWorker}
              className="px-3 text-xs h-6 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              Kill
            </Button>
          )}
          {!isRunning && (
            <Button
              variant="default"
              onClick={runPythonCode}
              className="px-3 text-xs h-6 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
              disabled={!pyodideLoaded}
            >
              Run Code
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
        <pre className="whitespace-pre-wrap">{output}</pre>
      </div>
    </div>
  );
}

export default CodeOutput;
