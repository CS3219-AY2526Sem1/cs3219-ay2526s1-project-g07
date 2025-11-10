import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type {
  MatchFoundData,
  UserId,
} from "../../../shared/types/matching-types";
import { WS_EVENTS_MATCHING } from "../../../shared/ws-events";

export const useMatchingWebSocket = (
  serverUrl: string = "http://localhost:3000"
): UseMatchingWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [matchingStatus, setMatchingStatus] =
    useState<MatchingStatus>("disconnected");
  const [lastMessage, setLastMessage] = useState<string>("Not connected");
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLastMessage(message);
    console.log("WebSocket:", message);
  }, []);

  const handleCollabSessionReady = useCallback(
    (sessionId: string) => {
      console.log("Navigating to collaboration session:", sessionId);
      navigate({ to: `/collab/${sessionId}`, params: { sessionId } });
    },
    [navigate]
  );

  const handleUserDequeued = useCallback(
    (userId: string) => {
      console.log(`User ${userId} has been dequeued from matching`);
      setMatchingStatus("cancelled");
      updateMessage("You have been removed from the matching queue");
    },
    [updateMessage]
  );

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("Socket already connected");
      return;
    }

    console.log("Connecting to WebSocket server...");
    setMatchingStatus("connecting");
    clearError();

    socketRef.current = io(serverUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    // Connection event handlers
    socketRef.current.on("connect", () => {
      console.log("Connected to matching service WebSocket");
      setIsConnected(true);
      setMatchingStatus("connected");
      updateMessage("Connected to matching service");
      clearError();
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("Disconnected from matching service:", reason);
      setIsConnected(false);
      setMatchingStatus("disconnected");
      updateMessage(`Disconnected: ${reason}`);

      // Reset match data on disconnect
      setMatchData(null);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
      setIsConnected(false);
      setMatchingStatus("disconnected");
      setError(`Connection failed: ${error.message}`);
      updateMessage(`Connection error: ${error.message}`);
    });

    // Matching event handlers
    socketRef.current.on(
      WS_EVENTS_MATCHING.MATCHING_SUCCESS,
      (data: MatchFoundData) => {
        console.log("Match found:", data);
        setMatchingStatus("matched");
        setMatchData(data);
        updateMessage(`Match found! Session: ${data.collabSessionId}`);
      }
    );

    socketRef.current.on(WS_EVENTS_MATCHING.MATCHING_FAILED, (data: any) => {
      console.log("Matching failed:", data);
      setMatchingStatus("failed");
      setError(data.message || "Matching failed");
      updateMessage(`Matching failed: ${data.message || "Unknown error"}`);
    });

    socketRef.current.on(
      WS_EVENTS_MATCHING.COLLAB_SESSION_READY,
      (data: any) => {
        console.log("Collaboration session is ready");
        setMatchingStatus("collab_session_ready");
        updateMessage("Collaboration session is ready");
        handleCollabSessionReady(data.sessionId);
      }
    );

    socketRef.current.on(WS_EVENTS_MATCHING.USER_DEQUEUED, (data: any) => {
      handleUserDequeued(data.userId);
    });

    socketRef.current.on(WS_EVENTS_MATCHING.COLLAB_SESSION_READY, (data: any) => {
      console.log('Collaboration session is ready');
      setMatchingStatus('collab_session_ready');
      updateMessage('Collaboration session is ready');
      handleCollabSessionReady(data.sessionId);
    });

    socketRef.current.on(WS_EVENTS_MATCHING.USER_DEQUEUED, (data: any) => {
      handleUserDequeued(data.userId);
    });

    // Error handler
    socketRef.current.on(WS_EVENTS_MATCHING.ERROR, (error) => {
      console.error("WebSocket error:", error);
      setError(typeof error === "string" ? error : "WebSocket error occurred");
      updateMessage(`Error: ${error}`);
    });
  }, [serverUrl, clearError, updateMessage]);

  const disconnect = useCallback(() => {
    if (!socketRef.current) {
      console.error("No WebSocket connection to disconnect");
      return;
    }

    socketRef.current?.off(WS_EVENTS_MATCHING.MATCHING_SUCCESS);
    socketRef.current?.off(WS_EVENTS_MATCHING.MATCHING_FAILED);
    socketRef.current?.off(WS_EVENTS_MATCHING.COLLAB_SESSION_READY);
    socketRef.current?.off(WS_EVENTS_MATCHING.USER_DEQUEUED);
    socketRef.current?.off(WS_EVENTS_MATCHING.ERROR);

    console.log("Disconnecting from WebSocket...");
    socketRef.current.disconnect();
    socketRef.current = null;
    setIsConnected(false);
    setMatchingStatus("disconnected");
    setMatchData(null);
    updateMessage("Manually disconnected");
  }, [updateMessage]);

  const joinUser = useCallback(
    (userId: UserId) => {
      if (socketRef.current && isConnected) {
        console.log("Joining user:", userId);
        socketRef.current.emit(WS_EVENTS_MATCHING.JOIN, userId);
        updateMessage(`Joined as user ${userId.id}`);
      } else {
        const message = "Cannot join: WebSocket not connected";
        console.warn(message);
        setError(message);
      }
    },
    [isConnected, updateMessage]
  );

  // Auto-connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    matchingStatus,
    lastMessage,
    matchData,
    error,
    connect,
    disconnect,
    joinUser,
  };
};

type MatchingStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "queued"
  | "matched"
  | "cancelled"
  | "failed"
  | "collab_session_ready";

interface UseMatchingWebSocketReturn {
  // Connection status
  isConnected: boolean;
  matchingStatus: MatchingStatus;

  // Messages and data
  lastMessage: string;
  matchData: MatchFoundData | null;
  error: string | null;

  // Actions
  connect: () => void;
  disconnect: () => void;
  joinUser: (userId: UserId) => void;
}
