"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingWS = void 0;
const ws_events_1 = require("../../../shared/ws-events");
class MatchingWS {
    constructor(io, matcher) {
        this.OnClientJoin = (socket, userId) => {
            if (!userId || !userId.id) {
                socket.emit(ws_events_1.WS_EVENTS_MATCHING.ERROR, 'JOIN event missing userId');
                return;
            }
            socket.userId = userId;
            socket.join(`user_${userId.id}`);
            console.log(`User ${userId.id} joined with socket ${socket.id}`);
        };
        this.OnClientDisconnect = (socket, reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
            // Clean up event listeners
            socket.off(ws_events_1.WS_EVENTS_MATCHING.JOIN, (data) => this.OnClientJoin(socket, data));
            socket.off(ws_events_1.WS_EVENTS_MATCHING.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
            socket.off(ws_events_1.WS_EVENTS_MATCHING.ERROR, (error) => this.OnError(socket, error));
            // Clean up user from matching queue if they disconnect
            if (socket.userId) {
                this.HandleConnectionInterrupt(socket.userId);
                console.log(`Removed user ${socket.userId.id} from matching queue due to disconnection`);
            }
        };
        this.OnError = (socket, error) => {
            this.HandleConnectionInterrupt(socket.userId);
            console.error('WebSocket error:', error);
        };
        this.io = io;
        this.matcher = matcher;
    }
    init() {
        this.io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);
            // Set up event listeners for this socket
            socket.on(ws_events_1.WS_EVENTS_MATCHING.JOIN, (data) => this.OnClientJoin(socket, data));
            socket.on(ws_events_1.WS_EVENTS_MATCHING.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
            socket.on(ws_events_1.WS_EVENTS_MATCHING.ERROR, (error) => this.OnError(socket, error));
        });
    }
    async HandleConnectionInterrupt(userId) {
        if (!userId)
            return;
        await this.matcher.dequeue(userId);
    }
}
exports.MatchingWS = MatchingWS;
