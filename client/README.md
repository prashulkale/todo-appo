# Task Manager Frontend

A modern React/Next.js frontend application for the Smart Task Manager with real-time collaboration features.

## Features

- Modern, responsive UI with Tailwind CSS
- Real-time updates via WebSocket
- Drag and drop task management
- Task filtering and sorting
- User authentication and management
- Task dependency visualization
- Mobile-friendly design

## Tech Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **React Beautiful DnD** - Drag and drop
- **Framer Motion** - Animations
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Project Structure

```
client/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── layout/         # Layout components
│   │   └── tasks/          # Task management components
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx
│   │   └── TaskContext.tsx
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   ├── services/           # API and WebSocket services
│   │   ├── api.ts
│   │   └── websocket.ts
│   └── types/              # TypeScript type definitions
│       └── index.ts
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Installation

```bash
cd client
npm install
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Environment Variables

Create a `.env.local` file in the client directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

## Key Components

### Authentication
- **LoginForm** - User login interface
- **RegisterForm** - User registration interface
- **AuthContext** - Authentication state management

### Task Management
- **TaskBoard** - Main task board with drag and drop
- **TaskColumn** - Individual status columns
- **TaskCard** - Individual task cards
- **TaskModal** - Task details and editing
- **CreateTaskModal** - New task creation
- **TaskFilters** - Filtering and sorting controls
- **TaskStats** - Statistics dashboard

### Layout
- **DashboardLayout** - Main application layout
- **Sidebar** - Navigation sidebar
- **TopBar** - Top navigation bar

## State Management

The application uses React Context for state management:

### AuthContext
Manages user authentication state:
- Current user information
- Login/logout functionality
- Session management

### TaskContext
Manages task-related state:
- Task list and operations
- User list
- Filtering and sorting
- Real-time updates

## Real-time Features

### WebSocket Integration
The application connects to the backend WebSocket server for real-time updates:

```typescript
// Connect to WebSocket
const wsService = new WebSocketService();

// Listen for task updates
wsService.onTaskCreated((data) => {
  // Handle new task
});

wsService.onTaskUpdated((data) => {
  // Handle task update
});

wsService.onTaskDeleted((data) => {
  // Handle task deletion
});
```

### Live Updates
- Tasks are updated in real-time across all connected clients
- No page refresh required
- Optimistic updates for better UX

## Styling

### Tailwind CSS
The application uses Tailwind CSS for styling with custom configuration:

- Custom color palette
- Responsive design utilities
- Animation classes
- Component-specific styles

### Design System
- Consistent spacing and typography
- Color-coded priorities and statuses
- Hover and focus states
- Loading and error states

## Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

### Mobile Features
- Touch-friendly drag and drop
- Collapsible sidebar
- Optimized forms
- Swipe gestures

## Performance Optimizations

### Code Splitting
- Automatic code splitting by Next.js
- Lazy loading of components
- Dynamic imports where appropriate

### State Management
- Efficient context updates
- Memoized components
- Optimistic updates

### Bundle Size
- Tree shaking enabled
- Minimal dependencies
- Optimized imports

## Accessibility

The application follows accessibility best practices:
- Semantic HTML elements
- ARIA labels and roles
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Consistent naming conventions

### Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### State Management
- Use contexts for global state
- Local state for component-specific data
- Custom hooks for reusable logic

## Testing

Currently, the application doesn't include automated tests. In a production environment, you would add:

- Unit tests with Jest and React Testing Library
- Integration tests for user flows
- E2E tests with Playwright or Cypress
- Visual regression tests

## Deployment

### Build Process
```bash
npm run build
```

### Static Export (Optional)
```bash
npm run export
```

### Deployment Platforms
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Docker containers

## Troubleshooting

### Common Issues

1. **WebSocket connection failed**
   - Check if backend server is running
   - Verify WebSocket URL in environment variables

2. **API requests failing**
   - Check API URL in environment variables
   - Verify CORS settings on backend

3. **Build errors**
   - Run `npm run type-check` to identify TypeScript errors
   - Check for missing dependencies

4. **Styling issues**
   - Ensure Tailwind CSS is properly configured
   - Check for conflicting CSS

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and hot reloading.

## Future Enhancements

- [ ] PWA support
- [ ] Offline functionality
- [ ] Dark mode theme
- [ ] Advanced animations
- [ ] Keyboard shortcuts
- [ ] Bulk operations
- [ ] Task templates
- [ ] Advanced filtering
- [ ] Export/import functionality
- [ ] Mobile app (React Native)
