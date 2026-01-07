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
    origin: "*",
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());

// Get project root path
const projectRoot = join(__dirname, '..');

// Serve todolist.html at the root
app.get('/', (req, res) => {
  res.sendFile(join(projectRoot, 'todolist.html'));
});

app.use(express.static(projectRoot));

// WebSocket event handlers
io.on('connection', (socket) => {
  socket.on('join-todolist', (listId: string) => {
    const currentRooms = Array.from(socket.rooms);
    if (!currentRooms.includes(listId)) {
      socket.join(listId);
    }
    
    setTimeout(() => {
      const room = io.sockets.adapter.rooms.get(listId);
      const userCount = room ? room.size : 0;
      io.to(listId).emit('user-count-updated', { count: userCount });
    }, 100);
  });

  socket.on('todo-add', (data: { listId: string, todo: any }) => {
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

  socket.on('join-board', (boardId: string) => {
    const currentRooms = Array.from(socket.rooms);
    if (!currentRooms.includes(boardId)) {
      socket.join(boardId);
    }
    
    setTimeout(() => {
      const room = io.sockets.adapter.rooms.get(boardId);
      const userCount = room ? room.size : 0;
      io.to(boardId).emit('user-count-updated', { count: userCount });
    }, 100);
  });

  socket.on('draw', (data: { boardId: string, x: number, y: number, color: string }) => {
    socket.to(data.boardId).emit('draw-update', data);
  });

  socket.on('disconnect', () => {
    const roomsToUpdate = Array.from(socket.rooms).filter(roomId => roomId !== socket.id);
    
    setTimeout(() => {
      roomsToUpdate.forEach((roomId) => {
        const room = io.sockets.adapter.rooms.get(roomId);
        const userCount = room ? room.size : 0;
        io.to(roomId).emit('user-count-updated', { count: userCount });
      });
    }, 100);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});