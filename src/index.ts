import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
  }
});

const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Serve static files (frontend)
const projectRoot = join(__dirname, '..');
app.use(express.static(projectRoot));

// Serve todolist.html at root
app.get('/', (req, res) => {
  res.sendFile(join(projectRoot, 'todolist.html'));
});

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