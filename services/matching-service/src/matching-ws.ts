import { Server as SocketIOServer, Socket } from 'socket.io';
import { Matcher } from './matcher';
import { WS_EVENTS_MATCHING } from '../../../shared/ws-events'
import type { UserId } from '../../../shared/types/matching-types';

export class MatchingWS {
  private io: SocketIOServer;
  private matcher: Matcher;

  constructor(io: SocketIOServer, matcher: Matcher) {
    this.io = io;
    this.matcher = matcher;
  }

  init() {
    this.io.on('connection', (socket: CustomSocket) => {
      console.log(`Client connected: ${socket.id}`);
  
      // Set up event listeners for this socket
      socket.on(WS_EVENTS_MATCHING.JOIN, (data) => this.OnClientJoin(socket, data));
      socket.on(WS_EVENTS_MATCHING.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
      socket.on(WS_EVENTS_MATCHING.ERROR, (error) => this.OnError(socket, error));
    });

    this.matcher.emitter.on(this.matcher.EVENT_USER_DEQUEUED, (userId: UserId) => {
      this.emitUserDequeued(userId.id);
    });
    console.log('Matching WebSocket server initialized and listening for connections.');
  }

  private async HandleConnectionInterrupt(userId: UserId | undefined): Promise<void> {
    if (!userId) return Promise.resolve();
    console.log(`Handling connection interrupt for user ${userId.id}`);
    await this.matcher.dequeue(userId);
  }

  private OnClientJoin = (socket: CustomSocket, userId: UserId) => {
    if (!userId || !userId.id) {
      socket.emit(WS_EVENTS_MATCHING.ERROR, 'JOIN event missing userId');
      return;
    }

    socket.userId = userId;
    socket.join(`user_${userId.id}`);
    console.log(`User ${userId.id} joined with socket ${socket.id}`);
  }

  private OnClientDisconnect = async (socket: CustomSocket, reason: string) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

    // Clean up event listeners
    socket.off(WS_EVENTS_MATCHING.JOIN, (data) => this.OnClientJoin(socket, data));
    socket.off(WS_EVENTS_MATCHING.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
    socket.off(WS_EVENTS_MATCHING.ERROR, (error) => this.OnError(socket, error));

    // Clean up user from matching queue if they disconnect
    if (socket.userId) {
      await this.HandleConnectionInterrupt(socket.userId);
      console.log(`Removed user ${socket.userId.id} from matching queue due to disconnection`);
    }
  }

  private OnError = async (socket: CustomSocket, error: any) => {
    console.error('WebSocket error:', error);
    await this.HandleConnectionInterrupt(socket.userId);
  }

  emitCollabSessionReady(userId: string, peerId: string, sessionId: string) {
    const payload = { userId, peerId, sessionId };
    console.log(`Emitting collab session ready to user ${userId} and peer ${peerId} for session ${sessionId}`);
    this.io.to(`user_${userId}`).emit(WS_EVENTS_MATCHING.COLLAB_SESSION_READY, payload);
    this.io.to(`user_${peerId}`).emit(WS_EVENTS_MATCHING.COLLAB_SESSION_READY, payload);
  }

  emitUserDequeued(userId: string) {
    console.log(`Emitting user dequeued event to user ${userId}`);
    this.io.to(`user_${userId}`).emit(WS_EVENTS_MATCHING.USER_DEQUEUED, { userId });
  }
}

// Extend Socket interface to include userId
interface CustomSocket extends Socket {
  userId?: UserId;
}
