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

io.on('connection', (socket) => {
  socket.on('join-todolist', (listId: string) => {
    if (!listId || typeof listId !== 'string') return;

    const currentRooms = Array.from(socket.rooms);
    if (!currentRooms.includes(listId)) {
      socket.join(listId);
    }
    
    const room = io.sockets.adapter.rooms.get(listId);
    const userCount = room ? room.size : 0;
    io.to(listId).emit('user-count-updated', { count: userCount });
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

  socket.on('join-board', (boardId: string) => {
    if (!boardId || typeof boardId !== 'string') return;

    const currentRooms = Array.from(socket.rooms);
    if (!currentRooms.includes(boardId)) {
      socket.join(boardId);
    }
    
    const room = io.sockets.adapter.rooms.get(boardId);
    const userCount = room ? room.size : 0;
    io.to(boardId).emit('user-count-updated', { count: userCount });
  });

  socket.on('draw', (data: { boardId: string, x: number, y: number, color: string }) => {
    if (!data?.boardId || typeof data.x !== 'number' || typeof data.y !== 'number' || !data.color) return;
    socket.to(data.boardId).emit('draw-update', data);
  });

  socket.on('disconnect', () => {
    const roomsToUpdate = Array.from(socket.rooms).filter(roomId => roomId !== socket.id);
    
    roomsToUpdate.forEach((roomId) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      const userCount = room ? room.size : 0;
      io.to(roomId).emit('user-count-updated', { count: userCount });
    });
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