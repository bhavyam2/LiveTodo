# LiveWhiteboard - Collaborative Todo List

A real-time collaborative todo list application that enables multiple users to work together on shared task boards with instant synchronization across all connected clients.

## Demo

[Link to Demo Video](https://www.youtube.com/watch?v=9pvfM9Bo47k)

## Technical Design

[Link to Technical Design Diagram](https://ibb.co/Sw6bFTqd)

## Features

### Real-Time Collaboration
- Instant synchronization of todos across all connected users
- Live user count display showing how many users are viewing the same board
- No page refresh required - all updates happen in real-time via WebSocket connections

### Todo Management
- Add new todos to shared boards
- Mark todos as completed or incomplete
- Delete todos with confirmation
- Automatic ordering and organization

### Persistent Storage
- All todos are saved to Supabase database
- Data persists across browser sessions
- Automatic board and column creation

### User Experience
- Clean, modern interface
- Responsive design
- Connection status indicators
- Real-time user presence tracking

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web server framework
- **Socket.io** - WebSocket library for real-time bidirectional communication
- **TypeScript** - Type-safe server-side code

### Frontend
- **Vanilla JavaScript** - No framework dependencies
- **HTML5/CSS3** - Modern web standards
- **Socket.io Client** - Real-time event handling

### Database
- **Supabase (PostgreSQL)** - Cloud-hosted PostgreSQL database
- **Prisma** - Database schema management and migrations

### Architecture
- **Event-Driven Architecture** - Socket.io events for real-time updates
- **Room-Based Communication** - Users join board-specific rooms for isolated collaboration
- **Client-Server Model** - Express server handles WebSocket connections and serves static files

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bhavyam2/LiveTodo.git
cd LiveWhiteboard
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory:
```
DATABASE_URL=your_supabase_connection_string
PORT=3000
CORS_ORIGIN=*
```

4. Set up Supabase:
- The Supabase URL and anon key are configured in `todolist.html`
- Update `DEFAULT_SUPABASE_URL` and `DEFAULT_SUPABASE_ANON_KEY` constants if needed
- Ensure your Supabase database matches the Prisma schema

5. Run the development server:
```bash
npm run dev
```

6. Open your browser:
Navigate to `http://localhost:3000`

## Usage

1. Enter a Board ID (or create a new one by entering a unique ID)
2. Optionally enter a Column ID (leave empty to auto-create)
3. Click Connect to start collaborating
4. Add todos and see them appear in real-time for all connected users

## Project Structure

```
LiveWhiteboard/
├── src/
│   └── index.ts          # Express server and Socket.io setup
├── prisma/
│   └── schema.prisma     # Database schema definitions
├── todolist.html         # Frontend application
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## API Endpoints

- `GET /` - Serves the todo list application
- `GET /health` - Health check endpoint

## WebSocket Events

### Client to Server
- `join-todolist` - Join a todo list room
- `todo-add` - Broadcast new todo
- `todo-update` - Broadcast todo update
- `todo-delete` - Broadcast todo deletion
- `todo-toggle` - Broadcast todo completion toggle

### Server to Client
- `todo-added` - Receive new todo from another user
- `todo-updated` - Receive todo update from another user
- `todo-deleted` - Receive todo deletion from another user
- `todo-toggled` - Receive todo completion toggle from another user
- `user-count-updated` - Receive updated user count for the room

## Database Schema

The application uses the following Prisma schema:

- **User** - User accounts with email and name
- **Board** - Todo boards with title and owner
- **Column** - Columns within boards for organization
- **Task** - Individual todo items with title, description, order, and completion status
