import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
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

const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

const projectRoot = join(__dirname, '..');
app.use(express.static(projectRoot));

app.get('/', (req, res) => {
  const filePath = join(projectRoot, 'todolist.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('Error loading page: ' + err.message);
    }
  });
});

// Store active users per room: roomId -> Map<socketId, userName>
const activeUsers = new Map<string, Map<string, string>>();
// Track which rooms each socket is in: socketId -> Set<roomId>
const socketRooms = new Map<string, Set<string>>();

io.on('connection', (socket) => {
  // Track socket rooms
  socketRooms.set(socket.id, new Set());

  socket.on('join-todolist', (data: { listId: string, userName?: string } | string) => {
    const listId = typeof data === 'string' ? data : data?.listId;
    const userName = typeof data === 'object' ? data?.userName : undefined;
    
    if (!listId || typeof listId !== 'string') return;

    const currentRooms = Array.from(socket.rooms);
    if (!currentRooms.includes(listId)) {
      socket.join(listId);
    }
    
    // Track this room for this socket
    if (!socketRooms.has(socket.id)) {
      socketRooms.set(socket.id, new Set());
    }
    socketRooms.get(socket.id)!.add(listId);
    
    // Track user in this room
    if (userName) {
      if (!activeUsers.has(listId)) {
        activeUsers.set(listId, new Map());
      }
      activeUsers.get(listId)!.set(socket.id, userName);
    }
    
    const room = io.sockets.adapter.rooms.get(listId);
    const userCount = room ? room.size : 0;
    const users = activeUsers.get(listId) ? Array.from(activeUsers.get(listId)!.values()) : [];
    
    io.to(listId).emit('user-count-updated', { count: userCount, users });
  });

  socket.on('todo-add', (data: { listId: string, todo: any }) => {
    if (!data?.listId || !data?.todo) return;
    socket.to(data.listId).emit('todo-added', data.todo);
  });

  socket.on('todo-update', (data: { listId: string, todoId: string, updates: any }) => {
    if (!data?.listId || !data?.todoId || !data?.updates) return;
    socket.to(data.listId).emit('todo-updated', { todoId: data.todoId, updates: data.updates });
  });

  socket.on('todo-delete', (data: { listId: string, todoId: string }) => {
    if (!data?.listId || !data?.todoId) return;
    socket.to(data.listId).emit('todo-deleted', { todoId: data.todoId });
  });

  socket.on('todo-toggle', (data: { listId: string, todoId: string, completed: boolean }) => {
    if (!data?.listId || !data?.todoId || typeof data.completed !== 'boolean') return;
    socket.to(data.listId).emit('todo-toggled', { todoId: data.todoId, completed: data.completed });
  });

  socket.on('disconnect', () => {
    // Get rooms this socket was in from our tracking
    const roomsToUpdate = socketRooms.get(socket.id) || new Set();
    
    roomsToUpdate.forEach((roomId) => {
      // Remove user from active users
      if (activeUsers.has(roomId)) {
        activeUsers.get(roomId)!.delete(socket.id);
        if (activeUsers.get(roomId)!.size === 0) {
          activeUsers.delete(roomId);
        }
      }
      
      // Get updated room info (socket is already removed from room at this point)
      const room = io.sockets.adapter.rooms.get(roomId);
      const userCount = room ? room.size : 0;
      const users = activeUsers.get(roomId) ? Array.from(activeUsers.get(roomId)!.values()) : [];
      
      // Broadcast updated user list to remaining users in the room
      io.to(roomId).emit('user-count-updated', { count: userCount, users });
    });
    
    // Clean up socket room tracking
    socketRooms.delete(socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'active' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other process or use a different port.`);
    process.exit(1);
  } else {
    throw err;
  }
});
