import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allows any frontend to connect for now
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --- WebSocket Logic ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Users "join" a specific board room based on the board ID
  socket.on('join-board', (boardId: string) => {
    socket.join(boardId);
    console.log(`User ${socket.id} joined board: ${boardId}`);
  });

  // When someone draws, we send that data ONLY to others in the same room
  socket.on('draw', (data: { boardId: string, x: number, y: number, color: string }) => {
    socket.to(data.boardId).emit('draw-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// --- API Routes ---
app.get('/health', (req, res) => {
  res.json({ status: 'Real-time server is active' });
});

// IMPORTANT: Use httpServer.listen, not app.listen
httpServer.listen(PORT, () => {
  console.log(`🚀 Real-time server running at: http://localhost:${PORT}`);
});