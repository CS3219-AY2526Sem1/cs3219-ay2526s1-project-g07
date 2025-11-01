import { Server as SocketIOServer } from "socket.io";
import { MatchingWS } from "../src/matching-ws.ts";
import { Matcher } from "../src/matcher.ts";
import { io as Client } from "socket.io-client";
import { WS_EVENTS } from "../src/utils.ts";
import { createServer } from "http";
import type { AddressInfo } from "net";

let io: SocketIOServer;
let matcher: Matcher;
let matchingWS: MatchingWS;
let clientSocket: ReturnType<typeof Client>;
let httpServer: ReturnType<typeof createServer>;
const TEST_WEBSOCKET_PORT = 5000;

async function init(): Promise<void> {
  httpServer = createServer();
  io = new SocketIOServer(httpServer, { cors: { origin: "*" } });

  // Resolve once server is listening
  await new Promise<void>((resolve) => {
    httpServer.listen(TEST_WEBSOCKET_PORT, resolve);
  });

  const port = (httpServer.address() as AddressInfo).port;

  matcher = new Matcher();
  matchingWS = new MatchingWS(io, matcher);
  matchingWS.init();

  clientSocket = Client(`http://localhost:${port}`, {
    transports: ["websocket"],
  });

  // Wait for connection to complete
  await new Promise<void>((resolve) => {
    clientSocket.on(WS_EVENTS.CONNECT, resolve);
  });
}

async function cleanup(): Promise<void> {
  clientSocket.close();
  io.close();
  await new Promise((resolve) => httpServer.close(resolve));
}

describe("Web socket events (async)", () => {
  beforeEach(async () => {
    await init();
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("Connection event", () => {
    it("should set up connection event listener", async () => {
      const listeners = io.listeners("connection");
      expect(listeners.length).toBeGreaterThan(0);
    });
  });

  describe("JOIN event", () => {
    let clientJoinSpy: jasmine.Spy;

    beforeEach(() => {
      clientJoinSpy = spyOn<any>(matchingWS, "OnClientJoin").and.callThrough();
    });

    it("should handle client join event", async () => {
      // Emit the JOIN event and wait a tick for the server to handle it
      clientSocket.emit(WS_EVENTS.JOIN, { userId: 123 });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(clientJoinSpy).toHaveBeenCalledWith(
        jasmine.any(Object),
        { userId: 123 }
      );
    });

    it("should emit error if userId is missing", async () => {
      const errorPromise = new Promise<string>((resolve) => {
        clientSocket.on(WS_EVENTS.ERROR, (msg: string) => resolve(msg));
      });

      clientSocket.emit(WS_EVENTS.JOIN, {});

      const errorMsg = await errorPromise;
      expect(errorMsg).toBe("JOIN event missing userId");
    });
  });

  describe("MATCHING_REQUEST event", () => {
    let matchingRequestSpy: jasmine.Spy;
    beforeEach(() => {
      matchingRequestSpy = spyOn<any>(matchingWS, "OnMatchingRequest").and.callThrough();
    });

    it("should handle matching request event", async () => {
      const testData = { userId: 456, topic: "Math", difficulty: "easy" };
      clientSocket.emit(WS_EVENTS.MATCHING_REQUEST, testData);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(matchingRequestSpy).toHaveBeenCalledWith(
        jasmine.any(Object),
        testData
      );
      expect(matcher.queue.find((req) => req.userId === testData.userId)).toBeDefined();
    });

  });

  describe("MATCHING_CANCEL event", () => {
    let matchingCancelSpy: jasmine.Spy;
    beforeEach(() => {
      matchingCancelSpy = spyOn<any>(matchingWS, "OnMatchingCancel").and.callThrough();
    });

    it("should handle matching cancel event", async () => {
      const testData = { userId: 789 };
      matcher.enqueue(789, { topic: "Science", difficulty: "medium" });
      clientSocket.emit(WS_EVENTS.MATCHING_CANCEL, testData);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(matchingCancelSpy).toHaveBeenCalledWith(
        jasmine.any(Object),
        testData
      );
      expect(matcher.queue.find((req) => req.userId === testData.userId)).toBeUndefined();
    });
  });

  describe("DISCONNECT event", () => {
    let clientDisconnectSpy: jasmine.Spy;
    beforeEach(() => {
      clientDisconnectSpy = spyOn<any>(matchingWS, "OnClientDisconnect").and.callThrough();
    });

    it("should handle client disconnect event", async () => {
      clientSocket.close();
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(clientDisconnectSpy).toHaveBeenCalledWith(
        jasmine.any(Object),
        jasmine.any(String)
      );
    });
  });
});
