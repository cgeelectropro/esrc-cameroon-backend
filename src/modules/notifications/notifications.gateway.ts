import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

interface UserSession {
  userId: string;
  socketId: string;
  rooms: Set<string>;
  connectedAt: Date;
}

@WebSocketGateway({
  cors: { 
    origin: process.env.FRONTEND_URL || 'http://localhost:3000', 
    credentials: true,
    methods: ['GET', 'POST'],
  },
  namespace: '/ws',
  transports: ['websocket', 'polling'],
})
@Injectable()
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private userSessions = new Map<string, UserSession[]>();
  private roomSubscriptions = new Map<string, Set<string>>();
  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
    // Set up periodic cleanup of stale connections
    setInterval(() => this.cleanupStaleConnections(), 60000);
  }

  /**
   * Handle client connection with JWT authentication
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Connection attempt without token');
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('jwt.secret'),
      });

      const userId = payload.sub;
      client.data.userId = userId;
      client.data.connectedAt = new Date();

      // Join user's personal room
      client.join(`user:${userId}`);

      // Store session info
      if (!this.userSessions.has(userId)) {
        this.userSessions.set(userId, []);
      }

      const session: UserSession = {
        userId,
        socketId: client.id,
        rooms: new Set([`user:${userId}`]),
        connectedAt: new Date(),
      };

      this.userSessions.get(userId)!.push(session);

      this.logger.log(`User ${userId} connected via ${client.id}`);

      // Notify user they're connected
      client.emit('connected', {
        userId,
        socketId: client.id,
        timestamp: new Date(),
      });

      // Emit online status to all connected clients
      this.broadcastUserStatus(userId, 'online');
    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sessions = this.userSessions.get(userId);
      if (sessions) {
        const index = sessions.findIndex((s) => s.socketId === client.id);
        if (index !== -1) {
          sessions.splice(index, 1);
        }

        // If no more sessions for this user, mark as offline
        if (sessions.length === 0) {
          this.userSessions.delete(userId);
          this.broadcastUserStatus(userId, 'offline');
        }
      }

      this.logger.log(`User ${userId} disconnected from ${client.id}`);
    }
  }

  /**
   * Get user's online status
   */
  @SubscribeMessage('user-status')
  async getUserStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string },
  ) {
    const { userId } = payload;
    const sessions = this.userSessions.get(userId);
    const isOnline = sessions && sessions.length > 0;

    return {
      userId,
      isOnline,
      sessionCount: sessions?.length || 0,
    };
  }

  /**
   * Join a room (for live classes, course sessions, etc.)
   */
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    try {
      const { room } = payload;
      const userId = client.data.userId;

      client.join(room);

      // Track room subscription
      if (!this.roomSubscriptions.has(room)) {
        this.roomSubscriptions.set(room, new Set());
      }
      this.roomSubscriptions.get(room)!.add(userId);

      // Update user session
      const sessions = this.userSessions.get(userId);
      if (sessions) {
        const session = sessions.find((s) => s.socketId === client.id);
        if (session) {
          session.rooms.add(room);
        }
      }

      // Notify room that user joined
      this.server.to(room).emit('user-joined', {
        userId,
        room,
        timestamp: new Date(),
      });

      this.logger.debug(`User ${userId} joined room: ${room}`);
      return { success: true, room };
    } catch (error) {
      this.logger.error('Join room error:', error);
      throw new WsException('Failed to join room');
    }
  }

  /**
   * Leave a room
   */
  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string },
  ) {
    try {
      const { room } = payload;
      const userId = client.data.userId;

      client.leave(room);

      // Update room subscriptions
      const subscribers = this.roomSubscriptions.get(room);
      if (subscribers) {
        subscribers.delete(userId);
        if (subscribers.size === 0) {
          this.roomSubscriptions.delete(room);
        }
      }

      // Notify room that user left
      this.server.to(room).emit('user-left', {
        userId,
        room,
        timestamp: new Date(),
      });

      this.logger.debug(`User ${userId} left room: ${room}`);
      return { success: true, room };
    } catch (error) {
      this.logger.error('Leave room error:', error);
      throw new WsException('Failed to leave room');
    }
  }

  /**
   * Send message in a room (live class chat, course discussion)
   */
  @SubscribeMessage('send-message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      room: string;
      message: string;
      type?: 'chat' | 'notification' | 'announcement';
    },
  ) {
    try {
      const { room, message, type = 'chat' } = payload;
      const userId = client.data.userId;

      const data = {
        userId,
        message,
        type,
        room,
        timestamp: new Date(),
      };

      // Broadcast to room
      this.server.to(room).emit('message', data);

      this.logger.debug(`Message in ${room} from ${userId}`);
      return { success: true, messageId: `${Date.now()}` };
    } catch (error) {
      this.logger.error('Send message error:', error);
      throw new WsException('Failed to send message');
    }
  }

  /**
   * Send notification to specific user
   */
  sendToUser(
    userId: string,
    event: string,
    data: unknown,
  ): void {
    this.server.to(`user:${userId}`).emit(event, {
      ...(typeof data === 'object' && data !== null ? data : {}),
      timestamp: new Date(),
    });
    this.logger.debug(`Notification sent to user ${userId}: ${event}`);
  }

  /**
   * Send notification to room
   */
  sendToRoom(
    room: string,
    event: string,
    data: unknown,
  ): void {
    this.server.to(room).emit(event, {
      ...(typeof data === 'object' && data !== null ? data : {}),
      timestamp: new Date(),
    });
    this.logger.debug(`Notification sent to room ${room}: ${event}`);
  }

  /**
   * Broadcast to all connected clients
   */
  broadcastToAll(event: string, data: unknown): void {
    this.server.emit(event, {
      ...(typeof data === 'object' && data !== null ? data : {}),
      timestamp: new Date(),
    });
    this.logger.debug(`Broadcast to all: ${event}`);
  }

  /**
   * Broadcast user online/offline status
   */
  private broadcastUserStatus(userId: string, status: 'online' | 'offline'): void {
    this.broadcastToAll('user-status-changed', {
      userId,
      status,
    });
  }

  /**
   * Clean up stale connections
   */
  private cleanupStaleConnections(): void {
    const now = new Date();
    const staleThreshold = 60000; // 1 minute

    for (const [userId, sessions] of this.userSessions.entries()) {
      const activeSessions = sessions.filter(
        (s) => now.getTime() - s.connectedAt.getTime() < staleThreshold,
      );

      if (activeSessions.length === 0) {
        this.userSessions.delete(userId);
      } else if (activeSessions.length < sessions.length) {
        this.userSessions.set(userId, activeSessions);
      }
    }

    this.logger.debug(
      `Cleanup: ${this.userSessions.size} active users, ${this.roomSubscriptions.size} active rooms`,
    );
  }

  /**
   * Get server statistics
   */
  getStats() {
    return {
      connectedUsers: this.userSessions.size,
      activeRooms: this.roomSubscriptions.size,
      totalConnections: Array.from(this.userSessions.values()).reduce(
        (sum, sessions) => sum + sessions.length,
        0,
      ),
    };
  }
}
