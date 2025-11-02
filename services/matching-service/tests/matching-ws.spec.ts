import { Server as SocketIOServer } from "socket.io";
import { MatchingWS } from "../src/matching-ws.ts";
import { Matcher } from "../src/matcher.ts";
import { io as Client } from "socket.io-client";
import { WS_EVENTS_MATCHING } from "../../../shared/ws-events.ts";
import { createServer } from "http";
import type { AddressInfo } from "net";
import type { UserId } from "../../../shared/types/matching-types.ts";
import redis from 'redis';
import { RedisClient } from "../../../redis/client.ts";

let io: SocketIOServer;
let matcher: Matcher;
let matchingWS: MatchingWS;
let clientSocket: ReturnType<typeof Client>;
let httpServer: ReturnType<typeof createServer>;
const TEST_WEBSOCKET_PORT = 5000;
let redisClient: redis.RedisClientType;

async function init(): Promise<void> {
  httpServer = createServer();
  io = new SocketIOServer(httpServer, { cors: { origin: "*" } });
  redisClient = await RedisClient.createClient() as redis.RedisClientType;

  // Resolve once server is listening
  await new Promise<void>((resolve) => {
    httpServer.listen(TEST_WEBSOCKET_PORT, resolve);
  });

  const port = (httpServer.address() as AddressInfo).port;

  matcher = new Matcher(redisClient);
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
