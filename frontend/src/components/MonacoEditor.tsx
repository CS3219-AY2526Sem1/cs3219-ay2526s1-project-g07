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
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "@tanstack/react-router";

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

interface ActiveUser {
  clientId?: number;
  name: string;
  color: string;
}

const DUPLICATE_SESSION_CLOSE_CODE = 4001;
const USER_REMOVED_CLOSE_CODE = 4000;
// 0xFFFFFF is the maximum value for a 24-bit RGB color (white)
const MAX_COLOR_VALUE = 0xffffff;

function PythonMonacoEditor({
  code,
  onCodeChange,
  sessionId,
}: PythonMonacoEditorProps) {
  const ydoc = useMemo(() => new Y.Doc(), []);
  const [codeEditor, setCodeEditor] =
    useState<editor.IStandaloneCodeEditor | null>(null);
  const [websocketProvider, setWebsocketProvider] =
    useState<WebsocketProvider | null>(null);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const navigate = useNavigate();

  const userId = useSession().data?.user?.id;
  const userName = useSession().data?.user?.name;
  const roomname = sessionId;
  const userColor = `#${Math.floor(Math.random() * MAX_COLOR_VALUE)
  .toString(16)
  .padStart(6, "0")}`; // assign a random color

  // Clean up Yjs document on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up ydoc on unmount");
      ydoc.destroy();
    };
  }, []);

  // this effect manages the lifetime of the provider
  useEffect(() => {
    if (!userId || !roomname || !userName) {
      console.warn(
        "Missing userId, userName, or roomname, cannot connect to collab session."
      );
      return;
    }

    console.log(`Connecting to collab session ${roomname} as user ${userId}`);
    const provider = new WebsocketProvider("/api/collab", roomname, ydoc, {
      params: { sessionId: roomname, userId },
    });

    provider.on("status", (event) => {
      console.log(event.status); // logs "connected" or "disconnected"
    });

    provider.on("connection-close", (event) => {
      const code = event?.code;

      // code 4000 indicates normal closure after user removal via API
      if (code === USER_REMOVED_CLOSE_CODE) {
        console.log(`Connection closed normally after user removal (Code ${code})`);
        return;
      }

      // code 4001 indicates disconnection due to duplicate user session
      if (code === DUPLICATE_SESSION_CLOSE_CODE) {
        console.log(
          `Disconnected by server (Code ${code}): ${event?.reason ?? ""}`
        );
        alert("Disconnected: Another session logged in with the same user.");

        // Stop the reconnection loop for this provider instance
        provider.shouldConnect = false;
        return;
      }

      // Handle other closures
      if (provider.ws?.readyState === WebSocket.CLOSED) {
        console.log(
          `Disconnected by server (Code ${code}): ${event?.reason ?? ""}`
        );
        alert(
          "Connection failed: You may be unauthorized to join this collaboration session."
        );
        navigate({ to: '/home' });
        return;
      }
    });

    provider.awareness.setLocalStateField("user", {
      userId: userId,
      name: userName,
      color: userColor,
    });

    setWebsocketProvider(provider);
    return () => {
      provider?.destroy();
    };
  }, [ydoc, userId, roomname]);

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
      websocketProvider.awareness
    );
    return () => {
      binding.destroy();
    };
  }, [ydoc, websocketProvider, codeEditor]);

  useEffect(() => {
    if (!websocketProvider) {
      return;
    }

    const awareness = websocketProvider.awareness;
    const STYLE_ID = "yjs-awareness-styles";

    const updateUIElements = () => {
      const usersForBar: ActiveUser[] = [];
      const userIdSet = new Set<number>();
      let styles = "";

      // Loop through all connected users' awareness states
      for (const [clientId, state] of awareness.getStates()) {
        const user = state?.user as { userId: number; name: string; color: string } | undefined;
        if (user) {
          // Logic for the User Bar (updates React state)
          if (userIdSet.has(user.userId)) {
            continue; // skip duplicate userId
          }
          userIdSet.add(user.userId);
          usersForBar.push({
            clientId,
            name: user.name,
            color: user.color,
          });
        }
        if (user?.color) {
          // y-monaco automatically generates classes with the clientID
          styles += `
          .yRemoteSelection-${clientId} {
            background-color: ${user.color} !important; 
            opacity: 0.5;
          }
          .yRemoteSelectionHead-${clientId} {
            border-left: 2px solid ${user.color} !important;
          }
          .yRemoteSelectionHead-${clientId}:hover::after {
            content: '${user.name}';
            opacity: 1;
            position: absolute; 
            top: -20px; 
            padding: 2px 4px;
            background-color: ${user.color};
            color: #fff;
            font-size: 10px;
            white-space: nowrap;
            border-radius: 3px;
            pointer-events: none;
          }
        `;
        }
      }
      console.log("Active users updated:", usersForBar);  
      console.log('user set'  , userIdSet);
      setActiveUsers(usersForBar);

      // Inject the CSS into the document
      let styleTag = document.getElementById(
        STYLE_ID
      ) as HTMLStyleElement | null;
      if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = STYLE_ID;
        document.head.appendChild(styleTag);
      }
      styleTag.innerHTML = styles;
    };

    // Listen for any changes in remote awareness (user joins, leaves, or updates state)
    awareness.on("change", updateUIElements);
    updateUIElements(); // Run once to set initial styles

    return () => {
      awareness.off("change", updateUIElements);
      // Clean up the style tag on component unmount
      document.getElementById(STYLE_ID)?.remove();
    };
  }, [websocketProvider]);

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
    <>
      <div className="user-bar" style={{ display: "flex", gap: "2px", margin: "4px", justifyContent: "flex-end" }}>
        {activeUsers.map((user) => (
          <Avatar key={user.clientId} title={user.name}>
              <AvatarFallback 
                  style={{ backgroundColor: user.color, color: 'white' }}
              >
                  {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="h-[calc(100%-88px)]">
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
    </>
  );
}

export default PythonMonacoEditor;
