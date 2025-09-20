# Smart Task Manager

A collaborative task management web application built with Next.js, Node.js, and Socket.IO for real-time updates. This application allows users to create, assign, and track tasks with dependencies in a collaborative environment.

## Features

### User Management
- ✅ User registration and login (mock authentication)
- ✅ User profile management
- ✅ Session management
- ✅ Real-time user presence

### Task Management
- ✅ Create, edit, and delete tasks
- ✅ Task assignment to users
- ✅ Task priorities (Low, Medium, High)
- ✅ Task statuses (To Do, In Progress, Done)
- ✅ Task dependencies (tasks can depend on other tasks)
- ✅ Drag and drop task board
- ✅ Task filtering and sorting
- ✅ Real-time task updates

### Real-time Features
- ✅ WebSocket integration with Socket.IO
- ✅ Live task updates across all connected clients
- ✅ Real-time notifications
- ✅ Collaborative task editing

### UI/UX Features
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Drag and drop interface
- ✅ Real-time status updates
- ✅ Task dependency visualization
- ✅ Mobile-friendly interface

## Tech Stack

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Socket.IO** for real-time communication
- **Zod** for schema validation
- **In-memory storage** (Map/Set based)

### Frontend
- **Next.js 14** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Socket.IO Client** for real-time updates
- **React Hook Form** with Zod validation
- **React Beautiful DnD** for drag and drop
- **Framer Motion** for animations
- **React Hot Toast** for notifications

## Project Structure

```
todo-app/
├── backend/                 # Backend API server
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic services
│   │   ├── types/           # TypeScript type definitions
│   │   ├── app.ts          # Express app configuration
│   │   └── index.ts        # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── client/                  # Frontend Next.js app
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── services/       # API and WebSocket services
│   │   └── types/          # TypeScript type definitions
│   ├── package.json
│   └── next.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

3. **Open your browser**
   Navigate to `http://localhost:3000` to access the application

## API Endpoints

### User Endpoints
- `POST /api/users/register` - Create a new user
- `POST /api/users/login` - Login user
- `GET /api/users` - Get all users
- `GET /api/users/me` - Get current user
- `POST /api/users/logout` - Logout user
- `GET /api/users/stats` - Get user statistics

### Task Endpoints
- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/my-tasks` - Get current user's tasks
- `GET /api/tasks/blocked` - Get blocked tasks
- `PATCH /api/tasks/:id/complete` - Mark task as complete
- `GET /api/tasks/:id/dependencies` - Get task dependencies

## WebSocket Events

### Client to Server
- `user_join` - Join user session
- `user_leave` - Leave user session
- `task_update_request` - Request task update

### Server to Client
- `task_created` - Task created notification
- `task_updated` - Task updated notification
- `task_deleted` - Task deleted notification
- `user_joined` - User joined notification
- `user_left` - User left notification

## Key Features Implementation

### Real-time Updates
The application uses Socket.IO to provide real-time updates across all connected clients. When a task is created, updated, or deleted, all connected users receive the update immediately.

### Task Dependencies
Tasks can have dependencies on other tasks. A task cannot be marked as "Done" until all its dependencies are completed. The UI shows dependency information and blocks completion when dependencies are not met.

### Drag and Drop
The task board supports drag and drop functionality using React Beautiful DnD. Users can drag tasks between columns to update their status.

### Responsive Design
The application is fully responsive and works on desktop, tablet, and mobile devices.

## Development

### Backend Development
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run type-check   # Run TypeScript type checking
```

### Frontend Development
```bash
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## Architecture Decisions

### In-Memory Storage
The application uses in-memory storage (Map/Set) instead of a database for simplicity. This means data is lost when the server restarts, but it's perfect for demonstration purposes.

### Mock Authentication
Authentication is mocked for simplicity. In a production environment, you would implement proper authentication with JWT tokens, password hashing, etc.

### TypeScript
Both frontend and backend use TypeScript for type safety and better developer experience.

### Zod Validation
Zod is used for runtime type validation on both client and server sides, ensuring data integrity.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Real authentication with JWT
- [ ] File attachments for tasks
- [ ] Task comments and activity logs
- [ ] Advanced filtering and search
- [ ] Task templates
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Docker containerization
- [ ] CI/CD pipeline
