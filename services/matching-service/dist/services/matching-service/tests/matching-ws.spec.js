"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const matching_ws_1 = require("../src/matching-ws");
const matcher_1 = require("../src/matcher");
const socket_io_client_1 = require("socket.io-client");
const ws_events_1 = require("../../../shared/ws-events");
const http_1 = require("http");
const client_1 = require("@peerprep/redis/client");
let io;
let matcher;
let matchingWS;
let clientSocket;
let httpServer;
const TEST_WEBSOCKET_PORT = 5000;
let redisClient;
async function init() {
    httpServer = (0, http_1.createServer)();
    io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
    redisClient = new client_1.RedisClient();
    await redisClient.init();
    // Resolve once server is listening
    await new Promise((resolve) => {
        httpServer.listen(TEST_WEBSOCKET_PORT, resolve);
    });
    const port = httpServer.address().port;
    matcher = new matcher_1.Matcher(redisClient);
    matchingWS = new matching_ws_1.MatchingWS(io, matcher);
    matchingWS.init();
    clientSocket = (0, socket_io_client_1.io)(`http://localhost:${port}`, {
        transports: ["websocket"],
    });
    // Wait for connection to complete
    await new Promise((resolve) => {
        clientSocket.on(ws_events_1.WS_EVENTS_MATCHING.CONNECT, resolve);
    });
}
async function cleanup() {
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
        let clientJoinSpy;
        beforeEach(() => {
            clientJoinSpy = spyOn(matchingWS, "OnClientJoin").and.callThrough();
        });
        it("should handle client join event", async () => {
            // Emit the JOIN event and wait a tick for the server to handle it
            clientSocket.emit(ws_events_1.WS_EVENTS_MATCHING.JOIN, { id: '123' });
            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(clientJoinSpy).toHaveBeenCalledWith(jasmine.any(Object), { id: '123' });
        });
        it("should emit error if userId is missing", async () => {
            const errorPromise = new Promise((resolve) => {
                clientSocket.on(ws_events_1.WS_EVENTS_MATCHING.ERROR, (msg) => resolve(msg));
            });
            clientSocket.emit(ws_events_1.WS_EVENTS_MATCHING.JOIN, {});
            const errorMsg = await errorPromise;
            expect(errorMsg).toBe("JOIN event missing userId");
        });
    });
    describe("DISCONNECT event", () => {
        let clientDisconnectSpy;
        beforeEach(() => {
            clientDisconnectSpy = spyOn(matchingWS, "OnClientDisconnect").and.callThrough();
        });
        it("should handle client disconnect event", async () => {
            clientSocket.close();
            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(clientDisconnectSpy).toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(String));
        });
    });
});
