/*
AI Assistance Disclosure:
Tool: GitHub Copilot (model: claude-sonnet-4), date: 2025‑09‑24
Scope: Generated implementation of the MonacoEditor component for Python coding.
Author review: I validated correctness of the components, removed unnecessary code, and edited styles.
I also extracted the component from the parent file for better modularity.
*/

import Editor, { type OnChange, type OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useCallback, useEffect, useMemo, useState } from "react";

import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

/** Monaco Editor options
 * See: https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html
 */
const monacoEditorOptions: editor.IStandaloneEditorConstructionOptions = {
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

const roomname = `dummy-session-id`; // replace with actual session id

function PythonMonacoEditor({ code, onCodeChange }: PythonMonacoEditorProps) {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [codeEditor, setEditor] = useState<any | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [binding, setBinding] = useState<MonacoBinding | null>(null);

  // // this effect manages the lifetime of the Yjs document and the provider
  useEffect(() => {
    const provider = new WebsocketProvider(
      // "wss://demos.yjs.dev/ws", // change with collab backend websocket URL
      "ws://localhost:1234", // will run the demo server by default if url fails
      roomname,
      ydoc
    );
    setProvider(provider);
    return () => {
      provider?.destroy();
      ydoc.destroy();
    };
  }, [ydoc]);

  // this effect manages the lifetime of the editor binding
  useEffect(() => {
    if (provider == null || codeEditor == null) {
      return;
    }
    console.log("reached", provider);
    const binding = new MonacoBinding(
      ydoc.getText(),
      codeEditor.getModel()!,
      new Set([codeEditor]),
      provider?.awareness
    );
    setBinding(binding);
    return () => {
      binding.destroy();
    };
  }, [ydoc, provider, codeEditor]);

  const handleCodeChange: OnChange = useCallback(
    (value) => {
      if (value !== undefined) {
        onCodeChange(value);
      }
    },
    [onCodeChange]
  );

  // Reloads the editor after fonts are loaded to ensure correct cursor positioning
  // See: https://github.com/microsoft/monaco-editor/issues/4644
  const handleEditorMount: OnMount = useCallback(async (editor, monaco) => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    monaco.editor.remeasureFonts();
    editor.layout();
    setEditor(editor);
  }, []);

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50 h-11">
        <h3 className="text-sm">Language: Python 3</h3>
      </div>
      <div className="h-[calc(100%-44px)]">
        <Editor
          width="100%"
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorMount}
          options={monacoEditorOptions}
        />
      </div>
    </div>
  );
}

export default PythonMonacoEditor;
