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
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { useSession } from '@/lib/auth-client'


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
  sessionId: string;
}

function PythonMonacoEditor({ code, onCodeChange, sessionId }: PythonMonacoEditorProps) {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [codeEditor, setCodeEditor] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [websocketProvider, setWebsocketProvider] =
    useState<WebsocketProvider | null>(null);

  // for testing purposes, use a fixed userId
  const userId = "user1"; // authorised user
  // const userid = 'user3'; // unauthorized user
  
  // const userId = useSession().data?.user?.id || '';
  const roomname = sessionId;

  // // this effect manages the lifetime of the Yjs document and the provider
  useEffect(() => {
    // const provider = new WebsocketProvider(`/api/collab?sessionId=${roomname}&userId=${userId}`, roomname, ydoc);
    console.log(`Connecting to collab session ${roomname} as user ${userId}`);
    const provider = new WebsocketProvider('/api/collab', roomname, ydoc, { params: { sessionId: roomname, userId } });
    setWebsocketProvider(provider);
    return () => {
      provider?.destroy();
      ydoc.destroy();
    };
  }, [ydoc]);

  // this effect manages the lifetime of the editor binding
  useEffect(() => {
    if (websocketProvider === null || codeEditor === null) {
      return;
    }
    const editorModel = codeEditor.getModel();
    if (editorModel === null) {
      return;
    }
    const binding = new MonacoBinding(
      ydoc.getText(),
      editorModel,
      new Set([codeEditor]),
      websocketProvider?.awareness
    );
    return () => {
      binding.destroy();
    };
  }, [ydoc, websocketProvider, codeEditor]);

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
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    monaco.editor.remeasureFonts();
    editor.layout();
    setCodeEditor(editor);
  }, []);

  return (
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
  );
}

export default PythonMonacoEditor;
