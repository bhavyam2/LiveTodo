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
    origin: "*", // Allows any frontend to connect for now
  }
});

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Get project root path
const projectRoot = join(__dirname, '..');

// Serve todolist.html at the root (must come before static middleware)
app.get('/', (req, res) => {
  const filePath = join(projectRoot, 'todolist.html');
  console.log('Serving todolist.html from:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error loading page: ' + err.message);
    }
  });
});

// Serve static files from the project root (for other files like test.html)
app.use(express.static(projectRoot));

// --- WebSocket Logic ---
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Users "join" a specific todo list room
  socket.on('join-todolist', (listId: string) => {
    // Check if already in the room to prevent duplicate joins
    const currentRooms = Array.from(socket.rooms);
    if (!currentRooms.includes(listId)) {
      socket.join(listId);
      console.log(`User ${socket.id} joined todo list: ${listId}`);
    } else {
      console.log(`User ${socket.id} already in todo list: ${listId}`);
    }
    
    // Get accurate user count (room.size includes the room name itself, so we subtract 1)
    const room = io.sockets.adapter.rooms.get(listId);
    const userCount = room ? Math.max(0, room.size - 1) : 0;
    
    console.log(`Todo list ${listId} now has ${userCount} user(s)`);
    
    // Notify all users in the room about the updated user count
    io.to(listId).emit('user-count-updated', { count: userCount });
  });

  // Todo list events - broadcast to all OTHER users in the room
  socket.on('todo-add', (data: { listId: string, todo: any }) => {
    // Broadcast to all other users in the room (not the sender)
    socket.to(data.listId).emit('todo-added', data.todo);
  });

  socket.on('todo-update', (data: { listId: string, todoId: string, updates: any }) => {
    socket.to(data.listId).emit('todo-updated', { todoId: data.todoId, updates: data.updates });
  });

  socket.on('todo-delete', (data: { listId: string, todoId: string }) => {
    socket.to(data.listId).emit('todo-deleted', { todoId: data.todoId });
  });

  socket.on('todo-toggle', (data: { listId: string, todoId: string, completed: boolean }) => {
    socket.to(data.listId).emit('todo-toggled', { todoId: data.todoId, completed: data.completed });
  });

  // Legacy board events (keeping for compatibility)
  socket.on('join-board', (boardId: string) => {
    const currentRooms = Array.from(socket.rooms);
    if (!currentRooms.includes(boardId)) {
      socket.join(boardId);
      console.log(`User ${socket.id} joined board: ${boardId}`);
    }
    
    const room = io.sockets.adapter.rooms.get(boardId);
    const userCount = room ? Math.max(0, room.size - 1) : 0;
    console.log(`Board ${boardId} now has ${userCount} user(s)`);
    
    // Notify all users in the room about the updated user count
    io.to(boardId).emit('user-count-updated', { count: userCount });
  });

  socket.on('draw', (data: { boardId: string, x: number, y: number, color: string }) => {
    socket.to(data.boardId).emit('draw-update', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Update user counts for all rooms this user was in
    // Note: socket.rooms is still available during disconnect
    const roomsToUpdate = Array.from(socket.rooms).filter(roomId => roomId !== socket.id);
    
    roomsToUpdate.forEach((roomId) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      // After disconnect, the socket is removed, so room.size already reflects the new count
      // But we need to subtract 1 because room.size includes the room name itself
      const userCount = room ? Math.max(0, room.size - 1) : 0;
      console.log(`Room ${roomId} now has ${userCount} user(s) after disconnect`);
      io.to(roomId).emit('user-count-updated', { count: userCount });
    });
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