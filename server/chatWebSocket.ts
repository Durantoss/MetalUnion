import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { db } from './db';
import { chatParticipants, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface ChatClient {
  socket: WebSocket;
  userId: string;
  roomId: string;
  stagename: string;
}

class ChatWebSocketServer {
  private wss: WebSocketServer;
  private clients: Map<string, ChatClient> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/chat-ws'
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    // Chat WebSocket server initialized on /chat-ws
  }

  private async handleConnection(socket: WebSocket, request: any) {
    // New chat WebSocket connection

    socket.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        await this.handleMessage(socket, message);
      } catch (error) {
        // Error parsing chat WebSocket message
        socket.send(JSON.stringify({ 
          type: 'error', 
          message: 'Invalid message format' 
        }));
      }
    });

    socket.on('close', () => {
      this.handleDisconnection(socket);
    });

    socket.on('error', (error) => {
      // Chat WebSocket error handled
      this.handleDisconnection(socket);
    });
  }

  private async handleMessage(socket: WebSocket, message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'join_room':
        await this.handleJoinRoom(socket, payload);
        break;
      case 'leave_room':
        await this.handleLeaveRoom(socket, payload);
        break;
      case 'ping':
        socket.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        console.log('Unknown chat message type:', type);
    }
  }

  private async handleJoinRoom(socket: WebSocket, payload: any) {
    const { userId, roomId, stagename } = payload;
    
    if (!userId || !roomId || !stagename) {
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Missing required fields: userId, roomId, stagename' 
      }));
      return;
    }

    try {
      // Remove client from previous room if exists
      const existingClientId = this.findClientBySocket(socket);
      if (existingClientId) {
        await this.handleLeaveRoom(socket, { userId });
      }

      // Add client to new room
      const clientId = `${userId}-${Date.now()}`;
      this.clients.set(clientId, {
        socket,
        userId,
        roomId,
        stagename
      });

      // Update database - mark user as online in this room
      await db
        .insert(chatParticipants)
        .values({
          userId,
          roomId,
          isOnline: true,
          lastSeen: new Date()
        })
        .onConflictDoNothing();

      // Notify client of successful join
      socket.send(JSON.stringify({
        type: 'room_joined',
        roomId,
        userId
      }));

      // Broadcast to other clients in the room that user joined
      this.broadcast(roomId, {
        type: 'user_joined',
        user: { userId, stagename }
      }, [userId]);

      console.log(`User ${stagename} joined room ${roomId}`);
    } catch (error) {
      console.error('Error joining chat room:', error);
      socket.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to join room' 
      }));
    }
  }

  private async handleLeaveRoom(socket: WebSocket, payload: any) {
    const clientId = this.findClientBySocket(socket);
    if (!clientId) return;

    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      // Update database - mark user as offline
      await db
        .update(chatParticipants)
        .set({ 
          isOnline: false, 
          lastSeen: new Date() 
        })
        .where(
          and(
            eq(chatParticipants.userId, client.userId),
            eq(chatParticipants.roomId, client.roomId)
          )
        );

      // Broadcast to other clients that user left
      this.broadcast(client.roomId, {
        type: 'user_left',
        user: { userId: client.userId, stagename: client.stagename }
      }, [client.userId]);

      // Remove client
      this.clients.delete(clientId);

      console.log(`User ${client.stagename} left room ${client.roomId}`);
    } catch (error) {
      console.error('Error leaving chat room:', error);
    }
  }

  private handleDisconnection(socket: WebSocket) {
    const clientId = this.findClientBySocket(socket);
    if (clientId) {
      const client = this.clients.get(clientId);
      if (client) {
        this.handleLeaveRoom(socket, { userId: client.userId });
      }
    }
  }

  private findClientBySocket(socket: WebSocket): string | undefined {
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (client.socket === socket) {
        return clientId;
      }
    }
    return undefined;
  }

  public broadcast(roomId: string, message: any, excludeUserIds: string[] = []) {
    const messageStr = JSON.stringify(message);
    
    for (const [clientId, client] of Array.from(this.clients.entries())) {
      if (
        client.roomId === roomId && 
        !excludeUserIds.includes(client.userId) &&
        client.socket.readyState === WebSocket.OPEN
      ) {
        try {
          client.socket.send(messageStr);
        } catch (error) {
          console.error('Error broadcasting to client:', error);
          // Remove dead connection
          this.clients.delete(clientId);
        }
      }
    }
  }

  public getRoomClients(roomId: string): ChatClient[] {
    return Array.from(this.clients.values()).filter(client => client.roomId === roomId);
  }

  public getClientCount(): number {
    return this.clients.size;
  }
}

export { ChatWebSocketServer };