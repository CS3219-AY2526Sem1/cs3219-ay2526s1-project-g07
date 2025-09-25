/*
AI Assistance Disclosure:
Tool: GitHub Copilot (model: gemini-2.5-pro), date: 2025‑09‑25
Scope: Generated implementation of the Web Worker to load and run Pyodide for Python code execution.
Author review: I validated correctness of the components, upgraded Pyodide versions, and added error handling.
*/

/// <reference lib="webworker" />
// src/workers/pyodide.worker.ts
importScripts("https://cdn.jsdelivr.net/pyodide/v0.28.3/full/pyodide.js");

interface Pyodide {
  loadPackage: (packages: string[]) => Promise<void>;
  runPythonAsync: (code: string) => Promise<string>;
  version: string;
}

declare function loadPyodide(options: {
  indexURL: string;
  stdout: (msg: string) => void;
  stderr: (msg: string) => void;
}): Promise<Pyodide>;

let pyodide: Pyodide;
let loaded: boolean = false;

async function loadPyodideAndPackages() {
  try {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.28.3/full/",
      stdout: (msg) => postMessage({ type: "stdout", msg }),
      stderr: (msg) => postMessage({ type: "stderr", msg }),
    });
    const pythonVersion = await pyodide.runPythonAsync(`
            import sys
            sys.version
        `);
    postMessage({
      type: "ready",
      pyodideVersion: pyodide.version,
      pythonVersion,
    });
    loaded = true;
  } catch (error) {
    postMessage({ type: "error", msg: (error as Error).message });
  }
}

const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
  await pyodideReadyPromise;
  if (!loaded) {
    return;
  }
  const { code } = event.data;
  if (code) {
    try {
      await pyodide.runPythonAsync(code);
    } catch (error) {
      self.postMessage({ type: "stderr", msg: (error as Error).message });
    }
  }
};
