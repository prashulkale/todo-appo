'use client';

import { useTasks } from '@/hooks/useTasks';
import { TaskStatus } from '@/types';
import TaskColumn from './TaskColumn';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'To Do', title: 'To Do', color: 'bg-gray-100' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'Done', title: 'Done', color: 'bg-green-100' },
];

export default function TaskBoard() {
  const { tasks, updateTask } = useTasks();

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    
    try {
      await updateTask(draggableId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Task Board</h3>
        <p className="text-sm text-gray-500 mt-1">
          Drag and drop tasks between columns to update their status
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {columns.map((column) => (
              <TaskColumn
                key={column.id}
                status={column.id}
                title={column.title}
                color={column.color}
                tasks={getTasksByStatus(column.id)}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
