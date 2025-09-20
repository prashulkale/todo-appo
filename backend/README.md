# Task Manager Backend API

A Node.js/Express.js backend API for the Smart Task Manager application with real-time WebSocket support.

## Features

- RESTful API endpoints for user and task management
- Real-time updates using Socket.IO
- In-memory data storage
- TypeScript for type safety
- Zod schema validation
- CORS and security middleware
- Error handling and logging

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers

## Project Structure

```
backend/
├── src/
│   ├── controllers/         # Route controllers
│   │   ├── userController.ts
│   │   └── taskController.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── websocket.ts
│   ├── routes/              # API routes
│   │   ├── userRoutes.ts
│   │   └── taskRoutes.ts
│   ├── services/            # Business logic
│   │   ├── InMemoryStore.ts
│   │   └── WebSocketService.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── package.json
└── tsconfig.json
```

## Installation

```bash
cd backend
npm install
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check
```

## API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication
Most endpoints require authentication via session token in the Authorization header:
```
Authorization: Bearer <session-id>
```

### User Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com"
}
```

#### Login User
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "john_doe"
}
```

#### Get All Users
```http
GET /api/users
```

#### Get Current User
```http
GET /api/users/me
Authorization: Bearer <session-id>
```

#### Logout User
```http
POST /api/users/logout
Authorization: Bearer <session-id>
```

### Task Endpoints

#### Create Task
```http
POST /api/tasks
Authorization: Bearer <session-id>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive documentation for the project",
  "priority": "High",
  "status": "To Do",
  "assignedUserId": "user-id-here",
  "dependencies": ["task-id-1", "task-id-2"]
}
```

#### Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <session-id>
```

#### Get Task by ID
```http
GET /api/tasks/:id
Authorization: Bearer <session-id>
```

#### Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <session-id>
Content-Type: application/json

{
  "title": "Updated task title",
  "status": "In Progress"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <session-id>
```

#### Get My Tasks
```http
GET /api/tasks/my-tasks
Authorization: Bearer <session-id>
```

#### Get Blocked Tasks
```http
GET /api/tasks/blocked
Authorization: Bearer <session-id>
```

#### Mark Task as Complete
```http
PATCH /api/tasks/:id/complete
Authorization: Bearer <session-id>
```

## WebSocket Events

### Client to Server Events

#### Join User Session
```javascript
socket.emit('user_join', { sessionId: 'session-id-here' });
```

#### Leave User Session
```javascript
socket.emit('user_leave');
```

### Server to Client Events

#### Task Created
```javascript
socket.on('task_created', (data) => {
  console.log('New task:', data.task);
});
```

#### Task Updated
```javascript
socket.on('task_updated', (data) => {
  console.log('Updated task:', data.task);
});
```

#### Task Deleted
```javascript
socket.on('task_deleted', (data) => {
  console.log('Deleted task ID:', data.taskId);
});
```

#### User Joined
```javascript
socket.on('user_joined', (data) => {
  console.log('User joined:', data.user);
});
```

#### User Left
```javascript
socket.on('user_left', (data) => {
  console.log('User left:', data.user);
});
```

## Data Models

### User
```typescript
interface User {
  id: string;           // UUID
  username: string;     // 3-50 characters
  email: string;        // Valid email format
  createdAt: Date;      // Creation timestamp
}
```

### Task
```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // 1-200 characters
  description?: string;          // Max 1000 characters
  priority: 'Low' | 'Medium' | 'High';
  status: 'To Do' | 'In Progress' | 'Done';
  assignedUserId?: string;       // User ID
  dependencies: string[];        // Array of task IDs
  createdAt: Date;              // Creation timestamp
  updatedAt: Date;              // Last update timestamp
}
```

## Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
```

## Environment Variables

```bash
PORT=5000                    # Server port
CLIENT_URL=http://localhost:3000  # Frontend URL for CORS
```

## Security Features

- CORS enabled for frontend domain
- Helmet.js for security headers
- Input validation with Zod schemas
- Session-based authentication
- Request logging

## Performance Considerations

- In-memory storage for fast access
- Efficient data structures (Map/Set)
- Minimal database operations
- WebSocket connection pooling

## Monitoring

The server logs all requests and WebSocket events to the console. In production, you would want to integrate with a proper logging service.

## Testing

Currently, the application doesn't include automated tests. In a production environment, you would add:

- Unit tests for controllers and services
- Integration tests for API endpoints
- WebSocket event testing
- Load testing for concurrent users

## Deployment

For production deployment:

1. Build the application: `npm run build`
2. Set environment variables
3. Use a process manager like PM2
4. Set up reverse proxy with Nginx
5. Configure SSL certificates
6. Set up monitoring and logging

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT environment variable
2. **CORS errors**: Ensure CLIENT_URL matches your frontend URL
3. **WebSocket connection failed**: Check if both servers are running
4. **Type errors**: Run `npm run type-check` to identify issues

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.
