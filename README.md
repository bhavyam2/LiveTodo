# LiveTodo - Real-Time Collaborative Todo List

A real-time collaborative todo list application that enables multiple users to work together on shared task boards with instant synchronization across all connected clients.

## Demo

[Link to Demo Video](https://www.youtube.com/watch?v=aUDqxCRAtN0)

## Features

### Real-Time Collaboration
- Instant synchronization of todos across all connected users
- Live user presence showing who's currently viewing the same board
- No page refresh required - all updates happen in real-time via WebSocket connections

### Todo Management
- Add new todos to shared boards
- Mark todos as completed or incomplete
- Delete todos with confirmation
- Automatic ordering and organization

### Persistent Storage
- All todos are saved to Supabase database
- Data persists across browser sessions
- Automatic board and column creation when joining new boards

### User Experience
- Clean, modern interface with gradient styling
- Responsive design
- Connection status indicators
- Real-time user presence tracking with names

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web server framework
- **Socket.io** - WebSocket library for real-time bidirectional communication
- **TypeScript** - Type-safe server-side code

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5/CSS3** - Modern web standards with gradient styling
- **Socket.io Client** - Real-time event handling
- **Supabase JS Client** - Direct database access from frontend

### Database
- **Supabase (PostgreSQL)** - Cloud-hosted PostgreSQL database with real-time capabilities

### Architecture
- **Event-Driven Architecture** - Socket.io events for real-time updates
- **Room-Based Communication** - Users join board-specific rooms for isolated collaboration
- **Client-Server Model** - Express server handles WebSocket connections and serves static files

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- Supabase account and project

## Usage

1. Enter your name
2. Enter a Board ID (use an existing board or create a new one by entering a unique ID)
3. Click Connect to start collaborating
4. Add todos and see them appear in real-time for all connected users
5. Check off completed items or delete todos as needed

## Project Structure

```
LiveWhiteboard/
├── src/
│   └── index.ts          # Express server and Socket.io setup
├── todolist.html         # Frontend application (single-page app)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## API Endpoints

- `GET /` - Serves the todo list application
- `GET /health` - Health check endpoint (returns `{ status: 'active' }`)

## WebSocket Events

### Client to Server
| Event | Description | Payload |
|-------|-------------|---------|
| `join-todolist` | Join a todo list room | `{ listId: string, userName?: string }` |
| `todo-add` | Broadcast new todo | `{ listId: string, todo: Task }` |
| `todo-update` | Broadcast todo update | `{ listId: string, todoId: string, updates: object }` |
| `todo-delete` | Broadcast todo deletion | `{ listId: string, todoId: string }` |
| `todo-toggle` | Broadcast todo completion toggle | `{ listId: string, todoId: string, completed: boolean }` |

### Server to Client
| Event | Description | Payload |
|-------|-------------|---------|
| `todo-added` | Receive new todo from another user | `Task` |
| `todo-updated` | Receive todo update from another user | `{ todoId: string, updates: object }` |
| `todo-deleted` | Receive todo deletion from another user | `{ todoId: string }` |
| `todo-toggled` | Receive todo completion toggle | `{ todoId: string, completed: boolean }` |
| `user-count-updated` | Receive updated user count and names | `{ count: number, users: string[] }` |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `CORS_ORIGIN` | CORS origin setting | `*` |

## License

ISC
