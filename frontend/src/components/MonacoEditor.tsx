/*
AI Assistance Disclosure:
Tool: GitHub Copilot (model: claude-sonnet-4), date: 2025‑09‑24
Scope: Generated implementation of the MonacoEditor component for Python coding.
Author review: I validated correctness of the components, removed unnecessary code, and edited styles.
I also extracted the component from the parent file for better modularity.
*/

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
}

function PythonMonacoEditor({ code, onCodeChange }: PythonMonacoEditorProps) {
  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 h-11">
        <h3 className="text-sm">Language: Python 3</h3>
      </div>
      <div className="h-[calc(100%-44px)]">
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
