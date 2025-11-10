"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchingWS = void 0;
const matcher_1 = require("./matcher");
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
        this.OnClientDisconnect = async (socket, reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
            // Clean up event listeners
            socket.off(ws_events_1.WS_EVENTS_MATCHING.JOIN, (data) => this.OnClientJoin(socket, data));
            socket.off(ws_events_1.WS_EVENTS_MATCHING.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
            socket.off(ws_events_1.WS_EVENTS_MATCHING.ERROR, (error) => this.OnError(socket, error));
            // Clean up user from matching queue if they disconnect
            if (socket.userId) {
                await this.HandleConnectionInterrupt(socket.userId);
                console.log(`Removed user ${socket.userId.id} from matching queue due to disconnection`);
            }
        };
        this.OnError = async (socket, error) => {
            console.error('WebSocket error:', error);
            await this.HandleConnectionInterrupt(socket.userId);
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
        this.matcher.emitter.on(matcher_1.MatcherEvents.EVENT_USER_DEQUEUED, (userId) => {
            this.emitUserDequeued(userId.id);
        });
        console.log('Matching WebSocket server initialized and listening for connections.');
    }
    async HandleConnectionInterrupt(userId) {
        if (!userId)
            return Promise.resolve();
        console.log(`Handling connection interrupt for user ${userId.id}`);
        await this.matcher.dequeue(userId);
    }
    emitCollabSessionReady(userId, peerId, sessionId) {
        const payload = { userId, peerId, sessionId };
        console.log(`Emitting collab session ready to user ${userId} and peer ${peerId} for session ${sessionId}`);
        this.io.to(`user_${userId}`).emit(ws_events_1.WS_EVENTS_MATCHING.COLLAB_SESSION_READY, payload);
        this.io.to(`user_${peerId}`).emit(ws_events_1.WS_EVENTS_MATCHING.COLLAB_SESSION_READY, payload);
    }
    emitUserDequeued(userId) {
        console.log(`Emitting user dequeued event to user ${userId}`);
        this.io.to(`user_${userId}`).emit(ws_events_1.WS_EVENTS_MATCHING.USER_DEQUEUED, { userId });
    }
}
exports.MatchingWS = MatchingWS;
