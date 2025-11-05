import { Server as SocketIOServer } from "socket.io";
import { MatchingWS } from "../src/matching-ws";
import { Matcher } from "../src/matcher";
import { io as Client } from "socket.io-client";
import { WS_EVENTS_MATCHING } from "../../../shared/ws-events";
import { createServer } from "http";
import type { AddressInfo } from "net";
import type { UserId } from "../../../shared/types/matching-types";
import { RedisClient } from '../../../redis/src/client';

let io: SocketIOServer;
let matcher: Matcher;
let matchingWS: MatchingWS;
let clientSocket: ReturnType<typeof Client>;
let httpServer: ReturnType<typeof createServer>;
const TEST_WEBSOCKET_PORT = 5000;
let redisClient: RedisClient;

async function init(): Promise<void> {
  httpServer = createServer();
  io = new SocketIOServer(httpServer, { cors: { origin: "*" } });
  redisClient = new RedisClient();
  await redisClient.init();

  // Resolve once server is listening
  await new Promise<void>((resolve) => {
    httpServer.listen(TEST_WEBSOCKET_PORT, resolve);
  });

  const port = (httpServer.address() as AddressInfo).port;

  matcher = new Matcher(redisClient);

  function mockSetInterval() {
    return 1;
  }
  // Mock setInterval to prevent actual intervals during tests
  spyOn(global, 'setInterval').and.callFake(mockSetInterval as any);
  matchingWS = new MatchingWS(io, matcher);
  matchingWS.init();

  clientSocket = Client(`http://localhost:${port}`, {
    transports: ["websocket"],
  });

  // Wait for connection to complete
  await new Promise<void>((resolve) => {
    clientSocket.on(WS_EVENTS_MATCHING.CONNECT, resolve);
  });
}

async function cleanup(): Promise<void> {
  io.removeAllListeners();
  clientSocket.removeAllListeners();
  clientSocket.close();
  io.close();
  await matcher.cleanUp();
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
      clientSocket.emit(WS_EVENTS_MATCHING.JOIN, { id: '123' } as UserId);

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(clientJoinSpy).toHaveBeenCalledWith(
        jasmine.any(Object),
        { id: '123' } as UserId
      );
    });

    it("should emit error if userId is missing", async () => {
      const errorPromise = new Promise<string>((resolve) => {
        clientSocket.on(WS_EVENTS_MATCHING.ERROR, (msg: string) => resolve(msg));
      });

      clientSocket.emit(WS_EVENTS_MATCHING.JOIN, {} as UserId);

      const errorMsg = await errorPromise;
      expect(errorMsg).toBe("JOIN event missing userId");
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
