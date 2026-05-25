import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer;

// Map user IDs to socket IDs to target specific users
const userSockets = new Map<string, string>();

export const initSocket = (server: HttpServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('user_connected', (userId: string) => {
      userSockets.set(userId, socket.id);
      console.log(`User ${userId} mapped to socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove mapping on disconnect
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  const socketId = userSockets.get(userId.toString());
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};
