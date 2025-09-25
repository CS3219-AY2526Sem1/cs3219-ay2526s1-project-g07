/*
AI Assistance Disclosure:
Tool: GitHub Copilot (model: claude-sonnet-4), date: 2025‑09‑24
Scope: Generated implementation of the MonacoEditor component for Python coding.
Author review: I validated correctness of the components, removed unnecessary code, and edited styles.
I also extracted the component from the parent file for better modularity.
*/
import { Button } from "@/components/ui/button";
import MonacoEditor, { type monaco } from "react-monaco-editor";

/** Monaco Editor options
 * See: https://microsoft.github.io/monaco-editor/docs.html#interfaces/editor.IEditorOptions.html
 */
const monacoEditorOptions: monaco.editor.IStandaloneEditorConstructionOptions =
  {
    selectOnLineNumbers: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "JetBrains Mono",
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    insertSpaces: true,
    wordWrap: "on",
    bracketPairColorization: { enabled: true },
    guides: {
      indentation: true,
      bracketPairs: true,
    },
  };

interface PythonMonacoEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  isRunning: boolean;
  runCode: () => void;
  stopCode: () => void;
}

function PythonMonacoEditor({
  code,
  onCodeChange,
  isRunning,
  runCode,
  stopCode,
}: PythonMonacoEditorProps) {
  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <h3 className="text-sm">Python 3</h3>
        <div className="flex items-center gap-2">
          {isRunning && (
            <Button
              variant="default"
              onClick={stopCode}
              className="px-3 py-1 text-xs h-6 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <span>Stop</span>
            </Button>
          )}
          {!isRunning && (
            <Button
              variant="default"
              onClick={runCode}
              className="px-3 py-1 text-xs h-6 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? "Running..." : "Run Code"}
            </Button>
          )}
        </div>
      </div>
      <div className="h-[calc(100%-48px)]">
        <MonacoEditor
          width="100%"
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={onCodeChange}
          options={monacoEditorOptions}
        />
      </div>
    </div>
  );
}

export default PythonMonacoEditor;
