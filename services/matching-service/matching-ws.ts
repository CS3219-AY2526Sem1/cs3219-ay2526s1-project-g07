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
    // WebSocket connection monitoring
    this.io.on('connection', (socket: CustomSocket) => {
      console.log(`Client connected: ${socket.id}`);
  
      // Store user information when they join
      socket.on(WS_EVENTS.JOIN, (data) => {
        const { userId } = data;
        socket.userId = Number(userId);
        socket.join(`user_${userId}`);
        console.log(`User ${userId} joined with socket ${socket.id}`);
      });
  
      // Handle matching request via WebSocket
      socket.on(WS_EVENTS.MATCHING_REQUEST, (data) => {
        const { userId, topic, difficulty } = data;
        console.log(`WebSocket matching request from user ${userId}`);
        
        this.matcher.enqueue(userId, { topic, difficulty });
        
        // Emit confirmation back to client
        socket.emit(WS_EVENTS.MATCHING_REQUEST_RECEIVED, {
          message: `Matching request received for user ${userId}`,
          status: 'queued'
        });
      });
  
      // Handle matching cancel via WebSocket
      socket.on(WS_EVENTS.MATCHING_CANCEL, (data) => {
        const { userId } = data;
        console.log(`WebSocket cancel matching request from user ${userId}`);

        this.HandleConnectionInterrupt(userId);

        // Emit confirmation back to client
        socket.emit(WS_EVENTS.MATCHING_CANCEL, {
          message: `Matching cancelled for user ${userId}`,
          status: 'cancelled'
        });
      });
      
      // Handle disconnection
      socket.on(WS_EVENTS.DISCONNECT, (reason) => {
        console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        
        // Clean up user from matching queue if they disconnect
        if (socket.userId) {
          this.HandleConnectionInterrupt(socket.userId);
          console.log(`Removed user ${socket.userId} from matching queue due to disconnection`);
        }
      });

      // Handle browser tab/window close
      socket.on(WS_EVENTS.CLOSE, (reason) => {
        console.log(`Client closed: ${socket.id}, reason: ${reason}`);

        // Clean up user from matching queue if they disconnect
        if (socket.userId) {
          this.HandleConnectionInterrupt(socket.userId);
          console.log(`Removed user ${socket.userId} from matching queue due to browser close`);
        }
      });
  
      // Handle connection errors
      socket.on(WS_EVENTS.ERROR, (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });
  }

  private HandleConnectionInterrupt(userId: number) {
    this.matcher.dequeue(userId);
  }
}

// Extend Socket interface to include userId
interface CustomSocket extends Socket {
  userId?: number;
}