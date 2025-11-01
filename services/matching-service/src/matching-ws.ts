import { Server as SocketIOServer, Socket } from 'socket.io';
import { Matcher } from './matcher.ts';
import { WS_EVENTS } from './utils.ts';

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
      socket.on(WS_EVENTS.JOIN, (data) => this.OnClientJoin(socket, data));
      socket.on(WS_EVENTS.MATCHING_REQUEST, (data) => this.OnMatchingRequest(socket, data));
      socket.on(WS_EVENTS.MATCHING_CANCEL, (data) => this.OnMatchingCancel(socket, data));
      socket.on(WS_EVENTS.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
      socket.on(WS_EVENTS.ERROR, (error) => this.OnError(error));
    });
  }

  private HandleConnectionInterrupt(userId: number) {
    this.matcher.dequeue(userId);
  }

  private OnClientJoin = (socket: CustomSocket, data: any) => {
    const { userId } = data;
    if (!userId) {
      socket.emit(WS_EVENTS.ERROR, 'JOIN event missing userId');
      return;
    }
    socket.userId = Number(userId);
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined with socket ${socket.id}`);
  }

  private OnMatchingRequest = (socket: CustomSocket, data: any) => {
    const { userId, topic, difficulty } = data;
    console.log(`WebSocket matching request from user ${userId}`);
    
    this.matcher.enqueue(userId, { topic, difficulty });
    
    // Emit confirmation back to client
    socket.emit(WS_EVENTS.MATCHING_REQUEST_RECEIVED, {
      message: `Matching request received for user ${userId}`,
      status: 'queued'
    });
  }

  private OnMatchingCancel = (socket: CustomSocket, data: any) => {
    const { userId } = data;
    if (!userId) {
      console.error('MATCHING_CANCEL event missing userId');
      return;
    }

    console.log(`WebSocket cancel matching request from user ${userId}`);
    this.HandleConnectionInterrupt(userId);

    // Emit confirmation back to client
    socket.emit(WS_EVENTS.MATCHING_CANCEL, {
      message: `Matching cancelled for user ${userId}`,
      status: 'cancelled'
    });
  }

  private OnClientDisconnect = (socket: CustomSocket, reason: string) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);

    // Clean up event listeners
    socket.off(WS_EVENTS.JOIN, (data) => this.OnClientJoin(socket, data));
    socket.off(WS_EVENTS.MATCHING_REQUEST, (data) => this.OnMatchingRequest(socket, data));
    socket.off(WS_EVENTS.MATCHING_CANCEL, (data) => this.OnMatchingCancel(socket, data));
    socket.off(WS_EVENTS.DISCONNECT, (reason) => this.OnClientDisconnect(socket, reason));
    socket.off(WS_EVENTS.ERROR, (error) => this.OnError(error));

    // Clean up user from matching queue if they disconnect
    if (socket.userId) {
      this.HandleConnectionInterrupt(socket.userId);
      console.log(`Removed user ${socket.userId} from matching queue due to disconnection`);
    }
  }

  private OnError = (error: any) => {
    console.error('WebSocket error:', error);
  }
}

// Extend Socket interface to include userId
interface CustomSocket extends Socket {
  userId?: number;
}
