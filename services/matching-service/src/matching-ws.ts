import { Server as SocketIOServer, Socket } from 'socket.io';
import { Matcher } from './matcher.ts';
import { WS_EVENTS_MATCHING } from '../../../shared/ws-events.ts'
import type { UserMatchingRequest, UserId } from '../../../shared/types/matching-types.ts';

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
  }

  private async HandleConnectionInterrupt(userId: UserId) {
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

  private OnClientDisconnect = (socket: CustomSocket, reason: string) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

    // Clean up event listeners
    socket.off(WS_EVENTS_MATCHING.JOIN, (data) => this.OnClientJoin(socket, data));
    socket.off(WS_EVENTS_MATCHING.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
    socket.off(WS_EVENTS_MATCHING.ERROR, (error) => this.OnError(socket, error));

    // Clean up user from matching queue if they disconnect
    if (socket.userId) {
      this.HandleConnectionInterrupt(socket.userId);
      console.log(`Removed user ${socket.userId.id} from matching queue due to disconnection`);
    }
  }

  private OnError = (socket: CustomSocket, error: any) => {
    this.HandleConnectionInterrupt(socket.userId);
    console.error('WebSocket error:', error);
  }
}

// Extend Socket interface to include userId
interface CustomSocket extends Socket {
  userId?: UserId;
}
